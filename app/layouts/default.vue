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
      <UModal :ui="{ content: 'max-w-5xl h-[80vh]' }">
        <UButton icon="i-lucide-settings" color="neutral" variant="ghost" />

        <template #content>
          <SettingsDashboard />
        </template>
      </UModal>
      <div class="flex gap-2">
        <UButton variant="ghost" color="neutral" icon="i-lucide-minus" @click="minimize" />
        <UButton size="sm" variant="ghost" color="neutral":icon="isMaximized ? 'i-lucide-minimize-2' : 'i-lucide-square'" @click="toggleMaximize" />
        <UButton variant="ghost" color="error" icon="i-lucide-x" @click="close" />
      </div>
    </template>
  </UHeader>

  <UDashboardGroup :ui="{ base: 'top-(--ui-header-height)' }">
    <UDashboardSidebar
      side="left"
      collapsible
      v-model:collapsed="leftCollapsed"
      resizable
      :collapsed-size="0"
      :min-size="12"
      :default-size="18"
      :max-size="40"
      :ui="{
        root: ['rounded-lg min-h-[calc(100svh-((var(--ui-header-height))px))] min-w-0 transition-[width] duration-300 ease-out overflow-hidden',
          !leftCollapsed ? 'border-1 border-neutral-800 mx-2 mb-2' : 'border-none'
        ],
        body: !leftCollapsed ? 'rounded-lg px-2 pb-2' : '',
      }"
    >
      <template #default="{ collapsed }">
        <section v-show="!collapsed" class="flex flex-col gap-4" >
          <div class="w-full flex justify-center items-center gap-2">
            <UTooltip 
            v-for="(button, index) in buttons"
            :key="index"
            :text="button.tooltip"
            >
              <UButton
                :color="button.color"
                :variant="button.variant"
                :icon="button.icon"
                @click="button.onClick"
              />
            </UTooltip>
          </div>
          <UTree
            v-model="selectedItem"
            :items="items"
            @toggle="onToggle"
          />
        </section>
      </template>

      <template #footer="{ collapsed }">
        <SidebarAppearanceMenu />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel
      :ui="{
        root: ['min-h-[calc(100svh-((var(--ui-header-height))px))] border-1 rounded-lg mb-2',
          !leftCollapsed && !rightCollapsed ? 'mx-0' : '',
          leftCollapsed && !rightCollapsed ? 'ml-2 mr-0' : '',
          !leftCollapsed && rightCollapsed ? 'ml-0 mr-2' : '',
          leftCollapsed && rightCollapsed ? 'mx-2' : ''
        ],
      }">
      <slot />
    </UDashboardPanel>

    <UDashboardSidebar
      side="right"
      collapsible
      v-model:collapsed="rightCollapsed"
      resizable
      :collapsed-size="0"
      :min-size="12"
      :default-size="18"
      :max-size="40"
      :ui="{
        root: ['border-none rounded-lg min-h-[calc(100svh-((var(--ui-header-height))px))] min-w-0 transition-[width] duration-300 ease-out overflow-hidden',
          !rightCollapsed ? 'px-2 pb-2' : ''
        ],
        body: !rightCollapsed ? 'border-1 border-neutral-800 rounded-lg px-2 pb-2' : '',
      }"
    >
      <template #default="{ collapsed }">
        <div v-show="!collapsed">
          
        </div>
      </template>
    </UDashboardSidebar>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { getCurrentWindow } from '@tauri-apps/api/window'

const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

const isMaximized = ref(false)
const appWindow = getCurrentWindow()
const close = () => appWindow.close()
const minimize = () => appWindow.minimize()
const toggleMaximize = () => {
  appWindow.toggleMaximize()
  isMaximized.value = !isMaximized.value
}

const { items, selectedItem, init, onToggle, createFile, createFolder, removeSelectedFolder, removeSelectedFile } = useFileExplorer()

const buttons: Array<{
  color: ButtonProps['color']
  variant: ButtonProps['variant']
  icon: string
  tooltip: string
  onClick: (event: MouseEvent) => void
}> = [
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-file-plus',
    tooltip: 'Create File',
    onClick: createFile
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-folder-plus',
    tooltip: 'Create Folder',
    onClick: createFolder
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-arrow-up-narrow-wide',
    tooltip: 'Change sort order',
    onClick: removeSelectedFolder
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-up-down',
    tooltip: 'Expand all',
    onClick: removeSelectedFile
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-down-up',
    tooltip: 'Collapse all',
    onClick: removeSelectedFile
  }
]

defineShortcuts({
  'ctrl_b' : () => {
    leftCollapsed.value = !leftCollapsed.value
  },
  'ctrl_alt_b': () => {
    rightCollapsed.value = !rightCollapsed.value
  }
})

onMounted(() => {
  init()
})
</script>
