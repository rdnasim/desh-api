# Data Model: Dhaka Metro Rail (MRT Line-6)

**Branch**: `013-dhaka-metro`  
**Date**: 2026-11-16  

## Entities

### 1. `MetroStation` (stored in `data/metro/stations.json`)

```typescript
interface MetroStation {
  slug: string;                 // e.g. "uttara-north"
  order: number;                // 1 to 17
  code: string;                 // e.g. "UN"
  name_en: string;              // "Uttara North"
  name_bn: string;              // "উত্তরা উত্তর"
  line: string;                 // "MRT-6"
  status: 'operational' | 'under_construction';
  lat: number;                  // 23.8741
  lon: number;                  // 90.3857
  division: string;             // "dhaka"
  district: string;             // "dhaka"
  upazila?: string;             // "uttara"
  connecting_routes?: string[]; // e.g. ["MRT Line-5 (Planned)"]
  features: string[];           // ["elevator", "escalator", "ticket_vending_machine", "accessible_toilet"]
  distance_from_start_km: number; // Cumulative distance from Uttara North (km)
}
```

### 2. `MetroFareCalculation`

```typescript
interface MetroFareCalculation {
  from: {
    slug: string;
    name_en: string;
    name_bn: string;
    code: string;
  };
  to: {
    slug: string;
    name_en: string;
    name_bn: string;
    code: string;
  };
  stations_traversed: number;
  distance_km: number;
  estimated_time_minutes: number;
  single_journey_fare: number;     // e.g. 100 (BDT)
  single_journey_fare_bn: string;  // "১০০"
  mrt_pass_fare: number;           // e.g. 90 (BDT) (10% discount)
  mrt_pass_fare_bn: string;        // "৯০"
  discount_percent: number;        // 10
  concessions: {
    children_under_3ft: string;
    freedom_fighters: string;
    persons_with_disabilities: string;
  };
}
```

### 3. `MetroTimetable`

```typescript
interface MetroScheduleWindow {
  period_en: string;
  period_bn: string;
  start_time: string;
  end_time: string;
  headway_minutes: number;
}

interface MetroTimetable {
  line: string;
  service_days: {
    regular: {
      days: string[];
      first_train_uttara_north: string;
      last_train_uttara_north: string;
      first_train_motijheel: string;
      last_train_motijheel: string;
      windows: MetroScheduleWindow[];
    };
    friday: {
      description_en: string;
      description_bn: string;
      first_train: string;
      last_train: string;
      headway_minutes: number;
    };
  };
  notes_en: string[];
  notes_bn: string[];
}
```
