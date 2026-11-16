import { describe, expect, it } from 'vitest';
import {
  calculateFare,
  getMetroLine,
  getStation,
  getTimetable,
  listStations,
} from '../../../src/modules/metro/service';

describe('Metro Service Unit Tests', () => {
  it('lists 17 total stations in order, with 16 operational', () => {
    const all = listStations();
    expect(all).toHaveLength(17);
    expect(all[0].slug).toBe('uttara-north');
    expect(all[15].slug).toBe('motijheel');
    expect(all[16].slug).toBe('kamalapur');
    expect(all[16].status).toBe('under_construction');

    const operational = listStations('operational');
    expect(operational).toHaveLength(16);
  });

  it('retrieves a station by slug or code', () => {
    const bySlug = getStation('farmgate');
    expect(bySlug).toBeDefined();
    expect(bySlug?.code).toBe('FG');
    expect(bySlug?.name_bn).toBe('ফার্মগেট');

    const byCode = getStation('mj');
    expect(byCode).toBeDefined();
    expect(byCode?.slug).toBe('motijheel');
  });

  it('calculates full route fare from Uttara North to Motijheel with 10% MRT Pass discount', () => {
    const fare = calculateFare('uttara-north', 'motijheel');
    expect(fare.from.slug).toBe('uttara-north');
    expect(fare.to.slug).toBe('motijheel');
    expect(fare.single_journey_fare).toBe(100);
    expect(fare.single_journey_fare_bn).toBe('১০০');
    expect(fare.mrt_pass_fare).toBe(90);
    expect(fare.mrt_pass_fare_bn).toBe('৯০');
    expect(fare.discount_percent).toBe(10);
    expect(fare.stations_traversed).toBe(15);
    expect(fare.estimated_time_minutes).toBeGreaterThanOrEqual(30);
  });

  it('enforces minimum fare of 20 Tk for adjacent stations', () => {
    const fare = calculateFare('uttara-north', 'uttara-center');
    expect(fare.single_journey_fare).toBe(20);
    expect(fare.mrt_pass_fare).toBe(18); // 10% off 20 is 18
  });

  it('is symmetric in direction', () => {
    const forward = calculateFare('mirpur-10', 'shahbagh');
    const backward = calculateFare('shahbagh', 'mirpur-10');
    expect(forward.single_journey_fare).toBe(backward.single_journey_fare);
    expect(forward.mrt_pass_fare).toBe(backward.mrt_pass_fare);
    expect(forward.distance_km).toBe(backward.distance_km);
  });

  it('throws for identical origin and destination', () => {
    expect(() => calculateFare('farmgate', 'farmgate')).toThrow(/SAME_STATION/);
  });

  it('throws for unknown station', () => {
    expect(() => calculateFare('unknown-station', 'farmgate')).toThrow(/UNKNOWN_STATION/);
  });

  it('returns timetable and line overview', () => {
    const tt = getTimetable();
    expect(tt.line).toBe('MRT Line-6');
    expect(tt.regular_service.first_train_uttara_north).toBe('07:10');
    expect(tt.friday_service.first_train).toBe('15:00');

    const line = getMetroLine();
    expect(line.id).toBe('mrt-line-6');
    expect(line.stations_count).toBe(16);
    expect(line.color_hex).toBe('#008751');
  });
});
