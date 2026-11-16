/** OpenAPI document settings and per-module tag descriptions shown on /docs. */
export const OPENAPI_CONFIG = {
  openapi: '3.1.0',
  info: {
    title: 'Desh API',
    version: '1.0.0',
    description: [
      "Free, open, bilingual API for Bangladesh: reference data (geo, banks, universities, holidays, hotlines), Bangla language tools, validators, and calculators (income tax, VAT, loans, zakat), today's gold, market and fuel prices, and mobile financial services (bKash, Nagad, Rocket, Upay, TAP).",
      '',
      '- Every response is `{ success, data, meta }`; `meta.source` and `meta.last_updated` say where the data came from.',
      '- Errors are `{ success: false, error: { code, message } }` with a matching HTTP status.',
      '- Numbers can be sent in Latin (1250) or Bangla (১২৫০) digits.',
      '- No API key required for public access (120 req/min, 10,000 req/day). Optional API key (X-API-Key) unlocks higher Developer and Enterprise quotas.',
      '- Validators check formats only and never store or log what you send.',
      '- Gold and market prices are read live (BAJUS, TCB). Where a source cannot be reached, the last list read (within 7 days) is served with `freshness: "last_known"`; with none, the API answers 503 `upstream_unavailable`.',
      '- Where an official source is English-only (bank branches, most universities), `name_bn` is omitted rather than invented.',
    ].join('\n'),
    license: { name: 'Code MIT, data CC BY 4.0' },
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [
    {
      name: 'Geo',
      description:
        'Divisions, districts, upazilas, unions and post offices with English and Bangla names. Sources: BBS geocodes and the Post Office list.',
    },
    {
      name: 'Bangla toolkit',
      description:
        'Number and taka in words, digit conversion, lakh/crore formatting, Bangla calendar dates, ordinals, slugs and Avro Phonetic transliteration.',
    },
    {
      name: 'Phone',
      description:
        'Validate and normalise Bangladesh mobile numbers. The operator is the original prefix allocation; ported numbers cannot be detected.',
    },
    {
      name: 'Convert',
      description: 'Convert text between legacy Bijoy (SutonnyMJ) encoding and Unicode Bangla.',
    },
    {
      name: 'Land',
      description:
        'Convert land measurements (katha, bigha, decimal, acre, …). Sizes of some units vary by region; standard values only.',
    },
    {
      name: 'Validate',
      description:
        'Format checks for NID, vehicle registration plates, e-TIN, VAT BIN and postcodes. Values are never looked up, stored or logged.',
    },
    {
      name: 'Hotlines',
      description:
        'National hotline numbers checked against official government pages. In an emergency, call 999.',
    },
    {
      name: 'Fun',
      description:
        'Traditional proverbs and riddles, quiz questions and history events (each citing its source), and GI-registered traditional foods by district. Pass `seed` for a repeatable pick.',
    },
    {
      name: 'Holidays',
      description:
        'Official government holiday lists (general, executive-order and optional), holiday checks and working-day counts. Only years with a published official list are served; moon-dependent dates are tentative until confirmed.',
    },
    {
      name: 'Finance',
      description:
        'Income tax for individuals from the Finance Act (keyed by tax year; tax year 2027-28 = income earned July 2026 – June 2027), VAT, loan EMI, DPS maturity and statutory gratuity. Every response cites its legal source and carries a disclaimer; these are estimates, not tax, financial or legal advice.',
    },
    {
      name: 'Mock data',
      description:
        'Synthetic Bangladeshi people and addresses for testing apps: bilingual names, format-valid phones and NIDs, example.com emails, and addresses consistent with real upazilas and postcodes. Nothing describes a real person. Pass `seed` for repeatable output.',
    },
    {
      name: 'Banks',
      description:
        'Scheduled banks and their branches from Bangladesh Bank (as on 31 August 2026), by district and upazila, and routing-number lookup. Routing numbers come from a secondary table and are included only when they match the branch and pass the check digit; confirm with your bank before sending money.',
    },
    {
      name: 'Education',
      description:
        'UGC universities, 11 statutory education boards (BISE, Madrasah, Technical) with district jurisdictions, and official GPA 5.0 grading scale reference and exam GPA calculator.',
    },
    {
      name: 'Gold & zakat',
      description:
        'Gold and silver prices read live from the Bangladesh Jewellers Association (BAJUS), per gram and per vori (11.664 g), and a zakat calculator using the classical nisab (7.5 vori gold or 52.5 vori silver).',
    },
    {
      name: 'Market prices',
      description:
        "Today's retail prices of essential goods in Dhaka from the Trading Corporation of Bangladesh (read live from TCB's daily spreadsheet, with English names added), and the government's monthly fuel prices.",
    },
    {
      name: 'MFS',
      description:
        'Mobile Financial Services (bKash, Nagad, Rocket, Upay, TAP) tariff schedules, USSD codes, transaction fee calculator and ranking comparison.',
    },
    {
      name: 'Prayer Times & Ramadan',
      description:
        'Daily 5 prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha), Sehri cutoff, and 30-day Ramadan timetable for all 64 districts based on Islamic Foundation Bangladesh standards.',
    },
    {
      name: 'Dhaka Metro Rail',
      description:
        'Dhaka Metro Rail (MRT Line-6) stations, GPS coordinates, fare calculator with 10% MRT Pass discount, timetables, and line overview from DMTCL.',
    },
    {
      name: 'Health',
      description:
        'National government hospitals, specialized medical institutes, bed capacities, emergency casualty hotlines, and GPS coordinates from DGHS.',
    },
    {
      name: 'Developer',
      description:
        'Developer authentication, API key validation, daily request quotas, and rate limit inspection.',
    },
  ],
};
