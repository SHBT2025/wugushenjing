# 项目编码规范 — 无股神经 (stockrsi3.1)

> 适用范围: index.html (内联 CSS + JS), service-worker.js, manifest.json
> 生成日期: 2025-04-09
> 基于实际代码扫描分析

---

## 1. 代码风格规则

### 1.1 缩进与格式

| 规则 | 实际标准 | 来源 |
|------|----------|------|
| **缩进** | 使用 **Tab** 缩进，宽度 4 空格 | index.html 全文件 |
| **引号** | 统一使用 **双引号** `"` | index.html 全文件 |
| **分号** | **必须加分号** `;`，不可省略 | 全文件每行语句结尾 |
| **行尾** | 无尾随空格，Unix LF 换行 | 全文件 |
| **空行** | 函数之间空 1 行，逻辑块之间空 1 行 | 全文件 |
| **行宽** | 不超过 120 字符（过长时换行对齐） | 全文件 |

### 1.2 注释规范

| 类型 | 格式 | 示例 |
|------|------|------|
| **段注释** | `// ========== 标题 ==========` | `// ========== 电池条核心逻辑 ==========` |
| **行注释** | `// 说明` 在代码上方 | `// 跳过非GET请求` |
| **行尾注释** | 很少使用，仅在简单说明时 | 极少见 |
| **JSDoc** | 仅在 service-worker.js 使用 | service-worker.js |
| **TODO** | `// TODO: 说明` | 项目中暂无 |

### 1.3 代码组织

```
index.html 结构（自上而下）:
├── <head> (元数据 + 外部 CDN + <style> 320行 CSS)
├── <body>
│   ├── HTML 结构 (~189 行)
│   ├── <script>
│   │   ├── 1. 全局变量声明 (watchlist, stockEventValues, klineData, ...)
│   │   ├── 2. 存储相关 (saveData, loadData)
│   │   ├── 3. 自选股管理 (addToWatchlist, removeFromWatchlist)
│   │   ├── 4. API & RSI (getSecId, fetchKline, fetchQuote, calcRSI6, getRSI6Series)
│   │   ├── 5. K线绘制 (drawKlineWithCrosshair, 含电池条/RSI曲线)
│   │   ├── 6. 事件系统 (addEvent, renderEventTable)
│   │   ├── 7. 提醒系统 (checkStockAlert, checkAllAlerts, showAlertNotification)
│   │   ├── 8. 交互与初始化 (init, DOMContentLoaded)
│   │   └── 9. Service Worker 注册
│   └── </script>
└── </html>
```

---

## 2. 架构与设计规则

### R1: 单文件架构
所有代码（HTML + CSS + JS）必须集中在 `index.html` 一个文件中。`service-worker.js` 是唯一的例外文件。

### R2: Canvas 绘制
K线图必须使用 Canvas 2D API 绘制，禁止使用 SVG 或第三方图表库。

### R3: 无框架约束
禁止使用 React / Vue / Angular 等前端框架。只允许使用原生 JavaScript (ES6+) + CSS3。

### R4: 无 jQuery
禁止使用 jQuery。所有 DOM 操作用原生 API（`document.querySelector`, `.addEventListener`, `.innerHTML` 等）。

### R5: RSI 算法固定
RSI(6) 使用 Wilder's Smoothing 方法（指数平滑变体），计算方式为：
1. 首周期: 简单平均 gain/loss
2. 后续周期: `avgGain = (avgGain × (period-1) + diff) / period`
3. `avgLoss` 同理
4. `RSI = 100 - 100 / (1 + avgGain/avgLoss)`

### R6: 事件数据模型独立
每只股票维护独立的事件值 Map（`stockEventValues`），全局事件列表（`globalEvents`）仅记录时间轴。

---

## 3. 命名约定

### 3.1 函数命名

| 模式 | 规则 | 示例 |
|------|------|------|
| **数据获取** | `fetch + 名词` | `fetchKline()`, `fetchQuote()`, `fetchStockName()` |
| **渲染** | `render + 名词` | `renderWatchlist()`, `renderEventTable()`, `renderBattery()`, `renderEventCell()` |
| **绘制** | `draw + 名词 + With + 修饰` | `drawKlineWithCrosshair()` |
| **计算** | `calc + 名词 + 数字` | `calcRSI6()` |
| **获取序列** | `get + 名词 + Series` | `getRSI6Series()` |
| **获取数据** | `get + 名词 + At + 条件` | `getStockDataAtDate()` |
| **存储** | `save + 名词` / `load + 名词` | `saveData()`, `loadData()` |
| **添加** | `add + To + 名词` | `addToWatchlist()` |
| **删除** | `remove + From + 名词` | `removeFromWatchlist()` |
| **工具** | 简短名词 | `getSecId()`, `showToast()` |
| **初始化** | `init` | `init()` |

### 3.2 变量命名

| 类型 | 规则 | 示例 |
|------|------|------|
| **全局变量** | 驼峰，名词 | `watchlist`, `klineData`, `currentStock`, `stockEventValues` |
| **DOM 引用** | 按语义命名 | `tbody`, `thead`, `wrapper` |
| **临时变量** | 简短驼峰 | `data`, `res`, `ev`, `mp`, `btn` |
| **循环变量** | `i`, `j`, `k` | `for (let i...)` |
| **常量** | `UPPER_SNAKE_CASE` | `ALERT_COOLDOWN` (3600000) |

### 3.3 ID 与 Class 命名

| 类型 | 规则 | 示例 |
|------|------|------|
| **HTML ID** | 驼峰 | `stockList`, `searchInput`, `eventTable` |
| **CSS Class** | 中划线连接 | `.search-box`, `.stock-item`, `.stock-del`, `.live-col` |
| **状态 Class** | 语义化 | `.show`, `.open`, `.expanded`, `.tooltip-visible` |

---

## 4. 数据持久化规则

### 4.1 localStorage 键名

| Key | 存储内容 | 格式 |
|-----|----------|------|
| `stockrsi_watchlist` | 自选股列表 | JSON: `[{code, name}]` |
| `stockrsi_events` | 事件数据（含所有股票） | JSON: `{globalEvents, stockEventValues, version}` |
| `stockrsi_alerts` | 提醒设置 | JSON: `{code: {priceAbove, priceBelow, rsiDaily, rsiWeekly, rsiMonthly}}` |

### 4.2 存储规则

1. **自动保存**: 任何修改操作后必须调用 `saveData()`
2. **版本后缀**: 所有 Key 以 `stockrsi_` 为前缀，避免冲突
3. **Map 序列化**: 存储前 `stockEventValues` (Map) 需转换为普通对象，加载后重建
4. **防丢失**: saveData 写 try-catch，加载失败返回默认值
5. **导入导出**: 支持完整 JSON 导出（含时间戳文件名），导入后全量替换

---

## 5. API 请求规则

### 5.1 数据源

| API | 用途 | 基础 URL |
|-----|------|----------|
| 东方财富 searchapi | 股票搜索 | `https://searchadapter.eastmoney.com/api/suggest/get` |
| 东方财富 push2 | 实时行情 | `https://push2.eastmoney.com/api/qt/stock/get` |
| 东方财富 push2his | K线数据 | `https://push2his.eastmoney.com/api/qt/stock/kline/get` |

### 5.2 请求约束

1. **无去重**: 当前未对重复请求做去重处理（TODO）
2. **无超时控制**: fetch 未设置 timeout（Todo: 需要 AbortController）
3. **无自动重试**: API 失败直接抛出异常（需要 fallback 机制）
4. **无缓存**: K线/行情数据不缓存，始终请求最新
5. **错误冒泡**: 异常由调用方自行 catch 处理

---

## 6. PWA 规则

1. **Service Worker**: 缓存优先策略，仅缓存静态资源，跳过 `eastmoney.com` API
2. **缓存列表**: `index.html`, `manifest.json`, `pc.png`, `app.png`, SortableJS CDN
3. **生命周期**: install → 缓存资源 → activate → 清理旧缓存 → fetch 拦截
4. **图标要求**: `pc.png` (192×192) + `app.png` (512×512)
5. **版本管理**: `CACHE_NAME` 变更时旧缓存自动清理

---

## 7. 项目边界

### ✅ 可修改

- HTML 结构（新增/调整 UI 元素）
- CSS 样式（新增/修改主题变量）
- JS 功能逻辑（修改现有函数、新增函数）

### ❌ 不可修改

- RSI(6) 算法核心公式
- Canvas 绘制引擎基础架构
- localStorage 键名前缀 (`stockrsi_`)
- Service Worker 缓存策略模式（缓存优先）

### ➕ 可新增

- 新的数据源（如腾讯财经 fallback）
- 新的技术指标函数（如 MACD, KDJ）
- 新的 UI 组件/面板
- 新的存储 Key（需遵循 `stockrsi_` 前缀）
- 新的提醒维度

### ➖ 不可新增

- 第三方 UI 框架/库（保持零框架）
- 重复的 script/body/html 闭合标签

---

## 附录：代码质量标尺

| 维度 | 要求 |
|------|------|
| 时间复杂度 | 避免 O(n²)，K线计算推荐 O(n) |
| 函数长度 | 单一职责，不超过 80 行 |
| DOM 操作 | 避免频繁 `innerHTML` 全量重绘 |
| 错误处理 | API 调用必须 try-catch |
| 事件绑定 | 优先事件委托，避免重复绑定 |
