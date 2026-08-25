import { createSharedComposable } from '@vueuse/core'
import { readDir, stat, type DirEntry } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import type { TreeItem } from '@nuxt/ui'

declare module '@vue/reactivity' {
  interface RefUnwrapBailTypes {
    fileTreeItem: FileTreeItem
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

function dirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function basename(path: string) {
  return path.split('/').filter(Boolean).pop() || ''
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

function toFsItem(item: FileTreeItem): FileSystemItem {
  return { path: item.path, name: item.label!, isDir: item.isDir }
}

const _useFileTree = () => {
  const { rootPath } = useWorkspace()
  const { createFile, createFolder, deleteItem, renameItem, moveItem: moveFsItem } = useFileSystem()

  const items = ref<FileTreeItem[]>([])
  const selectedItem = shallowRef<FileTreeItem>()
  const expanded = ref<string[]>([])
  const sortBy = ref<SortBy>('name')
  const sortDirection = ref<SortDirection>('asc')

  async function loadRoot() {
    if (!rootPath.value) {
      items.value = []
      return
    }
    items.value = await entriesToItems(rootPath.value, await readDir(rootPath.value), sortBy.value, sortDirection.value)
  }

  watch(rootPath, loadRoot, { immediate: true })

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

  function targetDir() {
    return selectedItem.value?.isDir ? selectedItem.value.path : rootPath.value
  }

  async function createItem(isDir: boolean) {
    const dir = targetDir()
    if (!dir) return

    if (isDir) await createFolder(dir)
    else await createFile(dir)

    await refreshDir(dir)
  }

  async function deleteSelectedItem() {
    if (!selectedItem.value) return
    const path = selectedItem.value.path
    await deleteItem(toFsItem(selectedItem.value))
    selectedItem.value = undefined
    await refreshDir(dirname(path))
  }

  async function renameSelectedItem(newName: string) {
    if (!selectedItem.value) return
    const item = selectedItem.value
    const newPath = await renameItem(toFsItem(item), newName)
    if (newPath === item.path) return

    const wasDir = item.isDir
    item.label = basename(newPath)
    item.path = newPath
    await refreshDir(wasDir ? newPath : dirname(newPath))
  }

  async function moveItem(item: FileTreeItem, targetDirPath: string) {
    const sourceDir = dirname(item.path)
    const newPath = await moveFsItem(toFsItem(item), targetDirPath)
    if (newPath === item.path) return

    if (selectedItem.value?.path === item.path) selectedItem.value = undefined

    await refreshDir(sourceDir)
    await refreshDir(targetDirPath)
  }

  return {
    items,
    selectedItem,
    expanded,
    sortBy,
    sortDirection,
    loadChildren,
    setSortOrder,
    onToggle,
    createItem,
    deleteSelectedItem,
    renameSelectedItem,
    moveItem
  }
}

export const useFileTree = createSharedComposable(_useFileTree)
