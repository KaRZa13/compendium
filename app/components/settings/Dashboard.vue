<template>
  <div class="flex flex-col flex-1">
    <UHeader title="" :ui="{ container: 'px-4! max-w-none justify-center' }">
      <template #default>
        <span class="font-bold">Settings</span>
      </template>
    </UHeader>

    <div class="flex flex-1 min-h-0">
      <USidebar
        collapsible="none"
        :ui="{
          gap: 'h-[calc(100%-var(--ui-header-height))]',
          container:
            'absolute top-(--ui-header-height) bottom-0 h-[calc(100%-var(--ui-header-height))]'
        }"
      >
        <UNavigationMenu
          orientation="vertical"
          :items="tabs"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </USidebar>

      <div class="flex-1 px-10 py-12">
        <component :is="components[activeTab]" class="size-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const components: Record<string, any> = {
  general: resolveComponent('SettingsGeneral'),
  appearance: resolveComponent('SettingsAppearance'),
  editor: resolveComponent('SettingsEditor'),
  shortcuts: resolveComponent('SettingsShortcuts'),
  canvas: resolveComponent('SettingsCanvas'),
  daily: resolveComponent('SettingsDaily'),
  templates: resolveComponent('SettingsTemplates')
}

const activeTab = ref('general')
const tabs = computed<NavigationMenuItem[][]>(() => [
  [{
    label: 'Options',
    type: 'label'
  },
  {
    label: 'General',
    icon: 'i-lucide-house',
    active: activeTab.value === 'general',
    onSelect: () => {
      activeTab.value = 'general'
    }
  },
  {
    label: 'Appearance',
    icon: 'i-lucide-swatch-book',
    active: activeTab.value === 'appearance',
    onSelect: () => {
      activeTab.value = 'appearance'
    }
  },
  {
    label: 'Interface',
    icon: 'i-lucide-laptop-minimal',
    active: activeTab.value === 'interface',
    onSelect: () => {
      activeTab.value = 'interface'
    }
  },
  {
    label: 'Editor',
    icon: 'i-lucide-pencil-line',
    active: activeTab.value === 'editor',
    onSelect: () => {
      activeTab.value = 'editor'
    }
  },
  {
    label: 'Shortcuts',
    icon: 'i-lucide-command',
    active: activeTab.value === 'shortcuts',
    onSelect: () => {
      activeTab.value = 'shortcuts'
    }
  }],
  [{
    label: 'Core',
    type: 'label'
  },
  {
    label: 'Canvas',
    icon: 'i-lucide-layout-dashboard',
    active: activeTab.value === 'canvas',
    onSelect: () => {
      activeTab.value = 'canvas'
    }
  },
  {
    label: 'Daily Report',
    icon: 'i-lucide-calendar',
    active: activeTab.value === 'daily',
    onSelect: () => {
      activeTab.value = 'daily'
    }
  },
  {
    label: 'Templates',
    icon: 'i-lucide-file-text',
    active: activeTab.value === 'templates',
    onSelect: () => {
      activeTab.value = 'templates'
    }
  }]
])
</script>