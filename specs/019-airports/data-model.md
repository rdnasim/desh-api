# Data Model: 019-airports

```typescript
export type AirportType = 'international' | 'domestic' | 'short_takeoff' | 'military_airstrip';
export type AirportStatus = 'operational' | 'under_development' | 'inactive';

export interface AirportRunway {
  length_ft: number;
  surface: string;
}

export interface AirportCoordinates {
  latitude: number;
  longitude: number;
}

export interface Airport {
  slug: string;
  iata_code?: string;
  icao_code?: string;
  name_en: string;
  name_bn: string;
  type: AirportType;
  status: AirportStatus;
  division: string;
  district: string;
  city: string;
  coordinates: AirportCoordinates;
  elevation_ft: number;
  runways: AirportRunway[];
  website: string;
}
```
