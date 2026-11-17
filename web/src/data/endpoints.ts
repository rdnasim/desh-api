import type { ApiEndpoint } from '../types';

export const API_MODULES = [
  'All',
  'Geo',
  'Bangla Toolkit',
  'Prayer & Ramadan',
  'Dhaka Metro',
  'Gold & Zakat',
  'Market & Fuel',
  'Finance',
  'Banks',
  'Education',
  'Health & Hospitals',
  'Weather & AQI',
  'Holidays',
  'MFS',
  'Hotlines',
  'Land',
  'Mock Data',
  'Validation',
  'Constituencies',
  'Bangladesh Railway',
  'Airports & Aviation',
  'Heritage & Tourism',
  'Rivers & Waterways',
  'Ports & Logistics',
  'Bangla NLP',
  'Developer',
] as const;

export const ENDPOINTS: ApiEndpoint[] = [
  // Developer
  {
    id: 'developer-quota',
    module: 'Developer',
    name: 'Check API Quota & Rate Limits',
    nameBn: 'কোটা ও রেট লিমিট নিরীক্ষা',
    method: 'GET',
    path: '/v1/developer/quota',
    defaultPathWithParams: '/v1/developer/quota',
    description:
      'Returns your current tier, remaining daily requests, per-minute rate limit, and reset time.',
  },

  // Geo
  {
    id: 'geo-divisions',
    module: 'Geo',
    name: 'All 8 Administrative Divisions',
    nameBn: 'সকল প্রশাসনিক বিভাগ',
    method: 'GET',
    path: '/v1/divisions',
    defaultPathWithParams: '/v1/divisions',
    description:
      'List all 8 administrative divisions of Bangladesh with English and Bengali names and coordinates.',
  },
  {
    id: 'geo-districts',
    module: 'Geo',
    name: 'Districts by Division or All 64',
    nameBn: '৬৪ জেলা বা বিভাগভিত্তিক তালিকা',
    method: 'GET',
    path: '/v1/districts',
    defaultPathWithParams: '/v1/districts?division=chattogram',
    description:
      'Get all 64 districts or filter by division (dhaka, chattogram, rajshahi, khulna, barishal, sylhet, rangpur, mymensingh).',
    params: [
      {
        name: 'division',
        type: 'string',
        description: 'Division slug (e.g. chattogram, dhaka, sylhet)',
      },
    ],
  },
  {
    id: 'geo-district-single',
    module: 'Geo',
    name: 'District Details by Slug',
    nameBn: 'নির্দিষ্ট জেলার বিস্তারিত',
    method: 'GET',
    path: '/v1/districts/:slug',
    defaultPathWithParams: '/v1/districts/cumilla',
    description: 'Get detailed facts, BBS geocode, and upazila count for a specific district.',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        default: 'cumilla',
        description: 'District slug or legacy spelling (e.g. cumilla, bogura)',
      },
    ],
  },
  {
    id: 'geo-upazilas',
    module: 'Geo',
    name: 'Upazilas (Sub-districts)',
    nameBn: 'উপজেলা তালিকা',
    method: 'GET',
    path: '/v1/upazilas',
    defaultPathWithParams: '/v1/upazilas?district=cumilla',
    description: 'List 495+ upazilas in Bangladesh, filterable by district.',
    params: [
      {
        name: 'district',
        type: 'string',
        description: 'District slug (e.g. cumilla, chattogram, sylhet)',
      },
    ],
  },
  {
    id: 'geo-postcodes',
    module: 'Geo',
    name: 'Lookup Postcode / Post Office',
    nameBn: 'ডাকঘর ও পোস্টকোড অনুসন্ধান',
    method: 'GET',
    path: '/v1/postcodes/:code',
    defaultPathWithParams: '/v1/postcodes/1205',
    description:
      'Find postal office name (English & Bengali), district, and upazila by 4-digit postcode.',
    params: [
      {
        name: 'code',
        type: 'string',
        required: true,
        default: '1205',
        description: '4-digit postal code (e.g. 1205, 3500)',
      },
    ],
  },
  {
    id: 'geo-search',
    module: 'Geo',
    name: 'Search Places (Bilingual & Phonetic)',
    nameBn: 'দ্বিভাষিক স্থান অনুসন্ধান',
    method: 'GET',
    path: '/v1/search',
    defaultPathWithParams: '/v1/search?q=comilla',
    description:
      'Fast fuzzy search across divisions, districts, upazilas, and unions with English and Bangla spelling support.',
    params: [
      {
        name: 'q',
        type: 'string',
        required: true,
        default: 'comilla',
        description: 'Search query in English or Bangla',
      },
    ],
  },

  // Prayer & Ramadan
  {
    id: 'prayer-times',
    module: 'Prayer & Ramadan',
    name: 'Daily 5 Prayer Times & Sehri Cutoff',
    nameBn: 'দৈনিক ৫ ওয়াক্ত নামাজের সময় ও সাহরি',
    method: 'GET',
    path: '/v1/prayer/times',
    defaultPathWithParams: '/v1/prayer/times?district=dhaka',
    description:
      'Astronomical Islamic prayer times for Fajr, Dhuhr, Asr, Maghrib, Isha, Sunrise & Iftar for all 64 districts.',
    params: [
      {
        name: 'district',
        type: 'string',
        default: 'dhaka',
        description: 'District slug (e.g. dhaka, sylhet, rajshahi)',
      },
      { name: 'date', type: 'string', description: 'YYYY-MM-DD (defaults to today)' },
    ],
  },
  {
    id: 'prayer-ramadan',
    module: 'Prayer & Ramadan',
    name: '30-Day Ramadan Timetable',
    nameBn: '৩০ দিনের মাহে রমজানের সময়সূচি',
    method: 'GET',
    path: '/v1/prayer/ramadan',
    defaultPathWithParams: '/v1/prayer/ramadan?district=dhaka',
    description:
      'Complete 30-day Ramadan calendar with Islamic Foundation Bangladesh Sehri and Iftar cutoffs.',
    params: [{ name: 'district', type: 'string', default: 'dhaka', description: 'District slug' }],
  },

  // Dhaka Metro
  {
    id: 'metro-stations',
    module: 'Dhaka Metro',
    name: 'MRT Line-6 Stations & Timetables',
    nameBn: 'মেট্রোরেলের স্টেশন ও সময়সূচি',
    method: 'GET',
    path: '/v1/metro/stations',
    defaultPathWithParams: '/v1/metro/stations',
    description:
      'Official list of 16 MRT Line-6 stations with GPS coordinates, transfer hubs, and train schedules.',
  },
  {
    id: 'metro-fare',
    module: 'Dhaka Metro',
    name: 'Metro Rail Fare Calculator',
    nameBn: 'মেট্রোরেলের ভাড়া ক্যালকুলেটর',
    method: 'GET',
    path: '/v1/metro/fare',
    defaultPathWithParams: '/v1/metro/fare?from=uttara-north&to=motijheel',
    description:
      'Calculate official single-journey ticket and Rapid Pass / MRT Pass discounted fare (10% off).',
    params: [
      {
        name: 'from',
        type: 'string',
        required: true,
        default: 'uttara-north',
        description: 'Origin station slug',
      },
      {
        name: 'to',
        type: 'string',
        required: true,
        default: 'motijheel',
        description: 'Destination station slug',
      },
    ],
  },

  // Gold & Zakat
  {
    id: 'gold-prices',
    module: 'Gold & Zakat',
    name: 'BAJUS Today Gold & Silver Prices',
    nameBn: 'বাজুস আজকের স্বর্ণ ও রৌপ্যের দাম',
    method: 'GET',
    path: '/v1/gold/prices',
    defaultPathWithParams: '/v1/gold/prices',
    description:
      'Real-time gold and silver prices from Bangladesh Jewellers Association (22K, 21K, 18K, Traditional) per gram and vori.',
  },
  {
    id: 'gold-zakat',
    module: 'Gold & Zakat',
    name: 'Zakat Calculator with Live Nisab',
    nameBn: 'লাইভ নিসাবভিত্তিক যাকাত ক্যালকুলেটর',
    method: 'GET',
    path: '/v1/zakat',
    defaultPathWithParams: '/v1/zakat?wealth=1000000',
    description:
      'Calculate Islamic Zakat (2.5%) evaluated against live Nisab threshold (7.5 vori gold or 52.5 vori silver).',
    params: [
      {
        name: 'wealth',
        type: 'number',
        required: true,
        default: '1000000',
        description: 'Net zakatable cash/wealth in BDT',
      },
    ],
  },

  // Market & Fuel Prices
  {
    id: 'market-prices',
    module: 'Market & Fuel',
    name: 'TCB Essential Commodities Retail Prices',
    nameBn: 'টিসিবি নিত্যপ্রয়োজনীয় বাজারদর',
    method: 'GET',
    path: '/v1/market/prices',
    defaultPathWithParams: '/v1/market/prices?category=edible-oil',
    description:
      'Daily retail commodity prices in Dhaka from Trading Corporation of Bangladesh (rice, oil, lentils, onions, beef, fish).',
    params: [
      {
        name: 'category',
        type: 'string',
        default: 'edible-oil',
        description: 'Category (rice, edible-oil, pulses, spices, meat-fish)',
      },
    ],
  },
  {
    id: 'fuel-prices',
    module: 'Market & Fuel',
    name: 'Government Automated Fuel Prices',
    nameBn: 'সরকারি জ্বালানি তেলের মূল্য',
    method: 'GET',
    path: '/v1/fuel/prices',
    defaultPathWithParams: '/v1/fuel/prices',
    description:
      'Current BPC automated monthly fuel tariff for Diesel, Kerosene, Octane, and Petrol.',
  },

  // Bangla Toolkit
  {
    id: 'bangla-taka-words',
    module: 'Bangla Toolkit',
    name: 'Currency / Taka in Words (টাকা কথায়)',
    nameBn: 'টাকা কথায় রূপান্তর',
    method: 'GET',
    path: '/v1/bangla/taka-in-words',
    defaultPathWithParams: '/v1/bangla/taka-in-words?amount=1250.50',
    description: 'Convert numeric amounts into formal Bengali currency words with Poisha support.',
    params: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        default: '1250.50',
        description: 'Amount in Taka (supports decimals and Bangla numerals)',
      },
    ],
  },
  {
    id: 'bangla-num-words',
    module: 'Bangla Toolkit',
    name: 'Number in Bengali Words (সংখ্যা কথায়)',
    nameBn: 'সংখ্যা কথায় রূপান্তর',
    method: 'GET',
    path: '/v1/bangla/num-to-words',
    defaultPathWithParams: '/v1/bangla/num-to-words?n=987654321',
    description: 'Convert numbers up to 100 Crore into standard Bengali words.',
    params: [
      {
        name: 'n',
        type: 'number',
        required: true,
        default: '987654321',
        description: 'Number to convert',
      },
    ],
  },
  {
    id: 'bangla-date',
    module: 'Bangla Toolkit',
    name: 'Bangla Calendar Date Converter',
    nameBn: 'বঙ্গাব্দ ও বাংলা পঞ্জিকা তারিখ',
    method: 'GET',
    path: '/v1/bangla/date',
    defaultPathWithParams: '/v1/bangla/date',
    description:
      'Get today or convert any Gregorian date to revised Bengali Academy calendar (Bongabdo, season, month).',
    params: [
      { name: 'date', type: 'string', description: 'YYYY-MM-DD (defaults to current date)' },
    ],
  },
  {
    id: 'bangla-transliterate',
    module: 'Bangla Toolkit',
    name: 'Avro Phonetic Transliteration',
    nameBn: 'অভ্র ফোনেটিক রূপান্তর',
    method: 'GET',
    path: '/v1/bangla/transliterate',
    defaultPathWithParams: '/v1/bangla/transliterate?text=ami%20banglay%20gaan%20gai',
    description: 'Phonetic English typing to clean Unicode Bangla conversion powered by Avro.',
    params: [
      {
        name: 'text',
        type: 'string',
        required: true,
        default: 'ami banglay gaan gai',
        description: 'Phonetic text',
      },
    ],
  },

  // Finance
  {
    id: 'finance-tax',
    module: 'Finance',
    name: 'Income Tax Calculator (Finance Act)',
    nameBn: 'আয়কর হিসাব (অর্থ আইন ২০২৬)',
    method: 'GET',
    path: '/v1/finance/income-tax',
    defaultPathWithParams:
      '/v1/finance/income-tax?income=1200000&employment_income=1200000&taxpayer=general',
    description:
      'Calculate progressive income tax slabs, rebates, and minimum tax for general, female, senior, and disabled taxpayers.',
    params: [
      {
        name: 'income',
        type: 'number',
        required: true,
        default: '1200000',
        description: 'Total gross annual income',
      },
      {
        name: 'employment_income',
        type: 'number',
        default: '1200000',
        description: 'Salaried employment income',
      },
      {
        name: 'taxpayer',
        type: 'string',
        default: 'general',
        options: ['general', 'female', 'senior', 'disabled', 'gazetted_freedom_fighter'],
        description: 'Taxpayer category',
      },
    ],
  },
  {
    id: 'finance-emi',
    module: 'Finance',
    name: 'Bank Loan EMI & Repayment Schedule',
    nameBn: 'ব্যাংক লোন ইএমআই ও কিস্তি',
    method: 'GET',
    path: '/v1/finance/emi',
    defaultPathWithParams: '/v1/finance/emi?principal=1000000&rate=9&months=60',
    description: 'Calculate Equated Monthly Installment (EMI), total interest, and amortization.',
    params: [
      {
        name: 'principal',
        type: 'number',
        required: true,
        default: '1000000',
        description: 'Loan principal in BDT',
      },
      {
        name: 'rate',
        type: 'number',
        required: true,
        default: '9',
        description: 'Annual interest rate (%)',
      },
      {
        name: 'months',
        type: 'number',
        required: true,
        default: '60',
        description: 'Tenure in months',
      },
    ],
  },

  // Banks & Routing
  {
    id: 'bank-routing',
    module: 'Banks',
    name: '9-Digit Routing Number Lookup',
    nameBn: 'ব্যাংক রাউটিং নম্বর তথ্য',
    method: 'GET',
    path: '/v1/routing/:routing',
    defaultPathWithParams: '/v1/routing/010130065',
    description:
      'Inspect bank name, branch, district, and check digit validity for any Bangladesh BEFTN routing code.',
    params: [
      {
        name: 'routing',
        type: 'string',
        required: true,
        default: '010130065',
        description: '9-digit BEFTN routing number',
      },
    ],
  },
  {
    id: 'bank-list',
    module: 'Banks',
    name: 'Scheduled Banks Directory',
    nameBn: 'বাংলাদেশ ব্যাংকের তফসিলি ব্যাংক তালিকা',
    method: 'GET',
    path: '/v1/banks',
    defaultPathWithParams: '/v1/banks?category=state_owned_commercial',
    description:
      'All 61 scheduled commercial, specialized, and foreign banks registered with Bangladesh Bank.',
    params: [
      {
        name: 'category',
        type: 'string',
        options: [
          'state_owned_commercial',
          'private_commercial',
          'foreign_commercial',
          'specialized',
        ],
        description: 'Bank category',
      },
    ],
  },

  // Education
  {
    id: 'edu-boards',
    module: 'Education',
    name: '11 Statutory Education Boards',
    nameBn: '১১টি শিক্ষাবোর্ড ও এখতিয়ারভুক্ত জেলা',
    method: 'GET',
    path: '/v1/education/boards',
    defaultPathWithParams: '/v1/education/boards',
    description:
      'All 9 General BISE, Madrasah, and Technical education boards, jurisdictional districts, and contact portals.',
  },
  {
    id: 'edu-universities',
    module: 'Education',
    name: 'UGC Universities Directory',
    nameBn: 'ইউজিসি অনুমোদিত বিশ্ববিদ্যালয়',
    method: 'GET',
    path: '/v1/universities',
    defaultPathWithParams: '/v1/universities?category=public',
    description: 'Public, private, and international universities approved by UGC Bangladesh.',
    params: [
      {
        name: 'category',
        type: 'string',
        default: 'public',
        options: ['public', 'private', 'international'],
        description: 'University category',
      },
    ],
  },

  // Health & Hospitals
  {
    id: 'health-emergency',
    module: 'Health & Hospitals',
    name: '24/7 National Emergency Hospitals',
    nameBn: '২৪/৭ জরুরি সরকারি হাসপাতাল',
    method: 'GET',
    path: '/v1/health/emergency',
    defaultPathWithParams: '/v1/health/emergency',
    description:
      '24-hour trauma, burn, pediatric, cardiac, and general emergency hotlines and hospital directories.',
  },
  {
    id: 'health-hospitals',
    module: 'Health & Hospitals',
    name: 'National Hospitals & Institutes',
    nameBn: 'জাতীয় ইনস্টিটিউট ও মেডিকেল কলেজ',
    method: 'GET',
    path: '/v1/health/hospitals',
    defaultPathWithParams: '/v1/health/hospitals?type=medical_college',
    description:
      'Directory of major government hospitals with bed capacity and GPS coordinates from DGHS.',
    params: [
      {
        name: 'type',
        type: 'string',
        default: 'medical_college',
        options: ['specialized_institute', 'medical_college', 'district_sadar', 'general_hospital'],
        description: 'Hospital type',
      },
    ],
  },

  // Weather & Disaster Signals
  {
    id: 'weather-maritime',
    module: 'Weather & AQI',
    name: 'BMD Maritime Storm Signals (1–11)',
    nameBn: 'আবহাওয়া অধিদপ্তর সমুদ্র দূরবর্তী ও মহাবিপদ সংকেত',
    method: 'GET',
    path: '/v1/weather/signals/maritime',
    defaultPathWithParams: '/v1/weather/signals/maritime',
    description:
      'Official BMD 1-11 cautionary, warning, danger, and great danger signal meanings and protocols.',
  },
  {
    id: 'weather-seasons',
    module: 'Weather & AQI',
    name: 'Six Bangla Traditional Seasons (ষড়ঋতু)',
    nameBn: 'বাংলার ঐতিহ্যবাহী ষড়ঋতু ও মাস',
    method: 'GET',
    path: '/v1/weather/seasons',
    defaultPathWithParams: '/v1/weather/seasons',
    description:
      'Grishma, Barsha, Sharat, Hemanta, Sheet, and Basanta with corresponding Bengali and Gregorian months.',
  },

  // Holidays
  {
    id: 'holidays-list',
    module: 'Holidays',
    name: 'Official Bangladesh Public Holidays',
    nameBn: 'সরকারি ছুটির তালিকা',
    method: 'GET',
    path: '/v1/holidays',
    defaultPathWithParams: '/v1/holidays?year=2027',
    description:
      'Official Ministry of Public Administration holiday calendar with executive-order, general, and optional religious dates.',
    params: [{ name: 'year', type: 'number', default: '2027', description: 'Year (e.g. 2027)' }],
  },
  {
    id: 'holidays-check',
    module: 'Holidays',
    name: 'Is It a Holiday? (আজ কি সরকারি ছুটি?)',
    nameBn: 'ছুটি যাচাই',
    method: 'GET',
    path: '/v1/is-holiday',
    defaultPathWithParams: '/v1/is-holiday?date=2027-12-16',
    description: 'Quick check if a specific date is a weekend or official government holiday.',
    params: [
      {
        name: 'date',
        type: 'string',
        required: true,
        default: '2027-12-16',
        description: 'Date in YYYY-MM-DD',
      },
    ],
  },

  // MFS
  {
    id: 'mfs-providers',
    module: 'MFS',
    name: 'MFS Providers & USSD Dial Codes',
    nameBn: 'বিকাশ, নগদ, রকেট ইউএসএসডি কোড',
    method: 'GET',
    path: '/v1/mfs/providers',
    defaultPathWithParams: '/v1/mfs/providers',
    description:
      'Registered mobile financial service providers (bKash, Nagad, Rocket, Upay, TAP) with official USSD codes.',
  },
  {
    id: 'mfs-compare',
    module: 'MFS',
    name: 'MFS Cash-Out Fee Comparison',
    nameBn: 'ক্যাশ আউট চার্জ তুলনা',
    method: 'GET',
    path: '/v1/mfs/compare',
    defaultPathWithParams: '/v1/mfs/compare?amount=5000&action=cash-out&channel=app',
    description:
      'Compare exact transaction fee rankings across bKash, Nagad, Rocket, and Upay for app vs USSD.',
    params: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        default: '5000',
        description: 'Transaction amount',
      },
      {
        name: 'action',
        type: 'string',
        default: 'cash-out',
        options: ['cash-out', 'send-money'],
        description: 'Transaction action',
      },
      {
        name: 'channel',
        type: 'string',
        default: 'app',
        options: ['app', 'ussd'],
        description: 'Channel used',
      },
    ],
  },

  // Hotlines
  {
    id: 'hotlines-list',
    module: 'Hotlines',
    name: 'National Emergency & Service Hotlines',
    nameBn: 'জাতীয় জরুরি হটলাইন (৯৯৯, ৩৩৩, ১০৯)',
    method: 'GET',
    path: '/v1/hotlines',
    defaultPathWithParams: '/v1/hotlines?category=emergency',
    description:
      'Verified official emergency hotlines (999, 333, 109, 106, 16122) with verification timestamps.',
    params: [
      {
        name: 'category',
        type: 'string',
        default: 'emergency',
        options: ['emergency', 'helpline', 'women_children', 'legal_aid', 'disaster'],
        description: 'Category',
      },
    ],
  },

  // Land
  {
    id: 'land-convert',
    module: 'Land',
    name: 'Bangladeshi Land Unit Converter',
    nameBn: 'জমি পরিমাপ ও একক রূপান্তর',
    method: 'GET',
    path: '/v1/land/convert',
    defaultPathWithParams: '/v1/land/convert?value=5&from=katha&to=sqft',
    description:
      'Convert between Katha, Bigha, Shotok / Decimal, Acre, Square Feet, and Square Metres.',
    params: [
      { name: 'value', type: 'number', required: true, default: '5', description: 'Numeric value' },
      {
        name: 'from',
        type: 'string',
        required: true,
        default: 'katha',
        options: ['katha', 'bigha', 'decimal', 'acre', 'sqft', 'sqm'],
        description: 'From unit',
      },
      {
        name: 'to',
        type: 'string',
        required: true,
        default: 'sqft',
        options: ['sqft', 'katha', 'bigha', 'decimal', 'acre', 'sqm'],
        description: 'To unit',
      },
    ],
  },

  // Mock Data
  {
    id: 'mock-people',
    module: 'Mock Data',
    name: 'Synthetic Bangladeshi People Generator',
    nameBn: 'টেস্টিং ডামি বাংলাদেশি ডাটা জেনারেটর',
    method: 'GET',
    path: '/v1/mock/people',
    defaultPathWithParams: '/v1/mock/people?count=3&seed=demo',
    description:
      'Generate synthetic developer test profiles with realistic Bengali names, format-valid phones, NIDs, and addresses.',
    params: [
      { name: 'count', type: 'number', default: '3', description: 'Number of records (max 50)' },
      {
        name: 'seed',
        type: 'string',
        default: 'demo',
        description: 'Seed for deterministic repeatable mock data',
      },
    ],
  },

  // Validation
  {
    id: 'validate-postcode',
    module: 'Validation',
    name: 'Validate Postcode Format',
    nameBn: 'পোস্টকোড ফরম্যাট যাচাই',
    method: 'GET',
    path: '/v1/validate/postcode/:code',
    defaultPathWithParams: '/v1/validate/postcode/1205',
    description: 'Validates 4-digit postcodes in Latin or Bengali digits.',
    params: [
      {
        name: 'code',
        type: 'string',
        required: true,
        default: '1205',
        description: 'Postcode to check',
      },
    ],
  },

  // Constituencies
  {
    id: 'constituencies-list',
    module: 'Constituencies',
    name: '300 Parliamentary Constituencies (Jatiya Sangsad)',
    nameBn: '৩০০ জাতীয় সংসদীয় আসন ও সীমানা',
    method: 'GET',
    path: '/v1/constituencies',
    defaultPathWithParams: '/v1/constituencies?district=dhaka',
    description:
      'All 300 single-member territorial constituencies of Jatiya Sangsad with official seat numbers (1-300), English/Bengali names, and administrative boundaries.',
    params: [
      {
        name: 'district',
        type: 'string',
        default: 'dhaka',
        description: 'Filter by district slug (e.g. dhaka, cumilla, sylhet)',
      },
      { name: 'division', type: 'string', description: 'Filter by division slug' },
    ],
  },
  {
    id: 'constituencies-single',
    module: 'Constituencies',
    name: 'Constituency by Number or Slug',
    nameBn: 'নির্দিষ্ট সংসদীয় আসনের বিস্তারিত',
    method: 'GET',
    path: '/v1/constituencies/:id',
    defaultPathWithParams: '/v1/constituencies/dhaka-10',
    description: 'Lookup constituency details by seat number (e.g. 183) or slug (e.g. dhaka-10).',
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
        default: 'dhaka-10',
        description: 'Seat number (1-300) or slug (e.g. dhaka-10)',
      },
    ],
  },

  // Bangladesh Railway
  {
    id: 'railway-trains',
    module: 'Bangladesh Railway',
    name: 'Intercity Express Trains & Schedules',
    nameBn: 'আন্তঃনগর এক্সপ্রেস ট্রেন ও সাপ্তাহিক বন্ধ',
    method: 'GET',
    path: '/v1/railway/trains',
    defaultPathWithParams: '/v1/railway/trains?origin=dhaka',
    description:
      'Bangladesh Railway intercity train directory with train numbers, origin, destination, departure/arrival times, and off-days.',
    params: [
      { name: 'origin', type: 'string', default: 'dhaka', description: 'Origin city or station' },
      { name: 'destination', type: 'string', description: 'Destination city or station' },
    ],
  },
  {
    id: 'railway-stations',
    module: 'Bangladesh Railway',
    name: 'Major Railway Junction Stations',
    nameBn: 'প্রধান রেলওয়ে জংশন ও স্টেশন',
    method: 'GET',
    path: '/v1/railway/stations',
    defaultPathWithParams: '/v1/railway/stations?division=dhaka',
    description:
      'Major railway stations and junctions with division, gauge (broad, meter, dual), and station codes.',
    params: [{ name: 'division', type: 'string', default: 'dhaka', description: 'Division slug' }],
  },

  // Airports & Aviation
  {
    id: 'airports-list',
    module: 'Airports & Aviation',
    name: 'Airports & CAAB Aviation Facilities',
    nameBn: 'আন্তর্জাতিক ও অভ্যন্তরীণ বিমানবন্দরসমূহ',
    method: 'GET',
    path: '/v1/airports',
    defaultPathWithParams: '/v1/airports?type=international',
    description:
      'Civil Aviation Authority of Bangladesh (CAAB) directory of international and domestic airports with IATA/ICAO codes, runway lengths, and coordinates.',
    params: [
      {
        name: 'type',
        type: 'string',
        default: 'international',
        description: 'international, domestic, short_takeoff, military_airstrip',
      },
      {
        name: 'division',
        type: 'string',
        description: 'Division slug (e.g. dhaka, chattogram, sylhet)',
      },
    ],
  },
  {
    id: 'airports-lookup',
    module: 'Airports & Aviation',
    name: 'Airport Details by IATA/ICAO Code',
    nameBn: 'আইএটিএ বা আইসিএও কোড অনুযায়ী বিমানবন্দর',
    method: 'GET',
    path: '/v1/airports/:identifier',
    defaultPathWithParams: '/v1/airports/DAC',
    description:
      'Look up complete airport details by IATA code (e.g. DAC, CGP, ZYL), ICAO code (e.g. VGHS, VGEG), or slug.',
    params: [
      {
        name: 'identifier',
        type: 'string',
        default: 'DAC',
        description: 'IATA code, ICAO code, or slug',
      },
    ],
  },

  // Heritage & Tourism
  {
    id: 'heritage-list',
    module: 'Heritage & Tourism',
    name: 'Heritage Sites & Tourist Destinations',
    nameBn: 'ঐতিহাসিক ও দর্শনীয় পর্যটন স্থানসমূহ',
    method: 'GET',
    path: '/v1/heritage',
    defaultPathWithParams: '/v1/heritage?type=unesco_world_heritage',
    description:
      'UNESCO World Heritage sites, archaeological monuments, eco-tourism reserves, and national landmarks verified against Department of Archaeology and BPC.',
    params: [
      {
        name: 'type',
        type: 'string',
        default: 'unesco_world_heritage',
        description: 'unesco_world_heritage, national_heritage, eco_tourism, landmark',
      },
      {
        name: 'category',
        type: 'string',
        description: 'archaeological, historical, natural, cultural, monument',
      },
      {
        name: 'division',
        type: 'string',
        description: 'Division slug (e.g. rajshahi, khulna, chattogram, dhaka)',
      },
      {
        name: 'q',
        type: 'string',
        description: 'Search by site name, description, or historical period',
      },
    ],
  },
  {
    id: 'heritage-lookup',
    module: 'Heritage & Tourism',
    name: 'Heritage Site Details by Slug or UNESCO ID',
    nameBn: 'স্লাগ বা ইউনেস্কো আইডি অনুযায়ী ঐতিহাসিক স্থান',
    method: 'GET',
    path: '/v1/heritage/:identifier',
    defaultPathWithParams: '/v1/heritage/somapura-mahavihara',
    description:
      'Look up detailed historical era, entry fees, highlights, and coordinates by slug (e.g. somapura-mahavihara, shat-gombuj-mosque, sundarbans) or UNESCO ID (322, 421, 798).',
    params: [
      {
        name: 'identifier',
        type: 'string',
        default: 'somapura-mahavihara',
        description: 'Site slug or UNESCO ID (e.g. somapura-mahavihara, 322, sundarbans)',
      },
    ],
  },

  // Rivers & Waterways
  {
    id: 'rivers-list',
    module: 'Rivers & Waterways',
    name: 'Major Rivers of Bangladesh (নদীমাতৃক বাংলাদেশ)',
    nameBn: 'বাংলাদেশের প্রধান নদ-নদীসমূহ',
    method: 'GET',
    path: '/v1/rivers',
    defaultPathWithParams: '/v1/rivers?division=dhaka',
    description:
      'Directory of principal rivers, origins, outflows, traversed districts, lengths, and transboundary relations verified against Bangladesh Water Development Board (BWDB).',
    params: [
      {
        name: 'division',
        type: 'string',
        default: 'dhaka',
        description: 'Division slug (e.g. dhaka, chattogram, rajshahi, sylhet)',
      },
      {
        name: 'district',
        type: 'string',
        description: 'District slug (e.g. kurigram, chandpur, bogura)',
      },
      {
        name: 'is_transboundary',
        type: 'string',
        description: 'Filter by transboundary status: "true" or "false"',
      },
      {
        name: 'q',
        type: 'string',
        description: 'Search by river name, origin, outflow, or description',
      },
    ],
  },
  {
    id: 'rivers-lookup',
    module: 'Rivers & Waterways',
    name: 'River Details by Slug',
    nameBn: 'স্লাগ অনুযায়ী নদীর বিস্তারিত তথ্য',
    method: 'GET',
    path: '/v1/rivers/:slug',
    defaultPathWithParams: '/v1/rivers/padma',
    description:
      'Look up comprehensive river details including origins, outflows, traversed districts, tributaries, and special features by slug (e.g. padma, meghna, jamuna, halda, karnaphuli).',
    params: [
      {
        name: 'slug',
        type: 'string',
        default: 'padma',
        description: 'River slug (e.g. padma, meghna, jamuna, halda, karnaphuli)',
      },
    ],
  },
  {
    id: 'ports-land-list',
    module: 'Ports & Logistics',
    name: 'Statutory Land Ports & Customs Stations',
    nameBn: 'বাংলাদেশ স্থলবন্দর ও কাস্টমস স্টেশনসমূহ',
    method: 'GET',
    path: '/v1/ports/land',
    defaultPathWithParams: '/v1/ports/land?status=operational',
    description:
      'Directory of Bangladesh Land Port Authority (BLPA) declared statutory land ports and border customs stations with Indian/Myanmar LCS counterparts, rail linkages, and key trade commodities.',
    params: [
      {
        name: 'division',
        type: 'string',
        description: 'Division slug (e.g. khulna, rangpur, sylhet, chattogram)',
      },
      {
        name: 'district',
        type: 'string',
        description: 'District slug (e.g. jashore, lalmonirhat, sylhet, chapai-nawabganj)',
      },
      {
        name: 'status',
        type: 'string',
        default: 'operational',
        description: 'Port status: operational, under_development, or proposed',
      },
      {
        name: 'has_rail_link',
        type: 'string',
        description: 'Filter by rail link availability: "true" or "false"',
      },
      {
        name: 'has_passenger_immigration',
        type: 'string',
        description: 'Filter by passenger immigration facility: "true" or "false"',
      },
      {
        name: 'q',
        type: 'string',
        description: 'Search by port name, 3-letter code, Indian counterpart LCS, or commodities',
      },
    ],
  },
  {
    id: 'ports-land-lookup',
    module: 'Ports & Logistics',
    name: 'Land Port Details by Code or Slug',
    nameBn: 'কোড বা স্লাগ অনুযায়ী স্থলবন্দরের বিস্তারিত',
    method: 'GET',
    path: '/v1/ports/land/:identifier',
    defaultPathWithParams: '/v1/ports/land/BEN',
    description:
      'Look up comprehensive land port details by its 3-letter code (e.g. BEN, BUR, TAM, BHM, HIL) or slug (e.g. benapole, burimari, tamabil).',
    params: [
      {
        name: 'identifier',
        type: 'string',
        default: 'BEN',
        description: '3-letter port code (BEN, BUR, TAM) or slug (benapole, burimari)',
      },
    ],
  },

  // Bangla NLP
  {
    id: 'nlp-stopwords',
    module: 'Bangla NLP',
    name: 'List Bangla Stopwords',
    nameBn: 'বাংলা স্টপওয়ার্ড তালিকা',
    method: 'GET',
    path: '/v1/nlp/stopwords',
    defaultPathWithParams: '/v1/nlp/stopwords?category=conjunction',
    description:
      'Curated corpus of 500+ high-frequency Bengali functional stopwords categorized by part-of-speech (conjunctions, pronouns, adverbs, postpositions, auxiliaries).',
    params: [
      {
        name: 'category',
        type: 'string',
        default: 'conjunction',
        description: 'Filter by grammatical category (e.g. conjunction, pronoun, adverb, postposition)',
      },
      {
        name: 'limit',
        type: 'number',
        default: '50',
        description: 'Maximum number of stopwords to return',
      },
    ],
  },
  {
    id: 'nlp-stopwords-remove',
    module: 'Bangla NLP',
    name: 'Remove Stopwords from Text',
    nameBn: 'টেক্সট থেকে স্টপওয়ার্ড অপসারণ',
    method: 'POST',
    path: '/v1/nlp/stopwords/remove',
    defaultPathWithParams: '/v1/nlp/stopwords/remove',
    description:
      'Strips canonical Bengali functional stopwords from input text and reports inventory of removed tokens.',
  },
  {
    id: 'nlp-normalize',
    module: 'Bangla NLP',
    name: 'Normalize Bangla Text',
    nameBn: 'বাংলা ইউনিকোড টেক্সট নরমালাইজার',
    method: 'POST',
    path: '/v1/nlp/normalize',
    defaultPathWithParams: '/v1/nlp/normalize',
    description:
      'Normalizes Bengali text to canonical Unicode NFC representation, cleans redundant zero-width joiners/non-joiners, composite nukta glyphs (ড়, ঢ়, য়), and standardizes spacing.',
  },
  {
    id: 'nlp-tokenize',
    module: 'Bangla NLP',
    name: 'Tokenize Words or Sentences',
    nameBn: 'শব্দ ও বাক্য টোকেনাইজার',
    method: 'POST',
    path: '/v1/nlp/tokenize',
    defaultPathWithParams: '/v1/nlp/tokenize',
    description:
      'Linguistically splits Bengali text into sentence tokens (delimited by Dari "।", Double Dari "॥", "?", "!", and line breaks) or word tokens respecting conjunctive ligatures.',
  },
  {
    id: 'nlp-stem',
    module: 'Bangla NLP',
    name: 'Affix-Stripping Stemmer',
    nameBn: 'বাংলা প্রত্যয় বিচ্ছেদ ও স্টেমার',
    method: 'POST',
    path: '/v1/nlp/stem',
    defaultPathWithParams: '/v1/nlp/stem',
    description:
      'Deterministic rule-based stemmer that strips common nominal case markers (-দেরকে, -গুলোকে, -য়ের), plural suffixes (-গুলো, -গণ, -সমূহ), and verbal inflections (-ছিলেন, -ছেন, -লেন).',
  },
];
