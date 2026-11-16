import type { z } from 'zod';
import classes from '../../generated/railway.classes';
import stations from '../../generated/railway.stations';
import trains from '../../generated/railway.trains';
import { normalizeForSearch } from '../../lib/normalize';
import type { RailwayClass, RailwayClassCodeSchema, RailwayStation, RailwayTrain } from './schemas';

const sortedTrains = [...trains].sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
const trainByNumber = new Map(trains.map((t) => [t.number, t]));
const trainBySlug = new Map(trains.map((t) => [t.slug, t]));

const sortedClasses = [...classes].sort((a, b) => a.name_en.localeCompare(b.name_en));
const classByCode = new Map(classes.map((c) => [c.code, c]));
const classBySlug = new Map(classes.map((c) => [c.slug, c]));

const sortedStations = [...stations].sort((a, b) => a.name_en.localeCompare(b.name_en));
const stationByCode = new Map(stations.map((s) => [s.code.toUpperCase(), s]));
const stationBySlug = new Map(stations.map((s) => [s.slug, s]));

export interface TrainFilter {
  origin?: string;
  destination?: string;
  classCode?: z.infer<typeof RailwayClassCodeSchema>;
  offDay?: string;
  q?: string;
}

export function listTrains({
  origin,
  destination,
  classCode,
  offDay,
  q,
}: TrainFilter = {}): RailwayTrain[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedTrains.filter((t) => {
    if (
      origin !== undefined &&
      t.origin_station !== origin.toLowerCase() &&
      t.origin_city.toLowerCase() !== origin.toLowerCase()
    ) {
      return false;
    }
    if (
      destination !== undefined &&
      t.destination_station !== destination.toLowerCase() &&
      t.destination_city.toLowerCase() !== destination.toLowerCase()
    ) {
      return false;
    }
    if (classCode !== undefined && !t.classes.includes(classCode)) {
      return false;
    }
    if (offDay !== undefined && t.off_day_en.toLowerCase() !== offDay.toLowerCase()) {
      return false;
    }
    if (query !== undefined) {
      const matchName = normalizeForSearch(t.name_en).includes(query);
      const matchNumber = t.number.includes(query);
      const matchCities =
        normalizeForSearch(t.origin_city).includes(query) ||
        normalizeForSearch(t.destination_city).includes(query);
      const matchHalts = t.major_halts.some((h) => normalizeForSearch(h).includes(query));
      if (!matchName && !matchNumber && !matchCities && !matchHalts) return false;
    }
    return true;
  });
}

export function getTrain(numberOrSlug: string): RailwayTrain | undefined {
  const key = numberOrSlug.trim();
  return trainByNumber.get(key) ?? trainBySlug.get(key.toLowerCase());
}

export function listRailwayClasses(): RailwayClass[] {
  return sortedClasses;
}

export function getRailwayClass(codeOrSlug: string): RailwayClass | undefined {
  const key = codeOrSlug.trim();
  return classByCode.get(key.toUpperCase() as any) ?? classBySlug.get(key.toLowerCase());
}

export interface StationFilter {
  division?: string;
  district?: string;
  q?: string;
}

export function listRailwayStations({
  division,
  district,
  q,
}: StationFilter = {}): RailwayStation[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);
  return sortedStations.filter((s) => {
    if (division !== undefined && s.division !== division) return false;
    if (district !== undefined && s.district !== district) return false;
    if (query !== undefined) {
      const matchName = normalizeForSearch(s.name_en).includes(query);
      const matchCode = s.code.toLowerCase().includes(query.toLowerCase());
      if (!matchName && !matchCode) return false;
    }
    return true;
  });
}

export function getRailwayStation(codeOrSlug: string): RailwayStation | undefined {
  const key = codeOrSlug.trim();
  return stationByCode.get(key.toUpperCase()) ?? stationBySlug.get(key.toLowerCase());
}
