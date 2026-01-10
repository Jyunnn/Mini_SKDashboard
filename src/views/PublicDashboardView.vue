<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">Dashboard Viewer</h1>
        <button
          @click="handleBack"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          返回編輯
        </button>
      </div>
    </header>
    <main class="p-6">
      <div class="h-[calc(100vh-140px)]">
        <DashboardRenderer
          :widgets="dashboardStore.widgets"
          :editable="false"
          :selected-widget-id="null"
          @layout-change="handleLayoutChange"
          @widget-select="() => {}"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/store/dashboard'
import DashboardRenderer from '@/components/dashboard/DashboardRenderer.vue'

const router = useRouter()
const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.loadFromLocalStorage()
})

function handleBack() {
  router.push('/admin/builder')
}

function handleLayoutChange() {}
</script>
