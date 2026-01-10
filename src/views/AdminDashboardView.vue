<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">Dashboard Builder</h1>
      <div class="flex items-center gap-3">
        <button
          @click="handlePreview"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          預覽
        </button>
        <button
          @click="handleSave"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          儲存佈局
        </button>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          登出
        </button>
      </div>
    </header>
    <div class="flex-1 flex overflow-hidden">
      <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <WidgetPanel @widget-drag="handleWidgetDrag" />
      </aside>
      <main
        class="flex-1 overflow-auto bg-gray-100 p-4"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div
          class="h-full min-h-[600px] border-2 border-dashed transition-colors"
          :class="isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
        >
          <DashboardRenderer
            :widgets="dashboardStore.widgets"
            :editable="true"
            :selected-widget-id="dashboardStore.selectedWidgetId"
            @layout-change="handleLayoutChange"
            @widget-select="handleWidgetSelect"
          />
        </div>
      </main>
      <aside class="w-72 bg-white border-l border-gray-200 flex-shrink-0">
        <InspectorPanel
          :selected-widget="dashboardStore.selectedWidget"
          @widget-update="handleWidgetUpdate"
          @widget-delete="handleWidgetDelete"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useDashboardStore } from '@/store/dashboard'
import { v4 as uuidv4 } from 'uuid'
import WidgetPanel from '@/components/editor/WidgetPanel.vue'
import DashboardRenderer from '@/components/dashboard/DashboardRenderer.vue'
import InspectorPanel from '@/components/editor/InspectorPanel.vue'
import type { DashboardWidget, WidgetType } from '@/types/widget'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const isDragOver = ref(false)
const draggedWidgetType = ref<WidgetType | null>(null)

onMounted(() => {
  dashboardStore.loadFromLocalStorage()
})

function handlePreview() {
  router.push('/dashboard')
}

function handleSave() {
  dashboardStore.saveToLocalStorage()
  alert('佈局已儲存')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function handleWidgetDrag(type: WidgetType) {
  draggedWidgetType.value = type
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const type = event.dataTransfer?.getData('widget-type') as WidgetType | undefined
  if (!type) return

  const id = uuidv4()
  const widget = createWidget(type, id)
  dashboardStore.addWidget(widget)
}

function createWidget(type: WidgetType, id: string): DashboardWidget {
  const widget: DashboardWidget = {
    id,
    type,
    layout: {
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      i: id
    },
    props: {}
  }

  switch (type) {
    case 'StatCard':
      widget.props = {
        title: '標題',
        value: '0',
        icon: '',
        trend: 0
      }
      widget.layout.h = 3
      break
    case 'LineChart':
      widget.props = {
        title: '折線圖',
        data: [
          { name: '1月', value: 10 },
          { name: '2月', value: 20 },
          { name: '3月', value: 15 },
          { name: '4月', value: 25 },
          { name: '5月', value: 30 }
        ],
        xAxisLabel: '時間',
        yAxisLabel: '數值',
        color: '#3b82f6'
      }
      widget.layout.w = 6
      widget.layout.h = 6
      break
    case 'SimpleText':
      widget.props = {
        text: '文字內容',
        fontSize: '1.125rem',
        fontWeight: '500',
        color: '#111827',
        align: 'center'
      }
      widget.layout.h = 3
      break
  }

  return widget
}

function handleLayoutChange(layouts: any[]) {
  dashboardStore.widgets.forEach((widget, index) => {
    const layout = layouts.find(l => l.i === widget.id)
    if (layout) {
      widget.layout = layout
    }
  })
}

function handleWidgetSelect(widget: DashboardWidget | null) {
  if (widget) {
    dashboardStore.selectWidget(widget.id)
  } else {
    dashboardStore.clearSelection()
  }
}

function handleWidgetUpdate(widget: DashboardWidget) {
  dashboardStore.updateWidget(widget.id, widget)
}

function handleWidgetDelete(id: string) {
  dashboardStore.removeWidget(id)
}
</script>
