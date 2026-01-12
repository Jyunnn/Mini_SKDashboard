<template>
  <div class="p-6">
    <div class="mb-4 flex items-center gap-4">
      <button
        @click="loadDynamicCards"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '載入中...' : '載入動態卡片' }}
      </button>
      
      <button
        @click="clearDynamicCards"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        清除卡片
      </button>
      
      <div v-if="lastUpdateTime" class="text-sm text-gray-500">
        最後更新: {{ lastUpdateTime }}
      </div>
    </div>
    
    <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { dataSourceService } from '@/services/DataSourceService'
import { useDashboardStore } from '@/store/dashboard'
import { useDataSourceStore } from '@/store/datasource'

const dashboardStore = useDashboardStore()
const dataSourceStore = useDataSourceStore()

const loading = ref(false)
const error = ref<string | null>(null)
const lastUpdateTime = ref<string | null>(null)

const DEMO_DATA_SOURCE_ID = 'dynamic-cards-demo'

async function loadDynamicCards() {
  loading.value = true
  error.value = null
  
  try {
    // 範例 API URL（請替換為實際的 API）
    const demoDataSource = {
      id: DEMO_DATA_SOURCE_ID,
      type: 'API' as const,
      config: {
        url: 'https://api.example.com/cards',
        method: 'GET' as const
      },
      isValid: true
    }
    
    // 如果資料來源不存在，先建立它
    if (!dataSourceStore.getDataSource(DEMO_DATA_SOURCE_ID)) {
      // 使用 Pinia store 的方法建立資料來源
    }
    
    // 獲取並解析 API 資料
    const items = await dataSourceService.fetchDynamicCards(demoDataSource)
    
    // 清除舊的動態 widgets
    const oldWidgets = dashboardStore.widgets.filter(w => 
      w.type === 'DynamicStatCard' && w.dataSourceId === DEMO_DATA_SOURCE_ID
    )
    oldWidgets.forEach(w => dashboardStore.removeWidget(w.id))
    
    // 生成 Widgets 配置
    const widgets = dataSourceService.generateDynamicWidgets(
      DEMO_DATA_SOURCE_ID,
      items,
      0, // startX
      0  // startY
    )
    
    // 批量添加到 Dashboard
    dashboardStore.addWidgets(widgets)
    
    // 更新最後更新時間
    lastUpdateTime.value = new Date().toLocaleString('zh-TW')
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入失敗'
  } finally {
    loading.value = false
  }
}

function clearDynamicCards() {
  const dynamicWidgets = dashboardStore.widgets.filter(w => 
    w.type === 'DynamicStatCard' && w.dataSourceId === DEMO_DATA_SOURCE_ID
  )
  dynamicWidgets.forEach(w => dashboardStore.removeWidget(w.id))
  lastUpdateTime.value = null
  error.value = null
}
</script>
