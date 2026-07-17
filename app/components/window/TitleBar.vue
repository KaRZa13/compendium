<template>
  <UHeader data-tauri-drag-region toggle-side="left" :ui="{
    root: 'w-full h-10',
    container: 'flex h-full w-full max-w-none px-1 sm:px-1 lg:px-1 mx-0'
  }">
    <template #left>
      <UButton icon="i-lucide-panel-left" color="neutral" variant="ghost" aria-label="Toggle sidebar"
        @click="emit('toggleSidebar')" />
    </template>
    <div class="w-full flex items-center justify-center h-full font-medium text-sm">
      <span>My Tauri App</span>
    </div>
    <template #right>
      <div class="flex gap-2">
        <UButton variant="ghost" color="neutral" icon="i-lucide-minus" @click="minimize" />
        <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-square" @click="toggleMaximize" />
        <UButton variant="ghost" color="error" icon="i-lucide-x" @click="close" />
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

const emit = defineEmits<{
  toggleSidebar: []
}>()

const appWindow = getCurrentWindow()
const minimize = () => appWindow.minimize()
const toggleMaximize = () => appWindow.toggleMaximize()
const close = () => appWindow.close()
</script>