# 系统架构文档 — 无股神经 (stockrsi3.1)

> 生成日期: 2025-04-09
> 架构风格: 单页应用 (SPA) + 分层架构
> 数据流: 单向 + 事件驱动

---

## 1. 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          用  户  层                                     │
│   点击  ·  拖拽  ·  键盘输入  ·  触摸手势  ·  滚轮                      │
│                                                                         │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────────┐        │
│   │  鼠标事件      │   │  Sortable 拖拽 │   │  移动端手势        │        │
│   │  (mousedown/   │   │  (onEnd回调)  │   │  (touch/click)    │        │
│   │   mousemove/   │   │               │   │                   │        │
│   │   mouseup)     │   │               │   │                   │        │
│   └───────┬───────┘   └───────┬───────┘   └───────┬───────────┘        │
│           │                   │                   │                    │
└───────────┼───────────────────┼───────────────────┼────────────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           U I  层                                       │
│                      (index.html 内联)                                  │
│                                                                         │
│   ┌──────────────────────────────┐   ┌────────────────────────────┐    │
│   │      HTML 结构层              │   │    CSS 表现层              │    │
│   │                              │   │                            │    │
│   │  ├─ 头部 (标题/Logo/状态)    │   │  ┌─ CSS 变量主题           │    │
│   │  ├─ 侧边栏 (搜索/自选列表)    │   │  │  (--bg-primary,         │    │
│   │  ├─ K线图区 (Canvas)         │   │  │   --accent-blue, ...)   │    │
│   │  ├─ 事件表格 (事件/实时列)    │   │  ├─ 暗色主题 (全局)        │    │
│   │  ├─ 模态框 (事件/提醒设置)    │   │  ├─ 响应式布局            │    │
│   │  └─ 通知层 (Toast/提醒)      │   │  │  (@media max-width:768) │    │
│   │                              │   │  └─ 动画过渡              │    │
│   └──────────┬───────────────────┘   └──────────┬─────────────────┘    │
│              │                                   │                    │
│              └───────┬───────────────────────────┘                    │
│                      │                                                │
│              ┌───────▼───────────────────────────────────────┐        │
│              │       渲染函数层                                │        │
│              │                                                │        │
│              │  renderWatchlist()    → 自选股列表 DOM         │        │
│              │  drawKlineWithCrosshair() → Canvas K线图      │        │
│              │  renderEventTable()   → 事件表格 DOM          │        │
│              │  renderBattery()      → RSI 电池条 SVG/HTML   │        │
│              │  renderEventCell()    → 事件单元格 HTML        │        │
│              │  showToast()          → Toast 通知            │        │
│              │  showAlertNotification() → 提醒弹窗           │        │
│              └───────────────────────┬───────────────────────┘        │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        策  略  层                                       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  核心技术指标计算                                                │   │
│   │                                                                 │   │
│   │  calcRSI6(closes)         → Wilder's Smoothing RSI(6)          │   │
│   │  getRSI6Series(data)      → 全序列RSI数组                      │   │
│   │  getStockDataAtDate()     → 指定日期价格+RSI                   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  事件与提醒引擎                                                  │   │
│   │                                                                 │   │
│   │  addEvent()             → 创建事件 + 同步其他股票               │   │
│   │  checkStockAlert()      → 单股票提醒检查（价格+RSI）           │   │
│   │  checkAllAlerts()       → 全自选股遍历检查                     │   │
│   │  saveAlertSettings()    → 保存提醒设置                         │   │
│   │  clearAlertSettings()   → 清除提醒设置                         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  排序与过滤                                                      │   │
│   │                                                                 │   │
│   │  SortableJS (onEnd)    → 自选股拖拽排序 + 事件表排序            │   │
│   │  stockSearch           → 搜索防抖（需添加）                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        数  据  层                                       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  API 请求层                                                      │   │
│   │                                                                 │   │
│   │  ┌──────────────────────┐  ┌──────────────────────────────┐    │   │
│   │  │  fetchKline(code,    │  │  fetchQuote(code)            │    │   │
│   │  │    period)           │  │  实时行情 (push2)            │    │   │
│   │  │  K线数据 (push2his)  │  │  → {price, changePct}        │    │   │
│   │  │  → [{date,open,      │  └──────────────────────────────┘    │   │
│   │  │      close,high,     │                                       │   │
│   │  │      low,volume}]    │  ┌──────────────────────────────┐    │   │
│   │  └──────────────────────┘  │  fetchStockName(code)         │    │   │
│   │                            │  股票名称 (push2)             │    │   │
│   │  ┌──────────────────────┐  │  → {code, name}              │    │   │
│   │  │  searchStocks(query) │  └──────────────────────────────┘    │   │
│   │  │  股票搜索 (searchapi)│                                       │   │
│   │  │  → [{code, name,     │                                       │   │
│   │  │      type}]          │                                       │   │
│   │  └──────────────────────┘                                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ID 转换层                                                      │   │
│   │                                                                 │   │
│   │  getSecId(code)   → 股票代码 → 东方财富 secid (1.xxx / 0.xxx)  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      本  地  存  储  层                                  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  localStorage (浏览器持久化)                                     │   │
│   │                                                                 │   │
│   │  ┌─────────────────────────────────────────────┐                │   │
│   │  │ Key                      │ Value             │                │   │
│   │  ├─────────────────────────────────────────────┤                │   │
│   │  │ stockrsi_watchlist       │ [{code, name}]   │                │   │
│   │  │ stockrsi_events          │ {globalEvents,   │                │   │
│   │  │                          │  stockEventValues,│               │   │
│   │  │                          │  version}         │                │   │
│   │  │ stockrsi_alerts          │ {code: {...}}    │                │   │
│   │  └─────────────────────────────────────────────┘                │   │
│   │                                                                 │   │
│   │  saveData()   → 序列化 → JSON.stringify → localStorage.setItem │   │
│   │  loadData()   → localStorage.getItem → JSON.parse → 反序列化   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Service Worker (PWA 离线缓存)                                   │   │
│   │                                                                 │   │
│   │  CACHE_NAME = 'stockrsi-v1.0.0'                                 │   │
│   │  缓存列表: index.html, manifest.json, pc.png, app.png,         │   │
│   │           SortableJS CDN                                         │   │
│   │  策略: 缓存优先（Cache First），跳过 eastmoney.com API          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

## 2. 外部数据源

```
┌─────────────────────────────────────────────────────────────────────┐
│                       东 方 财 富 API                                │
│                                                                     │
│  searchapi (搜索)                                                   │
│  https://searchadapter.eastmoney.com/api/suggest/get               │
│  ?input={keyword}&type=14&token=...                                │
│  → {Code, Name, Type}                                              │
│                                                                     │
│  push2 (实时行情)                                                   │
│  https://push2.eastmoney.com/api/qt/stock/get                      │
│  ?secid={secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,...         │
│  → {f43:price, f170:changePct}                                     │
│                                                                     │
│  push2his (K线历史)                                                 │
│  https://push2his.eastmoney.com/api/qt/stock/kline/get             │
│  ?secid={secid}&klt={101|102|103}&fqt=1&lmt=500                   │
│  → {klines: ["date,open,close,high,low,volume,..."]}               │
└─────────────────────────────────────────────────────────────────────┘

## 3. 数据流

### 3.1 主数据流（添加自选股 → 展示K线）

```
用户搜索股票
    │
    ▼
searchStocks() ──HTTP──► 东方财富 searchapi
    │
    ▼
addToWatchlist(code, name)
    │
    ├──► fillStockHistoryEvents() ──► fetchKline() ──HTTP──► push2his
    │                                                              │
    │                                                              ▼
    │                                                     K线数据 [{date,open,close,...}]
    │                                                              │
    │                                                              ▼
    │                                                     calcRSI6 + getRSI6Series
    │                                                              │
    │                                                              ▼
    │                                                     stockEventValues 更新
    │
    ├──► saveData() ──► localStorage.stockrsi_events
    │
    ├──► renderWatchlist() ──► DOM 更新
    │
    ├──► renderEventTable() ──► DOM 更新
    │
    └──► selectStock() ──► drawKlineWithCrosshair() ──► Canvas 绘制
```

### 3.2 实时数据流（定时刷新）

```
startLiveDataRefresh()
    │
    ▼ (每60秒)
updateAllLiveData()
    │
    ├──► fetchQuote(code) ──HTTP──► push2 ──► {price, changePct}
    │                                       │
    │                                       ▼
    │                              liveDataCache.set(code, data)
    │
    └──► updateLiveColumnDOM() ──► DOM 更新实时列
```

### 3.3 提醒检查流

```
定时器触发 (10:32 / 14:32 / 15:57)
    │
    ▼
checkAllAlerts()
    │
    ▼ (遍历所有自选股)
checkStockAlert(code)
    │
    ├──► fetchQuote(code)       → 当前价格
    ├──► liveDataCache.get()    → 当日RSI
    ├──► fetchRsiForAlertCheck()→ 周/月RSI
    │
    ▼
价格突破目标?  /  RSI到达阈值?
    │
    ├── 是 → showAlertNotification() + 冷却检查
    └── 否 → 跳过
```

### 3.4 事件创建流

```
用户点击K线 → 弹出事件模态框
    │
    ▼
选择类型 (买入/卖出/标记) → 点击确认
    │
    ▼
addEvent()
    │
    ├──► globalEvents.push({id, datetimeStr, timestamp})
    ├──► stockEventValues.get(code).set(eventId, {type, price, rsi, date})
    │
    ├──► (可选) 同步其他自选股同日期数据
    │       getStockDataAtDate(otherCode, date) ──► fetchKline()
    │
    ├──► saveData()
    ├──► renderEventTable()
    └──► drawKlineWithCrosshair()
```

## 4. 分层依赖关系

```
┌──────────────┐
│   用户层      │  ← 事件源（不依赖任何下层）
└──────┬───────┘
       │ 事件/回调
       ▼
┌──────────────┐
│   UI 层      │  ← 依赖: 策略层（数据），数据层（通过策略间接）
│  渲染函数     │    不直接调用数据层
└──────┬───────┘
       │ 调用
       ▼
┌──────────────┐
│  策略层      │  ← 依赖: 数据层（API），存储层（持久化）
│  计算/引擎    │    不直接操作 DOM
└──────┬───────┘
       │ 调用
       ▼
┌──────────────┐
│  数据层      │  ← 依赖: 无（纯 fetch + 转换）
│  API 请求    │    不操作 DOM，不涉及持久化
└──────┬───────┘
       │ 读写
       ▼
┌──────────────┐
│ 本地存储层    │  ← 依赖: 无（纯 localStorage API）
│ localStorage │    不处理业务逻辑
└──────────────┘
```

## 5. 分层约束

| 层 | 可以做什么 | 不可以做什么 |
|----|-----------|-------------|
| **UI 层** | DOM 操作、Canvas 绘制、事件绑定、CSS 动画 | 不能直接调用 API、不能直接读写 localStorage、不能做 RSI 计算 |
| **策略层** | RSI 计算、事件匹配、提醒检查、排序过滤 | 不能操作 DOM、不能主动发起 API 请求（只能调用数据层） |
| **数据层** | 构造 URL、fetch 请求、解析响应、ID 转换 | 不能操作 DOM、不能涉及业务逻辑、不能直接读写存储 |
| **存储层** | localStorage 读写、JSON 序列化/反序列化、SW 缓存 | 不能处理业务逻辑、不能发起网络请求 |

## 6. 核心数据结构

```typescript
// 自选股
interface WatchlistItem {
    code: string;       // "600519"
    name: string;       // "贵州茅台"
}

// K线数据点
interface KlinePoint {
    date: string;       // "2025-04-09"
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}

// 事件数据
interface EventData {
    id: string;             // "ev_20250409_001"
    datetimeStr: string;    // "2025-04-09 日线"
    timestamp: number;
}

// 每只股票的事件值
interface EventValue {
    type: 'buy' | 'sell' | 'mark' | 'passive';
    price: number | null;
    rsi1: number | null;
    dateIndex: number;
    date: string;
    period: string;
}

// 提醒设置
interface AlertSettings {
    [code: string]: {
        priceAbove: number | null;
        priceBelow: number | null;
        rsiDaily: number | null;
        rsiWeekly: number | null;
        rsiMonthly: number | null;
    };
}

// 存储结构
interface StorageData {
    globalEvents: EventData[];
    stockEventValues: { [code: string]: { [eventId: string]: EventValue } };
    version: string;
}
```

## 7. 全局变量一览

```javascript
// 状态变量
let watchlist = [];              // 自选股列表
let currentStock = null;         // 当前选中股票 {code, name}
let klineData = [];              // 当前K线数据
let currentPeriod = 'daily';     // 当前周期

// 事件系统
let globalEvents = [];           // 全局事件列表
let stockEventValues = new Map();// 股票→事件值 Map

// 实时数据
let liveDataCache = new Map();   // 缓存实时行情
let alertCheckCooldown = new Map(); // 提醒冷却记录
let liveRefreshTimer = null;     // 定时刷新器

// UI
let sortableInstance = null;     // Sortable 实例
```

---

> 本文档描述了项目 `stockrsi3.1` (无股神经) 的完整系统架构。
> 架构风格为 **单页应用 + 分层架构**，5 层职责明确，数据单向流动。
