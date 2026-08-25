import { createSharedComposable } from '@vueuse/core'
import { load, type Store } from '@tauri-apps/plugin-store'

const STORE_FILE = 'workspace-settings.json'
const ROOT_PATH_KEY = 'rootPath'
const WORKSPACES_KEY = 'workspaces'

function basename(path: string) {
  return path.split('/').filter(Boolean).pop() || ''
}

const _useWorkspace = () => {
  const { pickFolder, createFolder, renameItem } = useFileSystem()
  const rootPath = ref<string | null>(null)
  const workspaces = ref<string[]>([])
  let store: Store | null = null

  const needsRootFolder = computed(() => rootPath.value === null)

  async function initWorkspace() {
    store = await load(STORE_FILE)
    rootPath.value = (await store.get<string>(ROOT_PATH_KEY)) ?? null
    workspaces.value = (await store.get<string[]>(WORKSPACES_KEY)) ?? []
  }

  async function setCurrentWorkspace(path: string) {
    await store?.set(ROOT_PATH_KEY, path)
    rootPath.value = path
    if (!workspaces.value.includes(path)) {
      workspaces.value.push(path)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }
  }

  function resetCurrentWorkspace() {
    rootPath.value = null
  }

  async function changeWorkspace() {
    const selected = await pickFolder()
    if (selected) await setCurrentWorkspace(selected)
  }

  async function createWorkspace(name: string, location: string) {
    const path = await createFolder(location, name)
    await setCurrentWorkspace(path)
  }

  async function deleteWorkspace(path: string) {
    const index = workspaces.value.indexOf(path)
    if (index !== -1) {
      workspaces.value.splice(index, 1)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }
  }

  async function renameWorkspace(oldPath: string, newName: string) {
    const newPath = await renameItem({ path: oldPath, name: basename(oldPath), isDir: true }, newName)
    if (newPath === oldPath) return

    const index = workspaces.value.indexOf(oldPath)
    if (index !== -1) {
      workspaces.value.splice(index, 1, newPath)
      await store?.set(WORKSPACES_KEY, workspaces.value)
    }

    if (rootPath.value === oldPath) {
      await store?.set(ROOT_PATH_KEY, newPath)
      rootPath.value = newPath
    }
  }

  // DEBUG : affiche le contenu brut du store Tauri (workspace-settings.json).
  async function debugShowStore() {
    const entries = store ? await store.entries() : []
    window.alert(JSON.stringify(entries, null, 2))
  }

  // DEBUG : vide entièrement le store Tauri et réinitialise l'état associé.
  async function debugClearStore() {
    await store?.clear()
    await store?.save()
    rootPath.value = null
    workspaces.value = []
  }

  return {
    rootPath,
    workspaces,
    needsRootFolder,
    initWorkspace,
    setCurrentWorkspace,
    resetCurrentWorkspace,
    changeWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
    debugShowStore,
    debugClearStore
  }
}

export const useWorkspace = createSharedComposable(_useWorkspace)
