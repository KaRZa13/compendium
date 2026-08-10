import { createSharedComposable } from '@vueuse/core'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir, mkdir, writeTextFile, remove, type DirEntry } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { TreeItem } from '@nuxt/ui'

// Étend le TreeItem de Nuxt UI avec les infos dont on a besoin pour manipuler
// de vrais fichiers/dossiers (chemin absolu, type, et lazy-loading des enfants).
interface FileTreeItem extends TreeItem {
  path: string
  isDir: boolean
  children?: FileTreeItem[]
}

// Le store Tauri (plugin-store) persiste le dernier dossier ouvert dans ce
// fichier JSON, sous cette clé, pour le retrouver au prochain lancement.
const STORE_FILE = 'settings.json'
const STORE_KEY = 'rootPath'

// Choisit une icône Lucide selon l'extension du fichier (les dossiers n'ont
// pas d'icône ici : UTree affiche déjà une icône de dossier par défaut).
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

// Convertit les DirEntry renvoyées par readDir() en FileTreeItem utilisables
// par le composant UTree, avec le chemin absolu reconstruit via join().
async function entriesToItems(dirPath: string, entries: DirEntry[]): Promise<FileTreeItem[]> {
  const items = await Promise.all(entries.map(async (entry) => {
    const item: FileTreeItem = {
      label: entry.name,
      path: await join(dirPath, entry.name),
      isDir: entry.isDirectory,
      icon: iconFor(entry)
    }
    // Enfant "fantôme" (label vide) pour qu'un dossier affiche une flèche
    // d'expansion sans avoir encore lu son contenu (voir onToggle plus bas).
    if (entry.isDirectory) item.children = [{ label: '', path: '', isDir: false }]
    return item
  }))

  // Dossiers d'abord, puis tri alphabétique dans chaque groupe.
  return items.sort((a, b) => (a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : a.label!.localeCompare(b.label!)))
}

// createSharedComposable : une seule instance de cet état est partagée par
// tous les composants qui appellent useFileExplorer() (même sidebar, même
// arbre de fichiers partout dans l'app).
export const useFileExplorer = createSharedComposable(() => {
  const rootPath = ref<string | null>(null) // dossier racine actuellement ouvert
  const items = ref<FileTreeItem[]>([]) // arbre affiché par UTree
  const selectedItem = ref<FileTreeItem>() // élément sélectionné dans l'arbre (pour créer/supprimer au bon endroit)
  let store: Store | null = null // handle vers settings.json (plugin-store), initialisé dans init()

  // Ouvre la boîte de dialogue native de sélection de dossier, et sauvegarde
  // le choix dans le store pour le retrouver au prochain démarrage.
  async function pickFolder() {
    const selected = await open({ directory: true, multiple: false })
    if (typeof selected !== 'string') return null
    await store?.set(STORE_KEY, selected)
    return selected
  }

  // (Re)lit le contenu du dossier racine et reconstruit l'arbre affiché.
  async function loadRoot() {
    if (!rootPath.value) return
    items.value = await entriesToItems(rootPath.value, await readDir(rootPath.value))
  }

  // À appeler au montage du composant : ouvre le store, restaure le dernier
  // dossier utilisé (ou en demande un nouveau s'il n'y en a pas encore), puis
  // charge son contenu.
  async function init() {
    store = await load(STORE_FILE)
    rootPath.value = (await store.get<string>(STORE_KEY)) ?? (await pickFolder())
    if (rootPath.value) await loadRoot()
  }

  // Charge le contenu réel d'un sous-dossier et remplace son enfant fantôme.
  async function loadChildren(item: FileTreeItem) {
    item.children = await entriesToItems(item.path, await readDir(item.path))
  }

  // Handler d'expansion de UTree : lazy-loading. On ne lit le contenu d'un
  // dossier que la première fois qu'on l'ouvre (détecté via l'enfant
  // fantôme au label vide posé par entriesToItems).
  function onToggle(e: CustomEvent<{ isExpanded: boolean }>, item: FileTreeItem) {
    if (item.isDir && e.detail.isExpanded && item.children?.[0]?.label === '') {
      loadChildren(item)
    }
  }

  // Change de dossier racine (bouton "changer de dossier").
  async function changeFolder() {
    const selected = await pickFolder()
    if (selected) {
      rootPath.value = selected
      await loadRoot()
    }
  }

  // Détermine où créer un nouveau fichier/dossier : dans le dossier
  // sélectionné s'il y en a un, sinon à la racine.
  function targetDir() {
    return selectedItem.value?.isDir ? selectedItem.value.path : rootPath.value
  }

  // Crée un fichier vide via un prompt natif, puis rafraîchit l'arbre.
  async function createFile() {
    const dir = targetDir()
    if (!dir) return
    const name = window.prompt('Nom du fichier :')
    if (!name) return
    await writeTextFile(await join(dir, name), '')
    await loadRoot()
  }

  // Crée un dossier via un prompt natif, puis rafraîchit l'arbre.
  async function createFolder() {
    const dir = targetDir()
    if (!dir) return
    const name = window.prompt('Nom du dossier :')
    if (!name) return
    await mkdir(await join(dir, name))
    await loadRoot()
  }

  // Supprime le fichier sélectionné (no-op si rien n'est sélectionné ou si
  // la sélection est un dossier).
  async function removeSelectedFile() {
    if (!selectedItem.value || selectedItem.value.isDir) return
    await remove(selectedItem.value.path)
    selectedItem.value = undefined
    await loadRoot()
  }

  // Supprime le dossier sélectionné et tout son contenu (recursive: true).
  async function removeSelectedFolder() {
    if (!selectedItem.value || !selectedItem.value.isDir) return
    await remove(selectedItem.value.path, { recursive: true })
    selectedItem.value = undefined
    await loadRoot()
  }

  return {
    rootPath,
    items,
    selectedItem,
    init,
    onToggle,
    changeFolder,
    createFile,
    createFolder,
    removeSelectedFile,
    removeSelectedFolder
  }
})
