import { createSharedComposable } from '@vueuse/core'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir, mkdir, writeTextFile, remove, rename, stat, type DirEntry } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { TreeItem } from '@nuxt/ui'

declare module '@vue/reactivity' {
  interface RefUnwrapBailTypes {
    fileTreeItemBail: FileTreeItem
  }
}

export interface FileTreeItem extends TreeItem {
  path: string
  isDir: boolean
  createdAt?: number
  updatedAt?: number
  children?: FileTreeItem[]
}

export type SortBy = 'name' | 'modified' | 'created'
export type SortDirection = 'asc' | 'desc'

const STORE_FILE = 'settings.json'
const STORE_KEY = 'rootPath'
const WORKSPACES_KEY = 'workspaces'

// TODO : on pourrait/devrait choisir parmis les sets d'icônes Lucide (outline, solid, duotone, cappucin, vscode, etc...)
function iconFor(entry: DirEntry) {
  if (entry.isDirectory) return undefined
  const ext = entry.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts': case 'js': case 'vue': return 'i-lucide-file-code'
    case 'md': return 'i-lucide-file-text'
    case 'json': return 'i-lucide-braces'
    case 'png': case 'jpg': case 'jpeg': case 'svg': return 'i-lucide-image'
    default: return 'i-lucide-file'
  }
}

// Les dossiers restent toujours groupés avant les fichiers, quel que soit le critère choisi.
function compareItems(a: FileTreeItem, b: FileTreeItem, sortBy: SortBy, sortDirection: SortDirection) {
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1

  const factor = sortDirection === 'asc' ? 1 : -1
  if (sortBy === 'name') return a.label!.localeCompare(b.label!) * factor

  const field = sortBy === 'modified' ? 'updatedAt' : 'createdAt'
  return ((a[field] ?? 0) - (b[field] ?? 0)) * factor
}

function sortTree(nodes: FileTreeItem[], sortBy: SortBy, sortDirection: SortDirection) {
  nodes.sort((a, b) => compareItems(a, b, sortBy, sortDirection))
  for (const node of nodes) {
    if (isLoaded(node.children)) sortTree(node.children!, sortBy, sortDirection)
  }
}

async function entriesToItems(dirPath: string, entries: DirEntry[], sortBy: SortBy, sortDirection: SortDirection): Promise<FileTreeItem[]> {
  const items = await Promise.all(entries.map(async (entry) => {
    const path = await join(dirPath, entry.name)
    const info = await stat(path)
    const item: FileTreeItem = {
      label: entry.name,
      path,
      isDir: entry.isDirectory,
      icon: iconFor(entry),
      createdAt: info.birthtime?.getTime(),
      updatedAt: info.mtime?.getTime()
    }
    if (entry.isDirectory) item.children = [{ label: '', path: '', isDir: false }]
    return item
  }))

  return items.sort((a, b) => compareItems(a, b, sortBy, sortDirection))
}

function isLoaded(children?: FileTreeItem[]) {
  return children !== undefined && !(children.length === 1 && children[0]?.path === '')
}

function findNode(nodes: FileTreeItem[], path: string): FileTreeItem | undefined {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNode(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

function dirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function basename(path: string) {
  return path.split('/').filter(Boolean).pop() || ''
}

const _useFileExplorer = () => {
  const rootPath = ref<string | null>(null)
  const workspaces = ref<string[]>([])
  const items = ref<FileTreeItem[]>([])
  const selectedItem = shallowRef<FileTreeItem>()
  const expanded = ref<string[]>([])
  const sortBy = ref<SortBy>('name')
  const sortDirection = ref<SortDirection>('asc')
  let store: Store | null = null

  const needsRootFolder = computed(() => rootPath.value === null)

  async function resetRootFolder() {
    rootPath.value = null
    items.value = []
  }

  async function pickFolder() {
    const selected = await open({ directory: true, multiple: false })
    return typeof selected === 'string' ? selected : null
  }

  async function loadRoot() {
    if (!rootPath.value) return
    items.value = await entriesToItems(rootPath.value, await readDir(rootPath.value), sortBy.value, sortDirection.value)
  }

  async function refreshDir(dirPath: string) {
    const freshEntries = await entriesToItems(dirPath, await readDir(dirPath), sortBy.value, sortDirection.value)
    const isRoot = dirPath === rootPath.value
    const previousChildren = isRoot ? items.value : findNode(items.value, dirPath)?.children ?? []
    const previousByPath = new Map(previousChildren.map(item => [item.path, item]))

    for (const entry of freshEntries) {
      const prev = previousByPath.get(entry.path)
      if (entry.isDir && prev?.isDir && isLoaded(prev.children)) entry.children = prev.children
    }

    if (isRoot) {
      items.value = freshEntries
      return
    }
    const node = findNode(items.value, dirPath)
    if (node) node.children = freshEntries
  }

  async function setRootFolder(path: string) {
    await store?.set(STORE_KEY, path)
    rootPath.value = path
    if (!workspaces.value.includes(path)) {
      workspaces.value.push(path)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }
    await loadRoot()
  }

  async function init() {
    store = await load(STORE_FILE)
    rootPath.value = (await store.get<string>(STORE_KEY)) ?? null
    workspaces.value = (await store.get<string[]>(WORKSPACES_KEY)) ?? []
    if (rootPath.value) await loadRoot()
  }

  async function loadChildren(item: FileTreeItem) {
    if (isLoaded(item.children)) return
    item.children = await entriesToItems(item.path, await readDir(item.path), sortBy.value, sortDirection.value)
  }

  function setSortOrder(by: SortBy, direction: SortDirection) {
    sortBy.value = by
    sortDirection.value = direction
    sortTree(items.value, by, direction)
  }

  function onToggle(e: CustomEvent) {
    e.preventDefault()
  }

  async function changeFolder() {
    const selected = await pickFolder()
    if (selected) await setRootFolder(selected)
  }

  async function createWorkspace(name: string, location: string) {
    const path = await join(location, name)
    await mkdir(path)
    await setRootFolder(path)
  }

  async function removeWorkspace(path: string) {
    const index = workspaces.value.indexOf(path)
    if (index !== -1) {
      workspaces.value.splice(index, 1)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }
  }

  async function renameWorkspace(path: string, newName: string) {
    if (!newName || newName === basename(path)) return
    const newPath = await join(dirname(path), newName)
    await rename(path, newPath)

    const index = workspaces.value.indexOf(path)
    if (index !== -1) {
      workspaces.value.splice(index, 1, newPath)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }

    if (rootPath.value === path) {
      await store?.set(STORE_KEY, newPath)
      rootPath.value = newPath
      await loadRoot()
    }
  }

  function targetDir() {
    return selectedItem.value?.isDir ? selectedItem.value.path : rootPath.value
  }

  async function uniqueName(dir: string, base: string, ext = '') {
    const existing = new Set((await readDir(dir)).map(entry => entry.name))
    if (!existing.has(base + ext)) return base + ext

    let i = 2
    while (existing.has(`${base} ${i}${ext}`)) i++
    return `${base} ${i}${ext}`
  }

  async function createItem(isDir: boolean) {
    const dir = targetDir()
    if (!dir) return

    if (isDir) {
      const name = await uniqueName(dir, 'New Folder')
      await mkdir(await join(dir, name))
    } else {
      const name = await uniqueName(dir, 'Untitled', '.md')
      await writeTextFile(await join(dir, name), '')
    }
    await refreshDir(dir)
  }

  async function deleteSelectedItem() {
    if (!selectedItem.value) return
    const { path, isDir } = selectedItem.value
    if (isDir) {
      await remove(path, { recursive: true })
    } else {
      await remove(path)
    }
    selectedItem.value = undefined
    await refreshDir(dirname(path))
  }

  async function renameSelectedItem(newName: string) {
    if (!selectedItem.value) return
    if (!newName || newName === selectedItem.value.label) return
    if (!newName.endsWith('.md') && !selectedItem.value.isDir) {
      newName += '.md'
    }
    const newPath = await join(dirname(selectedItem.value.path), newName)
    await rename(selectedItem.value.path, newPath)
    selectedItem.value.label = newName
    selectedItem.value.path = newPath
    await refreshDir(selectedItem.value.isDir ? newPath : dirname(newPath))
  }

  async function moveItem(item: FileTreeItem, targetDir: string) {
    const sourceDir = dirname(item.path)
    if (targetDir === sourceDir) return
    if (item.isDir && (item.path === targetDir || targetDir.startsWith(`${item.path}/`))) return

    const newPath = await join(targetDir, item.label!)
    await rename(item.path, newPath)

    if (selectedItem.value?.path === item.path) selectedItem.value = undefined

    await refreshDir(sourceDir)
    await refreshDir(targetDir)
  }

  // DEBUG : affiche le contenu brut du store Tauri (settings.json).
  async function debugShowStore() {
    const entries = store ? await store.entries() : []
    window.alert(JSON.stringify(entries, null, 2))
    console.log('DEBUG : store entries', JSON.stringify(entries, null, 2))
  }

  // DEBUG : vide entièrement le store Tauri et réinitialise l'état associé.
  async function debugClearStore() {
    await store?.clear()
    await store?.save()
    rootPath.value = null
    workspaces.value = []
    items.value = []
    selectedItem.value = undefined
  }

  return {
    rootPath,
    workspaces,
    items,
    selectedItem,
    expanded,
    sortBy,
    sortDirection,
    needsRootFolder,
    init,
    pickFolder,
    onToggle,
    loadChildren,
    setSortOrder,
    changeFolder,
    setRootFolder,
    createWorkspace,
    removeWorkspace,
    renameWorkspace,
    createItem,
    deleteSelectedItem,
    resetRootFolder,
    renameSelectedItem,
    moveItem,
    debugShowStore,
    debugClearStore,
  }
}

export const useFileExplorer = createSharedComposable(_useFileExplorer)
