# Contract: Mock data

Follows `specs/001-phase1-mvp/contracts/common.md`. Every response has `meta.disclaimer`. With
`seed`, responses are cacheable; without, `Cache-Control: no-store`.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/mock/people` | `count?` (1–100, default 10), `seed?`, `gender?` (`male`\|`female`), `district?` (slug) | `MockPerson[]` | 400 |
| GET | `/v1/mock/addresses` | `count?`, `seed?`, `district?` | `MockAddress[]` | 400 |

`MockAddress`: `line_en`, `line_bn`, `upazila`, `district`, `division` (each `{ slug, name_en,
name_bn }`), `postcode`.

`MockPerson`: `name_en`, `name_bn`, `gender`, `date_of_birth`, `phone`, `email`, `nid`, `address`.
