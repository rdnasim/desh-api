import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import holidays from '../../generated/holidays.holidays';
import years from '../../generated/holidays.years';
import { cachePublic } from '../../lib/cache';
import { toLatinDigits } from '../../lib/digits';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { toBanglaDate } from '../bangla/calendar';
import { getDistrict } from '../geo/service';
import {
  type Calendar,
  CalendarSchema,
  CommunitySchema,
  type Holiday,
  HolidaySchema,
  HolidayTypeSchema,
  HolidayYearSchema,
} from './schemas';
import {
  type DayOptions,
  dayStatus,
  type HolidayData,
  listHolidays,
  parseWeekend,
  UnavailableYearError,
  workingDays,
} from './service';

const tags = ['Holidays'];
const DATA: HolidayData = { years, holidays };
const META = ['holidays.holidays', 'holidays.years'];

const HolidayOutSchema = HolidaySchema.and(z.object({ bangla_dates: z.array(z.string()) })).openapi(
  'HolidayWithBanglaDates',
  {
    example: {
      id: '2027-general-victory-day',
      year: 2027,
      calendar: 'general',
      name_en: 'Victory Day',
      name_bn: 'বিজয় দিবস',
      type: 'general',
      dates: ['2027-12-16'],
      tentative: false,
      source: 'MoPA notification 05.00.0000.175.08.0008.25-105 (5 Nov 2026)',
      bangla_dates: ['১ পৌষ ১৪৩৪ বঙ্গাব্দ'],
    },
  },
);

const HolidayBriefSchema = z.object({
  id: z.string(),
  name_en: z.string(),
  name_bn: z.string().optional(),
  type: HolidayTypeSchema,
});

const DayStatusSchema = z
  .object({
    date: z.string(),
    bangla_date: z.string(),
    weekend: z.boolean(),
    holiday: z.boolean(),
    working_day: z.boolean(),
    tentative: z.boolean(),
    holidays: z.array(HolidayBriefSchema),
    other_holidays: z.array(HolidayBriefSchema).openapi({
      description:
        'Optional or district-only holidays on this day; they do not close offices generally',
    }),
  })
  .openapi('DayStatus', {
    example: {
      date: '2027-12-16',
      bangla_date: '১ পৌষ ১৪৩৪ বঙ্গাব্দ',
      weekend: false,
      holiday: true,
      working_day: false,
      tentative: false,
      holidays: [
        {
          id: '2027-general-victory-day',
          name_en: 'Victory Day',
          name_bn: 'বিজয় দিবস',
          type: 'general',
        },
      ],
      other_holidays: [],
    },
  });

const WorkingDaysSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    weekend: z.array(z.string()),
    days: z.number().int(),
    working_days: z.number().int(),
    weekend_days: z.number().int(),
    holidays: z.number().int().openapi({ description: 'Holiday days that are not weekend days' }),
    holiday_list: z.array(HolidayBriefSchema),
    tentative: z.boolean(),
  })
  .openapi('WorkingDays', {
    example: {
      from: '2027-12-01',
      to: '2027-12-31',
      weekend: ['fri', 'sat'],
      days: 31,
      working_days: 22,
      weekend_days: 8,
      holidays: 1,
      holiday_list: [
        {
          id: '2027-general-victory-day',
          name_en: 'Victory Day',
          name_bn: 'বিজয় দিবস',
          type: 'general',
        },
      ],
      tentative: false,
    },
  });

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: {
    description: 'Year not available',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const q = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

const brief = (h: Holiday) => ({ id: h.id, name_en: h.name_en, name_bn: h.name_bn, type: h.type });

function invalid(message: string): never {
  throw new ApiError('invalid_parameter', message);
}

/** Maps service errors to API errors. */
function run<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof UnavailableYearError) {
      const list = error.available.length ? error.available.join(', ') : 'none yet';
      throw new ApiError(
        'not_found',
        `No official holiday list for ${error.year} yet. Available years: ${list}`,
        {
          message_bn: `${error.year} সালের সরকারি ছুটির তালিকা এখনো যুক্ত হয়নি`,
        },
      );
    }
    if (error instanceof RangeError) invalid(error.message);
    throw error;
  }
}

function parseCalendar(value: string | undefined): Calendar {
  if (value === undefined) return 'general';
  return CalendarSchema.safeParse(value).data ?? invalid('calendar must be general or bank');
}

function parseDate(name: string, value: string): string {
  const text = toLatinDigits(value.trim());
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    new Date(`${text}T00:00:00Z`).toISOString().startsWith(text);
  return valid ? text : invalid(`${name} must be a real date in YYYY-MM-DD format`);
}

function parseOptions(weekend: string | undefined, district: string | undefined): DayOptions {
  const days = weekend === undefined ? undefined : parseWeekend(weekend);
  if (days === null)
    invalid('weekend must be a comma list of sun,mon,tue,wed,thu,fri,sat (at most 6 days)');
  if (district !== undefined && !getDistrict(district))
    invalid(`district '${district}' is not a district slug`);
  return { weekend: days, district };
}

const banglaDate = (date: string) => toBanglaDate(date).formatted_bn;

export const holidayRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

holidayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/holidays/years',
    tags,
    summary: 'Years and calendars with an official holiday list, and their source documents',
    responses: responses(z.array(HolidayYearSchema), 'Available years'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, years, metaFor(META));
  },
);

holidayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/holidays',
    tags,
    summary: 'Official public holidays for a year',
    description:
      'Includes general holidays, executive-order holidays and optional (community) holidays. Moon-dependent dates have `tentative: true` until confirmed. Years without a published official list return 404.',
    request: {
      query: z.object({
        year: z.string().openapi({ param: { name: 'year', in: 'query' }, example: '2027' }),
        calendar: q('calendar', 'general (default) or bank'),
        type: q('type', HolidayTypeSchema.options.join(', ')),
        community: q('community', `For optional holidays: ${CommunitySchema.options.join(', ')}`),
      }),
    },
    responses: responses(z.array(HolidayOutSchema), 'Holidays sorted by first date'),
  }),
  (c) => {
    const query = c.req.valid('query');
    const year = numberParam('year', query.year, { min: 2000, max: 2100, integer: true });
    const calendar = parseCalendar(query.calendar);
    const type =
      query.type === undefined
        ? undefined
        : (HolidayTypeSchema.safeParse(query.type).data ??
          invalid(`type must be one of: ${HolidayTypeSchema.options.join(', ')}`));
    const community =
      query.community === undefined
        ? undefined
        : (CommunitySchema.safeParse(query.community).data ??
          invalid(`community must be one of: ${CommunitySchema.options.join(', ')}`));
    const list = run(() => listHolidays(DATA, calendar, year))
      .filter(
        (h) =>
          (type === undefined || h.type === type) &&
          (community === undefined || h.community === community),
      )
      .map((h) => ({ ...h, bangla_dates: h.dates.map(banglaDate) }));
    cachePublic(c);
    return ok(c, list, metaFor(META));
  },
);

holidayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/is-holiday',
    tags,
    summary: 'Is a date a holiday, a weekend, or a working day?',
    description:
      'Weekend defaults to Friday and Saturday. Optional (community) holidays and district-only holidays are listed under `other_holidays` and do not make the day a holiday, unless `district` matches a district-only holiday.',
    request: {
      query: z.object({
        date: z.string().openapi({
          param: { name: 'date', in: 'query', description: 'YYYY-MM-DD' },
          example: '2027-12-16',
        }),
        calendar: q('calendar', 'general (default) or bank'),
        weekend: q('weekend', 'Comma list of days, default fri,sat'),
        district: q('district', 'District slug, applies district-only holidays'),
      }),
    },
    responses: responses(DayStatusSchema, 'Day status'),
  }),
  (c) => {
    const query = c.req.valid('query');
    const date = parseDate('date', query.date);
    const calendar = parseCalendar(query.calendar);
    const options = parseOptions(query.weekend, query.district);
    const status = run(() => dayStatus(DATA, calendar, date, options));
    cachePublic(c);
    return ok(
      c,
      {
        ...status,
        bangla_date: banglaDate(date),
        holidays: status.holidays.map(brief),
        other_holidays: status.other_holidays.map(brief),
      },
      metaFor(META),
    );
  },
);

holidayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/working-days',
    tags,
    summary: 'Count working days between two dates (inclusive, up to 366 days)',
    request: {
      query: z.object({
        from: z.string().openapi({ param: { name: 'from', in: 'query' }, example: '2027-12-01' }),
        to: z.string().openapi({ param: { name: 'to', in: 'query' }, example: '2027-12-31' }),
        calendar: q('calendar', 'general (default) or bank'),
        weekend: q('weekend', 'Comma list of days, default fri,sat'),
        district: q('district', 'District slug, applies district-only holidays'),
      }),
    },
    responses: responses(WorkingDaysSchema, 'Working-day count'),
  }),
  (c) => {
    const query = c.req.valid('query');
    const from = parseDate('from', query.from);
    const to = parseDate('to', query.to);
    const calendar = parseCalendar(query.calendar);
    const options = parseOptions(query.weekend, query.district);
    const result = run(() => workingDays(DATA, calendar, from, to, options));
    cachePublic(c);
    return ok(c, { ...result, holiday_list: result.holiday_list.map(brief) }, metaFor(META));
  },
);
