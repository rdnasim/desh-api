# Data Model: 022-ports

```typescript
export type LandPortStatus = 'operational' | 'under_development' | 'inactive';
export type LandPortOperatorType = 'blpa_operated' | 'private_bot' | 'railway_joint';

export interface LandPort {
  slug: string;
  code: string;
  name_en: string;
  name_bn: string;
  status: LandPortStatus;
  operator_type: LandPortOperatorType;
  established_year: number;
  division: string;
  district: string;
  upazila: string;
  counterpart_indian_lcs: string;
  counterpart_state: string;
  key_commodities: string[];
  facilities: string[];
  has_rail_link: boolean;
  has_passenger_immigration: boolean;
  description_en: string;
  description_bn: string;
}
```
