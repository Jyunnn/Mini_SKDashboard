<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-semibold text-gray-700">元件庫</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="widget in widgetTypes"
        :key="widget.type"
        draggable="true"
        @dragstart="handleDragStart($event, widget.type)"
        @dragend="handleDragEnd"
        class="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:border-blue-500 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ widget.icon }}</div>
          <div>
            <h3 class="font-medium text-gray-800">{{ widget.name }}</h3>
            <p class="text-xs text-gray-500">{{ widget.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WidgetType } from '@/types/widget'

const emit = defineEmits<{
  'widget-drag': [type: WidgetType]
}>()

const widgetTypes = [
  {
    type: 'StatCard' as WidgetType,
    name: '統計卡片',
    description: '展示關鍵數據指標',
    icon: '📊'
  },
  {
    type: 'LineChart' as WidgetType,
    name: '折線圖',
    description: '展示趨勢變化',
    icon: '📈'
  },
  {
    type: 'SimpleText' as WidgetType,
    name: '文字標題',
    description: '純文字內容',
    icon: '📝'
  }
]

const isDragging = ref(false)

function handleDragStart(event: DragEvent, type: WidgetType) {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.setData('widget-type', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('widget-drag', type)
}

function handleDragEnd() {
  isDragging.value = false
}
</script>
