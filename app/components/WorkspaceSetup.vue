<template>
  <UDropdownMenu 
    :items="items" 
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: 'w-full'
    }"
  >
    <UButton
      :label="currentPath"
      icon="i-lucide-chevrons-up-down" 
      color="neutral" 
      variant="ghost" 
      class="data-[state=open]:bg-elevated"
      :ui="{
        base: 'w-full flex'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`
        }" />
      </div>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { rootPath, workspaces, resetRootFolder, setRootFolder } = useFileExplorer()
const currentPath = computed(() => rootPath.value?.split('/').filter(Boolean).pop() || 'Root')

function workspaceName(path: string) {
  return path.split('/').filter(Boolean).pop() || 'Root'
}

const items = computed<DropdownMenuItem[][]>(() => ([
  workspaces.value.map(path => ({
    label: workspaceName(path),
    icon: 'i-lucide-folder',
    onSelect: () => setRootFolder(path),
  })), [
    {
    label: 'Manage folders',
    icon: 'i-lucide-folder-cog',
    onSelect: () => resetRootFolder()
    }
  ]
]))
</script>
