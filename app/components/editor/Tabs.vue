<template>
  <section class="h-8 flex gap-2 bg-red-500 p-1.5">
    <UButton v-for="tab in fakeTabs" :key="tab.path" :label="tab.name">
      
      <template #trailing>
        <UButton 
          variant="ghost"
          color="neutral" 
          icon="i-lucide-x"
          size="xs"
        />
      </template>
    </UButton>
     
  </section>
</template>

<script setup lang="ts">
const fakeTabs = [
  { name: 'Tab 1', path: '/path/to/tab1' },
  { name: 'Tab 2', path: '/path/to/tab2' },
  { name: 'Tab 3', path: '/path/to/tab3' },
  { name: 'Tab 4', path: '/path/to/tab4' },
  { name: 'Tab 5', path: '/path/to/tab5' },
]
</script>
