<template>
  <UButton
    size="lg"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="capitalize ring-default rounded-sm text-sm"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip || !!slots.leading" #leading>
      <slot name="leading">
        <span
          class="inline-block size-2 rounded-full"
          :class="`bg-(--color-light) dark:bg-(--color-dark)`"
          :style="{
            '--color-light': chipShade?.[500],
            '--color-dark': chipShade?.[400]
          }"
        />
      </slot>
    </template>
  </UButton>
</template>

<script setup lang="ts">
import colors from 'tailwindcss/colors'

const props = defineProps<{
  label: string
  icon?: string
  chip?: string
  selected?: boolean
}>()

const slots = defineSlots<{
  leading: () => any
}>()

const chipShade = computed(() => props.chip ? (colors as unknown as Record<string, Record<string, string>>)[props.chip] : undefined)
</script>