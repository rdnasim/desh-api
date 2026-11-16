# Data Model: Weather Signals, Warnings & AQI Reference

## MaritimeSignal
```json
{
  "number": 10,
  "slug": "great-danger-10",
  "name_en": "Great Danger Signal No. 10",
  "name_bn": "মহাবিপদ সংকেত ১০",
  "severity": "extreme",
  "wind_speed_kmh": "89 km/h or higher",
  "meaning_en": "Port will experience severe weather from a cyclonic storm of great intensity that is expected to cross the coast over or near the port.",
  "meaning_bn": "বন্দরটি একটি প্রচণ্ড তীব্রতার ঘূর্ণিঝড়ের কবলে পড়বে এবং এটি বন্দরের উপর দিয়ে বা নিকট দিয়ে উপকূল অতিক্রম করবে।",
  "action_required": "Extreme danger: All port activities suspended; total evacuation to cyclone shelters."
}
```

## RiverportSignal
```json
{
  "number": 2,
  "slug": "warning-2",
  "name_en": "Warning Signal No. 2",
  "name_bn": "হুঁশিয়ারি সংকেত ২",
  "severity": "moderate",
  "wind_speed_kmh": "65–88 km/h",
  "meaning_en": "A squall or storm of wind speed 65–88 km/h will soon affect the riverport area.",
  "meaning_bn": "নদীবন্দর এলাকায় অনধিক ৬৫–৮৮ কিমি/ঘণ্টা বেগে ঝড় বয়ে যেতে পারে।",
  "vessel_guideline": "Vessels of 65 feet or less must stay in shelter; larger vessels may proceed with caution."
}
```

## AqiCategory
```json
{
  "slug": "unhealthy",
  "name_en": "Unhealthy",
  "name_bn": "অস্বাস্থ্যকর",
  "min_aqi": 151,
  "max_aqi": 200,
  "color_hex": "#FF0000",
  "health_implication_en": "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
  "health_implication_bn": "সকলের স্বাস্থ্য ঝুঁকি দেখা দিতে পারে; সংবেদনশীল জনগোষ্ঠীর ক্ষেত্রে মারাত্মক স্বাস্থ্য সমস্যা হতে পারে।",
  "cautionary_statement_en": "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion.",
  "cautionary_statement_bn": "শিশু, বয়োবৃদ্ধ ও শ্বাসকষ্টের রোগীদের দীর্ঘ সময় বাইরে পরিশ্রম পরিহার করা উচিত।"
}
```

## BanglaSeason
```json
{
  "order": 1,
  "slug": "grishma",
  "name_en": "Summer",
  "name_bn": "গ্রীষ্ম",
  "bangla_months": ["বৈশাখ", "জ্যৈষ্ঠ"],
  "approx_gregorian_span": "Mid-April to Mid-June",
  "description_en": "The hottest season with Kalbaishakhi (Nor'wester) storms and seasonal fruit harvests.",
  "description_bn": "বছরের উষ্ণতম ঋতু, কালবৈশাখী ঝড় ও গ্রীষ্মকালীন মৌসুমি ফলের সময়।"
}
```
