<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">配置資料來源</h2>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">選擇資料來源類型</label>
          <div class="flex gap-2">
            <button
              v-for="type in dataSourceTypes"
              :key="type.value"
              @click="selectedType = type.value"
              class="flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors"
              :class="selectedType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              <div class="text-2xl mb-1">{{ type.icon }}</div>
              <div>{{ type.label }}</div>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div v-if="selectedType === 'API'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">API URL *</label>
              <input
                v-model="apiConfig.url"
                type="text"
                placeholder="https://api.example.com/data"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">請求方法</label>
              <select
                v-model="apiConfig.method"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Headers (JSON 格式，可選)</label>
              <textarea
                v-model="apiConfig.headersJson"
                placeholder='{"Authorization": "Bearer token"}'
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">輪詢間隔 (毫秒，可選)</label>
              <input
                v-model="apiConfig.pollingInterval"
                type="number"
                placeholder="5000"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div v-if="selectedType === 'WebSocket'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WebSocket URL *</label>
              <input
                v-model="wsConfig.url"
                type="text"
                placeholder="wss://api.example.com/stream"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p class="text-xs text-gray-500">WebSocket 連線將在元件載入時自動建立</p>
          </div>

          <div v-if="selectedType === 'Manual'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">JSON 資料 *</label>
              <textarea
                v-model="manualConfig.data"
                placeholder='{"value": 100, "data": [{"name": "A", "value": 10}]}'
                rows="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <button
              @click="loadExampleData"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              載入範例資料
            </button>
          </div>
        </div>

        <div v-if="validationResult" class="mt-4 p-3 rounded-md" :class="validationResult.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          <p class="text-sm font-medium">
            {{ validationResult.isValid ? '✓ 驗證通過' : '✗ 驗證失敗' }}
          </p>
          <p v-if="!validationResult.isValid" class="text-sm mt-1">{{ validationResult.error }}</p>
        </div>
      </div>

      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button
          @click="handleTest"
          :disabled="isLoading"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '測試中...' : '測試連線' }}
        </button>
        <div class="flex gap-2">
          <button
            @click="handleClose"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            :disabled="!isValidated || isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataSourceType, DataSourceConfig } from '@/types/datasource'
import { dataSourceService } from '@/services/DataSourceService'

const emit = defineEmits<{
  confirm: [type: DataSourceType, config: DataSourceConfig]
  close: []
}>()

const dataSourceTypes = [
  { value: 'API' as DataSourceType, label: 'API', icon: '🌐' },
  { value: 'WebSocket' as DataSourceType, label: 'WebSocket', icon: '🔌' },
  { value: 'Manual' as DataSourceType, label: 'Manual', icon: '📝' }
]

const selectedType = ref<DataSourceType>('API')
const apiConfig = ref({
  url: '',
  method: 'GET' as 'GET' | 'POST',
  headersJson: '',
  pollingInterval: 5000
})
const wsConfig = ref({
  url: ''
})
const manualConfig = ref({
  data: ''
})

const isLoading = ref(false)
const validationResult = ref<{ isValid: boolean; error?: string; data?: any } | null>(null)
const isValidated = computed(() => validationResult.value?.isValid ?? false)

function loadExampleData() {
  manualConfig.value.data = JSON.stringify(
    {
      title: '範例資料',
      value: 1234,
      data: [
        { name: '1月', value: 100 },
        { name: '2月', value: 200 },
        { name: '3月', value: 150 },
        { name: '4月', value: 250 },
        { name: '5月', value: 300 }
      ]
    },
    null,
    2
  )
}

function parseHeaders(headersJson: string): Record<string, string> | undefined {
  if (!headersJson.trim()) return undefined
  try {
    return JSON.parse(headersJson)
  } catch {
    return undefined
  }
}

function buildConfig(): DataSourceConfig {
  switch (selectedType.value) {
    case 'API':
      return {
        url: apiConfig.value.url,
        method: apiConfig.value.method,
        headers: parseHeaders(apiConfig.value.headersJson),
        pollingInterval: apiConfig.value.pollingInterval
      }
    case 'WebSocket':
      return {
        url: wsConfig.value.url
      }
    case 'Manual':
      return {
        manualData: manualConfig.value.data
      }
  }
}

async function handleTest() {
  const config = buildConfig()
  isLoading.value = true
  validationResult.value = null

  const dataSource = {
    id: 'test',
    type: selectedType.value,
    config,
    isValid: false
  }

  try {
    const result = await dataSourceService.validateDataSource(dataSource)
    validationResult.value = result
  } catch (error) {
    validationResult.value = {
      isValid: false,
      error: error instanceof Error ? error.message : '驗證失敗'
    }
  } finally {
    isLoading.value = false
  }
}

function handleConfirm() {
  if (!isValidated.value) return
  const config = buildConfig()
  emit('confirm', selectedType.value, config)
}

function handleClose() {
  emit('close')
}
</script>
