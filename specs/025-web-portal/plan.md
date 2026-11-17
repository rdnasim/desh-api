# Architecture & Implementation Plan: 025-web-portal

## 1. Tech Stack
- Framework: React 19 + Vite + TypeScript.
- Styling: Tailwind CSS v4 + Lucide React icons.
- Hosting: Cloudflare Pages (`portal.deshapi.riadul.com`).
- Live Data: Direct requests to `https://deshapi.riadul.com/v1/...`.

## 2. Directory Structure
- `web/src/components/`: Reusable UI components, header, footer, widget cards.
- `web/src/data/endpoints.ts`: Complete directory of all API endpoints and parameter schemas.
- `web/src/modules/`: Specialized visual widgets for each API domain.
- `web/src/App.tsx`: Main layout, module navigation, and inspector pane.

## 3. Deployment
- Automated deployment via Cloudflare Pages GitHub integration.
