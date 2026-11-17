# Data Model: 021-rivers

```typescript
export interface River {
  slug: string;
  name_en: string;
  name_bn: string;
  origin: string;
  outflow: string;
  length_km: number;
  divisions: string[];
  districts: string[];
  tributaries: string[];
  distributaries: string[];
  is_transboundary: boolean;
  description_en: string;
  description_bn: string;
  special_features: string[];
}
```
