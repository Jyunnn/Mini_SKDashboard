<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-semibold text-gray-700">屬性編輯器</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="selectedWidget" class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm font-medium text-gray-500">元件類型</p>
          <p class="font-medium text-gray-800 mt-1">{{ widgetTypeLabels[selectedWidget.type] }}</p>
        </div>

        <div v-if="selectedWidget.type === 'StatCard'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">標題</label>
            <input
              v-model="selectedWidget.props.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">數值</label>
            <input
              v-model="selectedWidget.props.value"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">趨勢 (%)</label>
            <input
              v-model.number="selectedWidget.props.trend"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div v-else-if="selectedWidget.type === 'LineChart'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">標題</label>
            <input
              v-model="selectedWidget.props.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">X 軸標籤</label>
            <input
              v-model="selectedWidget.props.xAxisLabel"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Y 軸標籤</label>
            <input
              v-model="selectedWidget.props.yAxisLabel"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">顏色</label>
            <input
              v-model="selectedWidget.props.color"
              type="color"
              class="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div v-else-if="selectedWidget.type === 'SimpleText'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文字內容</label>
            <textarea
              v-model="selectedWidget.props.text"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">字體大小</label>
            <select
              v-model="selectedWidget.props.fontSize"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.875rem">小</option>
              <option value="1.125rem">中</option>
              <option value="1.5rem">大</option>
              <option value="2rem">特大</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">字體粗細</label>
            <select
              v-model="selectedWidget.props.fontWeight"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="400">正常</option>
              <option value="500">中等</option>
              <option value="600">粗體</option>
              <option value="700">特粗</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">文字顏色</label>
            <input
              v-model="selectedWidget.props.color"
              type="color"
              class="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">對齊方式</label>
            <select
              v-model="selectedWidget.props.align"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">靠左</option>
              <option value="center">置中</option>
              <option value="right">靠右</option>
            </select>
          </div>
        </div>

        <button
          @click="handleDelete"
          class="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          刪除元件
        </button>
      </div>
      <div v-else class="text-center text-gray-500 mt-8">
        <p class="text-sm">請先選擇一個元件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardWidget } from '@/types/widget'

const emit = defineEmits<{
  'widget-update': [widget: DashboardWidget]
  'widget-delete': [id: string]
}>()

interface Props {
  selectedWidget: DashboardWidget | null
}

const props = defineProps<Props>()

const widgetTypeLabels: Record<string, string> = {
  StatCard: '統計卡片',
  LineChart: '折線圖',
  SimpleText: '文字標題'
}

function handleDelete() {
  if (props.selectedWidget) {
    emit('widget-delete', props.selectedWidget.id)
  }
}
</script>
