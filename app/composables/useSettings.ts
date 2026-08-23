import { createSharedComposable } from '@vueuse/core'
import { load, type Store } from '@tauri-apps/plugin-store'

const STORE_FILE = 'user-settings.json'
const SETTINGS_KEY = 'user-settings'

const _useSettings = () => {
  const settings = ref<Record<string, any>>({})
  let store: Store | null = null

  async function initUserSettings() {
    store = await load(STORE_FILE)
    settings.value = (await store.get(SETTINGS_KEY)) || {}
  }

  async function saveUserSettings() {
    if (!store) return
    await store.set(SETTINGS_KEY, settings.value)
    await store.save()
  }

  // DEBUG : affiche le contenu brut du store Tauri (user-settings.json).
  async function debugShowStore() {
    const entries = store ? await store.entries() : []
    window.alert(JSON.stringify(entries, null, 2))
  }

  return {
    settings,
    initUserSettings,
    saveUserSettings,
    debugShowStore,
  }
}

export const useSettings = createSharedComposable(_useSettings)