# Feature Specification: Bangladesh Railway Intercity Directory

**Feature Branch**: `017-railway`  
**Created**: 2026-11-16  
**Status**: In Progress  
**Input**: Bangladesh Railway Intercity Directory: Train numbers, route origins & destinations, off-days, departure/arrival schedules, coach classes, and major stations.

---

## Overview

**Bangladesh Railway (BR)** is the state-owned rail transport agency operating under the Ministry of Railways (`railway.gov.bd`). BR carries millions of passengers between divisions on high-demand intercity trains like the *Suborno Express*, *Sonar Bangla Express*, *Parabat Express*, *Silk City Express*, and *Sundarban Express*.

Desh API provides an authoritative, bilingual reference for:
1. **Intercity Trains**: Flagship train pairs with official train numbers (e.g. 701/702, 787/788), departure and arrival schedules, weekly off-days, and route origins and destinations.
2. **Coach Classes**: Official BR seat and berth classes (Shovon, Shovon Chair, Snigdha, AC Seat, AC Berth, First Class Seat/Berth).
3. **Major Railway Stations**: Key junction stations, division headquarters, and termini (Kamalapur/Dhaka, Airport, Chattogram, Sylhet, Rajshahi, Khulna, Santahar, Ishwardi, Akhaura) with station codes and GPS coordinates.

---

## User Scenarios & Testing

### User Story 1 - List Intercity Trains with Filters (Priority: P1) 🎯 MVP
Commuters and travel platforms need to search for intercity trains between city pairs.

1. `GET /v1/railway/trains` returns trains sorted by train number.
2. Supports filtering by route origin (`?origin=dhaka`), destination (`?destination=chattogram`), class (`?class=snigdha`), off-day (`?off_day=friday`), or query search (`?q=suborno`).

### User Story 2 - Lookup Single Train by Number or Slug (Priority: P1) 🎯 MVP
Ticketing applications often query trains by train number (e.g. `701`, `788`) or slug (`suborno-express-701`).

1. `GET /v1/railway/trains/{number_or_slug}` resolves train details, departure time, arrival time, intermediate halts, and available classes.
2. 404s on unknown train number or slug.

### User Story 3 - Coach Classes Reference (Priority: P1) 🎯 MVP
Developers need the standard BR coach class codes, Bengali names, and AC status.

1. `GET /v1/railway/classes` returns all 7 standard BR coach classes (Shovon, Shovon Chair, Snigdha, First Class Seat, First Class Berth, AC Seat, AC Berth).

### User Story 4 - Major Railway Stations Directory (Priority: P2)
Mapping and navigation apps need primary railway stations with codes and coordinates.

1. `GET /v1/railway/stations` returns key railway stations with bilingual names, station codes (e.g. `DA` for Dhaka/Kamalapur, `CG` for Chattogram), division, and coordinates.
