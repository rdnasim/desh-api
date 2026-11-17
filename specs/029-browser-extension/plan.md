# Architecture & Implementation Plan: 029-browser-extension

## 1. Technical Design
- Manifest V3 compliant extension.
- UI: React / Preact + Tailwind CSS.
- Background Service Worker: Periodically refreshes prayer times and gold prices into `chrome.storage.local`.
- Offline support: Cached daily data available even without internet connection.
