# Data Model: Mobile Financial Services (MFS)

## Provider Entity

```typescript
export interface MfsFeeRate {
  rate_percent: number;      // e.g. 1.75 for 1.75%
  per_thousand: number;      // e.g. 17.50 Tk
  vat_included: boolean;     // whether 15% VAT is already included in quoted rate
  notes_en?: string;
  notes_bn?: string;
}

export interface MfsSendMoneyFee {
  fee_fixed: number;         // e.g. 5 Tk or 0 Tk
  free_conditions_en?: string;
  free_conditions_bn?: string;
  notes_en?: string;
  notes_bn?: string;
}

export interface MfsProvider {
  slug: string;              // "bkash", "nagad", "rocket", "upay", "tap"
  name_en: string;
  name_bn: string;
  parent_en: string;         // e.g. "BRAC Bank PLC"
  parent_bn: string;         // e.g. "ব্র্যাক ব্যাংক পিএলসি"
  ussd_code: string;         // "*247#"
  helpline: string;          // "16247"
  website: string;           // "https://www.bkash.com"
  charges: {
    cash_out: {
      app: MfsFeeRate;
      ussd: MfsFeeRate;
      atm?: MfsFeeRate;
      special?: MfsFeeRate;  // e.g. priyo agent
    };
    send_money: {
      app: MfsSendMoneyFee;
      ussd: MfsSendMoneyFee;
    };
  };
  limits: {
    cash_out_max_per_txn: number;
    cash_out_daily_max: number;
    send_money_max_per_txn: number;
  };
  last_verified: string;     // ISO date
  source_url: string;
}
```
