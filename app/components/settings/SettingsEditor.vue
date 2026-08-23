<template>
  <div v-for="(sections, indexSections) in editorSettings" :key="indexSections" class="w-full">
    <div v-if="sections.inputType === 'heading' && sections.label" class="w-full min-h-10 flex items-center px-1 pb-4 pt-6">
      <span>
        {{ sections.label }}
      </span>
    </div>
    
    <UCard class="w-full">
      <div v-for="(child, indexSection) in sections.children" :key="indexSection" class="w-full">
        <div class="w-full min-h-10 flex items-center px-1">
          <div class="w-full flex flex-col">
            <span>
              {{ child.label }}
            </span>
            <span class="text-sm text-dimmed">
              {{ child.description }}
            </span>
          </div>
          <USwitch v-if="child.inputType === 'switch'" v-model="child.value" size="md"/>
          <div v-if="child.inputType === 'number' && typeof child.value === 'number'" class="flex justify-end items-center gap-2">
            <UButton
              @click="resetValue(`${indexSections}-${indexSection}`, child)"
              icon="i-lucide-refresh-cw"
              size="md"
              color="neutral"
              variant="ghost"
              :ui="{ leadingIcon: spinningKey === `${indexSections}-${indexSection}` ? 'animate-spin-once' : '' }"
            />
            <UInputNumber v-model="child.value" size="md" :min="2" :max="8" />
          </div>
        </div>
    
        <USeparator v-if="child !== sections.children?.[sections.children.length - 1]" class="my-4"/>
      </div>
    </UCard>
  </div>


</template>

<script setup lang="ts">
interface EditorSetting {
  label?: string
  description?: string
  inputType: 'heading' | 'switch' | 'number'
  value?: boolean | number | null
  children?: EditorSetting[]
}

const { t } = useI18n()

const editorSettings = ref<EditorSetting[]>([
  {
    inputType: 'heading',
    children: [
      {
        label: t('settings.sections.general_settings.children.editor.children.base.fold_heading.label'),
        description: t('settings.sections.general_settings.children.editor.children.base.fold_heading.description'),
        inputType: 'switch',
        value: true,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.base.fold_indent.label'),
        description: t('settings.sections.general_settings.children.editor.children.base.fold_indent.description'),
        inputType: 'switch',
        value: true,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.base.line_numbers.label'),
        description: t('settings.sections.general_settings.children.editor.children.base.line_numbers.description'),
        inputType: 'switch',
        value: false,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.base.indent_guide.label'),
        description: t('settings.sections.general_settings.children.editor.children.base.indent_guide.description'),
        inputType: 'switch',
        value: false,
      },
    ],
  },
  {
    label: 'Behavior',
    inputType: 'heading',
    children: [
      {
        label: t('settings.sections.general_settings.children.editor.children.behavior.auto_close_brackets.label'),
        description: t('settings.sections.general_settings.children.editor.children.behavior.auto_close_brackets.description'),
        inputType: 'switch',
        value: false,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.behavior.auto_close_md_tags.label'),
        description: t('settings.sections.general_settings.children.editor.children.behavior.auto_close_md_tags.description'),
        inputType: 'switch',
        value: false,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.behavior.indent_using_tabs.label'),
        description: t('settings.sections.general_settings.children.editor.children.behavior.indent_using_tabs.description'), 
        inputType: 'switch',
        value: true,
      },
      {
        label: t('settings.sections.general_settings.children.editor.children.behavior.indent_width.label'),
        description: t('settings.sections.general_settings.children.editor.children.behavior.indent_width.description'),
        inputType: 'number',
        value: 4,
      }
    ]
  },
])

const spinningKey = ref<string | null>(null)

function resetValue(key: string, child: EditorSetting) {
  child.value = 4
  spinningKey.value = null
  nextTick(() => {
    spinningKey.value = key
    setTimeout(() => {
      if (spinningKey.value === key) spinningKey.value = null
    }, 400)
  })
}
</script>