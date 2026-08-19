<template>
  <UModal
    :open="needsRootFolder"
    :dismissible="false"
    :close="needsRootFolder ? false : true"
    :ui="{ content: 'max-w-2xl' }"
  >

    <template #header>
      <div class="w-full flex flex-col items-center gap-2">
        <NuxtImg
          src="/app-icon.png"
          width="64"
          height="64"
          alt="Compendium"
        />
        <span class="text-lg font-semibold">Bienvenue sur Compendium</span>
        <span class="text-sm text-center text-muted-foreground">
          Pour commencer, choisissez ou créez un dossier pour stocker vos données.
        </span>
      </div>
    </template>

    <template #body>
      <UTabs
        :items="tabs"
        v-model="activeTab"
        class="w-full"
        :ui="{
          list: 'hidden',
          root: 'py-16'
        }"
      >
        <template #base>
          <UCard class="mx-8 my-6">
            <div class="w-full min-h-10 flex px-1">
              <div class="w-full flex flex-col">
                <span>
                  Create new workspace
                </span>
                <span class="text-sm text-dimmed">
                  Create a new Compendium workspace under a folder
                </span>
              </div>
              <UButton 
                label="Create"
                @click="activeTab = 'new'"
                :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
              />
            </div>

            <USeparator class="my-4"/>

            <div class="w-full min-h-10 flex px-1">
              <div class="w-full flex flex-col">
                <span>
                  Open folder as workspace
                </span>
                <span class="text-sm text-dimmed">
                  Open an existing folder as a Compendium workspace
                </span>
              </div>
              <UButton
                label="Open"
                variant="outline"
                @click="changeFolder"
                :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
              />
            </div>
          </UCard>
        </template>

        <template #new>
          <div class="w-full px-8">
            <UButton 
              label="Back"
              icon="i-lucide-arrow-left"
              variant="link"
              color="neutral"
              @click="activeTab = 'base'"
              :ui="{ base: 'flex items-center justify-center cursor-pointer'}"
            />
            <span class="font-bold pl-3">Create local workspace</span>
          </div>
          <UCard class="mx-8 my-6">
            <div class="w-full min-h-10 flex px-1">
              <div class="w-full flex flex-col">
                <span>
                  Workspace name
                </span>
                <span class="text-sm text-dimmed">
                  Pick a name for your new Compendium workspace
                </span>
              </div>
              <UInput v-model="folderName" placeholder="Workspace name" :ui="{ base: 'min-w-24 flex items-center justify-center'}"/>
            </div>

            <USeparator class="my-4"/>

            <div class="w-full min-h-10 flex px-1">
              <div class="w-full flex flex-col">
                <span>
                  Location
                </span>
                <span class="text-sm text-dimmed truncate">
                  {{ location ?? 'Pick a place for your new workspace' }}
                </span>
              </div>
              <UButton
                label="Browse"
                variant="outline"
                @click="browseLocation"
                :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
              />
            </div>
          </UCard>

          <div class="w-full px-8 flex justify-end">
            <UButton
              label="Create"
              :disabled="!folderName || !location"
              @click="handleCreateWorkspace"
              :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
            />
          </div>
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const { needsRootFolder, pickFolder, changeFolder, createWorkspace } = useFileExplorer()

const activeTab = ref<'base' | 'new'>('base')
const folderName = ref('')
const location = ref<string | null>(null)

async function browseLocation() {
  const selected = await pickFolder()
  if (selected) location.value = selected
}

async function handleCreateWorkspace() {
  if (!folderName.value || !location.value) return
  await createWorkspace(folderName.value, location.value)
}

const tabs = ref<TabsItem[]>([
  {
    label: 'Dossier existant',
    icon: 'i-lucide-folder-open',
    value: 'base',
    slot: 'base' as const
  },
  {
    label: 'Nouveau dossier',
    icon: 'i-lucide-folder-plus',
    value: 'new',
    slot: 'new' as const
 }
])
</script>
