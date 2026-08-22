<template>
  <UHeader 
    :ui="{
      root: 'border-none',
      container: 'h-full w-full sm:px-1.5 lg:px-1.5 px-1.5 max-w-none',
    }"
  >
    <template #top>
      <div data-tauri-drag-region class="absolute inset-0" />
    </template>
    <template #title>
      <UButton 
        variant="ghost"
        color="neutral"
        :icon="!leftCollapsed ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
        @click="leftCollapsed = !leftCollapsed" 
      />
    </template>

    <div>Compendium</div>

    <template #right>
      <UButton 
        variant="ghost"
        color="neutral"
        :icon="!rightCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        @click="rightCollapsed = !rightCollapsed"
      />
      <UColorModeButton />
      <UModal :ui="{ content: 'max-w-5xl h-[80vh]' }">
        <UButton icon="i-lucide-settings" color="neutral" variant="ghost" />

        <template #content>
          <SettingsDashboard />
        </template>
      </UModal>
      <UButton variant="ghost" color="neutral" icon="i-lucide-bug" @click="debugShowStore" />
      <UButton variant="ghost" color="error" icon="i-lucide-trash-2" @click="debugClearStore" />
      <div class="flex gap-2">
        <UButton variant="ghost" color="neutral" icon="i-lucide-minus" @click="minimize" />
        <UButton size="sm" variant="ghost" color="neutral" :icon="isMaximized ? 'i-lucide-minimize-2' : 'i-lucide-square'" @click="toggleMaximize" />
        <UButton variant="ghost" color="error" icon="i-lucide-x" @click="close" />
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

const isMaximized = ref(false)
const appWindow = getCurrentWindow()
const close = () => appWindow.close()
const minimize = () => appWindow.minimize()
const toggleMaximize = () => {
  appWindow.toggleMaximize()
  isMaximized.value = !isMaximized.value
}
const {
  debugShowStore,
  debugClearStore
} = useFileExplorer()

const leftCollapsed = defineModel<boolean>('leftCollapsed', { default: false })
const rightCollapsed = defineModel<boolean>('rightCollapsed', { default: false })
</script>