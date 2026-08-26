<template>
  <section class="w-full flex flex-col gap-8">
    <!-- Tabs -->
     <EditorTabs />
     <div class="w-full px-48">
       <UEditor
         v-if="activeTab"
         :key="activeTab.path"
         v-model="content"
         content-type="markdown"
       />
     </div>
  </section>
</template>

<script setup lang="ts">
const { activeTab, content } = useEditorTabs()
</script>
