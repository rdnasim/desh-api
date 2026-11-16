# Feature Specification: Prayer Times & Ramadan Calendar

**Feature Branch**: `012-prayer-times`  
**Created**: 2026-11-16  
**Status**: Draft  
**Input**: Islamic Foundation Bangladesh 5 daily prayers per district, Sehri & Iftar timetable with district offsets.

---

## Overview

Prayer times and Ramadan schedules are among the most frequently queried reference datasets in Bangladesh. The standard reference across the nation is the **Islamic Foundation Bangladesh (IFB)** under the Ministry of Religious Affairs.

Desh API provides:
1. **5 Daily Prayer Times** (Fajr, Dhuhr, Asr, Maghrib, Isha) plus Sunrise, Sunset, Sehri cutoff (Sehri Shesh), and Midnight/Tahajjud windows.
2. **64 District Support**: Accurate times for all 64 districts based on official IFB district time offsets (+/- minutes relative to Dhaka baseline) and astronomical solar calculations matching IFB parameters (18° twilight for Fajr and Isha, Hanafi and Shafi Asr options, Dhaka UTC+6).
3. **Ramadan Timetable & Calendar**: 30-day Sehri and Iftar schedule for Ramadan for any district, paired with Hijri (e.g. 1447/1448 AH), Gregorian, and revised Bangla Academy dates, including the standard Islamic moon-sighting disclaimer ("চাঁদ দেখার উপর নির্ভরশীল").
4. **District Offsets Endpoint**: Reference table showing the official IFB minute adjustments across all 64 districts relative to Dhaka.

---

## User Scenarios & Testing

### User Story 1 - Daily Prayer Times by District (Priority: P1) 🎯 MVP
A developer building a Bangladesh mobile app, prayer widget, mosque display, or website needs the exact prayer times for today (or a specific date) for any district.

1. `GET /v1/prayer/times` returns prayer times for today in Dhaka.
2. `GET /v1/prayer/times?district=chattogram` returns times adjusted for Chattogram (-5 mins).
3. `GET /v1/prayer/times?district=sylhet&date=2026-03-20` calculates for that date and district.
4. Accepts Latin (`2026-03-20`) or Bangla digits (`২০২৬-০৩-২০`).
5. Supports school parameter: `school=hanafi` (default, shadow factor 2) and `school=shafi` (shadow factor 1).
6. Response contains:
   - `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib` (iftar), `isha`
   - `sehri_cutoff` (typically 3 mins before Fajr as per IFB printed timetables)
   - `date` (Gregorian, Hijri, Bangla)
   - Bilingual prayer names (`name_en`, `name_bn`)
   - Source metadata citing Islamic Foundation Bangladesh.

### User Story 2 - Ramadan Timetable (Priority: P1) 🎯 MVP
During Ramadan, individuals and apps need the complete 30-day Sehri & Iftar timetable for their home district.

1. `GET /v1/prayer/ramadan` returns the Ramadan schedule for the current/upcoming Ramadan for Dhaka.
2. `GET /v1/prayer/ramadan?district=rajshahi` returns the schedule adjusted for Rajshahi (+7 mins).
3. `GET /v1/prayer/ramadan?day=15&district=coxs-bazar` returns a single day's Sehri and Iftar for Cox's Bazar.
4. Each entry includes:
   - `ramadan_day`: 1–30
   - `gregorian_date`, `bangla_date`, `hijri_date`
   - `sehri_cutoff`, `fajr`, `iftar` (maghrib)
   - Moon sighting note / disclaimer.

### User Story 3 - District Offsets Directory (Priority: P2)
Developers and researchers need the official Islamic Foundation Bangladesh table of district minute differences relative to Dhaka.

1. `GET /v1/prayer/offsets` returns all 64 districts with their Sehri offset, Iftar offset, BBS code, and bilingual names.
2. `GET /v1/prayer/offsets/{district}` returns the offset for a specific district.

---

## Calculation Rules & Provenance

1. **Dhaka Benchmark**: Latitude 23.8103° N, Longitude 90.4125° E, Elevation ~10m, Timezone UTC+6 (`Asia/Dhaka`).
2. **Twilight Angles**:
   - Fajr: Sun altitude -18.0°
   - Isha: Sun altitude -18.0°
3. **Sehri Safe Margin (Ihtiyat)**:
   - Official IFB printed calendars enforce a safe margin of 3 minutes before true Fajr dawn for Sehri cutoff.
4. **Iftar Safe Margin**:
   - Iftar begins at astronomical sunset (Maghrib), with official calendars including a 2–3 minute buffer after sunset.
5. **District Offsets**:
   - Eastern districts (e.g. Sylhet, Chattogram, Brahmanbaria) have negative offsets (Sehri and Iftar are earlier than Dhaka).
   - Western districts (e.g. Rajshahi, Dinajpur, Chuadanga, Chapainawabganj) have positive offsets (Sehri and Iftar are later than Dhaka).
