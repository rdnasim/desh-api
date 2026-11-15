# Quickstart & Validation: Bangla Mock Data Generator

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/mock/people` | 10 people, `Cache-Control: no-store`, different on every call |
| 2 | `/v1/mock/people?count=3&seed=demo` | same 3 people every time, cacheable |
| 3 | `/v1/mock/people?gender=female&district=cumilla&seed=x` | women in Cumilla |
| 4 | `/v1/mock/addresses?count=5&district=sylhet&seed=a` | 5 Sylhet addresses with Sylhet postcodes |
| 5 | `/v1/mock/people?count=101` | 400 |
