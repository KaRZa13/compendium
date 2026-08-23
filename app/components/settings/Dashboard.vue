<template>
  <div class="h-full flex flex-col flex-1">
    <UHeader title="" :ui="{ container: 'px-4! max-w-none justify-center' }">
      <template #default>
        <span class="font-bold">{{ t('settings.title') }}</span>
      </template>
    </UHeader>

    <div class="h-full flex flex-1">
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

      <UScrollArea
        shadow
        class="h-full w-full flex-1 px-10 py-12"
      >
        <component :is="components[activeTab]" />
      </UScrollArea>
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

const { t } = useI18n()
const activeTab = ref('general')
const tabs = computed<NavigationMenuItem[][]>(() => [
  [{
    label: t('settings.sections.general_settings.label'),
    type: 'label'
  },
  {
    label: t('settings.sections.general_settings.children.general.label'),
    icon: 'i-lucide-house',
    active: activeTab.value === 'general',
    onSelect: () => {
      activeTab.value = 'general'
    }
  },
  {
    label: t('settings.sections.general_settings.children.appearance.label'),
    icon: 'i-lucide-swatch-book',
    active: activeTab.value === 'appearance',
    onSelect: () => {
      activeTab.value = 'appearance'
    }
  },
  {
    label: t('settings.sections.general_settings.children.editor.label'),
    icon: 'i-lucide-pencil-line',
    active: activeTab.value === 'editor',
    onSelect: () => {
      activeTab.value = 'editor'
    }
  },
  {
    label: t('settings.sections.general_settings.children.shortcuts.label'),
    icon: 'i-lucide-command',
    active: activeTab.value === 'shortcuts',
    onSelect: () => {
      activeTab.value = 'shortcuts'
    }
  }],
  [{
    label: t('settings.sections.core.label'),
    type: 'label'
  },
  {
    label: t('settings.sections.core.children.canvas.label'),
    icon: 'i-lucide-layout-dashboard',
    active: activeTab.value === 'canvas',
    onSelect: () => {
      activeTab.value = 'canvas'
    }
  },
  {
    label: t('settings.sections.core.children.daily_report.label'),
    icon: 'i-lucide-calendar',
    active: activeTab.value === 'daily',
    onSelect: () => {
      activeTab.value = 'daily'
    }
  },
  {
    label: t('settings.sections.core.children.templates.label'),
    icon: 'i-lucide-file-text',
    active: activeTab.value === 'templates',
    onSelect: () => {
      activeTab.value = 'templates'
    }
  }]
])
</script>