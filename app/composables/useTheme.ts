import { useLocalStorage, createSharedComposable } from '@vueuse/core'
import { omit } from '#ui/utils'
import colors from 'tailwindcss/colors'

const _useTheme = () => {
  const appConfig = useAppConfig()

  const _radius = useLocalStorage('nuxt-ui-radius', 0.25)
  const _font = useLocalStorage('nuxt-ui-font', 'Public Sans')
  const _blackAsPrimary = useLocalStorage('nuxt-ui-black-as-primary', false)

  const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']
  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral
    },
    set(option) {
      appConfig.ui.colors.neutral = option
      window.localStorage.setItem('nuxt-ui-neutral', appConfig.ui.colors.neutral)
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
      window.localStorage.setItem('nuxt-ui-primary', appConfig.ui.colors.primary)
    }
  })

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
  const radius = computed({
    get() {
      return _radius.value
    },
    set(option) {
      _radius.value = option
    }
  })

  const blackAsPrimary = computed(() => _blackAsPrimary.value)

  function setBlackAsPrimary(value: boolean) {
    _blackAsPrimary.value = value
  }
  const fonts = ['Public Sans', 'DM Sans', 'Geist', 'Inter', 'Poppins', 'Outfit', 'Raleway']
  const font = computed({
    get() {
      return _font.value
    },
    set(option) {
      _font.value = option
    }
  })

  const radiusStyle = computed(() => `:root { --ui-radius: ${_radius.value}rem; }`)
  const fontStyle = computed(() => `:root { --font-sans: '${_font.value}', sans-serif; }`)
  const blackAsPrimaryStyle = computed(() => _blackAsPrimary.value ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')
  const link = computed(() => {
    const name = _font.value
    if (name === 'Public Sans') return []
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
    return appConfig.ui.colors.primary !== 'green'
      || _blackAsPrimary.value
      || appConfig.ui.colors.neutral !== 'slate'
      || _radius.value !== 0.25
      || _font.value !== 'Public Sans'
  })

  function resetTheme() {
    appConfig.ui.colors.primary = 'green'
    window.localStorage.removeItem('nuxt-ui-primary')

    appConfig.ui.colors.neutral = 'slate'
    window.localStorage.removeItem('nuxt-ui-neutral')

    _radius.value = 0.25
    _font.value = 'Public Sans'
    _blackAsPrimary.value = false
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
    resetTheme
  }
}

export const useTheme = createSharedComposable(_useTheme)