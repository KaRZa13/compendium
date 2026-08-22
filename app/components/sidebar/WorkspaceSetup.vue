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
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { rootPath, workspaces, resetRootFolder, setRootFolder } = useFileExplorer()
const currentPath = computed(() => rootPath.value?.split('/').filter(Boolean).pop() || '')

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
