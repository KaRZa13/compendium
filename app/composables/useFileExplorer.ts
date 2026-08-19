import { createSharedComposable } from '@vueuse/core'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir, mkdir, writeTextFile, remove, type DirEntry } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { TreeItem } from '@nuxt/ui'

interface FileTreeItem extends TreeItem {
  path: string
  isDir: boolean
  children?: FileTreeItem[]
}

const STORE_FILE = 'settings.json'
const STORE_KEY = 'rootPath'
const WORKSPACES_KEY = 'workspaces'

// TODO : on pourrait utiliser un mapping plus complet, ou même un choisir parmis les sets d'icônes Lucide (outline, solid, duotone, cappucin, vscode, etc...) selon les préférences de l'utilisateur.
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

async function entriesToItems(dirPath: string, entries: DirEntry[]): Promise<FileTreeItem[]> {
  const items = await Promise.all(entries.map(async (entry) => {
    const item: FileTreeItem = {
      label: entry.name,
      path: await join(dirPath, entry.name),
      isDir: entry.isDirectory,
      icon: iconFor(entry)
    }
    if (entry.isDirectory) item.children = [{ label: '', path: '', isDir: false }]
    return item
  }))

  return items.sort((a, b) => (a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : a.label!.localeCompare(b.label!)))
}

const _useFileExplorer = () => {
  const rootPath = ref<string | null>(null)
  const workspaces = ref<string[]>([])
  const items = ref<FileTreeItem[]>([])
  const selectedItem = ref<FileTreeItem>()
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
    items.value = await entriesToItems(rootPath.value, await readDir(rootPath.value))
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
    item.children = await entriesToItems(item.path, await readDir(item.path))
  }

  function onToggle(e: CustomEvent<{ isExpanded: boolean }>, item: FileTreeItem) {
    if (item.isDir && !e.detail.isExpanded && item.children?.[0]?.label === '') {
      loadChildren(item)
    }
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

  function targetDir() {
    return selectedItem.value?.isDir ? selectedItem.value.path : rootPath.value
  }

  async function createFile() {
    const dir = targetDir()
    if (!dir) return
    const name = window.prompt('Nom du fichier :')
    if (!name) return
    await writeTextFile(await join(dir, name), '')
    await loadRoot()
  }

  async function createFolder() {
    const dir = targetDir()
    if (!dir) return
    const name = window.prompt('Nom du dossier :')
    if (!name) return
    await mkdir(await join(dir, name))
    await loadRoot()
  }

  async function deleteSelectedFile() {
    if (!selectedItem.value || selectedItem.value.isDir) return
    await remove(selectedItem.value.path)
    selectedItem.value = undefined
    await loadRoot()
  }

  async function deleteSelectedFolder() {
    if (!selectedItem.value || !selectedItem.value.isDir) return
    await remove(selectedItem.value.path, { recursive: true })
    selectedItem.value = undefined
    await loadRoot()
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
    needsRootFolder,
    init,
    pickFolder,
    onToggle,
    changeFolder,
    setRootFolder,
    createWorkspace,
    createFile,
    createFolder,
    deleteSelectedFile,
    deleteSelectedFolder,
    resetRootFolder,
    debugShowStore,
    debugClearStore,
  }
}

export const useFileExplorer = createSharedComposable(_useFileExplorer)
