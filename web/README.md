# Desh API Explorer & Live Usage Web App

A modern, standalone public web application built with **React**, **Vite**, and **TypeScript** for interacting with **Desh API** and monitoring real-time API read usage.

---

## Features

- **Real-Time API Quota & Usage Monitor:**
  - Displays remaining daily quota and requests used today from `/v1/developer/quota`.
  - Color-coded consumption progress bar.
  - Per-minute rate limit indicator (120 req/min).
  - Countdown timer until daily quota reset (midnight UTC).
  - Optional custom `X-API-Key` switcher for developer & enterprise tiers.

- **Comprehensive Read API Catalog:**
  - Categorized directory covering all 20+ modules:
    - Geo (Divisions, Districts, Upazilas, Postcodes, Search)
    - Bangla Toolkit (Taka in words, numbers in words, Bangla date, Avro transliteration)
    - Islamic Prayer Times & 30-Day Ramadan Calendar
    - Dhaka Metro Rail MRT Line-6 (Stations, Timetables & 10% discount Fare Calculator)
    - Gold & Silver Prices (BAJUS live prices & Nisab Zakat calculator)
    - Market & Fuel Prices (TCB essential retail prices & BPC fuel rates)
    - Finance & Taxes (Income Tax 2026, Loan EMI, VAT, Gratuity)
    - Banks & Routing Numbers (61 scheduled banks, 11,533 branches, BEFTN routing validator)
    - Education (11 statutory education boards, UGC universities, GPA calculator)
    - Healthcare & Hospitals (24/7 national emergency hotlines, bed capacities)
    - Weather & Disaster Signals (BMD storm signals 1–11, riverport signals, AQI)
    - Public Holidays (Official lists, is-it-a-holiday check, working days)
    - Mobile Financial Services (bKash, Nagad, Rocket, Upay charges & USSD codes)
    - Emergency Hotlines (999, 333, 109, 106)
    - Land Unit Conversions (Katha, Bigha, Decimal, Acre, Sqft)
    - Synthetic Mock Data (Bangladeshi profiles, addresses)
    - Format Validators (Postcode, NID, Vehicle Plates)

- **Interactive API Console / Playground:**
  - Select any endpoint or type custom paths.
  - Form field parameter builder for query string and URL path variables.
  - Live execution with latency timer (`⚡ ms`) and exact byte size (`📦 KB`).
  - Response tabs: **Formatted JSON**, **Response Headers**, and **cURL command**.
  - One-click copy for responses and cURL commands.

- **Session History & Telemetry:**
  - Keeps a history log of recent requests with HTTP status codes and response latencies.
  - Re-inspect any previous request with a single click.

- **Bilingual & Responsive UI:**
  - Full support for Bengali Unicode script with font fallbacks.
  - Dark / Light mode toggle with automatic system preference detection.

---

## Getting Started

### 1. Run Locally
```bash
# From the repository root
npm run dev --prefix web

# Or from inside the web directory
cd web
npm install
npm run dev
```

The web app will start at `http://localhost:3000`.

### 2. Build for Production
```bash
cd web
npm run build
```
The optimized static bundle will be generated in `web/dist/`.

---

## Deployment Options

This app is a static SPA and can be deployed anywhere with zero backend configuration:

### Deploy to Cloudflare Pages:
```bash
npx wrangler pages deploy web/dist --project-name desh-api-explorer
```

### Deploy to Vercel:
```bash
npx vercel web/dist
```

### Deploy to Netlify:
```bash
npx netlify deploy --dir=web/dist --prod
```
