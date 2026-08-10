<template>
  <UDropdownMenu 
    :items="items" 
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton 
      label="TEST" 
      icon="i-lucide-chevrons-up-down" 
      color="neutral" 
      variant="ghost" 
      block
      class="data-[state=open]:bg-elevated"  
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`
        }" />
      </div>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const currentFolder = ref('My Folder')

const items = computed<DropdownMenuItem[][]>(() => ([[
    {
      label: currentFolder.value,
      trailingIcon: 'i-lucide-chevron-right',
    }], [{
      label: 'Manage folders',
      icon: 'i-lucide-folder-cog',
    }]]
  )
)
</script>
