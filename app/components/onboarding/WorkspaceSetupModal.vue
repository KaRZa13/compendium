<template>
  <UModal
    :open="needsRootFolder"
    :dismissible="false"
    :close="needsRootFolder ? false : true"
    :ui="{ content: workspaces.length > 0 ? 'max-w-6xl' : 'max-w-4xl' }"
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
            <span class="text-lg font-semibold">
              {{ t('welcome_modal.title') }}
            </span>
            <span class="text-sm text-center text-muted-foreground">
              {{ t('welcome_modal.description') }}
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
                <div class="w-full min-h-10 flex items-center px-1">
                  <div class="w-full flex flex-col">
                    <span>
                      {{ t('welcome_modal.base.create_workspace.label') }}
                    </span>
                    <span class="text-sm text-dimmed">
                      {{ t('welcome_modal.base.create_workspace.description') }}
                    </span>
                  </div>
                  <UButton 
                    :label="t('buttons.create')"
                    color="neutral"
                    @click="activeTab = 'new'"
                    :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
                  />
                </div>
                <USeparator class="my-4"/>
                <div class="w-full min-h-10 flex items-center px-1">
                  <div class="w-full flex flex-col">
                    <span>
                      {{ t('welcome_modal.base.open_workspace.label') }}
                    </span>
                    <span class="text-sm text-dimmed">
                      {{ t('welcome_modal.base.open_workspace.description') }}
                    </span>
                  </div>
                  <UButton
                    :label="t('buttons.open')"
                    variant="outline"
                    color="neutral"
                    @click="changeFolder"
                    :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
                  />
                </div>
              </UCard>
            </template>

            <template #new>
              <div class="w-full px-8">
                <UButton 
                  :label="t('navigation.back')"
                  icon="i-lucide-arrow-left"
                  variant="link"
                  color="neutral"
                  @click="activeTab = 'base'"
                  :ui="{ base: 'flex items-center justify-center cursor-pointer'}"
                />
                <span class="font-bold pl-3">{{ t('welcome_modal.new.title') }}</span>
              </div>

              <UCard class="mx-8 my-6">
                <div class="w-full min-h-10 flex px-1">
                  <div class="w-full flex flex-col">
                    <span>
                      {{ t('welcome_modal.new.workspace_name.label') }}
                    </span>
                    <span class="text-sm text-dimmed">
                      {{ t('welcome_modal.new.workspace_name.description') }}
                    </span>
                  </div>
                  <UInput v-model="folderName" :placeholder="t('welcome_modal.new.workspace_name.placeholder')" :ui="{ base: 'min-w-24 flex items-center justify-center'}"/>
                </div>

                <USeparator class="my-4"/>

                <div class="w-full min-h-10 flex items-center px-1">
                  <div class="w-full flex flex-col">
                    <span>
                      {{ t('welcome_modal.new.workspace_location.label') }}
                    </span>
                    <span class="text-sm text-dimmed truncate">
                      {{ location ?? t('welcome_modal.new.workspace_location.description') }}
                    </span>
                  </div>
                  <UButton
                    :label="t('buttons.browse')"
                    variant="outline"
                    color="neutral"
                    @click="browseLocation"
                    :ui="{ base: 'min-w-24 flex items-center justify-center cursor-pointer'}"
                  />
                </div>
              </UCard>

              <div class="w-full px-8 flex justify-end">
                <UButton
                  :label="t('buttons.create')"
                  :disabled="!folderName || !location"
                  @click="handleCreateWorkspace"
                  color="neutral"
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

const { t } = useI18n()

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
      label: t('context_menu.rename'),
      icon: 'i-lucide-pencil-line',
      onSelect: () => {
        editingWorkspaceName.value = workspace
        newName.value = workspace.split('/').filter(Boolean).pop() || ''
      }
    },
    {
      label: t('context_menu.delete'),
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
