<template>
  <div class="bg-white rounded-lg shadow-sm p-6 h-full">
    <h3 class="text-sm font-medium text-gray-500 mb-4">{{ title }}</h3>
    <div class="h-[calc(100%-2rem)]">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import type { LineChartProps } from '@/types/widget'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const props = withDefaults(defineProps<LineChartProps>(), {
  title: '折線圖',
  data: () => [],
  xAxisLabel: '',
  yAxisLabel: '',
  color: '#3b82f6'
})

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartOption = computed(() => {
  const data = props.data || []
  const color = props.color || '#3b82f6'

  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      name: props.xAxisLabel
    },
    yAxis: {
      type: 'value',
      name: props.yAxisLabel
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true,
        itemStyle: {
          color
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: hexToRgba(color, 0.3)
              },
              {
                offset: 1,
                color: hexToRgba(color, 0.05)
              }
            ]
          }
        }
      }
    ]
  }
})
</script>
