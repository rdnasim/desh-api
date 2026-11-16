# Data Model: Bangladesh Railway Intercity Directory

## RailwayTrain
```json
{
  "number": "701",
  "slug": "suborno-express-701",
  "name_en": "Suborno Express",
  "name_bn": "সুবর্ণ এক্সপ্রেস",
  "origin_station": "chattogram",
  "destination_station": "dhaka",
  "origin_city": "Chattogram",
  "destination_city": "Dhaka",
  "departure_time": "07:00",
  "arrival_time": "12:15",
  "off_day_en": "Monday",
  "off_day_bn": "সোমবার",
  "classes": ["S_CHAIR", "SNIGDHA"],
  "major_halts": [
    "Chattogram",
    "Dhaka Airport",
    "Dhaka (Kamalapur)"
  ]
}
```

## RailwayClass
```json
{
  "code": "SNIGDHA",
  "slug": "snigdha",
  "name_en": "Snigdha (AC Chair)",
  "name_bn": "স্নিগ্ধা (এসি চেয়ার)",
  "is_ac": true,
  "description_en": "Air-conditioned chair car seating with reclining seats.",
  "description_bn": "শীতাতপ নিয়ন্ত্রিত চেয়ার কার আসন।"
}
```

## RailwayStation
```json
{
  "code": "DA",
  "slug": "dhaka",
  "name_en": "Dhaka Railway Station (Kamalapur)",
  "name_bn": "ঢাকা রেলওয়ে স্টেশন (কমলাপুর)",
  "division": "dhaka",
  "district": "dhaka",
  "coordinates": {
    "latitude": 23.7314,
    "longitude": 90.4267
  }
}
```
