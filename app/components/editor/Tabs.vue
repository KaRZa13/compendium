<template>
  <section v-if="tabs.length" class="h-8 flex items-stretch gap-0.5 p-1 overflow-x-auto">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="group flex items-center gap-1.5 pl-2.5 pr-1 rounded cursor-pointer select-none max-w-48"
      :class="[
        tab.path === activeTabPath ? 'bg-elevated' : 'hover:bg-elevated/50'
      ]"
      @click="activate(tab.path)"
      @dblclick="pinTab(tab.path)"
      @mousedown.middle="closeTab(tab.path)"
    >
      <UIcon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
      <span
        class="truncate text-sm"
        :class="tab.preview ? 'italic text-muted' : ''"
      >
        {{ tab.label }}
      </span>
      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-x"
        size="xs"
        class="shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer"
        :class="tab.path === activeTabPath ? 'opacity-100' : ''"
        @click.stop="closeTab(tab.path)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const { tabs, activeTabPath, activate, pinTab, closeTab } = useEditorTabs()
</script>
