# Data Model: 020-heritage

```typescript
export type HeritageCategory = 'archaeological' | 'historical' | 'natural' | 'cultural' | 'monument';
export type HeritageType = 'unesco_world_heritage' | 'national_heritage' | 'eco_tourism' | 'landmark';

export interface HeritageEntryFee {
  citizen_bdt?: number;
  saarc_bdt?: number;
  foreign_bdt?: number;
  is_free?: boolean;
}

export interface HeritageSite {
  slug: string;
  name_en: string;
  name_bn: string;
  category: HeritageCategory;
  type: HeritageType;
  unesco_id?: number;
  period_era?: string;
  division: string;
  district: string;
  upazila?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description_en: string;
  description_bn: string;
  highlights: string[];
  best_time_to_visit?: string;
  entry_fee?: HeritageEntryFee;
}
```
