# Data Model: 018-constituencies

## Constituency Record
```typescript
export interface Constituency {
  number: number;               // 1 to 300
  number_bn: string;            // '১' to '৩০০'
  code: string;                 // 'panchagarh-1', 'dhaka-10', 'bandarban'
  name_en: string;              // 'Panchagarh-1', 'Dhaka-10'
  name_bn: string;              // 'পঞ্চগড়-১', 'ঢাকা-১০'
  division: string;             // 'rangpur', 'dhaka'
  district: string;             // 'panchagarh', 'dhaka'
  area_en: string;              // Description of covered upazilas/thanas
  area_bn: string;              // বাংলা বিবরণ
}
```

## District Seat Breakdown Record
```typescript
export interface DistrictConstituencies {
  district: string;             // 'dhaka', 'panchagarh'
  district_name_en: string;     // 'Dhaka'
  district_name_bn: string;     // 'ঢাকা'
  division: string;             // 'dhaka'
  seat_count: number;           // e.g. 20 for Dhaka, 2 for Panchagarh
  constituencies: Array<{
    number: number;
    number_bn: string;
    code: string;
    name_en: string;
    name_bn: string;
  }>;
}
```
