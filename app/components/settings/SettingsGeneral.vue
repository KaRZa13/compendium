<template>
  <UCard class="w-full">
    <div class="w-full min-h-10 flex px-1">
      <div class="w-full flex flex-col">
        <span>
          Version 0.1.0
        </span>
        <ULink
          href="docs/CHANGELOG.md"
          target="_blank"
          class="text-sm text-dimmed hover:text-primary"
        >
          See the changelog
        </ULink>
      </div>
      <UButton 
        icon="i-lucide-refresh-cw"
        label="Check for updates"
        variant="outline"
        color="neutral"
        size="sm"
      />
    </div>

    <USeparator class="my-4"/>

    <div class="w-full min-h-10 flex px-1 justify-between items-center">
      <span>
        Automatic updates
      </span>
      <USwitch v-model="value" size="md"/>
    </div>

    <USeparator class="my-4"/>

    <div class="w-full min-h-10 flex px-1">
      <div class="w-full flex flex-col">
        <span>
          Language
        </span>
        <span class="text-sm text-dimmed">
          Change the display language
        </span>
      </div>
      <ULocaleSelect v-model="locale" :locales="Object.values(locales)" size="md"/>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const locale = ref('en')
const value = ref(true)
</script>