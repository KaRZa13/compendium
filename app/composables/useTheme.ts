import { createSharedComposable } from '@vueuse/core'
import { load, type Store } from '@tauri-apps/plugin-store'
import { omit } from '#ui/utils'
import colors from 'tailwindcss/colors'

const STORE_FILE = 'theme-settings.json'
const PRIMARY_KEY = 'primary'
const NEUTRAL_KEY = 'neutral'
const RADIUS_KEY = 'radius'
const FONT_KEY = 'font'
const BLACK_AS_PRIMARY_KEY = 'blackAsPrimary'

const DEFAULT_PRIMARY = 'green'
const DEFAULT_NEUTRAL = 'slate'
const DEFAULT_RADIUS = 0.25
const DEFAULT_FONT = 'Public Sans'

const _useTheme = () => {
  const appConfig = useAppConfig()
  let store: Store | null = null

  const _radius = ref(DEFAULT_RADIUS)
  const _font = ref(DEFAULT_FONT)
  const _blackAsPrimary = ref(false)

  const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']
  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral
    },
    set(option) {
      appConfig.ui.colors.neutral = option
      store?.set(NEUTRAL_KEY, option)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed({
    get() {
      return appConfig.ui.colors.primary
    },
    set(option) {
      appConfig.ui.colors.primary = option
      setBlackAsPrimary(false)
      store?.set(PRIMARY_KEY, option)
    }
  })

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
  const radius = computed({
    get() {
      return _radius.value
    },
    set(option) {
      _radius.value = option
      store?.set(RADIUS_KEY, option)
    }
  })

  const blackAsPrimary = computed(() => _blackAsPrimary.value)

  function setBlackAsPrimary(value: boolean) {
    _blackAsPrimary.value = value
    store?.set(BLACK_AS_PRIMARY_KEY, value)
  }
  const fonts = ['Public Sans', 'DM Sans', 'Geist', 'Inter', 'Poppins', 'Outfit', 'Raleway']
  const font = computed({
    get() {
      return _font.value
    },
    set(option) {
      _font.value = option
      store?.set(FONT_KEY, option)
    }
  })

  const radiusStyle = computed(() => `:root { --ui-radius: ${_radius.value}rem; }`)
  const fontStyle = computed(() => `:root { --font-sans: '${_font.value}', sans-serif; }`)
  const blackAsPrimaryStyle = computed(() => _blackAsPrimary.value ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')
  const link = computed(() => {
    const name = _font.value
    if (name === DEFAULT_FONT) return []
    return [{
      rel: 'stylesheet' as const,
      href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`,
      id: `font-${name.toLowerCase().replace(/\s+/g, '-')}`
    }]
  })

  const style = [
    { innerHTML: radiusStyle, id: 'nuxt-ui-radius', tagPriority: -2 },
    { innerHTML: fontStyle, id: 'nuxt-ui-font', tagPriority: -2 },
    { innerHTML: blackAsPrimaryStyle, id: 'nuxt-ui-black-as-primary', tagPriority: -2 },
  ]

  const hasChanges = computed(() => {
    return appConfig.ui.colors.primary !== DEFAULT_PRIMARY
      || _blackAsPrimary.value
      || appConfig.ui.colors.neutral !== DEFAULT_NEUTRAL
      || _radius.value !== DEFAULT_RADIUS
      || _font.value !== DEFAULT_FONT
  })

  async function initTheme() {
    store = await load(STORE_FILE)
    appConfig.ui.colors.primary = (await store.get<string>(PRIMARY_KEY)) ?? DEFAULT_PRIMARY
    appConfig.ui.colors.neutral = (await store.get<string>(NEUTRAL_KEY)) ?? DEFAULT_NEUTRAL
    _radius.value = (await store.get<number>(RADIUS_KEY)) ?? DEFAULT_RADIUS
    _font.value = (await store.get<string>(FONT_KEY)) ?? DEFAULT_FONT
    _blackAsPrimary.value = (await store.get<boolean>(BLACK_AS_PRIMARY_KEY)) ?? false
  }

  async function resetTheme() {
    appConfig.ui.colors.primary = DEFAULT_PRIMARY
    appConfig.ui.colors.neutral = DEFAULT_NEUTRAL
    _radius.value = DEFAULT_RADIUS
    _font.value = DEFAULT_FONT
    _blackAsPrimary.value = false

    await store?.clear()
    await store?.save()
  }

  return {
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
    link,
    style,
    hasChanges,
    initTheme,
    resetTheme
  }
}

export const useTheme = createSharedComposable(_useTheme)