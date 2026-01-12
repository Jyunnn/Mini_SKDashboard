# 動態元件卡 API 功能說明

## 功能概述

根據 API 返回的陣列資料，自動生成對應數量的元件卡。

## API 資料格式

API 必須返回以下格式的陣列：

```json
[
  {
    "key": "sales",
    "title": "銷售額",
    "value": 125000
  },
  {
    "key": "orders",
    "title": "訂單數",
    "value": 456
  },
  {
    "key": "customers",
    "title": "客戶數",
    "value": 89
  }
]
```

### 欄位說明

| 欄位   | 類型            | 必填 | 說明                               |
| ------ | --------------- | ---- | ---------------------------------- |
| key    | string          | 是   | 元件的唯一標識碼                   |
| title  | string          | 是   | 卡片顯示的標題                     |
| value  | string \| number | 是   | 卡片顯示的數值                     |

## 使用方法

### 1. 配置資料來源

在資料來源設定中新增 API 資料來源：

```typescript
{
  id: 'dynamic-cards-datasource',
  type: 'API',
  config: {
    url: 'https://api.example.com/cards',
    method: 'GET',
    pollingInterval: 5000 // 選填：輪詢間隔（毫秒）
  },
  isValid: true
}
```

### 2. 程式碼範例

#### 使用 DataSourceService 批量生成 Widgets

```typescript
import { dataSourceService } from '@/services/DataSourceService'
import { useDashboardStore } from '@/store/dashboard'

const dataSource = {
  id: 'dynamic-cards-datasource',
  type: 'API',
  config: {
    url: 'https://api.example.com/cards',
    method: 'GET'
  },
  isValid: true
}

// 1. 獲取並解析 API 資料
const items = await dataSourceService.fetchDynamicCards(dataSource)

// 2. 生成 Widgets 配置
const widgets = dataSourceService.generateDynamicWidgets(
  'dynamic-cards-datasource',
  items,
  0, // startX - 開始 X 座標
  0  // startY - 開始 Y 座標
)

// 3. 批量添加到 Dashboard
const dashboardStore = useDashboardStore()
dashboardStore.addWidgets(widgets)
```

### 3. 元件佈局說明

生成的卡片會自動進行網格佈局：

- 每行最多 3 個卡片（每個卡片寬度為 4 格，總共 12 格）
- 卡片高度為 4 格
- 透過 `startX` 和 `startY` 參數控制起始位置

### 4. 實際應用場景

#### 場景一：定期更新的數據面板

```typescript
// 在元件中初始化
onMounted(async () => {
  const items = await dataSourceService.fetchDynamicCards(dataSource)
  const widgets = dataSourceService.generateDynamicWidgets(dataSource.id, items)
  dashboardStore.addWidgets(widgets)
})

// 設定輪詢更新
const cleanup = dataSourceService.pollAPI(
  dataSource,
  async (data) => {
    const items = data.map(item => ({
      key: item.key,
      title: item.title,
      value: item.value
    }))
    
    // 清除舊的動態 widgets
    const oldWidgets = dashboardStore.widgets.filter(w => 
      w.type === 'DynamicStatCard' && w.dataSourceId === dataSource.id
    )
    oldWidgets.forEach(w => dashboardStore.removeWidget(w.id))
    
    // 添加新的 widgets
    const widgets = dataSourceService.generateDynamicWidgets(dataSource.id, items)
    dashboardStore.addWidgets(widgets)
  }
)
```

#### 場景二：手動觸發更新

```typescript
async function refreshDynamicCards() {
  const dataSource = dataSourceStore.getDataSource('dynamic-cards-datasource')
  if (!dataSource) return
  
  const items = await dataSourceService.fetchDynamicCards(dataSource)
  
  // 清除舊的 widgets
  const oldWidgets = dashboardStore.widgets.filter(w => 
    w.type === 'DynamicStatCard' && w.dataSourceId === dataSource.id
  )
  oldWidgets.forEach(w => dashboardStore.removeWidget(w.id))
  
  // 添加新的 widgets
  const widgets = dataSourceService.generateDynamicWidgets(dataSource.id, items)
  dashboardStore.addWidgets(widgets)
}
```

## 元件外觀

動態卡片元件（DynamicStatCard）會顯示：

```
┌─────────────────────┐
│ [key]               │
│                     │
│ title               │
│ value               │
└─────────────────────┘
```

- **key**: 以藍色小標籤顯示（等寬字體）
- **title**: 次標題，灰色字體
- **value**: 主要數值，大字體加粗

## 注意事項

1. **API 必須返回陣列格式**，否則會拋出錯誤
2. 每次更新建議先清除舊的動態 widgets，再添加新的
3. 可以透過輪詢功能自動定期更新資料
4. Widget ID 包含時間戳，確保唯一性
5. 建議在生產環境中添加錯誤處理機制

## 測試 API 範例

可以使用以下 JSON 進行測試：

```json
[
  {
    "key": "revenue",
    "title": "本月營收",
    "value": "NT$ 1,250,000"
  },
  {
    "key": "users",
    "title": "活躍用戶",
    "value": 3456
  },
  {
    "key": "conversion",
    "title": "轉換率",
    "value": "12.5%"
  }
]
```

## 相關檔案

- `src/types/datasource.ts` - 資料來源類型定義
- `src/types/widget.ts` - Widget 類型定義
- `src/services/DataSourceService.ts` - 資料來源服務
- `src/components/widgets/DynamicStatCard.vue` - 動態卡片元件
- `src/store/dashboard.ts` - Dashboard 狀態管理
