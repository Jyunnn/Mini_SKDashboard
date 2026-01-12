<template>
  <div class="w-full h-full" @click.self="handleCanvasClick">
    <grid-layout
      v-model:layout="layout"
      :col-num="12"
      :row-height="30"
      :is-draggable="editable"
      :is-resizable="editable"
      :prevent-collision="true"
      :auto-size="true"
      :vertical-compact="true"
      class="bg-white"
    >
      <grid-item
        v-for="item in widgets"
        :key="item.id"
        :i="item.layout.i"
        :x="item.layout.x"
        :y="item.layout.y"
        :w="item.layout.w"
        :h="item.layout.h"
        :is-draggable="editable"
        :is-resizable="editable"
        @click="handleWidgetClick($event, item)"
        class="transition-shadow duration-200"
        :class="{ 'ring-2 ring-blue-500': selectedWidgetId === item.id && editable }"
      >
        <div class="w-full h-full p-2 relative">
          <div v-if="loadingStates[item.id]" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <component :is="widgetComponents[item.type]" v-bind="{ ...item.props, ...widgetData[item.id] }" />
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'
import type { DashboardWidget } from '@/types/widget'
import { useDataSourceStore } from '@/store/datasource'
import { dataSourceService } from '@/services/DataSourceService'

const widgetComponents = {
  StatCard: defineAsyncComponent(() => import('@/components/widgets/StatCard.vue')),
  LineChart: defineAsyncComponent(() => import('@/components/widgets/LineChart.vue')),
  SimpleText: defineAsyncComponent(() => import('@/components/widgets/SimpleText.vue')),
  DynamicStatCard: defineAsyncComponent(() => import('@/components/widgets/DynamicStatCard.vue'))
}

interface Props {
  widgets: DashboardWidget[]
  editable: boolean
  selectedWidgetId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'layout-change': [layout: any[]]
  'widget-select': [widget: DashboardWidget | null]
  'widget-update': [widget: DashboardWidget]
}>()

const dataSourceStore = useDataSourceStore()
const widgetData = ref<Record<string, any>>({})
const cleanupFunctions = ref<Record<string, () => void>>({})
const loadingStates = ref<Record<string, boolean>>({})

const layout = computed({
  get() {
    return props.widgets.map(w => w.layout)
  },
  set(newLayout) {
    emit('layout-change', newLayout)
  }
})

async function loadWidgetData(widget: DashboardWidget) {
  const dataSource = dataSourceStore.getDataSource(widget.dataSourceId)
  if (!dataSource) return

  loadingStates.value[widget.id] = true

  try {
    const data = await dataSourceService.fetchData(dataSource)
    widgetData.value[widget.id] = data

    const updatedWidget = {
      ...widget,
      props: {
        ...widget.props,
        ...mapDataToProps(widget.type, data)
      }
    }
    emit('widget-update', updatedWidget)
  } catch (error) {
    console.error(`Failed to load data for widget ${widget.id}:`, error)
  } finally {
    loadingStates.value[widget.id] = false
  }
}

function mapDataToProps(widgetType: string, data: any): Record<string, any> {
  switch (widgetType) {
    case 'StatCard':
      return {
        value: data.value || data.data || 0,
        title: data.title || data.name || '統計數據'
      }
    case 'LineChart':
      return {
        data: data.data || data.series || data || [],
        title: data.title || '折線圖'
      }
    case 'SimpleText':
      return {
        text: data.text || data.content || data.value || '文字內容'
      }
    case 'DynamicStatCard':
      return {
        key: data.key || '',
        title: data.title || '',
        value: data.value || 0
      }
    default:
      return {}
  }
}

function setupWidgetDataSource(widget: DashboardWidget) {
  const dataSource = dataSourceStore.getDataSource(widget.dataSourceId)
  if (!dataSource) return

  if (dataSource.type === 'API' && dataSource.config.pollingInterval) {
    const cleanup = dataSourceService.pollAPI(
      dataSource,
      (data) => {
        widgetData.value[widget.id] = data
        const updatedWidget = {
          ...widget,
          props: {
            ...widget.props,
            ...mapDataToProps(widget.type, data)
          }
        }
        emit('widget-update', updatedWidget)
      },
      (error) => {
        console.error(`Polling error for widget ${widget.id}:`, error)
      }
    )
    cleanupFunctions.value[widget.id] = cleanup
  } else if (dataSource.type === 'WebSocket') {
    const ws = dataSourceService.subscribeWebSocket(dataSource, (data) => {
      widgetData.value[widget.id] = data
      const updatedWidget = {
        ...widget,
        props: {
          ...widget.props,
          ...mapDataToProps(widget.type, data)
        }
      }
      emit('widget-update', updatedWidget)
    })
    cleanupFunctions.value[widget.id] = () => ws.close()
  } else {
    loadWidgetData(widget)
  }
}

function cleanupWidgetDataSource(widgetId: string) {
  if (cleanupFunctions.value[widgetId]) {
    cleanupFunctions.value[widgetId]()
    delete cleanupFunctions.value[widgetId]
  }
}

function initializeWidgets() {
  props.widgets.forEach(widget => {
    setupWidgetDataSource(widget)
  })
}

onMounted(() => {
  initializeWidgets()
})

onUnmounted(() => {
  Object.values(cleanupFunctions.value).forEach(cleanup => cleanup())
})

watch(() => props.widgets, (newWidgets) => {
  const newWidgetIds = newWidgets.map(w => w.id)
  const oldWidgetIds = Object.keys(cleanupFunctions.value)

  oldWidgetIds.forEach(id => {
    if (!newWidgetIds.includes(id)) {
      cleanupWidgetDataSource(id)
    }
  })

  newWidgets.forEach(widget => {
    if (!cleanupFunctions.value[widget.id]) {
      setupWidgetDataSource(widget)
    }
  })
}, { deep: true })

function handleWidgetClick(event: Event, widget: DashboardWidget) {
  event.stopPropagation()
  if (props.editable) {
    emit('widget-select', widget)
  }
}

function handleCanvasClick() {
  if (props.editable) {
    emit('widget-select', null)
  }
}
</script>

<style scoped>
.vue-grid-layout {
  transition: height 0.3s ease;
}

.vue-grid-item {
  transition: all 0.2s ease;
}
</style>
