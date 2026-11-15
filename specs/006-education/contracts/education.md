# Contract: Education

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/universities` | `category?`, `district?`, `q?` | `University[]` sorted by name | 400 |
| GET | `/v1/universities/categories` | — | `UniversityCategoryWithCount[]` | — |
| GET | `/v1/universities/{slug}` | — | `University` | 404 |
