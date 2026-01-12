import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardWidget } from '@/types/widget'

export const useDashboardStore = defineStore('dashboard', () => {
  const widgets = ref<DashboardWidget[]>([])
  const selectedWidgetId = ref<string | null>(null)
  const isEditable = ref<boolean>(true)

  function addWidget(widget: DashboardWidget): void {
    widgets.value.push(widget)
  }

  function removeWidget(id: string): void {
    const index = widgets.value.findIndex(w => w.id === id)
    if (index !== -1) {
      widgets.value.splice(index, 1)
    }
    if (selectedWidgetId.value === id) {
      selectedWidgetId.value = null
    }
  }

  function updateWidget(id: string, updates: Partial<DashboardWidget>): void {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      Object.assign(widget, updates)
    }
  }

  function selectWidget(id: string | null): void {
    selectedWidgetId.value = id
  }

  function clearSelection(): void {
    selectedWidgetId.value = null
  }

  const selectedWidget = computed(() => {
    return widgets.value.find(w => w.id === selectedWidgetId.value) || null
  })

  function saveToLocalStorage(): void {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets.value))
  }

  function loadFromLocalStorage(): void {
    const data = localStorage.getItem('dashboard_widgets')
    if (data) {
      try {
        widgets.value = JSON.parse(data)
      } catch (e) {
        console.error('Failed to load widgets from localStorage', e)
      }
    }
  }

  function clearWidgets(): void {
    widgets.value = []
    selectedWidgetId.value = null
  }

  function setEditable(editable: boolean): void {
    isEditable.value = editable
  }

  function addWidgets(widgets: DashboardWidget[]): void {
    widgets.value.push(...widgets)
  }

  return {
    widgets,
    selectedWidgetId,
    selectedWidget,
    isEditable,
    addWidget,
    removeWidget,
    updateWidget,
    selectWidget,
    clearSelection,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearWidgets,
    setEditable,
    addWidgets
  }
})
