# Feature Specification: Weather Signals, Disaster Warnings & AQI Reference

**Feature Branch**: `016-weather-aqi`  
**Created**: 2026-11-16  
**Status**: In Progress  
**Input**: Bangladesh Meteorological Department (BMD) maritime (1–11) and riverport (1–4) warning signals, Department of Environment (DoE) 6-category Air Quality Index (AQI) scale with advisories, and traditional 6 Bangla seasons (ঋতু).

---

## Overview

Bangladesh is a disaster-prone coastal delta where storm and riverport signals, air quality levels, and seasonal cycles are vital parts of public life, navigation, education, and disaster response.

Desh API provides an authoritative, bilingual reference system:
1. **BMD Maritime Storm Signals (1 to 11)**: Complete official terminology, cautionary meaning, wind speed thresholds, port safety instructions, and coastal track directions.
2. **BMD Inland Riverport Warning Signals (1 to 4)**: Vessel safety thresholds (e.g. 65 ft rule), squall velocities, and navigation precautions for inland waterways.
3. **DoE Air Quality Index (AQI) Standards**: Official Bangladesh DoE 6-category scale (0–50 Good, 51–100 Moderate, 101–150 Caution, 151–200 Unhealthy, 201–300 Very Unhealthy, 301–500 Hazardous) with standard HEX color codes, sensitive group cautions, and emergency guidance.
4. **Traditional 6 Bangla Seasons (ষড়ঋতু)**: Grishma, Barsha, Sharat, Hemanta, Sheet, and Basanta with corresponding Bangla months (Baishakh to Chaitra) and Gregorian date spans.

---

## User Scenarios & Testing

### User Story 1 - Maritime Signals (Priority: P1) 🎯 MVP
Maritime operators, news agencies, disaster management teams, and coastal residents need official cyclone signal meanings.

1. `GET /v1/weather/signals/maritime` returns all 11 signals in sequential order.
2. `GET /v1/weather/signals/maritime/{number}` returns signal details (name, Bengali name, category, wind speed criteria, port danger level).
3. 404s on signal outside 1–11.

### User Story 2 - Inland Riverport Signals (Priority: P1) 🎯 MVP
Ferry, launch, and trawler operators on Bangladesh's vast river network need riverport warning signals.

1. `GET /v1/weather/signals/riverport` returns all 4 riverport signals (Cautionary 1, Warning 2, Danger 3, Great Danger 4).
2. `GET /v1/weather/signals/riverport/{number}` returns vessel safety directions and wind thresholds.
3. 404s on signal outside 1–4.

### User Story 3 - Air Quality Index (AQI) Categories & Lookup (Priority: P1) 🎯 MVP
Health apps, weather widgets, and schools need official DoE AQI categories and instant evaluation from raw AQI values.

1. `GET /v1/weather/aqi/categories` returns the 6 DoE categories with range, color hex, health implications, and cautionary statements.
2. `GET /v1/weather/aqi/lookup?value=175` returns category `unhealthy`, color `#FF0000`, health effects, and recommended guidance.
3. 400s on invalid/negative values.

### User Story 4 - 6 Bangla Seasons (Priority: P2)
Cultural apps, education portals, and calendars need the traditional six seasons of Bangladesh.

1. `GET /v1/weather/seasons` returns the 6 seasons (*গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত*), Bangla months, English months, and environmental traits.
