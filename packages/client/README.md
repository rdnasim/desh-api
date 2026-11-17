# @deshapi/client

Official strongly-typed TypeScript and JavaScript client for **[Desh API](https://deshapi.riadul.com)**.

Zero dependencies, native `fetch` based, works across Node.js 18+, Bun, Deno, Cloudflare Workers, Next.js, and modern browsers.

---

## Installation

```bash
npm install @deshapi/client
# or
pnpm add @deshapi/client
# or
yarn add @deshapi/client
```

---

## Quick Start

```typescript
import { createDeshClient } from '@deshapi/client';

const desh = createDeshClient({
  // Optional: Provide API Key for Developer/Enterprise quota tiers
  apiKey: process.env.DESH_API_KEY,
});

// 1. Geo Lookups
const divisions = await desh.geo.divisions();
const upazilas = await desh.geo.upazilas('cumilla');
const postcode = await desh.geo.postcode(1205);

// 2. Bangla Toolkit
const words = await desh.bangla.numToWords(1250000);
// → "বারো লক্ষ পঞ্চাশ হাজার"
const takaWords = await desh.bangla.takaInWords(1250.50);
// → "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা"

// 3. Format Validation
const nid = await desh.validate.nid('1990123456789');
const vehicle = await desh.validate.vehicle('ঢাকা মেট্রো-গ ১১-২২৩৩');

// 4. Finance & Tax
const tax = await desh.finance.incomeTax(1200000, { tax_year: '2027-28' });
const emi = await desh.finance.emi(1000000, 9, 60);

// 5. Daily Essentials & Prayer
const prayers = await desh.prayer.times({ district: 'chattogram' });
const gold = await desh.gold.prices();

// 6. Natural Language Processing (NLP)
const stemmed = await desh.nlp.stem('ছাত্রদেরকে');
// → { input: 'ছাত্রদেরকে', stem: 'ছাত্র', suffix: 'দেরকে' }
const normalized = await desh.nlp.normalize('বাংলা‌দেশ');
// → { normalized: 'বাংলাদেশ' }
```

---

## Error Handling

Errors throw a typed `DeshApiError`:

```typescript
import { createDeshClient, DeshApiError } from '@deshapi/client';

const desh = createDeshClient();

try {
  await desh.geo.district('unknown');
} catch (error) {
  if (error instanceof DeshApiError) {
    console.error(error.status);     // 404
    console.error(error.code);       // "not_found"
    console.error(error.message);    // "District 'unknown' not found"
    console.error(error.messageBn);  // "জেলা পাওয়া যায়নি"
  }
}
```

---

## License

MIT © Desh API Contributors
