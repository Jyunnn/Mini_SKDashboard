# Vue 3 Low-Code Dashboard Builder 開發記錄

## 專案概述

基於 URD.md 規格建立的 Low-code 儀表板系統，採用前後台分離架構。

### 技術堆疊

- **Core Framework**: Vue 3 (Composition API + `<script setup>`)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: Vue Router
- **Styling**: Tailwind CSS
- **Grid System**: grid-layout-plus
- **State Management**: Pinia
- **Icons**: lucide-vue-next
- **Charts**: vue-echarts + echarts
- **Utils**: uuid (for generating widget IDs)

---

## 已完成的功能

### 1. 基礎設置 (已完成)

- ✅ 專案初始化（Vite + Vue 3 + TypeScript）
- ✅ Tailwind CSS 配置
- ✅ TypeScript Interface 定義
  - `src/types/widget.ts` - Widget 相關型別
  - `src/types/store.ts` - Store 狀態型別

### 2. 狀態管理 (已完成)

- ✅ **AuthStore** (`src/store/auth.ts`)
  - 登入/登出功能
  - 使用 localStorage 模擬 token 儲存
  - 登入狀態檢查

- ✅ **DashboardStore** (`src/store/dashboard.ts`)
  - Widgets 管理（新增、刪除、更新）
  - 選中狀態管理
  - 編輯模式控制
  - localStorage 持久化

### 3. 路由系統 (已完成)

- ✅ **路由配置** (`src/router/index.ts`)
  - `/login` - 登入頁
  - `/admin/builder` - 後台編輯頁（需登入）
  - `/dashboard` - 前台展示頁
  - `/dashboard/:id` - 特定儀表板展示頁

- ✅ **路由守衛**
  - `/admin/*` 路徑需驗證登入狀態
  - 未登入自動重導向至登入頁

### 4. 頁面視圖 (已完成)

- ✅ **LoginView** (`src/views/LoginView.vue`)
  - 帳號密碼輸入表單
  - 登入邏輯（任意非空帳號密碼）
  - 登入成功後轉導至後台

- ✅ **AdminDashboardView** (`src/views/AdminDashboardView.vue`)
  - 三欄式佈局（元件庫、畫布、屬性編輯器）
  - Header 按鈕（預覽、儲存、登出）
  - 拖放功能整合
  - 元件選中和屬性編輯整合

- ✅ **PublicDashboardView** (`src/views/PublicDashboardView.vue`)
  - 全螢幕展示模式
  - 靜態唯讀模式（不可拖曳、縮放）
  - 返回編輯按鈕

### 5. 共用 Widget 元件 (已完成)

- ✅ **StatCard** (`src/components/widgets/StatCard.vue`)
  - 關鍵數據卡片
  - 支援標題、數值、圖標、趨勢
  - 使用 `withDefaults` 添加默認值防止 props 為 undefined

- ✅ **LineChart** (`src/components/widgets/LineChart.vue`)
  - 折線圖展示
  - 支援自定義數據、軸標籤、顏色
  - **重要**: 必須使用 `use()` 註冊 echarts 組件（CanvasRenderer、LineChart 等）
  - 使用 `withDefaults` 添加默認值防止 props 為 undefined

- ✅ **SimpleText** (`src/components/widgets/SimpleText.vue`)
  - 純文字元件
  - 支援字體大小、粗細、顏色、對齊方式
  - 使用 `withDefaults` 添加默認值防止 props 為 undefined

### 6. 核心畫布元件 (已完成)

- ✅ **DashboardRenderer** (`src/components/dashboard/DashboardRenderer.vue`)
  - 使用 grid-layout-plus 實現網格佈局
  - 支援 editable prop 控制前後台模式
  - 後台：可拖曳、縮放、選中
  - 前台：靜態唯讀模式
  - 響應式佈局變化

### 7. 後台編輯器元件 (已完成)

- ✅ **WidgetPanel** (`src/components/editor/WidgetPanel.vue`)
  - 元件庫列表
  - 支援拖放至畫布
  - 三種元件類型展示

- ✅ **InspectorPanel** (`src/components/editor/InspectorPanel.vue`)
  - 屬性編輯器
  - 根據不同元件類型動態顯示編輯欄位
  - 支援刪除元件

### 8. 拖放與互動功能 (已完成)

- ✅ 拖放邏輯（從 WidgetPanel 拖曳至 DashboardRenderer）
- ✅ 元件選中功能
- ✅ 屬性即時更新
- ✅ 佈局儲存至 localStorage
- ✅ 預覽模式切換

---

## 專案結構

```
dashboard_sample/
├── public/                          # 靜態資源
├── src/
│   ├── assets/                      # 樣式與資源
│   │   └── main.css                 # Tailwind CSS 設定
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DashboardRenderer.vue    # 核心畫布元件
│   │   ├── editor/
│   │   │   ├── InspectorPanel.vue       # 屬性編輯器
│   │   │   └── WidgetPanel.vue         # 元件庫
│   │   └── widgets/
│   │       ├── LineChart.vue           # 折線圖元件
│   │       ├── SimpleText.vue          # 文字元件
│   │       └── StatCard.vue            # 統計卡片元件
│   ├── router/
│   │   └── index.ts                   # 路由配置
│   ├── store/
│   │   ├── auth.ts                    # 認證 Store
│   │   └── dashboard.ts               # 儀表板 Store
│   ├── types/
│   │   ├── store.ts                   # Store 型別
│   │   └── widget.ts                  # Widget 型別
│   ├── views/
│   │   ├── AdminDashboardView.vue     # 後台編輯頁
│   │   ├── LoginView.vue             # 登入頁
│   │   └── PublicDashboardView.vue    # 前台展示頁
│   ├── App.vue                       # 根元件
│   ├── main.ts                       # 應用程式入口
│   └── vite-env.d.ts                 # Vite 型別定義
├── index.html                        # HTML 入口
├── package.json                      # 專案依賴
├── postcss.config.js                 # PostCSS 配置
├── tailwind.config.js                # Tailwind 配置
├── tsconfig.json                     # TypeScript 配置
├── tsconfig.node.json                # Node TypeScript 配置
├── vite.config.ts                    # Vite 配置
└── URD.md                            # 需求文件
```

---

## 開發命令

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
專案會在 `http://localhost:3000` 啟動

### 建構
```bash
npm run build
```

### 預覽建構結果
```bash
npm run preview
```

---

## 使用說明

### 登入流程
1. 訪問 `http://localhost:3000` 會自動重導向至 `/login`
2. 輸入任意非空帳號密碼即可登入
3. 登入成功後進入 `/admin/builder` 後台編輯頁

### 後台編輯器
1. 左側：元件庫 - 拖曳元件至畫布
2. 中間：畫布 - 放置元件、調整佈局
3. 右側：屬性編輯器 - 選中元件後編輯屬性

### 前台展示
1. 點擊「預覽」按鈕切換至 `/dashboard`
2. 以唯讀模式查看儀表板
3. 點擊「返回編輯」回到後台

---

## 未來可擴展功能

### 新 Widget 類型
- BarChart - 柱狀圖
- PieChart - 圓餅圖
- Table - 數據表格
- Image - 圖片元件
- Iframe - 嵌入外部網頁

### 進階功能
- 元件複製功能
- 元件圖層順序調整
- 撤銷/重做功能
- 匯出/匯入佈局配置（JSON 檔案）
- 多個儀表板管理
- 元件分類與搜尋
- 模板庫

### 後端整合
- 真實用戶認證系統
- 佈局資料庫存儲
- Widget 數據 API 連接
- 多用戶協作

---

## 開發注意事項

### grid-layout-plus 樣式
該套件無需手動引入 CSS，樣式已自動注入。

### echarts 使用 (vue-echarts)
使用 vue-echarts 時必須先註冊所需的 echarts 組件：
```ts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])
```

### TypeScript 型別
所有元件使用 `defineProps<InterfaceType>` 定義型別，確保型別安全。

### Widget 預設值
所有 Widget 元件應使用 `withDefaults` 設置默認值，防止 props 為 undefined 時報錯：
```ts
const props = withDefaults(defineProps<WidgetProps>(), {
  // 默認值
})
```

### Store 更新
DashboardStore 使用 ref 管理狀態，可直接修改 widget.props 觸發響應式更新。

### 本地存儲
使用 `dashboardStore.saveToLocalStorage()` 儲存佈局，使用 `loadFromLocalStorage()` 載入。

---

## 已知問題

無重大問題，專案建構與執行正常。
