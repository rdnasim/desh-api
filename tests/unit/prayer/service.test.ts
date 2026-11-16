import { describe, expect, it } from 'vitest';
import {
  districtOffsets,
  findDistrictOffset,
  getDailyPrayerTimes,
  getHijriDate,
  getRamadanSchedule,
} from '../../../src/modules/prayer/service';

describe('Prayer Times & Ramadan Service', () => {
  it('has 64 district offsets registered with Islamic Foundation Bangladesh parameters', () => {
    expect(districtOffsets).toHaveLength(64);
    const dhaka = findDistrictOffset('dhaka');
    expect(dhaka).toBeDefined();
    expect(dhaka?.sehri_offset_minutes).toBe(0);

    const sylhet = findDistrictOffset('sylhet');
    expect(sylhet).toBeDefined();
    expect(sylhet?.sehri_offset_minutes).toBe(-6);

    const rajshahi = findDistrictOffset('rajshahi');
    expect(rajshahi).toBeDefined();
    expect(rajshahi?.sehri_offset_minutes).toBe(7);

    // BBS code lookup
    const bbs = findDistrictOffset('BD2015'); // Chattogram
    expect(bbs?.slug).toBe('chattogram');
  });

  it('calculates daily prayer times for Dhaka with all required fields', () => {
    const res = getDailyPrayerTimes('2026-03-20', 'dhaka', 'hanafi');
    expect(res.date).toBe('2026-03-20');
    expect(res.district.slug).toBe('dhaka');
    expect(res.school).toBe('hanafi');

    // 24h format
    expect(res.times.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.sunrise).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.asr).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.maghrib).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.isha).toMatch(/^\d{2}:\d{2}$/);
    expect(res.times.sehri_cutoff).toMatch(/^\d{2}:\d{2}$/);

    // Sehri cutoff should be earlier than Fajr
    expect(res.times.sehri_cutoff < res.times.fajr).toBe(true);

    // 12h format
    expect(res.times_12h.fajr).toMatch(/\d{2}:\d{2} AM/);
    expect(res.times_12h.dhuhr).toMatch(/\d{2}:\d{2} PM/);
    expect(res.times_12h.maghrib).toMatch(/\d{2}:\d{2} PM/);

    // Bangla formatting
    expect(res.times_bn.fajr).toMatch(/[০-৯]{2}:[০-৯]{2} ভোর/);
    expect(res.times_bn.maghrib).toMatch(/[০-৯]{2}:[০-৯]{2} সন্ধ্যা/);
    expect(res.bangla_date).toContain('বঙ্গাব্দ');
  });

  it('correctly shifts times between Eastern (Sylhet) and Western (Rajshahi) districts', () => {
    const dhaka = getDailyPrayerTimes('2026-03-20', 'dhaka');
    const sylhet = getDailyPrayerTimes('2026-03-20', 'sylhet');
    const rajshahi = getDailyPrayerTimes('2026-03-20', 'rajshahi');

    // In Sylhet (-6 min), Iftar and Sehri are 6 minutes earlier than Dhaka
    const [dhH, dhM] = dhaka.times.maghrib.split(':').map(Number);
    const [syH, syM] = sylhet.times.maghrib.split(':').map(Number);
    const [rjH, rjM] = rajshahi.times.maghrib.split(':').map(Number);

    const dhakaMin = dhH * 60 + dhM;
    const sylhetMin = syH * 60 + syM;
    const rajshahiMin = rjH * 60 + rjM;

    expect(sylhetMin).toBe(dhakaMin - 6);
    expect(rajshahiMin).toBe(dhakaMin + 7);
  });

  it('accepts Bangla digits in date query', () => {
    const res = getDailyPrayerTimes('২০২৬-০৩-২০', 'dhaka');
    expect(res.date).toBe('2026-03-20');
  });

  it('generates a 30-day Ramadan schedule with Gregorian, Hijri, and Bangla dates', () => {
    const sched = getRamadanSchedule('dhaka', 1447);
    expect(sched.year_hijri).toBe(1447);
    expect(sched.days).toHaveLength(30);

    const day1 = sched.days[0];
    expect(day1.day).toBe(1);
    expect(day1.sehri_cutoff).toBeDefined();
    expect(day1.iftar).toBeDefined();
    expect(day1.sehri_cutoff_bn).toContain('ভোর');
    expect(day1.iftar_bn).toContain('সন্ধ্যা');

    expect(sched.disclaimer_bn).toContain('চাঁদ দেখার ওপর নির্ভরশীল');
  });

  it('provides bilingual Hijri dates', () => {
    const hijri = getHijriDate(new Date('2026-02-18T00:00:00Z'));
    expect(hijri.formatted_en).toContain('1447 AH');
    expect(hijri.formatted_bn).toContain('১৪৪৭ হিজরি');
  });
});
