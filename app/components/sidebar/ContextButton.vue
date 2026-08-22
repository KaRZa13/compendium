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
      <UTooltip text="Change sort order">
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
    label: 'Name (A-Z)',
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
    label: 'Name (Z-A)',
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
    label: 'Modified date (newest first)',
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
  },
  {
    label: 'Modified date (oldest first)',
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
  }],
  [{
    label: 'Created date (newest first)',
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
  }, {
    label: 'Created date (oldest first)',
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
    tooltip: 'Create File',
    onClick: () => createItem(false)
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-folder-plus',
    tooltip: 'Create Folder',
    onClick: () => createItem(true)
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-up-down',
    tooltip: 'Expand all',
    onClick: expandAll
  },
  {
    color: 'neutral',
    variant: 'ghost',
    icon: 'i-lucide-chevrons-down-up',
    tooltip: 'Collapse all',
    onClick: collapseAll
  }
]
</script>
