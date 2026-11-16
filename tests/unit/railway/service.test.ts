import { describe, expect, it } from 'vitest';
import {
  getRailwayClass,
  getRailwayStation,
  getTrain,
  listRailwayClasses,
  listRailwayStations,
  listTrains,
} from '../../../src/modules/railway/service';

describe('Bangladesh Railway Service', () => {
  it('lists all intercity trains sorted by train number', () => {
    const trains = listTrains();
    expect(trains.length).toBeGreaterThanOrEqual(15);
    const numbers = trains.map((t) => parseInt(t.number, 10));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('filters trains by origin and destination city', () => {
    const dhakaToCtg = listTrains({ origin: 'dhaka', destination: 'chattogram' });
    expect(dhakaToCtg.length).toBeGreaterThanOrEqual(2);
    expect(dhakaToCtg.some((t) => t.slug.includes('suborno'))).toBe(true);
    expect(dhakaToCtg.some((t) => t.slug.includes('sonar-bangla'))).toBe(true);

    const dhakaToSylhet = listTrains({ origin: 'dhaka', destination: 'sylhet' });
    expect(dhakaToSylhet.some((t) => t.name_en === 'Parabat Express')).toBe(true);
    expect(dhakaToSylhet.some((t) => t.name_en === 'Upaban Express')).toBe(true);
  });

  it('filters trains by coach class', () => {
    const snigdhaTrains = listTrains({ classCode: 'SNIGDHA' });
    expect(snigdhaTrains.length).toBeGreaterThan(10);
    expect(snigdhaTrains.every((t) => t.classes.includes('SNIGDHA'))).toBe(true);
  });

  it('filters trains by off day', () => {
    const mondayOff = listTrains({ offDay: 'Monday' });
    expect(mondayOff.some((t) => t.name_en === 'Suborno Express')).toBe(true);
  });

  it('gets a train by official 3-digit number or slug', () => {
    const train701 = getTrain('701');
    expect(train701).toBeDefined();
    expect(train701?.name_en).toBe('Suborno Express');
    expect(train701?.departure_time).toBe('07:00');

    const trainSlug = getTrain('sonar-bangla-express-787');
    expect(trainSlug).toBeDefined();
    expect(trainSlug?.number).toBe('787');

    expect(getTrain('9999')).toBeUndefined();
  });

  it('lists official BR coach classes with AC status', () => {
    const classes = listRailwayClasses();
    expect(classes).toHaveLength(7);
    const snigdha = getRailwayClass('SNIGDHA');
    expect(snigdha?.is_ac).toBe(true);
    expect(snigdha?.name_bn).toBe('স্নিগ্ধা');

    const shovonChair = getRailwayClass('shovon-chair');
    expect(shovonChair?.code).toBe('S_CHAIR');
    expect(shovonChair?.is_ac).toBe(false);
  });

  it('lists and looks up major railway stations', () => {
    const stations = listRailwayStations();
    expect(stations.length).toBeGreaterThanOrEqual(10);

    const dhaka = getRailwayStation('DA');
    expect(dhaka?.slug).toBe('dhaka');
    expect(dhaka?.division).toBe('dhaka');
    expect(dhaka?.coordinates.latitude).toBeCloseTo(23.7314, 2);

    const ctg = getRailwayStation('chattogram');
    expect(ctg?.code).toBe('CG');
  });
});
