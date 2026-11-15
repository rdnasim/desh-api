# Quickstart & Validation: Banks

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/banks` | 61 banks; Sonali: ID 15, 1,239 branches, code 200 |
| 2 | `/v1/banks/agrani-bank/branches?district=chandpur` | Agrani branches in Chandpur, paginated |
| 3 | `/v1/routing/010130065` | Agrani Bank, Kachua Bazar, Chandpur |
| 4 | `/v1/routing/010130066` | 400, invalid check digit |
| 5 | `/v1/validate/routing/010130065` | valid, bank code 010, `no-store` |

To refresh: download the new branch list in a browser, then
`python3 -I scripts/import/banks.py <geo_bank.pdf> <routing.csv>` and `pnpm data:check`.
