import type { DashboardWidget } from './widget'

export interface DashboardState {
  widgets: DashboardWidget[]
  selectedWidgetId: string | null
  isEditable: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: { name: string } | null
}
