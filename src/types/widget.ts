export type WidgetType = 'StatCard' | 'LineChart' | 'SimpleText'

export interface WidgetLayout {
  x: number
  y: number
  w: number
  h: number
  i: string
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  layout: WidgetLayout
  props: Record<string, any>
  dataSourceId: string
}

export interface StatCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: number
  color?: string
}

export interface LineChartProps {
  title: string
  data: Array<{ name: string; value: number }>
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
}

export interface SimpleTextProps {
  text: string
  fontSize?: string
  fontWeight?: string
  color?: string
  align?: 'left' | 'center' | 'right'
}

export type WidgetProps = StatCardProps | LineChartProps | SimpleTextProps
