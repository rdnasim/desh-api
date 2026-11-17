# Feature Specification: 026-developer-portal (Developer Dashboard & API Keys)

**Feature Branch**: `026-developer-portal`  
**Status**: Built  

---

## 1. Overview

While Desh API offers an open anonymous tier (100 req/day/IP), production developers, startups, and enterprises require dedicated API keys with higher daily quotas, telemetry, and rate limits. The Developer Portal provides a self-service authentication and usage dashboard.

---

## 2. User Stories

- **US1 (Key Issuance)**: Developers can sign up via GitHub/Google OAuth or email to generate SHA-256 backed developer API keys.
- **US2 (Usage Telemetry)**: Developers can monitor real-time usage graphs, error rates (4xx/5xx), average latency, and quota consumption.
- **US3 (Quota Alerts)**: Developers can configure email or webhook notifications when their daily quota reaches 80% and 95%.
- **US4 (Tier Upgrades)**: High-volume enterprise customers can request higher tiers or sponsor the open project.
