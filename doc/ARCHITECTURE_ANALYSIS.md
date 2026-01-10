# 專案架構分析報告

## 概述

使用 Serena 工具分析 dashboard_sample 專案，確認專案採用 Vue 3 + TypeScript 的前後台分離 Low-code 儀表板系統架構。

---

## 專案結構

```
dashboard_sample/
├── src/
│   ├── components/           # 元件目錄
│   │   ├── dashboard/       # 畫布元件
│   │   │   └── DashboardRenderer.vue
│   │   ├── editor/         # 編輯器元件
│   │   │   ├── InspectorPanel.vue
│   │   │   └── WidgetPanel.vue
│   │   └── widgets/        # Widget 元件
│   │       ├── LineChart.vue
│   │       ├── SimpleText.vue
│   │       └── StatCard.vue
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── store/              # 狀態管理
│   │   ├── auth.ts
│   │   └── dashboard.ts
│   ├── types/              # 類型定義
│   │   ├── store.ts
│   │   └── widget.ts
│   ├── views/              # 頁面視圖
│   │   ├── AdminDashboardView.vue
│   │   ├── LoginView.vue
│   │   └── PublicDashboardView.vue
│   ├── assets/             # 靜態資源
│   │   └── main.css
│   ├── App.vue             # 根元件
│   ├── main.ts             # 應用程式入口
│   └── vite-env.d.ts       # 型別定義
├── doc/                    # 文檔
│   ├── DEV_LOG.md
│   ├── QUICK_START.md
│   └── URD.md
├── index.html
├── package.json
├── vite.config.ts
└── 其他配置檔案...
```

---

## 核心模組分析

### 1. 路由系統 (src/router/index.ts)

**路由配置**：
- `/login` - 登入頁（無需認證）
- `/admin/builder` - 後台編輯器（需認證）
- `/dashboard` - 前台展示（無需認證）
- `/dashboard/:id` - 特定儀表板展示（無需認證）
- `/` - 重導向至 `/login`

**路由守衛**：
- 使用 `beforeEach` 攔截器
- 檢查 `useAuthStore().isAuthenticated`
- 未登入訪問 `/admin/*` 會重導向至 `/login`
- 已登入訪問 `/login` 會重導向至 `/admin/builder`

### 2. 狀態管理 (src/store/)

#### AuthStore (src/store/auth.ts)
**狀態**：
- `isAuthenticated: boolean` - 登入狀態
- `user: { name: string } | null` - 使用者資訊

**方法**：
- `login(username, password)` - 登入（任意非空帳號密碼）
- `logout()` - 登出
- `checkAuth()` - 檢查 localStorage 中的登入狀態

#### DashboardStore (src/store/dashboard.ts)
**狀態**：
- `widgets: DashboardWidget[]` - 元件陣列
- `selectedWidgetId: string | null` - 選中元件 ID
- `isEditable: boolean` - 編輯模式

**Computed**：
- `selectedWidget: DashboardWidget | null` - 當前選中的元件

**方法**：
- `addWidget(widget)` - 新增元件
- `removeWidget(id)` - 刪除元件
- `updateWidget(id, updates)` - 更新元件
- `selectWidget(id)` - 選中元件
- `clearSelection()` - 清除選中
- `saveToLocalStorage()` - 儲存至 localStorage
- `loadFromLocalStorage()` - 從 localStorage 載入
- `clearWidgets()` - 清除所有元件
- `setEditable(editable)` - 設置編輯模式

### 3. 類型定義 (src/types/widget.ts)

**WidgetType**：
- `'StatCard'` - 統計卡片
- `'LineChart'` - 折線圖
- `'SimpleText'` - 純文字

**DashboardWidget**：
```typescript
interface DashboardWidget {
  id: string
  type: WidgetType
  layout: WidgetLayout
  props: Record<string, any>
}
```

**WidgetLayout**：
```typescript
interface WidgetLayout {
  x: number      // X 位置
  y: number      // Y 位置
  w: number      // 寬度（格數）
  h: number      // 高度（格數）
  i: string      // 元件 ID
}
```

**各 Widget Props**：
- `StatCardProps` - title, value, icon?, trend?, color?
- `LineChartProps` - title, data, xAxisLabel?, yAxisLabel?, color?
- `SimpleTextProps` - text, fontSize?, fontWeight?, color?, align?

### 4. 核心組件

#### DashboardRenderer.vue
**職責**：核心畫布元件，使用 grid-layout-plus 實現網格佈局

**Props**：
- `widgets: DashboardWidget[]` - 元件陣列
- `editable: boolean` - 是否可編輯
- `selectedWidgetId?: string | null` - 選中元件 ID

**功能**：
- 動態載入 Widget 元件
- 支援拖曳、縮放（editable=true 時）
- 元件選中狀態顯示
- 響應式佈局變化

**動態元件註冊**：
```typescript
const widgetComponents = {
  StatCard: defineAsyncComponent(() => import('@/components/widgets/StatCard.vue')),
  LineChart: defineAsyncComponent(() => import('@/components/widgets/LineChart.vue')),
  SimpleText: defineAsyncComponent(() => import('@/components/widgets/SimpleText.vue'))
}
```

#### WidgetPanel.vue
**職責**：元件庫側邊欄，提供可拖曳的元件

**功能**：
- 顯示三種元件類型
- 支援拖放至畫布
- 發出 `widget-drag` 事件

#### InspectorPanel.vue
**職責**：屬性編輯器，根據元件類型動態顯示編輯欄位

**Props**：
- `selectedWidget: DashboardWidget | null` - 當前選中的元件

**功能**：
- 根據不同元件類型顯示不同的屬性編輯表單
- 支援刪除元件
- 發出 `widget-update` 和 `widget-delete` 事件

### 5. Widget 元件

#### StatCard.vue
**功能**：關鍵數據卡片顯示
- 顯示標題、數值、圖標
- 支援趨勢指示
- 使用 `withDefaults` 設置默認值

#### LineChart.vue
**功能**：折線圖展示（使用 vue-echarts）
- **重要**：必須使用 `use()` 註冊 echarts 組件
- 註冊的組件：CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent
- 支援自定義數據、軸標籤、顏色
- 使用 `withDefaults` 設置默認值

#### SimpleText.vue
**功能**：純文字元件
- 支援字體大小、粗細、顏色、對齊方式
- 使用 `withDefaults` 設置默認值

### 6. 頁面視圖

#### AdminDashboardView.vue
**職責**：後台編輯器主頁面

**佈局**：
- Header：標題、預覽、儲存、登出按鈕
- 左側：WidgetPanel（元件庫）
- 中間：DashboardRenderer（畫布）
- 右側：InspectorPanel（屬性編輯器）

**功能**：
- 元件拖放（handleDrop）
- 佈局變更（handleLayoutChange）
- 元件選中（handleWidgetSelect）
- 屬性更新（handleWidgetUpdate）
- 元件刪除（handleWidgetDelete）
- 預覽切換（handlePreview）
- 儲存佈局（handleSave）
- 登出（handleLogout）
- Widget 初始化（createWidget）

#### LoginView.vue
**職責**：登入頁面
- 帳號密碼輸入表單
- 登入邏輯（任意非空帳號密碼）
- 登入成功後轉導至 `/admin/builder`

#### PublicDashboardView.vue
**職責**：前台展示頁面
- 全螢幕展示模式
- 靜態唯讀模式（editable=false）
- 返回編輯按鈕

### 7. 應用程式入口 (src/main.ts)

**初始化流程**：
1. 建立 Vue 應用程式實例
2. 註冊 Pinia
3. 註冊 Router
4. 載入 CSS 樣式
5. 掛載至 `#app`

```typescript
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## 資料流分析

### 登入流程
```
1. 用戶訪問 / → 重導向至 /login
2. 用戶輸入帳號密碼
3. LoginView 調用 authStore.login()
4. authStore 儲存 token 至 localStorage
5. 重導向至 /admin/builder
```

### 後台編輯流程
```
1. 用戶從 WidgetPanel 拖曳元件
2. DashboardRenderer 接收 drop 事件
3. AdminDashboardView 調用 createWidget() 創建 Widget
4. 調用 dashboardStore.addWidget() 新增至 store
5. DashboardRenderer 響應式更新顯示

選中編輯流程：
1. 用戶點擊 Widget
2. DashboardRenderer 發出 widget-select 事件
3. AdminDashboardView 調用 dashboardStore.selectWidget()
4. InspectorPanel 響應式更新顯示屬性
5. 用戶修改屬性
6. InspectorPanel 發出 widget-update 事件
7. AdminDashboardView 調用 dashboardStore.updateWidget()
8. Widget 響應式更新顯示
```

### 儲存/載入流程
```
儲存：
1. 用戶點擊儲存按鈕
2. AdminDashboardView 調用 dashboardStore.saveToLocalStorage()
3. widgets 陣列序列化為 JSON
4. 儲存至 localStorage['dashboard_widgets']

載入：
1. AdminDashboardView/PublicDashboardView onMounted
2. 調用 dashboardStore.loadFromLocalStorage()
3. 從 localStorage['dashboard_widgets'] 讀取 JSON
4. 反序列化賦值給 widgets
```

---

## 技術依賴

### 核心框架
- Vue 3 (Composition API + `<script setup>`)
- TypeScript

### 狀態管理
- Pinia

### 路由
- Vue Router

### UI 組件庫
- grid-layout-plus - 網格佈局系統
- vue-echarts - 圖表組件
- echarts - 圖表引擎

### 工具庫
- uuid - 生成唯一 ID

### 樣式
- Tailwind CSS

### 構建工具
- Vite

---

## 架構特點

### 1. 前後台分離
- 後台（/admin/builder）：可編輯模式
- 前台（/dashboard）：唯讀展示模式
- 透過 DashboardRenderer 的 `editable` prop 控制模式

### 2. 組件化設計
- Widget 元件可複用
- 靜態元件設計，完全由 props 控制
- 支援動態載入（defineAsyncComponent）

### 3. 狀態集中管理
- AuthStore 管理認證狀態
- DashboardStore 管理儀表板狀態
- 使用 localStorage 持久化

### 4. 拖放互動
- 基於 HTML5 Drag and Drop API
- WidgetPanel 作為拖曳源
- DashboardRenderer 作為放置目標
- 響應式更新佈局

### 5. 屬性編輯器
- 根據元件類型動態顯示編輯欄位
- 即時更新元件屬性
- 雙向綁定實現

---

## 潛在擴展點

### 1. 新增 Widget 類型
- 在 `src/types/widget.ts` 定義新 WidgetType 和 Props
- 在 `src/components/widgets/` 建立新元件
- 在 `DashboardRenderer.vue` 的 `widgetComponents` 註冊
- 在 `WidgetPanel.vue` 的 `widgetTypes` 添加定義
- 在 `AdminDashboardView.vue` 的 `createWidget` 添加初始化邏輯
- 在 `InspectorPanel.vue` 添加屬性編輯介面

### 2. 後端整合
- 將 localStorage 替換為 API 呼叫
- 實現真實用戶認證
- 多儀表板管理

### 3. 進階功能
- 撤銷/重做
- 元件複製
- 元件圖層順序調整
- 匯出/匯入配置（JSON）

---

## 總結

專案架構清晰，採用標準的 Vue 3 專案結構：

✅ **良好的分層**：Types → Store → Router → Views → Components
✅ **單一職責**：每個組件職責明確
✅ **可擴展性**：Widget 組件易於擴展
✅ **型別安全**：完整的 TypeScript 類型定義
✅ **狀態管理**：使用 Pinia 集中管理狀態
✅ **路由守衛**：實現權限控制

架構符合 URD 規格要求，所有核心功能均已實現並可正常運作。
