export type DataSourceType = 'API' | 'WebSocket' | 'Manual'

export interface DataSourceConfig {
  url?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  pollingInterval?: number
  manualData?: string
}

export interface DataSource {
  id: string
  type: DataSourceType
  config: DataSourceConfig
  isValid: boolean
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  data?: any
}
