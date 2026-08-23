<template>
  <UTree
    expanded-icon="i-lucide-folder-open"
    collapsed-icon="i-lucide-folder"
    v-model="selectedItem"
    v-model:expanded="expanded"
    :get-key="(item) => item.path"
    :items="items"
    :ui="{ linkLabel: 'flex-1 min-w-0' }"
    @toggle="onToggle"
    :unmount-on-hide="false"
  >
    <template #item-leading="{ item, expanded, ui }">
      <UIcon
        v-if="item.isDir"
        :name="expanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
        :class="ui.linkLeadingIcon()"
      />
    </template>
    <template #item-label="{ item }">
      <UContextMenu v-if="editingPath !== item.path" :items="getContextMenuItems(item)">
        <div
          class="flex items-start rounded"
          :class="[
            draggedItem?.path === item.path ? 'opacity-50' : '',
            dragOverPath === item.path ? 'bg-elevated' : ''
          ]"
          draggable="true"
          @dblclick="item.isDir && toggleExpanded(item)"
          @dragstart="onDragStart($event, item)"
          @dragend="onDragEnd"
          @dragenter="onDragEnterItem($event, item)"
          @dragover="onDragOverItem($event, item)"
          @dragleave="onDragLeaveItem($event, item)"
          @drop="onDropOnItem($event, item)"
        >
          {{ item.label?.split('.')?.[0] }}
        </div>
      </UContextMenu>
      
      <div v-else class="flex items-start">
        <UInput
          autofocus
          v-model="newName"
          :placeholder="item.label?.split('.')?.[0]"
          @keydown.stop
          @keyup.enter="confirmRename"
          @blur="confirmRename"
          @focus="$event.target.select()"
        />
      </div>
    </template>
    <template #item-trailing="{ item, ui }">
      <UIcon
        v-if="item.isDir"
        name="i-lucide-chevron-down"
        :class="[ui.linkTrailingIcon(), expanded.includes(item.path) ? 'rotate-180' : '']"
        @click.stop="toggleExpanded(item)"
      />
    </template>
  </UTree>
</template>

<script setup lang="ts">
const { t } = useI18n()
const editingPath = ref<string | null>(null)
const newName = ref('')
const {
  items,
  selectedItem,
  expanded,
  initFileExplorer,
  onToggle,
  loadChildren,
  renameSelectedItem,
  deleteSelectedItem,
  moveItem,
} = useFileExplorer()

onMounted(() => {
  initFileExplorer()
})

async function confirmRename() {
  await renameSelectedItem(newName.value)
  editingPath.value = null
}

async function toggleExpanded(item: FileTreeItem) {
  const key = item.path
  const i = expanded.value.indexOf(key)
  if (i === -1) {
    expanded.value.push(key)
    await loadChildren(item)
  } else {
    expanded.value.splice(i, 1)
  }
}

function getContextMenuItems(item: FileTreeItem) {
  const items = [
    {
      label: t('context_menu.rename'),
      icon: 'i-lucide-pencil-line',
      onSelect: () => {
        selectedItem.value = item
        newName.value = item.label?.split('.')?.[0] ?? ''
        editingPath.value = item.path
      }
    },
    {
      label: t('context_menu.delete'),
      icon: 'i-lucide-trash-2',
      onSelect: deleteSelectedItem
    }
  ]
  return items
}

//#region Drag and Drop
const draggedItem = shallowRef<FileTreeItem | null>(null)
const dragOverPath = ref<string | null>(null)

const canDropInto = (source: FileTreeItem, targetDirPath: string) => {
  if (!source.isDir) return true
  return source.path !== targetDirPath && !targetDirPath.startsWith(`${source.path}/`)
}

const onDragStart = (e: DragEvent, item: FileTreeItem) => {
  draggedItem.value = item
  e.dataTransfer?.setData('text/plain', item.path)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  draggedItem.value = null
  dragOverPath.value = null
}

const onDragEnterItem = (e: DragEvent, item: FileTreeItem) => {
  if (!item.isDir || !draggedItem.value || !canDropInto(draggedItem.value, item.path)) return
  e.preventDefault()
  dragOverPath.value = item.path
}

const onDragOverItem = (e: DragEvent, item: FileTreeItem) => {
  if (!item.isDir || !draggedItem.value || !canDropInto(draggedItem.value, item.path)) return
  e.preventDefault()
}

const onDragLeaveItem = (e: DragEvent, item: FileTreeItem) => {
  const related = e.relatedTarget as Node | null
  if (related && (e.currentTarget as HTMLElement).contains(related)) return
  if (dragOverPath.value === item.path) dragOverPath.value = null
}

const onDropOnItem = async (e: DragEvent, item: FileTreeItem) => {
  if (!item.isDir || !draggedItem.value || !canDropInto(draggedItem.value, item.path)) return
  e.preventDefault()
  e.stopPropagation()
  const source = draggedItem.value
  draggedItem.value = null
  dragOverPath.value = null
  await moveItem(source, item.path)
}
//#endregion
</script>