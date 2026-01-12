import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DataSource, DataSourceConfig } from '@/types/datasource'
import { v4 as uuidv4 } from 'uuid'

export const useDataSourceStore = defineStore('datasource', () => {
  const dataSources = ref<DataSource[]>([])
  const selectedDataSourceId = ref<string | null>(null)

  function addDataSource(type: DataSource['type'], config: DataSourceConfig): string {
    const id = uuidv4()
    const dataSource: DataSource = {
      id,
      type,
      config,
      isValid: false
    }
    dataSources.value.push(dataSource)
    return id
  }

  function updateDataSource(id: string, updates: Partial<DataSource>): void {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index !== -1) {
      Object.assign(dataSources.value[index], updates)
    }
  }

  function removeDataSource(id: string): void {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index !== -1) {
      dataSources.value.splice(index, 1)
    }
    if (selectedDataSourceId.value === id) {
      selectedDataSourceId.value = null
    }
  }

  function getDataSource(id: string): DataSource | undefined {
    return dataSources.value.find(ds => ds.id === id)
  }

  function selectDataSource(id: string | null): void {
    selectedDataSourceId.value = id
  }

  function clearSelection(): void {
    selectedDataSourceId.value = null
  }

  const selectedDataSource = ref<DataSource | undefined>(undefined)

  function updateValidationStatus(id: string, isValid: boolean): void {
    const dataSource = dataSources.value.find(ds => ds.id === id)
    if (dataSource) {
      dataSource.isValid = isValid
    }
  }

  function saveToLocalStorage(): void {
    localStorage.setItem('datasources', JSON.stringify(dataSources.value))
  }

  function loadFromLocalStorage(): void {
    const data = localStorage.getItem('datasources')
    if (data) {
      try {
        dataSources.value = JSON.parse(data)
      } catch (e) {
        console.error('Failed to load datasources from localStorage', e)
      }
    }
  }

  return {
    dataSources,
    selectedDataSourceId,
    selectedDataSource,
    addDataSource,
    updateDataSource,
    removeDataSource,
    getDataSource,
    selectDataSource,
    clearSelection,
    updateValidationStatus,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
