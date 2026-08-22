<template>
  <UModal
    :open="needsRootFolder"
    :dismissible="false"
    :close="needsRootFolder ? false : true"
    :ui="{ content: workspaces.length > 0 ? 'max-w-5xl' : 'max-w-3xl' }"
  >
    <template #body>
      <section class="w-full flex">
        <USidebar 
          v-if="workspaces.length > 0"
          :style="{ '--sidebar-width': '24rem' }"
        >
          <template #default>
            <UButton 
              v-for="workspace in workspaces" 
              :key="workspace"
              :label="workspace.split('/').filter(Boolean).pop() || ''"
              variant="ghost"
              color="neutral"
              @click="setRootFolder(workspace)"
            >
              <div v-if="editingWorkspaceName !== workspace" class="w-full flex flex-col items-start">
                <span>
                  {{workspace.split('/').filter(Boolean).pop() || ''}}
                </span>
                <span class="text-sm text-dimmed">
                  {{ workspace }}
                </span>
              </div>

              <div v-else class="w-full flex items-start" @click.stop>
                <UInput
                  autofocus
                  v-model="newName"
                  :placeholder="workspace.split('/').filter(Boolean).pop() || ''"
                  @keydown.stop
                  @keyup.enter="confirmRename"
                  @blur="confirmRename"
                  @focus="$event.target.select()"
                />
              </div>

              <template #trailing>
                <UDropdownMenu 
                  v-if="editingWorkspaceName !== workspace"
                  :items="getWorkspaceActions(workspace)" 
                  :content="{ onCloseAutoFocus: (e: Event) => e.preventDefault() }"
                >
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    @click.stop
                  />
                </UDropdownMenu>
              </template>
            </UButton>
          </template>
        </USidebar>

        <div class="w-full flex flex-col">
          <div class="w-full flex flex-1 flex-col items-center gap-2 border-b-1 border-neutral-200 dark:border-neutral-800 py-4">
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
        </div>
      </section>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const {
  workspaces,
  needsRootFolder,
  changeFolder,
  setRootFolder,
  pickFolder,
  createWorkspace,
  removeWorkspace,
  renameWorkspace,
} = useFileExplorer()

const activeTab = ref<'base' | 'new'>('base')
const folderName = ref('')
const location = ref<string | null>(null)
const editingWorkspaceName = ref<string | null>(null)
const newName = ref('')

async function browseLocation() {
  const selected = await pickFolder()
  if (selected) location.value = selected
}

async function handleCreateWorkspace() {
  if (!folderName.value || !location.value) return
  await createWorkspace(folderName.value, location.value)
}

async function confirmRename() {
  if (editingWorkspaceName.value) {
    await renameWorkspace(editingWorkspaceName.value, newName.value)
  }
  editingWorkspaceName.value = null
}

function getWorkspaceActions(workspace: string) {
  const actions = [
    {
      label: 'Rename',
      icon: 'i-lucide-pencil-line',
      onSelect: () => {
        editingWorkspaceName.value = workspace
        newName.value = workspace.split('/').filter(Boolean).pop() || ''
      }
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      onSelect: () => removeWorkspace(workspace)
    }
  ]
  return actions
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
