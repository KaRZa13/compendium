<template>
  <div class="w-full flex justify-center items-center gap-2">
    <UTooltip 
      v-for="(button, index) in buttons.slice(0, 2)"
      :key="index"
      :text="button.tooltip"
    >
      <UButton 
        :color="button.color"
        :variant="button.variant"
        :icon="button.icon"
        @click="button.onClick" 
      />
    </UTooltip>

    <UDropdownMenu :items="sortItems" placement="bottom-start">
      <UTooltip :text="t('tooltip.change_sort_order')">
        <UButton 
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-up-narrow-wide"
        />
      </UTooltip>
    </UDropdownMenu>
    
    <UTooltip 
      v-for="(button, index) in buttons.slice(2, 4)"
      :key="index"
      :text="button.tooltip"
    >
      <UButton 
        :color="button.color"
        :variant="button.variant"
        :icon="button.icon"
        @click="button.onClick" 
      />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps, DropdownMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const {
  items,
  expanded,
  loadChildren,
  createItem,
  setSortOrder,
} = useFileExplorer()

const selectedFilter = ref<'nameAsc' | 'nameDesc' | 'modifiedAsc' | 'modifiedDesc' | 'createdAsc' | 'createdDesc'>('nameAsc')

async function expandAll() {
  const expandNode = async (node: FileTreeItem) => {
    if (!node.isDir) return
    if (!expanded.value.includes(node.path)) {
      expanded.value.push(node.path)
    }

    await loadChildren(node)
    if (node.children) {
      for (const child of node.children) {
        await expandNode(child)
      }
    }
  }

  for (const item of items.value) {
    await expandNode(item)
  }
}

function collapseAll() {
  expanded.value = []
}

const sortItems = computed(() => [
  [{
    label: t('filters.name_asc'),
    type: 'checkbox',
    icon: 'i-lucide-arrow-down-a-z',
    checked: selectedFilter.value === 'nameAsc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('name', 'asc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'nameAsc'
      }
    }
  },
  {
    label: t('filters.name_desc'),
    type: 'checkbox',
    icon: 'i-lucide-arrow-up-z-a',
    checked: selectedFilter.value === 'nameDesc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('name', 'desc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'nameDesc'
      }
    }
  }],
  [{
    label: t('filters.modified_asc'),
    type: 'checkbox',
    icon: 'i-lucide-calendar-arrow-up',
    checked: selectedFilter.value === 'modifiedAsc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('modified', 'asc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'modifiedAsc'
      }
    }
  },
  {
    label: t('filters.modified_desc'),
    type: 'checkbox',
    icon: 'i-lucide-calendar-arrow-down',
    checked: selectedFilter.value === 'modifiedDesc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('modified', 'desc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'modifiedDesc'
      }
    }
  }],
  [{
    label: t('filters.created_asc'),
    type: 'checkbox',
    icon: 'i-lucide-calendar-arrow-up',
    checked: selectedFilter.value === 'createdAsc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('created', 'asc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'createdAsc'
      }
    }
  },
  {
    label: t('filters.created_desc'),
    type: 'checkbox',
    icon: 'i-lucide-calendar-arrow-down',
    checked: selectedFilter.value === 'createdDesc',
    onSelect: (e:Event) => {
      e.preventDefault()
      setSortOrder('created', 'desc')
    },
    onUpdateChecked: (checked: boolean) => {
      if (checked) {
        selectedFilter.value = 'createdDesc'
      }
    }
  }]
] satisfies DropdownMenuItem[][])

const buttons: Array<{
  color: ButtonProps['color']
  variant: ButtonProps['variant']
  icon: string
  tooltip: string
  onClick: (event: MouseEvent) => void
}> = [
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-file-plus',
    tooltip: t('tooltip.new_file'),
    onClick: () => createItem(false)
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-folder-plus',
    tooltip: t('tooltip.new_folder'),
    onClick: () => createItem(true)
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-up-down',
    tooltip: t('tooltip.expand_all'),
    onClick: expandAll
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-down-up',
    tooltip: t('tooltip.collapse_all'),
    onClick: collapseAll
  }
]
</script>
