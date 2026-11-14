# Contract: Bijoy ↔ Unicode (US4)

`meta.source`: `"SutonnyMJ mapping (data/convert/bijoy-map.json)"`. Deterministic → cacheable, but
POST responses are not cached by the CDN.

| Method | Path | Body | 200 `data` | Errors |
|---|---|---|---|---|
| POST | `/v1/convert/bijoy-to-unicode` | `{ "text": string }` (≤ 100 KB UTF-8) | `{ input_length, output }` | 400 empty/missing, 413 |
| POST | `/v1/convert/unicode-to-bijoy` | `{ "text": string }` (≤ 100 KB) | `{ input_length, output }` | 400, 413 |

Also accepts `Content-Type: text/plain` bodies (raw text) for convenience; response is still JSON.
Responses are `no-store`. The whole input is treated as Bijoy (spec Clarifications): English words
mixed into Bijoy text are mapped too. Unicode → Bijoy splits ো/ৌ into `‡ … v` / `‡ … Š`, uses
standard phalas (স্ব = `m^`), and the output never contains Bangla Unicode.

```json
// POST /v1/convert/bijoy-to-unicode  { "text": "Avgvi †mvbvi evsjv" }
{ "success": true, "data": { "input_length": 18, "output": "আমার সোনার বাংলা" }, "meta": { ... } }
```

The full input is not echoed back (large payloads); only its length.
