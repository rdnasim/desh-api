# Data sources

<!-- Generated from data/meta.json by `pnpm data:docs`. Do not edit by hand. -->

Every API response names its source in `meta.source`. This page lists the source, licence and
credits for each dataset. When you reuse the data, please credit "Desh API contributors" and the
upstream sources below.

| Dataset | Source | Licence | Retrieved | Last updated | Credits |
|---|---|---|---|---|---|
| `banks.banks` | [Bangladesh Bank, Banking Statistics Division: list of bank branches by district and thana, as on 31 August 2026 (econdata/bs/geo_bank.pdf)](https://www.bb.org.bd/econdata/bs/geo_bank.pdf) | Public government information; compilation CC BY 4.0 | 2026-11-15 | 2026-11-15 | Bangladesh Bank |
| `banks.branches` | [Bangladesh Bank, Banking Statistics Division: list of bank branches by district and thana, as on 31 August 2026 (econdata/bs/geo_bank.pdf); routing numbers from the bddata.org bank routing table (reportedly from Bangladesh Bank), attached only when bank, district, branch name and check digit agree](https://www.bb.org.bd/econdata/bs/geo_bank.pdf) | Branch list: public government information; compilation CC BY 4.0. Routing numbers: factual data compiled by bddata.org (all rights reserved; used with attribution, see specs/005-banks/research.md) | 2026-11-15 | 2026-11-15 | Bangladesh Bank; bddata.org (Bangladesh Barta) |
| `convert.bijoy-map` | [SutonnyMJ Bijoy mapping derived from bn-ansi-to-unicode (BinduLogic)](https://github.com/BinduLogic/bn-ansi-to-unicode) | MIT (Copyright (c) 2022 BinduLogic LLC); desh-api additions CC BY 4.0 | 2026-11-14 | 2026-11-14 | BinduLogic LLC (bn-ansi-to-unicode) |
| `education.boards` | [Ministry of Education (moedu.gov.bd) and individual education board statutory portals (dhakaeducationboard.gov.bd, bmeb.gov.bd, bteb.gov.bd, etc.)](https://moedu.gov.bd) | Public government information; compilation CC BY 4.0 | 2026-11-16 | 2026-11-16 | Ministry of Education, Bangladesh; Board of Intermediate and Secondary Education |
| `education.grading-scale` | [Ministry of Education, Bangladesh: uniform GPA 5.0 grading system for SSC/HSC and equivalent examinations](https://moedu.gov.bd) | Public government information; compilation CC BY 4.0 | 2026-11-16 | 2026-11-16 | Ministry of Education, Bangladesh |
| `education.universities` | [University Grants Commission of Bangladesh (ugc.gov.bd): university lists and university pages (site updated 2026-11-12)](https://www.ugc.gov.bd/universities) | Public government information; compilation CC BY 4.0 | 2026-11-15 | 2026-11-12 | University Grants Commission of Bangladesh |
| `education.university-categories` | [University Grants Commission of Bangladesh (ugc.gov.bd): university lists and university pages (site updated 2026-11-12)](https://www.ugc.gov.bd/universities) | Public government information; compilation CC BY 4.0 | 2026-11-15 | 2026-11-12 | University Grants Commission of Bangladesh |
| `finance.tax-categories` | [Finance Act 2026 (Act No. 96 of 2026, 30 June 2026), Schedule 2; Income Tax Act 2023 (s. 78, Sixth Schedule) as amended by Act No. 89 of 2026 and Act No. 96 of 2026](http://bdlaws.minlaw.gov.bd/act-details-1725.html) | Public law; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Legislative and Parliamentary Affairs Division (bdlaws.minlaw.gov.bd); National Board of Revenue, Bangladesh |
| `finance.tax-years` | [Finance Act 2026 (Act No. 96 of 2026, 30 June 2026), Schedule 2; Income Tax Act 2023 (s. 78, Sixth Schedule) as amended by Act No. 89 of 2026 and Act No. 96 of 2026](http://bdlaws.minlaw.gov.bd/act-details-1725.html) | Public law; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Legislative and Parliamentary Affairs Division (bdlaws.minlaw.gov.bd); National Board of Revenue, Bangladesh |
| `fun.dishes` | [Department of Patents, Designs and Trademarks (DPDT), granted GI products list (page updated 2026-11-04)](https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf) | Public government information; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Department of Patents, Designs and Trademarks, Bangladesh |
| `fun.history` | Facts read from cited pages (Wikipedia: Bengali language movement, Bangladesh Liberation War, Provisional Government of Bangladesh, National symbols of Bangladesh); each event cites its page | Facts; descriptions CC BY 4.0 | 2026-11-14 | 2026-11-14 | Wikipedia contributors; desh-api contributors |
| `fun.proverbs` | Traditional Bangla proverbs (public domain); meanings written by desh-api contributors | Public domain proverbs; meanings CC BY 4.0 | 2026-11-14 | 2026-11-14 | desh-api contributors |
| `fun.quiz` | Facts read from cited pages (Wikipedia: National symbols of Bangladesh, Bengali language movement, Bangladesh Liberation War, Provisional Government of Bangladesh, Geography of Bangladesh); each question cites its page. Facts where sources disagreed were left out. | Facts; questions CC BY 4.0 | 2026-11-14 | 2026-11-14 | Wikipedia contributors; desh-api contributors |
| `fun.riddles` | Traditional Bangla riddles (public domain) | Public domain riddles; translations CC BY 4.0 | 2026-11-14 | 2026-11-14 | desh-api contributors |
| `geo.city-corporations` | [Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); BBS/OCHA COD-AB data CC BY-IGO 3.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); Bangladesh Bureau of Statistics; UN OCHA Humanitarian Data Exchange |
| `geo.districts` | [Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); BBS/OCHA COD-AB data CC BY-IGO 3.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); Bangladesh Bureau of Statistics; UN OCHA Humanitarian Data Exchange |
| `geo.divisions` | [Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); BBS/OCHA COD-AB data CC BY-IGO 3.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); Bangladesh Bureau of Statistics; UN OCHA Humanitarian Data Exchange |
| `geo.postcodes` | [Bangladesh GeoCode (GeoNames postal codes, compiled from the Bangladesh Post Office list)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); GeoNames data CC BY 4.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); GeoNames; Bangladesh Post Office |
| `geo.unions` | [Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); BBS/OCHA COD-AB data CC BY-IGO 3.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); Bangladesh Bureau of Statistics; UN OCHA Humanitarian Data Exchange |
| `geo.upazilas` | [Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)](https://github.com/nuhil/bangladesh-geocode) | MIT (compilation); BBS/OCHA COD-AB data CC BY-IGO 3.0 | 2026-11-13 | 2026-11-12 | Nuhil Mehdy and contributors (nuhil/bangladesh-geocode); Bangladesh Bureau of Statistics; UN OCHA Humanitarian Data Exchange |
| `holidays.holidays` | [Ministry of Public Administration holiday notifications (2027: No. 05.00.0000.175.08.0008.25-105, 5 Nov 2026)](https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740) | Public government information; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Ministry of Public Administration, Bangladesh |
| `holidays.years` | [Ministry of Public Administration holiday notifications (2027: No. 05.00.0000.175.08.0008.25-105, 5 Nov 2026)](https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740) | Public government information; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Ministry of Public Administration, Bangladesh |
| `hotlines` | [Bangladesh National Portal, 'জরুরি হটলাইন' (page updated 2026-07-28); Directorate General of Health Services for 16263](https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89) | Public government information; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Bangladesh National Portal (bangladesh.gov.bd); Directorate General of Health Services |
| `land.units` | Standard Bangladesh land measurement equivalents (1 acre = 100 decimal = 43,560 sq ft; 1 katha = 720 sq ft; 1 bigha = 20 katha); metric factors from the international foot (0.3048 m) | Facts; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | desh-api contributors |
| `market.commodities` | [Commodity names and units exactly as written in the Trading Corporation of Bangladesh daily retail price list; English names and slugs by desh-api contributors](https://tcb.gov.bd/pages/daily-rmps) | Names: public government information; translations CC BY 4.0 | 2026-11-15 | 2026-11-15 | Trading Corporation of Bangladesh; desh-api contributors |
| `market.fuel` | [Energy and Mineral Resources Division monthly fuel price notices (published by Bangladesh Petroleum Corporation)](https://bpc.gov.bd/) | Public government information; compilation CC BY 4.0 | 2026-11-15 | 2026-10-29 | Energy and Mineral Resources Division; Bangladesh Petroleum Corporation |
| `metro.stations` | [Dhaka Mass Transit Company Limited (DMTCL), Ministry of Road Transport and Bridges: MRT Line-6 station directory, coordinates and official fare chart](https://dmtcl.gov.bd) | Public government information; compilation CC BY 4.0 | 2026-11-16 | 2026-11-16 | Dhaka Mass Transit Company Limited (DMTCL); Road Transport and Highways Division, Bangladesh; desh-api contributors |
| `mfs.providers` | [Bangladesh Bank MFS regulations and official schedule of charges from licensed MFS providers (bKash, Nagad, Rocket, Upay, TAP)](https://www.bb.org.bd/en/index.php/financialactivity/mfs) | Public tariff information; compilation CC BY 4.0 | 2026-11-16 | 2026-11-16 | Bangladesh Bank; bKash Limited; Nagad Limited; Dutch-Bangla Bank PLC; United Commercial Bank PLC; Trust Axiata Digital Limited |
| `mock.names` | [Common Bangladeshi given and family names compiled by desh-api contributors (no directory of real people used); tradition weights from the BBS Population and Housing Census 2022](https://en.prothomalo.com/bangladesh/at87h01ocn) | CC BY 4.0 | 2026-11-15 | 2026-11-15 | desh-api contributors |
| `phone.prefixes` | [BTRC mobile numbering plan (operator prefix allocation)](https://www.btrc.gov.bd) | Public information; compilation CC BY 4.0 | 2026-11-14 | 2026-11-14 | Bangladesh Telecommunication Regulatory Commission |
| `prayer.district-offsets` | [Islamic Foundation Bangladesh (IFB), Ministry of Religious Affairs: prayer and Ramadan timetable schedule and district time offset table](https://islamicfoundation.gov.bd) | Public government information; compilation CC BY 4.0 | 2026-11-16 | 2026-11-16 | Islamic Foundation Bangladesh; Ministry of Religious Affairs, Bangladesh; desh-api contributors |
| `validate.vehicle-area-aliases` | Abbreviations seen on BRTA registration plates (e.g. 'চট্ট মেট্রো' for Chattogram Metro); full area names come from geo.districts | CC BY 4.0 | 2026-11-14 | 2026-11-14 | desh-api contributors |

## Live sources

Read when a request arrives (cached at the edge), not stored in `data/`.

| Endpoint | Source | Notes |
|---|---|---|
| `/v1/gold/prices`, `/v1/zakat` | [Bangladesh Jewellers Association (BAJUS), gold and silver rate](https://www.bajus.org/gold-price) | Cached 30 minutes; `meta.last_updated` is the price list's effective date. Where BAJUS cannot be reached, the last list read within 7 days (kept in Workers KV) is served as `last_known`; otherwise 503 |
| `/v1/market/prices` | [Trading Corporation of Bangladesh (TCB), daily retail prices in Dhaka](https://tcb.gov.bd/pages/daily-rmps) | Newest daily spreadsheet, cached 30 minutes (each file a day); English names from `market.commodities`. Same last-good copy in Workers KV and 503 rule as gold |

## Rules and formulas

Calculators that apply a law or a standard formula rather than a dataset.

| Endpoint | Source |
|---|---|
| `/v1/finance/vat` | Value Added Tax and Supplementary Duty Act 2012, section 15 (standard rate 15%) |
| `/v1/finance/gratuity` | Bangladesh Labour Act 2006, section 2(10) |
| `/v1/finance/emi`, `/v1/finance/dps` | Standard reducing-balance and recurring-deposit formulas |
| `/v1/zakat` | Classical nisab: 7.5 vori (87.48 g) gold or 52.5 vori (612.36 g) silver; rate 2.5% |
| `/v1/validate/routing/{number}` | Routing check digit (weights 5-7-1), inferred from 10,032 published routing numbers |
