import aqiCategories from '../../generated/weather.aqi-categories';
import maritimeSignals from '../../generated/weather.maritime-signals';
import riverportSignals from '../../generated/weather.riverport-signals';
import seasons from '../../generated/weather.seasons';
import type {
  AqiCategory,
  AqiLookupResponse,
  BanglaSeason,
  MaritimeSignal,
  RiverportSignal,
} from './schemas';

// Signals ordered by number 1..11 and 1..4
const sortedMaritime = [...maritimeSignals].sort((a, b) => a.number - b.number);
const maritimeByNumber = new Map(sortedMaritime.map((s) => [s.number, s]));
const maritimeBySlug = new Map(sortedMaritime.map((s) => [s.slug, s]));

const sortedRiverport = [...riverportSignals].sort((a, b) => a.number - b.number);
const riverportByNumber = new Map(sortedRiverport.map((s) => [s.number, s]));
const riverportBySlug = new Map(sortedRiverport.map((s) => [s.slug, s]));

// AQI ordered ascending by min_aqi
const sortedAqi = [...aqiCategories].sort((a, b) => a.min_aqi - b.min_aqi);
const aqiBySlug = new Map(sortedAqi.map((a) => [a.slug, a]));

// Seasons ordered 1..6
const sortedSeasons = [...seasons].sort((a, b) => a.order - b.order);
const seasonBySlug = new Map(sortedSeasons.map((s) => [s.slug, s]));
const seasonByOrder = new Map(sortedSeasons.map((s) => [s.order, s]));

export function listMaritimeSignals(): MaritimeSignal[] {
  return sortedMaritime;
}

export function getMaritimeSignal(key: number | string): MaritimeSignal | undefined {
  if (typeof key === 'number') return maritimeByNumber.get(key);
  const num = parseInt(key, 10);
  if (!isNaN(num) && maritimeByNumber.has(num)) return maritimeByNumber.get(num);
  return maritimeBySlug.get(key.toLowerCase().trim());
}

export function listRiverportSignals(): RiverportSignal[] {
  return sortedRiverport;
}

export function getRiverportSignal(key: number | string): RiverportSignal | undefined {
  if (typeof key === 'number') return riverportByNumber.get(key);
  const num = parseInt(key, 10);
  if (!isNaN(num) && riverportByNumber.has(num)) return riverportByNumber.get(num);
  return riverportBySlug.get(key.toLowerCase().trim());
}

export function listAqiCategories(): AqiCategory[] {
  return sortedAqi;
}

export function getAqiCategory(slug: string): AqiCategory | undefined {
  return aqiBySlug.get(slug.toLowerCase().trim());
}

export function lookupAqi(aqiValue: number): AqiLookupResponse | undefined {
  if (aqiValue < 0) return undefined;

  let category = sortedAqi.find((c) => aqiValue >= c.min_aqi && aqiValue <= c.max_aqi);
  // Values above 500 fall into hazardous category
  if (!category && aqiValue > 500) {
    category = aqiBySlug.get('hazardous');
  }
  if (!category) return undefined;

  let recEn = 'Air quality is acceptable for outdoor activity.';
  let recBn = 'বাইরে স্বাভাবিক চলাচলের জন্য বাতাসের মান উপযোগী।';

  if (category.slug === 'caution') {
    recEn = 'Sensitive individuals should limit prolonged outdoor exertion.';
    recBn = 'সংবেদনশীল ব্যক্তি ও শিশুদের দীর্ঘক্ষণ বাইরে অতিরিক্ত পরিশ্রম পরিহার করা উচিত।';
  } else if (category.slug === 'unhealthy') {
    recEn = 'Wear a protective N95 mask outdoors; sensitive groups should stay indoors.';
    recBn = 'বাইরে এন৯৫ মাস্ক পরিধান করুন; সংবেদনশীল ব্যক্তিদের ঘরের ভেতরে থাকা উচিত।';
  } else if (category.slug === 'very-unhealthy') {
    recEn =
      'Avoid all outdoor exertion; keep indoor windows closed and run air purifiers if available.';
    recBn = 'বাইরে চলাচল যথাসম্ভব পরিহার করুন; ঘরের জানালা বন্ধ রাখুন এবং মাস্ক ব্যবহার করুন।';
  } else if (category.slug === 'hazardous') {
    recEn = 'Emergency conditions: remain indoors with windows shut; strictly avoid going outside.';
    recBn = 'জরুরি অবস্থা: ঘরের বাইরে বের হওয়া সম্পূর্ণ বন্ধ রাখুন এবং জানালা বন্ধ রাখুন।';
  }

  return {
    aqi: aqiValue,
    category,
    recommendation_en: recEn,
    recommendation_bn: recBn,
  };
}

export function listBanglaSeasons(): BanglaSeason[] {
  return sortedSeasons;
}

export function getBanglaSeason(key: number | string): BanglaSeason | undefined {
  if (typeof key === 'number') return seasonByOrder.get(key);
  const order = parseInt(key, 10);
  if (!isNaN(order) && seasonByOrder.has(order)) return seasonByOrder.get(order);
  return seasonBySlug.get(key.toLowerCase().trim());
}
