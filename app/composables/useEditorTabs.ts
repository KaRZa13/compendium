import { createSharedComposable, useDebounceFn } from '@vueuse/core'

export interface EditorTab {
  path: string
  label: string
  icon?: string
  preview: boolean
}

const _useEditorTabs = () => {
  const { readFile, writeFile } = useFileSystem()

  const tabs = ref<EditorTab[]>([])
  const activeTabPath = ref<string | null>(null)
  const content = ref('')
  const debouncedSave = useDebounceFn((path: string, value: string) => writeFile(path, value), 500)
  let loading = false

  const activeTab = computed(() => tabs.value.find(tab => tab.path === activeTabPath.value) ?? null)

  async function activate(path: string) {
    if (activeTabPath.value === path) return
    if (activeTabPath.value) await writeFile(activeTabPath.value, content.value)

    activeTabPath.value = path
    loading = true
    content.value = await readFile(path)
    loading = false
  }

  async function openTab(item: FileTreeItem, options: { preview?: boolean } = {}) {
    if (item.isDir) return
    const preview = options.preview ?? false
    const existing = tabs.value.find(tab => tab.path === item.path)

    if (existing) {
      if (!preview) existing.preview = false
    } else if (preview) {
      const previewTab = tabs.value.find(tab => tab.preview)
      if (previewTab) {
        previewTab.path = item.path
        previewTab.label = item.label ?? item.path
        previewTab.icon = item.icon
      } else {
        tabs.value.push({ path: item.path, label: item.label ?? item.path, icon: item.icon, preview: true })
      }
    } else {
      tabs.value.push({ path: item.path, label: item.label ?? item.path, icon: item.icon, preview: false })
    }

    await activate(item.path)
  }

  function pinTab(path: string) {
    const tab = tabs.value.find(tab => tab.path === path)
    if (tab) tab.preview = false
  }

  async function closeTab(path: string) {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return
    tabs.value.splice(index, 1)

    if (activeTabPath.value !== path) return

    const next = tabs.value[index] ?? tabs.value[index - 1]
    if (next) {
      activeTabPath.value = null
      await activate(next.path)
    } else {
      activeTabPath.value = null
      content.value = ''
    }
  }

  watch(content, (value) => {
    if (loading || !activeTabPath.value) return
    debouncedSave(activeTabPath.value, value)
  })

  return {
    tabs,
    activeTabPath,
    activeTab,
    content,
    openTab,
    pinTab,
    closeTab,
    activate
  }
}

export const useEditorTabs = createSharedComposable(_useEditorTabs)
