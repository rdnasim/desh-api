# Feature Specification: Dhaka Metro Rail (MRT Line-6)

**Feature Branch**: `013-dhaka-metro`  
**Created**: 2026-11-16  
**Status**: Draft  
**Input**: Dhaka Metro Rail (MRT Line-6): Station directory, GPS coordinates, timetables, and single-journey vs MRT Pass fare calculator.

---

## Overview

Dhaka Metro Rail (Mass Rapid Transit / MRT Line-6), operated by **Dhaka Mass Transit Company Limited (DMTCL)** under the Road Transport and Highways Division, is Bangladesh's first elevated rapid transit rail system. Connecting Uttara to Motijheel (with Kamalapur under construction), it serves hundreds of thousands of commuters daily across 16 active stations.

Desh API provides a clean, bilingual API for:
1. **Station Directory**: 16 operational stations + Kamalapur extension, with official station codes, bilingual names (`_en`, `_bn`), GPS coordinates (latitude, longitude), sequential order, and nearby landmarks/facilities.
2. **Fare Calculator**: Official DMTCL fare matrix (minimum fare ৳20, maximum fare ৳100) comparing single-journey ticket prices against the **10% MRT Pass / Rapid Pass discount** (৳18 to ৳90).
3. **Timetable & Operating Schedule**: First and last train departures, peak vs off-peak train headways, Saturday–Thursday schedule, and Friday afternoon special schedule.
4. **Lines Overview**: Summary of MRT Line-6 specifications and network interchange points (e.g. Mirpur-10 interchange with planned MRT Line-5).

---

## User Scenarios & Testing

### User Story 1 - Station Directory & GPS Coordinates (Priority: P1) 🎯 MVP
Commuters, mapping apps, and delivery platforms need the official MRT station list, ordering, and coordinates.

1. `GET /v1/metro/stations` returns all stations in sequential order from north to south (`uttara-north` to `motijheel`).
2. `GET /v1/metro/stations/{slug}` returns a single station with full details: coordinates, code, Bengali name, facilities (escalators, elevators, parking), and nearby connections.
3. Supports filtering by operational status (`operational`, `under_construction`).

### User Story 2 - Station-to-Station Fare Calculator (Priority: P1) 🎯 MVP
Commuters and ticketing systems need to calculate fares between any two stations.

1. `GET /v1/metro/fare?from=uttara-north&to=motijheel` returns:
   - Single journey ticket fare: ৳100
   - MRT Pass / Rapid Pass fare (10% discount): ৳90
   - Stations count (16 stations traversed)
   - Estimated travel time (~31-32 minutes)
   - Concession policies (children under 3 ft free, freedom fighters free).
2. Works symmetrically (`from=motijheel&to=uttara-north` gives the same fare).
3. Rejects unknown station slugs with 404 `not_found`.
4. Rejects journeys starting and ending at the same station with 400 `invalid_parameter`.

### User Story 3 - Operating Timetable & Schedules (Priority: P2)
Commuters need to know train departure times, frequency, and operating hours.

1. `GET /v1/metro/timetable` returns weekday operating hours (first/last train from Uttara North and Motijheel), peak/off-peak intervals, and Friday afternoon schedule.
2. `GET /v1/metro/lines` returns MRT Line-6 metadata (length 21.26 km, 16 operating stations, standard gauge, electrification 1500V DC).
