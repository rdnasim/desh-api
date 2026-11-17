# Architecture & Implementation Plan: 027-desh-cli

## 1. Tech Stack
- Runtime: Node.js (TypeScript compiled with `tsup` or native binary compiled via Bun/Go).
- CLI Framework: `commander` or `cac`.
- UI: `chalk`, `ora` for terminal spinners, and `cli-table3` for tabular outputs.

## 2. Capabilities
- Offline mode: Static algorithms (tax, land conversion, number-to-words, validation) can execute locally without network calls.
- Online mode: Fetches live data (gold, market prices, weather signals) with local caching.
