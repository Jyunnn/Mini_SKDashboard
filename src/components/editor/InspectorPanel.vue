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

        <div v-if="currentDataSource" class="bg-blue-50 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">資料來源</p>
            <button
              @click="handleRefreshData"
              :disabled="isRefreshing || currentDataSource.type === 'WebSocket'"
              class="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isRefreshing ? '重新整理中...' : '重新整理' }}
            </button>
          </div>
          <p class="font-medium text-gray-800">{{ dataSourceTypeLabels[currentDataSource.type] }}</p>
          <div v-if="currentDataSource.type === 'API'" class="text-xs text-gray-600 space-y-1">
            <p><span class="font-medium">URL:</span> {{ currentDataSource.config.url }}</p>
            <p><span class="font-medium">Method:</span> {{ currentDataSource.config.method }}</p>
            <p v-if="currentDataSource.config.pollingInterval">
              <span class="font-medium">輪詢:</span> {{ currentDataSource.config.pollingInterval }}ms
            </p>
          </div>
          <div v-else-if="currentDataSource.type === 'WebSocket'" class="text-xs text-gray-600">
            <p><span class="font-medium">URL:</span> {{ currentDataSource.config.url }}</p>
            <p class="text-green-600 mt-1">● 已連線</p>
          </div>
          <div v-else class="text-xs text-gray-600">
            <p class="font-medium">手動定義資料</p>
          </div>
          <button
            @click="handleEditDataSource"
            class="mt-2 w-full px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
          >
            編輯資料來源
          </button>
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
import { computed, ref } from 'vue'
import type { DashboardWidget } from '@/types/widget'
import { useDataSourceStore } from '@/store/datasource'
import { dataSourceService } from '@/services/DataSourceService'

const emit = defineEmits<{
  'widget-update': [widget: DashboardWidget]
  'widget-delete': [id: string]
  'datasource-edit': [widget: DashboardWidget]
  'datasource-refresh': [widget: DashboardWidget]
}>()

interface Props {
  selectedWidget: DashboardWidget | null
}

const props = defineProps<Props>()

const dataSourceStore = useDataSourceStore()
const isRefreshing = ref(false)

const widgetTypeLabels: Record<string, string> = {
  StatCard: '統計卡片',
  LineChart: '折線圖',
  SimpleText: '文字標題'
}

const dataSourceTypeLabels: Record<string, string> = {
  API: 'API 來源',
  WebSocket: 'WebSocket 來源',
  Manual: '假資料'
}

const currentDataSource = computed(() => {
  if (!props.selectedWidget) return null
  return dataSourceStore.getDataSource(props.selectedWidget.dataSourceId)
})

function handleDelete() {
  if (props.selectedWidget) {
    emit('widget-delete', props.selectedWidget.id)
  }
}

function handleEditDataSource() {
  if (props.selectedWidget) {
    emit('datasource-edit', props.selectedWidget)
  }
}

async function handleRefreshData() {
  if (!props.selectedWidget) return

  isRefreshing.value = true
  try {
    emit('datasource-refresh', props.selectedWidget)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}
</script>
