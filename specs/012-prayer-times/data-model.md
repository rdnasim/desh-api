# Data Model: Prayer Times & Ramadan Calendar

**Branch**: `012-prayer-times`  
**Date**: 2026-11-16  

## Entities

### 1. `DistrictOffset` (stored in `data/prayer/district-offsets.json`)
Official Islamic Foundation Bangladesh offset per district relative to Dhaka.

```typescript
interface DistrictOffset {
  slug: string;          // e.g. "dhaka", "sylhet", "chattogram"
  name_en: string;       // e.g. "Sylhet"
  name_bn: string;       // e.g. "সিলেট"
  bbs_code: string;      // e.g. "BD6091"
  division: string;      // e.g. "sylhet"
  sehri_offset_minutes: number; // e.g. -6 (minutes relative to Dhaka)
  iftar_offset_minutes: number; // e.g. -6
  fajr_offset_minutes: number;  // e.g. -6
  dhuhr_offset_minutes: number; // e.g. -5
  asr_offset_minutes: number;   // e.g. -6
  maghrib_offset_minutes: number; // e.g. -6
  isha_offset_minutes: number;  // e.g. -6
}
```

### 2. `DailyPrayerTimes`
Computed prayer times for a single day.

```typescript
interface DailyPrayerTimes {
  date: string;               // ISO "YYYY-MM-DD"
  hijri_date: string;         // e.g. "15 Ramadan 1447"
  hijri_date_bn: string;      // e.g. "১৫ রমজান ১৪৪৭"
  bangla_date: string;        // e.g. "৬ চৈত্র ১৪৩২"
  district: {
    slug: string;
    name_en: string;
    name_bn: string;
  };
  school: 'hanafi' | 'shafi';
  times: {
    sehri_cutoff: string;     // "HH:MM" (24h)
    fajr: string;             // "HH:MM"
    sunrise: string;          // "HH:MM"
    dhuhr: string;            // "HH:MM"
    asr: string;              // "HH:MM"
    maghrib: string;          // "HH:MM" (Iftar)
    isha: string;             // "HH:MM"
    sunset: string;           // "HH:MM"
  };
  times_12h: {
    sehri_cutoff: string;     // e.g. "04:52 AM"
    fajr: string;             // e.g. "04:55 AM"
    sunrise: string;          // e.g. "06:12 AM"
    dhuhr: string;            // e.g. "12:05 PM"
    asr: string;              // e.g. "04:18 PM"
    maghrib: string;          // e.g. "06:08 PM"
    isha: string;             // e.g. "07:22 PM"
  };
  times_bn: {
    sehri_cutoff: string;     // e.g. "০৪:৫২ ভোর"
    fajr: string;             // e.g. "০৪:৫৫ ভোর"
    sunrise: string;          // e.g. "০৬:১২ সকাল"
    dhuhr: string;            // e.g. "১২:০৫ দুপুর"
    asr: string;              // e.g. "০৪:১৮ বিকাল"
    maghrib: string;          // e.g. "০৬:০৮ সন্ধ্যা"
    isha: string;             // e.g. "০৭:২২ রাত"
  };
}
```

### 3. `RamadanSchedule` & `RamadanDay`
30-day Ramadan schedule for a given year and district.

```typescript
interface RamadanDay {
  day: number;                // 1 to 30
  gregorian_date: string;     // "YYYY-MM-DD"
  bangla_date: string;        // e.g. "১ চৈত্র ১৪৩২"
  hijri_date: string;         // e.g. "1 Ramadan 1447"
  sehri_cutoff: string;       // "04:58"
  fajr: string;               // "05:01"
  iftar: string;              // "18:02"
  sehri_cutoff_12h: string;   // "04:58 AM"
  iftar_12h: string;          // "06:02 PM"
  sehri_cutoff_bn: string;    // "০৪:৫৮ ভোর"
  iftar_bn: string;           // "০৬:০২ সন্ধ্যা"
}

interface RamadanSchedule {
  year_hijri: number;         // e.g. 1447
  district: {
    slug: string;
    name_en: string;
    name_bn: string;
  };
  start_date: string;         // Tentative start date
  disclaimer: string;         // "চাঁদ দেখার ওপর নির্ভরশীল" / "Subject to the sighting of the moon"
  days: RamadanDay[];
}
```
