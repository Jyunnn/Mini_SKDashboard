<template>
  <div class="h-full flex flex-col relative">
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
        class="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:border-blue-500 hover:shadow-md transition-all group relative"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ widget.icon }}</div>
          <div class="flex-1">
            <h3 class="font-medium text-gray-800">{{ widget.name }}</h3>
            <p class="text-xs text-gray-500">{{ widget.description }}</p>
          </div>
          <div 
            class="text-gray-400 hover:text-blue-600 cursor-help text-lg relative"
            @mouseenter="handleTooltipShow($event, widget.type)"
            @mouseleave="handleTooltipHide"
          >
            <span>ℹ️</span>
            
            <Teleport to="body">
              <div 
                v-if="showTooltip === widget.type"
                class="fixed bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-[9999]"
                :style="{ top: getTooltipPosition(widget.type).top + 'px', left: getTooltipPosition(widget.type).left + 'px' }"
              >
                <div class="absolute top-4 -left-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-900"></div>
                <div class="font-bold mb-2 flex items-center gap-2">
                  <span>📋</span> 資料格式要求
                </div>
                <pre class="text-gray-300 whitespace-pre-wrap font-mono text-xs">{{ widget.dataFormat }}</pre>
              </div>
            </Teleport>
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

const showTooltip = ref<string | null>(null)
const tooltipPositions = ref<Record<string, { top: number; left: number }>>({})

const widgetTypes = [
  {
    type: 'StatCard' as WidgetType,
    name: '統計卡片',
    description: '展示關鍵數據指標',
    icon: '📊',
    dataFormat: `{
  "title": "銷售額",
  "value": 125000,
  "icon": "💰",
  "trend": 12.5
}`
  },
  {
    type: 'LineChart' as WidgetType,
    name: '折線圖',
    description: '展示趨勢變化',
    icon: '📈',
    dataFormat: `{
  "title": "月度銷售趨勢",
  "data": [
    { "name": "1月", "value": 10 },
    { "name": "2月", "value": 20 },
    { "name": "3月", "value": 15 }
  ],
  "xAxisLabel": "月份",
  "yAxisLabel": "銷售額"
}`
  },
  {
    type: 'SimpleText' as WidgetType,
    name: '文字標題',
    description: '純文字內容',
    icon: '📝',
    dataFormat: `{
  "text": "歡迎使用儀表板",
  "fontSize": "1.125rem",
  "fontWeight": "500",
  "color": "#111827",
  "align": "center"
}`
  },
  {
    type: 'DynamicStatCard' as WidgetType,
    name: '動態卡片組',
    description: '根據API批量生成卡片',
    icon: '🎴',
    dataFormat: `[
  {
    "key": "sales",
    "title": "銷售額",
    "value": 1250000
  },
  {
    "key": "orders",
    "title": "訂單數",
    "value": 456
  }
]`
  }
]

const isDragging = ref(false)

function handleTooltipShow(event: MouseEvent, type: WidgetType) {
  showTooltip.value = type
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipPositions.value[type] = {
    top: rect.top,
    left: rect.right + 8
  }
}

function handleTooltipHide() {
  showTooltip.value = null
}

function getTooltipPosition(type: string) {
  return tooltipPositions.value[type] || { top: 0, left: 0 }
}

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
