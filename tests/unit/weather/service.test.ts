import { describe, expect, it } from 'vitest';
import {
  getBanglaSeason,
  getMaritimeSignal,
  getRiverportSignal,
  listAqiCategories,
  listBanglaSeasons,
  listMaritimeSignals,
  listRiverportSignals,
  lookupAqi,
} from '../../../src/modules/weather/service';

describe('Maritime Storm Signals', () => {
  it('lists all 11 maritime warning signals in numerical order', () => {
    const signals = listMaritimeSignals();
    expect(signals).toHaveLength(11);
    expect(signals.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('gets a maritime signal by number or slug', () => {
    const sig10 = getMaritimeSignal(10);
    expect(sig10).toBeDefined();
    expect(sig10?.severity).toBe('extreme');
    expect(sig10?.name_bn).toContain('মহাবিপদ সংকেত ১০');

    const sig8 = getMaritimeSignal('great-danger-8');
    expect(sig8?.number).toBe(8);

    const sigString = getMaritimeSignal('3');
    expect(sigString?.number).toBe(3);

    expect(getMaritimeSignal(99)).toBeUndefined();
  });
});

describe('Inland Riverport Signals', () => {
  it('lists all 4 riverport signals in order', () => {
    const signals = listRiverportSignals();
    expect(signals).toHaveLength(4);
    expect(signals.map((s) => s.number)).toEqual([1, 2, 3, 4]);
  });

  it('gets a riverport signal by number or slug', () => {
    const sig2 = getRiverportSignal(2);
    expect(sig2?.slug).toBe('warning-2');
    expect(sig2?.vessel_guideline).toContain('65 feet');

    const sig4 = getRiverportSignal('great-danger-4');
    expect(sig4?.number).toBe(4);
    expect(sig4?.severity).toBe('extreme');

    expect(getRiverportSignal(10)).toBeUndefined();
  });
});

describe('Air Quality Index (AQI)', () => {
  it('lists all 6 DoE categories ordered by min_aqi', () => {
    const categories = listAqiCategories();
    expect(categories).toHaveLength(6);
    expect(categories.map((c) => c.slug)).toEqual([
      'good',
      'moderate',
      'caution',
      'unhealthy',
      'very-unhealthy',
      'hazardous',
    ]);
  });

  it('looks up AQI and returns category and health advisories', () => {
    const good = lookupAqi(35);
    expect(good?.category.slug).toBe('good');
    expect(good?.category.color_hex).toBe('#00E400');

    const moderate = lookupAqi(75);
    expect(moderate?.category.slug).toBe('moderate');

    const caution = lookupAqi(125);
    expect(caution?.category.slug).toBe('caution');
    expect(caution?.recommendation_en).toContain('Sensitive individuals');

    const unhealthy = lookupAqi(165);
    expect(unhealthy?.category.slug).toBe('unhealthy');
    expect(unhealthy?.recommendation_en).toContain('mask');

    const veryUnhealthy = lookupAqi(250);
    expect(veryUnhealthy?.category.slug).toBe('very-unhealthy');

    const hazardous = lookupAqi(350);
    expect(hazardous?.category.slug).toBe('hazardous');
    expect(hazardous?.category.color_hex).toBe('#7E0023');

    // Extreme high value > 500 still maps to hazardous
    const extreme = lookupAqi(650);
    expect(extreme?.category.slug).toBe('hazardous');

    expect(lookupAqi(-5)).toBeUndefined();
  });
});

describe('Bangla Seasons (ষড়ঋতু)', () => {
  it('lists all 6 traditional Bangla seasons in chronological order', () => {
    const seasons = listBanglaSeasons();
    expect(seasons).toHaveLength(6);
    expect(seasons.map((s) => s.slug)).toEqual([
      'grishma',
      'barsha',
      'sharat',
      'hemanta',
      'sheet',
      'basanta',
    ]);
    expect(seasons[0].bangla_months).toEqual(['বৈশাখ', 'জ্যৈষ্ঠ']);
    expect(seasons[5].bangla_months).toEqual(['ফাল্গুন', 'চৈত্র']);
  });

  it('gets a season by order or slug', () => {
    const sheet = getBanglaSeason(5);
    expect(sheet?.slug).toBe('sheet');
    expect(sheet?.name_bn).toBe('শীত');

    const barsha = getBanglaSeason('barsha');
    expect(barsha?.order).toBe(2);

    expect(getBanglaSeason(7)).toBeUndefined();
  });
});
