<template>
  <div class="flex flex-col border border-default rounded-lg overflow-hidden">
    <div class="flex items-center gap-1 px-2 py-1.5 border-b border-default bg-elevated/50">
      <UButton
        icon="i-lucide-corner-up-left"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="loading"
        @click="goUp"
      />
      <span class="text-sm text-muted truncate flex-1" :title="modelValue">{{ modelValue }}</span>
    </div>

    <div class="h-56 overflow-y-auto p-1">
      <p v-if="loading" class="text-sm text-muted px-2 py-4 text-center">Chargement…</p>
      <p v-else-if="error" class="text-sm text-error px-2 py-4 text-center">{{ error }}</p>
      <p v-else-if="!entries.length" class="text-sm text-muted px-2 py-4 text-center">Aucun sous-dossier</p>
      <UButton
        v-for="entry in entries"
        :key="entry.path"
        :label="entry.name"
        icon="i-lucide-folder"
        color="neutral"
        variant="ghost"
        block
        class="justify-start"
        @click="open(entry)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { readDir, type DirEntry } from '@tauri-apps/plugin-fs'
import { join, dirname, homeDir } from '@tauri-apps/api/path'

interface DirOption {
  name: string
  path: string
}

const modelValue = defineModel<string>({ default: '' })

const entries = ref<DirOption[]>([])
const loading = ref(false)
const error = ref('')

async function load(path: string) {
  loading.value = true
  error.value = ''
  try {
    const dirEntries = await readDir(path)
    entries.value = (
      await Promise.all(
        dirEntries
          .filter((entry: DirEntry) => entry.isDirectory)
          .map(async (entry: DirEntry) => ({ name: entry.name, path: await join(path, entry.name) }))
      )
    ).sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    entries.value = []
    error.value = 'Impossible de lire ce dossier.'
  } finally {
    loading.value = false
  }
}

function open(entry: DirOption) {
  modelValue.value = entry.path
}

async function goUp() {
  try { 
    const parent = await dirname(modelValue.value)
    if (parent !== modelValue.value) modelValue.value = parent
  } catch {
    error.value = 'Impossible de remonter dans l\'arborescence.'
  }
}

watch(modelValue, (path) => {
  if (path) load(path)
}, { immediate: true })

onMounted(async () => {
  if (!modelValue.value) modelValue.value = await homeDir()
})
</script>
