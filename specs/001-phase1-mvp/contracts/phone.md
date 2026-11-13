# Contract: Phone (US3)

`Cache-Control: no-store`. `meta.source`: `"BTRC numbering plan (prefix allocation)"`.

| Method | Path | Input | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/phone/{number}` | path (URL-encoded, Latin/Bangla digits, `+`, spaces, `-`) | `PhoneResult` | — (invalid numbers return 200 with `valid:false`) |
| POST | `/v1/phone/validate` | `{ "number": string }` | `PhoneResult` | 400 missing body |
| POST | `/v1/phone/bulk` | `{ "numbers": string[] }` (1–100) | `PhoneResult[]` (same order) | 400, 413 > 100 |

```json
{ "input": "+8801712345678", "valid": true, "normalized": "01712345678",
  "international": "+8801712345678",
  "operator": { "slug": "grameenphone", "name_en": "Grameenphone", "name_bn": "গ্রামীণফোন" },
  "portability_notice": "Operator reflects the original prefix allocation; the number may have been ported." }
```

```json
{ "input": "01212345678", "valid": false, "reason": "invalid_prefix",
  "portability_notice": "Operator reflects the original prefix allocation; the number may have been ported." }
```
