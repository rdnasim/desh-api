import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import {
  DailyPrayerTimesSchema,
  DistrictOffsetSchema,
  RamadanDaySchema,
  RamadanScheduleSchema,
} from './schemas';
import {
  districtOffsets,
  findDistrictOffset,
  getDailyPrayerTimes,
  getRamadanSchedule,
} from './service';

const tags = ['Prayer Times & Ramadan'];
const meta = () => metaFor(['prayer.district-offsets']);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
});

const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

export const prayerRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

prayerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/prayer/times',
    tags,
    summary: 'Daily prayer times by district',
    description:
      'Calculates the 5 daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) plus Sunrise, Sehri cutoff, and Sunset for any district in Bangladesh according to Islamic Foundation Bangladesh conventions. Accepts Latin or Bangla digits for dates.',
    request: {
      query: z.object({
        district: query('district', 'District slug or BBS code (defaults to dhaka)', 'dhaka'),
        date: query('date', 'Date in YYYY-MM-DD format (defaults to today in Dhaka)', '2026-03-20'),
        school: z
          .enum(['hanafi', 'shafi'])
          .optional()
          .openapi({
            param: {
              name: 'school',
              in: 'query',
              description: 'Jurisprudential school for Asr time calculation (defaults to hanafi)',
            },
            example: 'hanafi',
          }),
      }),
    },
    responses: responses(DailyPrayerTimesSchema, 'Daily prayer times for the requested district'),
  }),
  (c) => {
    cachePublic(c);
    const { district, date, school } = c.req.valid('query');
    if (district && !findDistrictOffset(district)) {
      throw new ApiError('not_found', `Unknown district '${district}'. See /v1/prayer/offsets.`);
    }
    const result = getDailyPrayerTimes(date, district || 'dhaka', school || 'hanafi');
    return ok(c, result, meta());
  },
);

prayerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/prayer/ramadan',
    tags,
    summary: 'Ramadan Sehri and Iftar timetable',
    description:
      'Provides the complete 30-day Sehri & Iftar timetable for the holy month of Ramadan for any district in Bangladesh, mapped to Gregorian and revised Bangla Academy dates.',
    request: {
      query: z.object({
        district: query('district', 'District slug or BBS code (defaults to dhaka)', 'dhaka'),
        year: query('year', 'Hijri year (e.g. 1447) or Gregorian year (e.g. 2026)', '1447'),
        day: query('day', 'Specific Ramadan day (1 to 30)', '1'),
      }),
    },
    responses: responses(
      RamadanScheduleSchema,
      '30-day Ramadan schedule (or filtered to a single day when ?day= is provided)',
    ),
  }),
  (c) => {
    cachePublic(c);
    const { district, year, day } = c.req.valid('query');
    if (district && !findDistrictOffset(district)) {
      throw new ApiError('not_found', `Unknown district '${district}'. See /v1/prayer/offsets.`);
    }
    const schedule = getRamadanSchedule(district || 'dhaka', year);
    if (day) {
      const dayNum = Number(day);
      if (Number.isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
        throw new ApiError('invalid_parameter', 'Ramadan day must be between 1 and 30');
      }
      const dayEntry = schedule.days.find((d) => d.day === dayNum);
      if (!dayEntry) {
        throw new ApiError('not_found', `Day ${dayNum} not found in schedule`);
      }
      return ok(c, { ...schedule, days: [dayEntry] }, meta());
    }
    return ok(c, schedule, meta());
  },
);

prayerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/prayer/offsets',
    tags,
    summary: 'Official IFB district prayer time offsets',
    description:
      'Lists all 64 districts in Bangladesh with their official Islamic Foundation Bangladesh minute offsets for Sehri and Iftar relative to the Dhaka baseline.',
    request: {
      query: z.object({
        q: query('q', 'Filter by district or division name in English or Bangla', 'sylhet'),
      }),
    },
    responses: responses(z.array(DistrictOffsetSchema), 'List of 64 district offsets'),
  }),
  (c) => {
    cachePublic(c);
    const { q } = c.req.valid('query');
    let items = districtOffsets;
    if (q) {
      const term = q.trim().toLowerCase();
      items = items.filter(
        (d) =>
          d.slug.toLowerCase().includes(term) ||
          d.name_en.toLowerCase().includes(term) ||
          d.name_bn.includes(term) ||
          d.division.toLowerCase().includes(term) ||
          d.bbs_code.toLowerCase() === term,
      );
    }
    return ok(c, items, meta());
  },
);

prayerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/prayer/offsets/{district}',
    tags,
    summary: 'District prayer time offset details',
    description:
      'Returns the official IFB minute offset for a single district by slug or BBS code.',
    request: {
      params: z.object({
        district: z
          .string()
          .openapi({ param: { name: 'district', in: 'path' }, example: 'sylhet' }),
      }),
    },
    responses: responses(DistrictOffsetSchema, 'District offset details'),
  }),
  (c) => {
    cachePublic(c);
    const { district } = c.req.valid('param');
    const offset = findDistrictOffset(district);
    if (!offset) {
      throw new ApiError('not_found', `Unknown district '${district}'`);
    }
    return ok(c, offset, meta());
  },
);
