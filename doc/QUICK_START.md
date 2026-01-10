# 快速啟動指南

## 第一次設置

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev
```

專案會在 `http://localhost:3000` 啟動。

## 登入資訊

- URL: `http://localhost:3000`
- 帳號: 任意非空字串
- 密碼: 任意非空字串

## 主要頁面

| 路由 | 功能 | 需登入 |
|------|------|--------|
| `/login` | 登入頁 | 否 |
| `/admin/builder` | 後台編輯器 | 是 |
| `/dashboard` | 前台展示 | 否 |

## 常用命令

```bash
# 開發模式
npm run dev

# 建構
npm run build

# 預覽建構結果
npm run preview
```

## 專案結構重點

```
src/
├── components/
│   ├── dashboard/DashboardRenderer.vue  # 畫布
│   ├── editor/
│   │   ├── InspectorPanel.vue         # 屬性編輯器
│   │   └── WidgetPanel.vue            # 元件庫
│   └── widgets/                        # Widget 元件
├── store/
│   ├── auth.ts                         # 認證
│   └── dashboard.ts                    # 儀表板狀態
├── types/                              # 型別定義
└── views/                              # 頁面
```

## 添加新 Widget 步驟

1. 在 `src/types/widget.ts` 定義新 WidgetType 和 Props 介面
2. 在 `src/components/widgets/` 建立新元件
3. 在 `DashboardRenderer.vue` 的 `widgetComponents` 中註冊
4. 在 `WidgetPanel.vue` 的 `widgetTypes` 陣列中添加定義
5. 在 `AdminDashboardView.vue` 的 `createWidget` 函數中添加初始化邏輯
6. 在 `InspectorPanel.vue` 中添加屬性編輯介面

## 常見問題

### echarts 錯誤 "Renderer undefined is not imported"
使用 vue-echarts 時必須先註冊 echarts 組件，參考 `LineChart.vue` 的實作：
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

### 樣式沒有套用
確保 `tailwind.config.js` 的 content 路徑正確：
```js
content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"]
```

### grid-layout-plus 樣式問題
該套件無需手動引入 CSS，樣式已自動注入。

### Store 資料不持久化
使用 `dashboardStore.saveToLocalStorage()` 儲存，`loadFromLocalStorage()` 載入。
