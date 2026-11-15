# Quickstart & Validation: Universities

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/universities/categories` | public 61, private 116, international 3, cbhe 1 |
| 2 | `/v1/universities?category=public&district=dhaka` | public universities in Dhaka |
| 3 | `/v1/universities/university-of-dhaka` | established 1921, www.du.ac.bd |
| 4 | `/v1/universities?category=college` | 400 |

To refresh: `tsx scripts/import/ugc.ts <empty-dir>` (downloads ~186 pages, one per second).
