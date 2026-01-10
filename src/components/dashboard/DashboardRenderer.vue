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
        <div class="w-full h-full p-2">
          <component :is="widgetComponents[item.type]" v-bind="item.props" />
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, defineProps, defineEmits } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'
import type { DashboardWidget } from '@/types/widget'

const widgetComponents = {
  StatCard: defineAsyncComponent(() => import('@/components/widgets/StatCard.vue')),
  LineChart: defineAsyncComponent(() => import('@/components/widgets/LineChart.vue')),
  SimpleText: defineAsyncComponent(() => import('@/components/widgets/SimpleText.vue'))
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
}>()

const layout = computed({
  get() {
    return props.widgets.map(w => w.layout)
  },
  set(newLayout) {
    emit('layout-change', newLayout)
  }
})

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
