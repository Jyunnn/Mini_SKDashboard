import type { DataSource, DataSourceConfig, ValidationResult } from '@/types/datasource'

export class DataSourceService {
  private static instance: DataSourceService

  private constructor() {}

  static getInstance(): DataSourceService {
    if (!DataSourceService.instance) {
      DataSourceService.instance = new DataSourceService()
    }
    return DataSourceService.instance
  }

  async validateAPI(
    url: string,
    method: 'GET' | 'POST' = 'GET',
    headers?: Record<string, string>
  ): Promise<ValidationResult> {
    try {
      if (!this.isValidUrl(url, ['http:', 'https:'])) {
        return {
          isValid: false,
          error: 'URL 格式錯誤，請提供有效的 HTTP/HTTPS 地址'
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      if (!response.ok) {
        return {
          isValid: false,
          error: `API 請求失敗，狀態碼：${response.status}`
        }
      }

      const data = await response.json()

      return {
        isValid: true,
        data
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '連線失敗，請檢查網路設定'
      }
    }
  }

  async validateWebSocket(url: string): Promise<ValidationResult> {
    return new Promise((resolve) => {
      try {
        if (!this.isValidUrl(url, ['ws:', 'wss:'])) {
          resolve({
            isValid: false,
            error: 'URL 格式錯誤，請提供有效的 WS/WSS 地址'
          })
          return
        }

        const ws = new WebSocket(url)
        const timeout = setTimeout(() => {
          ws.close()
          resolve({
            isValid: false,
            error: '連線超時，請檢查伺服器是否正常運作'
          })
        }, 5000)

        ws.onopen = () => {
          clearTimeout(timeout)
          ws.close()
          resolve({
            isValid: true,
            data: null
          })
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          resolve({
            isValid: false,
            error: 'WebSocket 連線失敗，請檢查 URL 是否正確'
          })
        }
      } catch (error) {
        resolve({
          isValid: false,
          error: error instanceof Error ? error.message : 'WebSocket 連線失敗'
        })
      }
    })
  }

  validateManual(jsonString: string): ValidationResult {
    try {
      if (!jsonString.trim()) {
        return {
          isValid: false,
          error: '請輸入 JSON 資料'
        }
      }

      const data = JSON.parse(jsonString)

      return {
        isValid: true,
        data
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'JSON 格式錯誤，請檢查語法'
      }
    }
  }

  async validateDataSource(dataSource: DataSource): Promise<ValidationResult> {
    switch (dataSource.type) {
      case 'API':
        return await this.validateAPI(
          dataSource.config.url || '',
          dataSource.config.method || 'GET',
          dataSource.config.headers
        )
      case 'WebSocket':
        return await this.validateWebSocket(dataSource.config.url || '')
      case 'Manual':
        return this.validateManual(dataSource.config.manualData || '')
      default:
        return {
          isValid: false,
          error: '未知的資料來源類型'
        }
    }
  }

  async fetchData(dataSource: DataSource): Promise<any> {
    switch (dataSource.type) {
      case 'API':
        return await this.fetchAPI(dataSource)
      case 'WebSocket':
        throw new Error('WebSocket 資料需透過 subscribe 方法獲取')
      case 'Manual':
        return this.getManualData(dataSource)
      default:
        throw new Error('未知的資料來源類型')
    }
  }

  private async fetchAPI(dataSource: DataSource): Promise<any> {
    const url = dataSource.config.url
    const method = dataSource.config.method || 'GET'
    const headers = dataSource.config.headers

    const response = await fetch(url!, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      throw new Error(`API 請求失敗，狀態碼：${response.status}`)
    }

    return await response.json()
  }

  private getManualData(dataSource: DataSource): any {
    const jsonString = dataSource.config.manualData
    if (!jsonString) {
      throw new Error('Manual 資料未設定')
    }

    return JSON.parse(jsonString)
  }

  subscribeWebSocket(
    dataSource: DataSource,
    callback: (data: any) => void
  ): WebSocket {
    const url = dataSource.config.url
    const ws = new WebSocket(url!)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('解析 WebSocket 資料失敗:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket 錯誤:', error)
    }

    return ws
  }

  pollAPI(
    dataSource: DataSource,
    callback: (data: any) => void,
    onError?: (error: Error) => void
  ): () => void {
    const interval = dataSource.config.pollingInterval || 5000
    const timer = setInterval(async () => {
      try {
        const data = await this.fetchData(dataSource)
        callback(data)
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error)
        }
      }
    }, interval)

    return () => clearInterval(timer)
  }

  private isValidUrl(url: string, allowedProtocols: string[]): boolean {
    try {
      const parsed = new URL(url)
      return allowedProtocols.includes(parsed.protocol)
    } catch {
      return false
    }
  }
}

export const dataSourceService = DataSourceService.getInstance()
