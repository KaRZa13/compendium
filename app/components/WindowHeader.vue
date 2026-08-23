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
      <UTooltip :text="!leftCollapsed ? t('tooltip.collapse_sidebar') : t('tooltip.expand_sidebar')">
        <UButton 
          variant="ghost"
          color="neutral"
          :icon="!leftCollapsed ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
          @click="leftCollapsed = !leftCollapsed" 
        />
      </UTooltip>
    </template>

    <div>
      {{ getWindowTitle() }}
    </div>

    <template #right>
      <UTooltip :text="!rightCollapsed ? t('tooltip.collapse_sidebar') : t('tooltip.expand_sidebar')">
        <UButton 
          variant="ghost"
          color="neutral"
          :icon="!rightCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
          @click="rightCollapsed = !rightCollapsed"
        />
      </UTooltip>
      <UColorModeButton />
      <UModal :ui="{ content: 'max-w-5xl h-[80vh]' }">
        <UTooltip :text="t('tooltip.settings')">
          <UButton icon="i-lucide-settings" color="neutral" variant="ghost" />
        </UTooltip>

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

const { t } = useI18n()
const isMaximized = ref(false)
const appWindow = getCurrentWindow()
const close = () => appWindow.close()
const minimize = () => appWindow.minimize()
const toggleMaximize = () => {
  appWindow.toggleMaximize()
  isMaximized.value = !isMaximized.value
}
const {
  rootPath,
  selectedItem,
  debugShowStore,
  debugClearStore
} = useFileExplorer()

const leftCollapsed = defineModel<boolean>('leftCollapsed', { default: false })
const rightCollapsed = defineModel<boolean>('rightCollapsed', { default: false })

function getWindowTitle() {
  if (!selectedItem.value || selectedItem.value.isDir) {
    return `${rootPath.value?.split('/').pop()} - Compendium`
  } else {
    return `${selectedItem.value.label} - ${rootPath.value?.split('/').pop()} - Compendium`
  }
}
</script>