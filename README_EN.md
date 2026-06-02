# 📈 RSI Pulse — Stock RSI Analysis Tool

A PWA for A-share stock RSI analysis powered by Eastmoney API. Supports **daily/weekly/monthly** RSI monitoring, custom alerts, drag-and-drop sorting, and offline access.

## ✨ Features

- 🔍 **Stock Search** — Fuzzy search A-shares by ticker or name
- 📊 **Triple Timeframe RSI** — Daily, Weekly, Monthly RSI at a glance
- 🔔 **RSI Alerts** — Custom overbought/oversold thresholds with browser push notifications
- 📋 **Drag & Sort** — Freely reorder stock cards
- 📱 **PWA** — Install to desktop/home screen, works like a native app
- 📡 **Offline Ready** — Service Worker caching, accessible without network

## 🎮 How to Use

| Action | How |
|--------|-----|
| **Add Stock** | Search by ticker/name → click result |
| **View RSI** | Card shows daily RSI; tap 「周」「月」 to switch |
| **Set Alert** | Tap 🔔 → set threshold → confirm |
| **Reorder** | Long-press card to drag |
| **Delete** | Tap ✕ button |

## 🛠 Tech Stack

HTML5 + CSS3 + Vanilla JS · SortableJS · Service Worker · Web Notification API · Eastmoney Public API

## ⚠️ Disclaimer

This tool is for educational purposes only. It does NOT constitute investment advice. Invest at your own risk.

## 📄 License

MIT
