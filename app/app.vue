<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { style, link, initTheme } = useTheme()
useHead({ style, link })

onMounted(() => {
  initTheme()
})
</script>
