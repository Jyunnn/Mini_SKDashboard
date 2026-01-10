<template>
  <div class="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col justify-between">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-500">{{ title }}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
      </div>
      <div v-if="icon" class="text-gray-400">
        <span>{{ icon }}</span>
      </div>
    </div>
    <div v-if="showTrend" class="mt-4">
      <span :class="trend >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
      <span class="text-gray-500 text-sm ml-1">vs 上週</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatCardProps } from '@/types/widget'

const props = withDefaults(defineProps<StatCardProps>(), {
  title: '標題',
  value: '0',
  icon: '',
  trend: undefined,
  color: undefined
})

const showTrend = computed(() => props.trend !== undefined)
</script>
