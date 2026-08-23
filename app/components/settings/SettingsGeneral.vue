<template>
  <UCard class="w-full">
    <div class="w-full min-h-10 flex items-center px-1">
      <div class="w-full flex flex-col">
        <span>
          {{ t('settings.sections.general_settings.children.general.children.version.label', { versionNumber: appConfig.version }) }}
        </span>
        <ULink
          href="docs/CHANGELOG.md"
          target="_blank"
          class="text-sm text-dimmed hover:text-primary"
        >
          {{ t('settings.sections.general_settings.children.general.children.version.changelog') }}
        </ULink>
      </div>
      <UButton 
        icon="i-lucide-refresh-cw"
        :label="t('settings.sections.general_settings.children.general.children.version.button_label')"
        variant="outline"
        color="neutral"
        size="sm"
      />
    </div>

    <USeparator class="my-4"/>

    <div class="w-full min-h-10 flex px-1 justify-between items-center">
      <span>
        {{ t('settings.sections.general_settings.children.general.children.auto_update.label') }}
      </span>
      <USwitch v-model="value" size="md"/>
    </div>

    <USeparator class="my-4"/>

    <div class="w-full min-h-10 flex items-center px-1">
      <div class="w-full flex flex-col">
        <span>
          {{ t('settings.sections.general_settings.children.general.children.language.label') }}
        </span>
        <span class="text-sm text-dimmed">
          {{ t('settings.sections.general_settings.children.general.children.language.description') }}
        </span>
      </div>
      <ULocaleSelect 
        size="md"
        :model-value="locale" 
        :locales="[en, fr]" 
        @update:model-value="setLocale($event)" 
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { en, fr } from '@nuxt/ui/locale'

const { t, locale, setLocale } = useI18n()
const value = ref(true)
const appConfig = useAppConfig()
</script>