import { join } from '@tauri-apps/api/path'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { mkdir, remove, rename, writeTextFile, readDir } from '@tauri-apps/plugin-fs'

export interface FileSystemItem {
  path: string
  name: string
  isDir: boolean
  children?: FileSystemItem[]
  createdAt?: Date
  updatedAt?: Date
  extension?: string
}

function dirname(path: string): string {
  return path.split('/').slice(0, -1).join('/')
}

async function uniqueName(location: string, name: string, ext = ''): Promise<string> {
  const existing = new Set((await readDir(location)).map(entry => entry.name))
  if (!existing.has(name + ext)) return name + ext

  let i = 2
  while (existing.has(`${name} ${i}${ext}`)) i++
  return `${name} ${i}${ext}`
}

export function useFileSystem() {
  async function pickFolder(): Promise<string | null> {
    const selected = await openDialog({ directory: true, multiple: false })
    return typeof selected === 'string' ? selected : null
  }

  //#region Basic File System Operations
  async function createFile(location: string): Promise<string> {
    const name = await uniqueName(location, 'Untitled', '.md')
    const path = await join(location, name)
    await writeTextFile(path, '')
    return path
  }

  async function createFolder(location: string, name?: string): Promise<string> {
    const folderName = name || await uniqueName(location, 'New Folder')
    const path = await join(location, folderName)
    await mkdir(path)
    return path
  }

  async function deleteItem(item: FileSystemItem): Promise<void> {
    if (item.isDir) {
      await remove(item.path, { recursive: true })
    } else {
      await remove(item.path)
    }
  }

  async function renameItem(item: FileSystemItem, newName: string): Promise<string> {
    if (!newName || newName === item.name) return item.path
    if (!item.isDir && !newName.endsWith('.md')) newName += '.md'

    const newPath = await join(dirname(item.path), newName)
    await rename(item.path, newPath)
    return newPath
  }

  async function moveItem(item: FileSystemItem, targetDir: string): Promise<string> {
    const sourceDir = dirname(item.path)
    if (sourceDir === targetDir) return item.path
    if (item.isDir && (item.path === targetDir || targetDir.startsWith(`${item.path}/`))) return item.path

    const newPath = await join(targetDir, item.name)
    await rename(item.path, newPath)
    return newPath
  }
  //#endregion

  return {
    pickFolder,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    moveItem
  }
}
