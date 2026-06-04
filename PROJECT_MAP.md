# 项目地图 — 无股神经 (stockrsi3.1)

> 生成日期: 2025-04-09
> 项目路径: D:\cherry\stockrsi3.1
> 总文件数: 11 (代码 + 文档 + 资源)
> 说明: 本文档是项目的导航地图，帮助你快速定位每个文件、每个模块的位置和职责。

---

## 1. 项目全景图

```
D:\cherry\stockrsi3.1/
│
├── 📄 index.html              ← 核心（1687 行），内联 HTML + CSS + JS
├── 📄 service-worker.js       ← PWA 离线缓存（109 行）
├── 📄 manifest.json           ← PWA 安装配置（29 行）
│
├── 🖼️ app.png                 ← PWA 应用图标（192x192 / 512x512）
├── 🖼️ pc.png                  ← 浏览器标签图标（favicon）
│
├── 📄 PROJECT.md              ← 项目说明文档（253 行）
├── 📄 CONTEXT.md              ← 项目上下文 / 功能状态（192 行）
├── 📄 ARCHITECTURE.md         ← 系统架构图（386 行）
├── 📄 RULES.md                ← 编码规范手册（208 行）
├── 📄 BUG.md                  ← Bug 跟踪清单（384 行）
├── 📄 VISION.md               ← 产品理念（80 行）
└── 📄 PROJECT_MAP.md          ← ★ 本文档 — 项目导航地图
```

---

## 2. 文件依赖关系图

```
                         ┌──────────────────┐
                         │   manifest.json  │
                         │  (PWA 配置)      │
                         └────────┬─────────┘
                                  │ <link rel="manifest">
                                  ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   app.png        │◄───│                  │───►│   pc.png         │
│   (应用图标)      │    │   index.html     │    │   (favicon)      │
│   192x192/512x512│    │   1687 行        │    │   浏览器标签图标  │
└──────────────────┘    │   ★ 核心程序     │    └──────────────────┘
                        │                  │◄───┐
                        │  HTML(~189行)    │    │
                        │  CSS (~320行)    │    │
                        │  JS (~1178行)    │    │
                        └────────┬─────────┘    │
                                 │              │
                                 │ register()   │
                                 ▼              │
                        ┌──────────────────┐    │
                        │ service-worker.js│────┘
                        │ (PWA 离线缓存)   │ 缓存 index.html + manifest.json
                        │ 109 行           │ + SortableJS CDN + 图标
                        └──────────────────┘
```

### 外部依赖

| 外部资源 | 类型 | 用途 | 加载位置 |
|----------|------|------|----------|
| `cdn.jsdelivr.net/npm/sortablejs@1.15.1` | JS 库 | 自选股拖拽排序 | index.html:16 |
| `push2his.eastmoney.com/api/qt/stock/kline` | API | 日/周/月 K 线数据 | index.html JS |
| `push2.eastmoney.com/api/qt/stock/get` | API | 实时行情（60s 轮询） | index.html JS |
| `searchapi.eastmoney.com/bbs` | API | 股票搜索建议 | index.html JS |
| localStorage | 浏览器存储 | 自选股/事件/提醒持久化 (3 key) | index.html JS |

---

## 3. index.html 内部结构地图（1687 行）

```
index.html
├── <head> (1-339)
│   ├── 元数据 & 响应式 (1-15)
│   ├── SortableJS CDN 加载 (16)
│   └── <style> CSS (17-338)
│       ├── CSS 变量 :root (24-37)
│       ├── 全局样式 / 布局 (38-55)
│       ├── 头部 / Logo (56-114)
│       ├── 侧边栏 / 搜索 (115-179)
│       ├── K线图 Canvas (180-229)
│       ├── 事件表格 (230-300)
│       ├── 提醒系统 / 弹窗 (301-337)
│       └── 加载动画 / 状态栏 (334-338)
│
├── <body> HTML 结构 (340-501)
│   ├── #app 容器 (341)
│   │   ├── .header (342-375)
│   │   │   ├── Logo "无股神经" + Tooltip
│   │   │   └── 数据导入/导出/刷新按钮
│   │   ├── .main-container (376-499)
│   │   │   ├── .sidebar 侧边栏 (377-439)
│   │   │   │   ├── 搜索框 + 建议下拉
│   │   │   │   └── 自选股列表 (拖拽排序)
│   │   │   └── .content 主区域 (440-499)
│   │   │       ├── .kline-toolbar (周期切换: 日/周/月)
│   │   │       ├── #klineCanvas (K线图 + RSI)
│   │   │       ├── .rsi-battery (电池条)
│   │   │       ├── 事件表格
│   │   │       └── 欢迎页 (首次使用)
│   │   └── .status-bar (状态栏)
│   └── 隐藏元素 (模态框/通知/Toast 容器)
│
└── <script> JS (502-1687)
    ├── (1) 全局变量声明 (503-515)        — watchlist, klineData, stockAlerts...
    ├── (2) 工具函数 (517-554)             — showToast, saveData, loadData
    ├── (3) 搜索模块 (556-606)             — searchStocks, 防抖搜索
    ├── (4) 数据获取 (608-703)             — fetchKline, fetchLivePrices
    ├── (5) RSI 计算引擎 (705-832)         — calcRSI6, getRSI6Series ★ 核心算法
    ├── (6) K线图绘制 (834-999)            — drawKLine, drawRSI, 十字光标
    ├── (7) 电池条渲染 (1001-1044)         — 10格 RSI 可视化
    ├── (8) 事件系统 (1046-1136)           — 添加/删除/展示事件
    ├── (9) 提醒引擎 (1138-1305)           — 检查 + 弹窗通知 + 冷却
    ├── (10) 实时行情 (1307-1390)          — 60s 定时轮询 + 超时重试
    ├── (11) 数据导入导出 (1392-1449)     — JSON 文件导入/导出
    ├── (12) 自选股管理 (1451-1549)       — 增删改 + 渲染列表
    ├── (13) UI 交互 (1551-1629)          — 模态框 / 欢迎页 / 按钮事件
    ├── (14) 初始化入口 (1631-1648)       — loadData → 默认加载茅台
    └── (15) PWA 注册 (1650-1657)         — serviceWorker.register
```

---

## 4. JS 函数调用关系图

```
initApp()                                    [入口]
  ├─ loadData()                              [从 localStorage 恢复]
  │   ├─ localStorage.getItem("watchlist_mid2")
  │   ├─ localStorage.getItem("eventSystem_mid2")
  │   └─ localStorage.getItem("stockAlerts_mid2")
  │
  ├─ renderWatchlist()                       [渲染自选股列表]
  │   └─ Sortable(拖拽绑定)
  │
  └─ selectStock("600519")                   [选中默认股票]
      │
      ├─ fetchKline("600519", "daily")       [获取 K 线数据]
      │   └─ 东方财富 API → parseKlineData()
      │
      ├─ calcRSI6(closePrices)               [计算 RSI(6)]
      │   └─ Wilder 平滑算法 → 返回 RSI 数组
      │
      ├─ drawKLine(klineData, rsiData)       [绘制 K 线图]
      │   ├─ drawCandlesticks()              [蜡烛图]
      │   ├─ drawRSI()                       [RSI 曲线叠加]
      │   ├─ drawCrosshair()                 [十字光标]
      │   └─ drawEventMarkers()              [事件标记]
      │
      ├─ renderBattery(currentRsi)           [渲染电池条]
      │
      └─ checkAllAlerts(code, rsiData)      [触发提醒检查]
          └─ showAlertNotification()         [弹窗通知]
              └─ ALERT_COOLDOWN (1 小时防重)

┌─ 定时循环 ─────────────────────────────────────────┐
│  fetchLivePrices(watchlist)                        │
│    ├─ 东方财富 API → parseLiveData()               │
│    ├─ updateLiveTable() [实时更新表格]              │
│    └─ checkAllAlerts() [检查所有股票的提醒]          │
│  setInterval: 60s                                  │
│  工作日定时: 10:32 / 14:32 / 15:57                 │
└────────────────────────────────────────────────────┘
```

---

## 5. 数据流图

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  东方财富 API │────▶│  数据获取层       │────▶│  RSI 计算引擎        │
│  (push2his)  │     │  fetch*()        │     │  calcRSI6()         │
│  (push2)     │     │  parseKlineData()│     │  getRSI6Series()    │
│  (searchapi) │     │  60s轮询         │     │  Wilder 平滑        │
└──────────────┘     └──────────────────┘     └──────────┬───────────┘
                                                          │
                                                          ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  localStorage│◀────│  持久化层         │◀────│  渲染层              │
│  (3 个 key)  │     │  saveData()      │     │  drawKLine()        │
│  watchlist   │     │  loadData()      │     │  renderBattery()    │
│  eventSystem │     │                  │     │  renderWatchlist()  │
│  stockAlerts │     │                  │     │  showAlert()        │
└──────────────┘     └──────────────────┘     └──────────────────────┘
                                                          ▲
                                                          │
┌──────────────┐     ┌──────────────────┐                 │
│  SortableJS  │────▶│  用户交互层       │─────────────────┘
│  拖拽排序     │     │  鼠标/触摸/键盘    │
│              │     │  点击/滚轮/拖拽    │
└──────────────┘     └──────────────────┘
```

### 数据流方向说明

| 方向 | 路径 | 触发方式 |
|------|------|----------|
| 🔽 **获取数据** | API → fetch → parse → RSI计算 → 渲染 | 切换股票 / 切换周期 / 自动刷新 |
| 🔄 **用户操作** | 点击/拖拽 → JS回调 → 状态更新 → 重新渲染 | 添加股票 / 删除事件 / 设置提醒 |
| 🔼 **持久化** | 状态变更 → saveData() → localStorage | 任何修改操作后自动保存 |
| 🔁 **定时刷新** | setInterval 60s → API → 更新表格 → 检查提醒 | 后台自动运行 |
| ⬇️ **PWA 离线** | Service Worker → Cache API → 离线加载 | 网络不可用时自动回退 |

---

## 6. 关键数据结构

| 变量名 | 类型 | 用途 | 持久化 |
|--------|------|------|--------|
| `watchlist` | `Array<{code,name}>` | 自选股列表 | ✅ localStorage |
| `currentStock` | `{code,name}|null` | 当前选中的股票 | ❌ 内存 |
| `klineData` | `Array<KlineBar>` | 当前 K 线数据 (日/周/月) | ❌ 仅缓存 |
| `currentPeriod` | `"daily"|"weekly"|"monthly"` | 当前周期 | ❌ 内存 |
| `globalEvents` | `Array<Event>` | 全部事件 | ✅ localStorage |
| `stockEventValues` | `Map<code, Map<eventId, value>>` | 事件关联值 | ✅ localStorage |
| `stockAlerts` | `Map<code, AlertSettings>` | 提醒设置 | ✅ localStorage |
| `alertedCache` | `Map<string, timestamp>` | 提醒冷却缓存 | ❌ 内存 |
| `liveDataCache` | `Map<code, LiveData>` | 实时行情缓存 | ❌ 内存 |

---

## 7. 文档体系说明

| 文档 | 定位 | 阅读顺序 | 适合读者 |
|------|------|----------|----------|
| **VISION.md** | 产品哲学 — 为什么做 | 第 1 本 | 所有人 |
| **PROJECT.md** | 项目说明 — 做什么 | 第 2 本 | 新开发者 |
| **ARCHITECTURE.md** | 系统架构 — 怎么组织 | 第 3 本 | 开发者 |
| **PROJECT_MAP.md** | 项目地图 — ★ 导航 | 第 4 本 | 开发者（本文） |
| **RULES.md** | 编码规范 — 怎么写 | 第 5 本 | 贡献者 |
| **CONTEXT.md** | 状态追踪 — 目前到哪了 | 并行查阅 | PM / 开发者 |
| **BUG.md** | Bug 清单 — 什么要修 | 并行查阅 | 开发者 |

---

## 8. 快速定位指南

### 想找某个功能？查这里：

| 功能 | 文件 | 行号区间 | 核心函数 |
|------|------|----------|----------|
| 股票搜索 | index.html | 556-606 | `searchStocks()` |
| K线数据获取 | index.html | 608-703 | `fetchKline()` |
| RSI(6) 计算 | index.html | 705-832 | `calcRSI6()`, `getRSI6Series()` |
| K线图绘制 | index.html | 834-999 | `drawKLine()` |
| 十字光标 | index.html | ~950-999 | Canvas mousemove |
| 电池条 | index.html | 1001-1044 | `renderBattery()` |
| 事件系统 | index.html | 1046-1136 | `addEvent()`, `deleteEvent()` |
| 提醒引擎 | index.html | 1138-1305 | `checkAllAlerts()` |
| 实时行情 | index.html | 1307-1390 | `fetchLivePrices()` |
| 导入导出 | index.html | 1392-1449 | JSON 文件 |
| 自选股管理 | index.html | 1451-1549 | `renderWatchlist()` |
| 初始化启动 | index.html | 1631-1648 | `initApp()` |
| PWA 注册 | index.html | 1650-1657 | `navigator.serviceWorker.register` |
| PWA 离线缓存 | service-worker.js | 1-109 | install / activate / fetch |
| PWA 配置 | manifest.json | 1-29 | 名称/图标/主题色 |

### 想修 Bug？查这里：

| Bug 编号 | 严重度 | 标题 | 行号 |
|----------|--------|------|------|
| BUG-1 | 🔴 严重 | 文件末尾代码损坏/重复 | index.html:1676-1687 |
| BUG-2 | 🔴 严重 | 搜索中文拼音首字母无结果 | index.html:556-606 |
| BUG-3 | 🟠 中等 | 移动端键盘弹起遮挡搜索框 | index.html:115-179 |
| BUG-4 | 🟠 中等 | RSI 计算数组长度不一致 | index.html:705-832 |
| BUG-5 | 🟠 中等 | 离线启动后无法换股票 | service-worker.js |
| BUG-6~10 | 🟡🟢 | 样式/性能/建议 | 详见 BUG.md |

---

## 9. 贡献指南（如何修改）

### 修改代码

1. 所有代码在 `index.html` 中（1687 行单文件）
2. 找到对应模块的行号范围（见上方快速定位表）
3. 遵循 `RULES.md` 编码规范（Tab 缩进、双引号、加分号）
4. 修改后使用 `saveData()` 确保持久化
5. 测试日/周/月三个周期、移动端/PC 端

### 新增文件

- 新增文档 → 放入根目录 `D:\cherry\stockrsi3.1\`
- 新增资源（图标等）→ 放入根目录，更新 `manifest.json`
- 新增外部 CDN → 在 `index.html:16` 附近添加 `<script>` 标签
- 新增 API → 在数据获取模块 (608-703) 添加 fetch 函数

### 构建与部署

本项目是纯静态站点，无需构建工具：

1. 修改 `index.html` → 直接可用
2. 部署方式：任意静态服务器（Nginx / GitHub Pages / Vercel）
3. PWA 要求：`service-worker.js` 和 `manifest.json` 需在根目录
4. 浏览器缓存：Service Worker 使用 Cache-first 策略

---

> **📌 提示**: 本文档与 `ARCHITECTURE.md`（系统架构）和 `CONTEXT.md`（功能状态）配合使用，可全面掌握项目全貌。
> **更新**: 当项目结构发生变化时（新增/删除/移动文件），请同步更新本文件。
