<template>
  <UCard class="w-full">
    <div class="w-full min-h-10 flex items-center px-1">
      <div class="w-full flex flex-col">
        <span>
          {{ t('settings.sections.general_settings.children.appearance.children.theme.label') }}
        </span>
        <span class="text-sm text-dimmed">
          {{ t('settings.sections.general_settings.children.appearance.children.theme.description') }}
        </span>
      </div>
      <USelect
        v-model="colorMode.preference"
        :items="colorItems"
        value-key="value"
        :icon="icon"
      />
    </div>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
          {{ t('settings.sections.general_settings.children.appearance.children.primary.label') }}
      </legend>

      <div class="w-full grid grid-cols-4 gap-2 mt-2">
          <ThemePickerButton
            :label="colorMode.value === 'dark' 
              ? t('settings.sections.general_settings.children.appearance.children.primary.colors.white') 
              : t('settings.sections.general_settings.children.appearance.children.primary.colors.black')"
            :selected="blackAsPrimary"
            @click="setBlackAsPrimary(true)"
          >
            <template #leading>
              <span class="inline-block size-2 rounded-full bg-black dark:bg-white" />
            </template>
          </ThemePickerButton>

          <ThemePickerButton
            v-for="color in primaryColors"
            :key="color"
            :label="t(`settings.sections.general_settings.children.appearance.children.primary.colors.${color}`)"
            :chip="color"
            :selected="!blackAsPrimary && primary === color"
            @click="primary = color"
          />
        </div>
    </fieldset>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
          {{ t('settings.sections.general_settings.children.appearance.children.background.label') }}
      </legend>

      <div class="w-full grid grid-cols-4 gap-2 mt-2">
        <ThemePickerButton
          v-for="color in neutralColors"
          :key="color"
          :label="t(`settings.sections.general_settings.children.appearance.children.background.colors.${color}`)"
          :chip="color === 'neutral' ? 'old-neutral' : color"
          :selected="neutral === color"
          @click="neutral = color"
        />
      </div>
    </fieldset>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
        {{ t('settings.sections.general_settings.children.appearance.children.radius.label') }}
      </legend>

      <div class="w-full grid grid-cols-5 gap-2 mt-2">
        <ThemePickerButton
          v-for="r in radiuses"
          :key="r"
          :label="`${r}`"
          :selected="radius === r"
          @click="radius = r"
        />
      </div>
    </fieldset>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
        {{ t('settings.sections.general_settings.children.appearance.children.font.label') }}
      </legend>

      <div class="w-full gap-2 mt-2">
        <USelect
            v-model="font"
            color="neutral"
            icon="i-lucide-type"
            :items="fonts"
            class="w-full ring-default rounded-sm hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
        />
      </div>
    </fieldset>
    <USeparator class="my-4"/>

    <div class="w-full min-h-10 flex px-1 justify-between items-center">
      <div class="w-full flex flex-col">
        <span class="text-error">
          {{ t('settings.sections.general_settings.children.appearance.children.reset_theme.label') }}
        </span>
        <span class="text-sm text-dimmed">
          {{ t('settings.sections.general_settings.children.appearance.children.reset_theme.description') }}
        </span>
      </div>
      <UButton
        :label="t('buttons.reset')"
        variant="outline"
        color="error"
        @click="resetTheme()"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()
const {
  neutralColors,
  neutral,
  primaryColors,
  primary,
  blackAsPrimary,
  setBlackAsPrimary,
  radiuses,
  radius,
  fonts,
  font,
  resetTheme
} = useTheme()

const colorItems = ref([
  { 
    label: t('settings.sections.general_settings.children.appearance.children.theme.button_label_light'), 
    value: 'light',
    icon: 'i-lucide-sun'
  },
  { 
    label: t('settings.sections.general_settings.children.appearance.children.theme.button_label_dark'), 
    value: 'dark',
    icon: 'i-lucide-moon'
  }
])
const icon = computed(() => colorItems.value.find(item => item.value === colorMode.preference)?.icon)
</script>