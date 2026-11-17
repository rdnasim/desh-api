# Architecture & Implementation Plan: 032-bots-integrations

## 1. Technical Design
- Runtime: Cloudflare Workers with Telegram Bot API webhook endpoints.
- Discord: Discord interaction bot running on edge.
- Alert Pipeline: Cron trigger polling BMD signals and publishing alert payloads to subscribed Discord channels and Telegram groups.
