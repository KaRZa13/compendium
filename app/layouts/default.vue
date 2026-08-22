<template>
  <WindowHeader v-model:left-collapsed="leftCollapsed" v-model:right-collapsed="rightCollapsed" />

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
          !leftCollapsed ? 'border-1 border-neutral-200 dark:border-neutral-800 mx-2 mb-2' : 'border-none'
        ],
        body: !leftCollapsed ? 'rounded-lg px-2 pb-2' : '',
      }"
    >
      <template #default="{ collapsed }">
        <section v-show="!collapsed" class="flex flex-col gap-4" >
          <SidebarContextButton />
          <SidebarFileTree />
        </section>
      </template>

      <template #footer="{ collapsed }">
        <SidebarWorkspaceSetup v-show="!collapsed" />
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
        body: !rightCollapsed ? 'border-1 border-neutral-200 dark:border-neutral-800 rounded-lg px-2 pb-2' : '',
      }"
    >
      <template #default="{ collapsed }">
        <div v-show="!collapsed">
          
        </div>
      </template>
    </UDashboardSidebar>
  </UDashboardGroup>

  <OnboardingWorkspaceSetupModal />
</template>

<script setup lang="ts">
// Sidebar State
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

defineShortcuts({
  'ctrl_b' : () => {
    leftCollapsed.value = !leftCollapsed.value
  },
  'ctrl_alt_b': () => {
    rightCollapsed.value = !rightCollapsed.value
  }
})
</script>
