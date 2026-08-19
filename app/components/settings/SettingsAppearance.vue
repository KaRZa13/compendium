<template>
  <UCard class="w-full">
    <div class="w-full min-h-10 flex px-1">
      <div class="w-full flex flex-col">
        <span>
          Theme
        </span>
        <span class="text-sm text-dimmed">
          Change between light and dark mode
        </span>
      </div>
      <UColorModeSelect />
    </div>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
          Primary color
      </legend>

      <div class="w-full grid grid-cols-4 gap-2 mt-2">
          <ThemePickerButton
            :label="colorMode.value === 'dark' ? 'White' : 'Black'"
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
            :label="color"
            :chip="color"
            :selected="!blackAsPrimary && primary === color"
            @click="primary = color"
          />
        </div>
    </fieldset>

    <USeparator class="my-4"/>

    <fieldset class="w-full min-h-10 flex px-1">
      <legend>
          Background color
      </legend>

      <div class="w-full grid grid-cols-4 gap-2 mt-2">
        <ThemePickerButton
          v-for="color in neutralColors"
          :key="color"
          :label="color"
          :chip="color === 'neutral' ? 'old-neutral' : color"
          :selected="neutral === color"
          @click="neutral = color"
        />
      </div>
    </fieldset>
  </UCard>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const appConfig = useAppConfig()
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
</script>