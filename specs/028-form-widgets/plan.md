# Architecture & Implementation Plan: 028-form-widgets

## 1. Technical Design
- Built as standard Web Components (`HTMLElement`) using Shadow DOM for encapsulated styling.
- Zero external runtime dependencies; bundle size target < 15 kB (gzipped).
- Available via unpkg/jsdelivr CDN and npm package `@deshapi/widgets`.
- Built-in offline caching using `localStorage` for division/district datasets.
