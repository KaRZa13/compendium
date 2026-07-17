<template>
  <div class="flex flex-col h-screen">
    <WindowTitleBar @toggle-sidebar="toggleFileExplorer"/>
    <div class="flex-1 flex overflow-hidden">
      <!-- Navigation Sidebar -->
      <USidebar
        v-model:open="closedSidebar"
        collapsible="icon"
        :ui="{
            gap: 'hidden',
            container: 'static h-full',
          }"
      >
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </USidebar>

      <!-- File Explorer -->
      <USidebar
        v-model:open="fileExplorerOpen"
        collapsible="offcanvas"
        :ui="{
            gap: 'hidden',
            container: 'static h-full overflow-hidden data-[state=collapsed]:w-0',
          }"
      >
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </USidebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const fileExplorerOpen = ref(true)
const closedSidebar = ref(false)

function toggleFileExplorer() {
  fileExplorerOpen.value = !fileExplorerOpen.value
}

const items: NavigationMenuItem[] = [
  {
    label: '',
    icon: 'i-lucide-house',
    active: true
  },
  {
    label: '',
    icon: 'i-lucide-inbox',
  },
  {
    label: '',
    icon: 'i-lucide-users'
  }
]
</script>

