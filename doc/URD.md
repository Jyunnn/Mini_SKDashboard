# Project Name: Vue 3 Low-Code Dashboard Builder (MVP) - 前後台分離版

## 1. 專案概述 (Project Overview)

本專案旨在建立一個具備「前後台分離」架構的 Low-code 儀表板系統。

- **後台 (Admin/Builder)**: 需登入。提供完整的拖放 (Drag & Drop) 編輯功能，可從元件庫拖曳 Widget 至網格畫布，並編輯屬性。
- **前台 (Frontend/Viewer)**: 公開或需權限訪問（視需求）。僅負責渲染儀表板內容，不顯示格線、不可拖曳或縮放，呈現最終樣式。

## 2. 技術堆疊與約束 (Tech Stack & Constraints)

AI Agent 必須嚴格遵守以下技術選型：

- **Core Framework**: Vue 3 (使用 Composition API + `<script setup>`)
- **Language**: TypeScript (必須定義完整的 Interface)
- **Build Tool**: Vite
- **Router**: Vue Router (必須使用，用於管理登入頁、後台編輯頁、前台展示頁的路由導航與權限守衛)
- **Styling**: Tailwind CSS (全站樣式標準)
- **Grid System**: grid-layout-plus (核心佈局庫，需利用其 static 或 isDraggable/isResizable 屬性來控制前後台差異)
- **State Management**: Pinia (管理 Dashboard 數據與 User Auth 狀態)
- **Icons**: lucide-vue-next
- **Charts**: vue-echarts 或 echarts
- **Mock Auth**: 使用簡單的 localStorage 或 Pinia 模擬登入行為 (MVP 階段不需串接真實後端 API)。

## 3. 系統架構與頁面路由 (System Architecture & Routes)

系統分為三個主要頁面視圖：

### 3.1 登入頁 (Login View)

- **Route**: `/login`
- **功能**: 簡單的帳號密碼輸入框。
- **邏輯**: 驗證成功後，將 Token 存入 Pinia/localStorage，並轉導至後台編輯頁。

### 3.2 後台編輯頁 (Admin Builder View)

- **Route**: `/admin/builder` (需 Auth Guard)
- **Layout**: 三欄式佈局
  - **Sidebar (Left)**: 元件庫 (Draggable source)。
  - **Canvas (Center)**: 編輯畫布 (Interactive Grid)。顯示格線、支援拖曳、縮放、選中。
  - **Inspector (Right)**: 屬性編輯器。
- **Header**: 包含「預覽」、「儲存佈局」、「登出」按鈕。

### 3.3 前台展示頁 (Public Dashboard View)

- **Route**: `/dashboard` 或 `/dashboard/:id`
- **Layout**: 全螢幕展示 (無 Sidebar, 無 Inspector)。
- **Logic**: 讀取與後台相同的 JSON Schema，但 Grid Item 設定為 Static (唯讀) 模式。

## 4. 數據結構定義 (Data Schema)

### 4.1 資料來源定義 (DataSource)

```typescript
type DataSourceType = 'API' | 'WebSocket' | 'Manual'

interface DataSource {
  id: string
  type: DataSourceType
  config: {
    url?: string              // API/WebSocket 連線位置
    method?: 'GET' | 'POST'   // API 請求方法
    headers?: Record<string, string>
    pollingInterval?: number   // 輪詢間隔 (毫秒)，僅 API
    manualData?: string        // Manual 類型的 JSON 資料
  }
  isValid: boolean            // 格式驗證結果
}
```

### 4.2 Widget 定義 (DashboardWidget)

```typescript
interface DashboardWidget {
  id: string;          // UUID
  type: WidgetType;    // 'StatCard' | 'LineChart' | 'SimpleText'
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
  };
  props: Record<string, any>; // 元件屬性
  dataSourceId: string;        // 關聯的資料來源 ID
}
```

### 4.2 全局狀態 (Store)

**DashboardStore**:

```typescript
interface DashboardState {
  widgets: DashboardWidget[];
  selectedWidgetId: string | null;
  isEditable: boolean; // 關鍵屬性：控制目前是「編輯模式」還是「檢視模式」
}
```

**AuthStore**:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: { name: string } | null;
}
```

**DataSourceStore**:

```typescript
interface DataSourceState {
  dataSources: DataSource[]
  selectedDataSourceId: string | null
  
  // Actions
  addDataSource(ds: DataSource): void
  updateDataSource(id: string, updates: Partial<DataSource>): void
  removeDataSource(id: string): void
  validateDataSource(id: string): Promise<boolean>
  fetchDataSourceData(id: string): Promise<any>
}
```

## 5. 功能需求 (Functional Requirements)

### 5.0 權限與路由 (Authentication & Routing)

- [ ] **路由守衛 (Navigation Guard)**: 進入 `/admin/*` 路徑前，檢查 `AuthStore.isAuthenticated`。若未登入，強制轉導至 `/login`。
- [ ] **登入模擬**: 輸入任意非空帳號密碼即可登入。

### 5.1 畫布交互 (Canvas Logic) - 後台 vs 前台功能

| 功能 | 後台 (Admin) | 前台 (Viewer) |
|------|-------------|---------------|
| Grid Lines | 顯示 (輔助對齊) | 隱藏 (乾淨背景) |
| Draggable | Enable (可拖曳位置) | Disable (位置固定) |
| Resizable | Enable (可調整大小) | Disable (大小固定) |
| Click Action | 選中 Widget (觸發屬性編輯) | 無動作 (或觸發 Widget 內部互動，如圖表 tooltip) |
| Component | grid-layout-plus 參數 is-draggable=true | grid-layout-plus 參數 is-draggable=false |

### 5.2 屬性編輯 (Inspector - Admin Only)

- [ ] **連動更新**: 僅在後台可見。修改屬性後，Canvas 上的元件需即時響應。

### 5.3 支援元件 (Shared Components)

這些元件需設計為「無狀態 (Stateless)」或「被動式」，樣式與數據完全由 props 決定，以便同時在前後台重用。

使用者選擇元件後，系統應觸發「資料配置 (Data Configuration)」步驟。僅在配置完成且驗證通過後，元件才被允許實例化並顯示於畫布。

- **StatCard**: 展示關鍵數據。
- **LineChart**: 展示趨勢圖。
- **SimpleText**: 純文字標題或說明。

### 5.4 資料來源配置流程

當使用者將元件拖曳至畫布時，系統應執行以下流程：

1. **觸發資料來源配置對話框**
   - 顯示三種資料來源類型選擇：API、WebSocket、Manual（假資料）

2. **根據選擇類型顯示不同配置表單**

   **API 配置**:
   - URL 輸入框
   - 請求方法 (GET/POST) 下拉選單
   - Headers 設定（可選）
   - 輪詢間隔（可選，預設 5000ms）

   **WebSocket 配置**:
   - URL 輸入框
   - 測試連線按鈕

   **Manual (假資料)**:
   - JSON 輸入框（語法高亮驗證）
   - 範例預覽按鈕

3. **資料格式驗證**
   - API: 測試連線並回傳資料，驗證 JSON 格式
   - WebSocket: 測試連線並接收資料，驗證 JSON 格式
   - Manual: 驗證 JSON 語法

4. **驗證通過後**
   - 將資料來源儲存至 DataSourceStore
   - 將元件加入 DashboardStore，並關聯 dataSourceId
   - 元件自動載入資料並渲染

5. **驗證失敗**
   - 顯示錯誤訊息
   - 阻止元件新增至畫布
   - 保持配置對話框開啟供修正

### 5.5 資料來源驗證規則

**API 驗證**:
- URL 格式必須為有效 HTTP/HTTPS 地址
- 回傳資料必須為有效 JSON
- 回傳狀態碼需為 2xx

**WebSocket 驗證**:
- URL 格式必須為有效 WS/WSS 地址
- 必須成功建立連線
- 接收資料必須為有效 JSON

**Manual 驗證**:
- 輸入內容必須為有效 JSON
- JSON 結構需符合元件預期格式

## 6. 元件實作建議 (Implementation Guidelines)

### 6.1 核心畫布元件重用 (DashboardRenderer.vue)

建議建立一個通用的 DashboardRenderer 元件，透過 props 決定模式。

```vue
<!-- DashboardRenderer.vue -->
<template>
  <GridLayout
    v-model:layout="layout"
    :col-num="12"
    :row-height="30"
    :is-draggable="props.editable"  <!-- 關鍵：由外部傳入是否可編輯 -->
    :is-resizable="props.editable"
  >
    <GridItem v-for="item in widgets" ...>
       <!-- 動態元件 -->
       <component :is="map[item.type]" v-bind="item.props" />
    </GridItem>
  </GridLayout>
</template>
```

**Admin View**: `<DashboardRenderer :editable="true" :widgets="store.widgets" />`  
**Public View**: `<DashboardRenderer :editable="false" :widgets="store.widgets" />`

### 6.2 資料來源配置對話框 (DataSourceConfigDialog.vue)

模態式對話框，包含：
- 資料來源類型選擇 (Tab 或 Step)
- 動態表單根據選擇類型切換
- 測試連線/驗證按鈕
- 確認/取消按鈕

### 6.3 資料來源服務

建立 `services/DataSourceService.ts`，提供：
- `validateAPI(url, method, headers)`: 驗證 API 資料來源
- `validateWebSocket(url)`: 驗證 WebSocket 資料來源
- `validateManual(jsonString)`: 驗證 Manual JSON
- `fetchData(dataSource)`: 根據資料來源類型獲取資料
- `subscribeWebSocket(dataSource, callback)`: WebSocket 訂閱
- `pollAPI(dataSource, callback)`: API 輪詢

## 7. 交付項目 (Deliverables)

### 專案結構

包含 `router/index.ts` 設定。

### Pages (Views)

- `views/LoginView.vue`
- `views/AdminDashboardView.vue` (Builder)
- `views/PublicDashboardView.vue` (Viewer)

### Components

- `components/dashboard/DashboardRenderer.vue` (共用畫布邏輯)
- `components/editor/WidgetPanel.vue`
- `components/editor/InspectorPanel.vue`
- `components/editor/DataSourceConfigDialog.vue` (資料來源配置對話框)

### Stores

- `store/dashboard.ts`
- `store/auth.ts`
- `store/datasource.ts` (資料來源管理)

### Services

- `services/DataSourceService.ts` (資料來源驗證與獲取)

### Types

- `types/widget.ts` (已包含 WidgetType, DashboardWidget, etc.)
- `types/datasource.ts` (新增: DataSource, DataSourceType)

## 8. 開發進度拆分

### 階段一：資料來源基礎架構
- [ ] 定義 `types/datasource.ts`，包含 `DataSource` interface 和 `DataSourceType` type
- [ ] 更新 `types/widget.ts`，在 `DashboardWidget` 新增 `dataSourceId` 欄位
- [ ] 建立 `store/datasource.ts` (DataSourceStore)，管理資料來源列表
- [ ] 建立 `services/DataSourceService.ts` 基礎架構

### 階段二：資料來源驗證邏輯
- [ ] 實作 `DataSourceService.validateAPI(url, method, headers)` 測試連線並驗證回傳 JSON 格式
- [ ] 實作 `DataSourceService.validateWebSocket(url)` 測試連線並驗證接收 JSON 格式
- [ ] 實作 `DataSourceService.validateManual(jsonString)` 驗證 JSON 語法
- [ ] 新增錯誤處理與使用者友好錯誤訊息

### 階段三：資料來源配置 UI
- [ ] 建立 `components/editor/DataSourceConfigDialog.vue` 基礎結構
- [ ] 實作資料來源類型切換 Tab (API/WebSocket/Manual)
- [ ] 實作 API 配置表單 (URL, Method, Headers, Polling Interval)
- [ ] 實作 WebSocket 配置表單 (URL)
- [ ] 實作 Manual 配置表單 (JSON 輸入框，語法驗證)
- [ ] 實作測試連線/驗證按鈕與結果顯示

### 階段四：元件拖曳流程調整
- [ ] 修改 `views/AdminDashboardView.vue:handleDrop`，拖曳後先彈出資料來源配置對話框
- [ ] 修改 `createWidget` 函數，新增 `dataSourceId` 欄位
- [ ] 實作配置成功後元件新增至 DashboardStore 的邏輯
- [ ] 實作配置失敗錯誤提示與對話框保持邏輯

### 階段五：資料獲取實作
- [ ] 實作 `DataSourceService.fetchData(dataSource)` 統一獲取邏輯
- [ ] 實作 `DataSourceService.pollAPI(dataSource, callback)` API 輪詢機制
- [ ] 實作 `DataSourceService.subscribeWebSocket(dataSource, callback)` WebSocket 訂閱機制
- [ ] 更新各 Widget 元件，從 props 接收動態資料
- [ ] 在 DashboardRenderer 中整合資料載入邏輯

### 階段六：即時更新與輪詢
- [ ] 實作 WebSocket 即時資料更新機制，元件自動重新渲染
- [ ] 實作 API 輪詢機制，根據配置間隔定期更新
- [ ] 新增重新整理按鈕到 InspectorPanel，手動觸發資料更新
- [ ] 新增資料載入狀態顯示（loading/success/error）

### 階段七：資料來源管理
- [ ] 在 InspectorPanel 顯示當前元件關聯的資料來源資訊
- [ ] 新增編輯資料來源功能，允許修改資料來源設定
- [ ] 新增更換資料來源功能，允許切換不同資料來源
- [ ] 在 DataSourceStore 新增資料來源的 CRUD 操作

### 階段八：整合測試與優化
- [ ] 測試拖曳→配置→顯示完整流程（三種資料來源類型）
- [ ] 測試資料格式錯誤處理與使用者提示
- [ ] 測試 WebSocket 即時更新
- [ ] 測試 API 輪詢更新
- [ ] 測試資料來源編輯與更換功能
- [ ] 優化使用者體驗（載入動畫、錯誤提示等）
- [ ] 完善型別定義與錯誤處理
