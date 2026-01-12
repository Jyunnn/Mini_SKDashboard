<template>
  <div class="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col justify-between">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ key }}</span>
        </div>
        <h3 class="text-sm font-medium text-gray-500">{{ title }}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DynamicStatCardProps } from '@/types/widget'

const props = withDefaults(defineProps<DynamicStatCardProps>(), {
  key: '',
  title: '標題',
  value: '0'
})
</script>
