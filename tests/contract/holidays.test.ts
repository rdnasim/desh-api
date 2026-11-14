import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

describe('/v1/holidays', () => {
  it('lists available years with their documents', async () => {
    const body = await expectOk(await call('/v1/holidays/years'));
    expect(body.data).toMatchObject([
      { year: 2027, calendar: 'general', documents: [{ date: '2026-11-05' }] },
    ]);
  });

  it('lists 2027 holidays with Bangla dates, sorted by date', async () => {
    const body = await expectOk(await call('/v1/holidays?year=2027'));
    const list = body.data as { id: string; dates: string[]; bangla_dates: string[] }[];
    expect(list[0]?.dates[0]).toBe('2027-01-01');
    const victory = list.find((h) => h.id === '2027-general-victory-day');
    expect(victory?.bangla_dates).toEqual(['১ পৌষ ১৪৩৪ বঙ্গাব্দ']);
    const firsts = list.map((h) => h.dates[0] as string);
    expect(firsts).toEqual([...firsts].sort());
  });

  it('filters by type and community', async () => {
    const general = await expectOk(await call('/v1/holidays?year=2027&type=general'));
    expect((general.data as unknown[]).length).toBe(15);
    const hindu = await expectOk(
      await call('/v1/holidays?year=2027&type=optional&community=hindu'),
    );
    expect((hindu.data as { community: string }[]).every((h) => h.community === 'hindu')).toBe(
      true,
    );
  });

  it('404s years without an official list and lists the available ones', async () => {
    const res = await expectError(await call('/v1/holidays?year=2030'), 404, 'not_found');
    expect(res.error.message).toContain('2027');
    await expectError(await call('/v1/holidays?year=2027&calendar=bank'), 404, 'not_found');
  });

  it('400s bad parameters', async () => {
    await expectError(await call('/v1/holidays'), 400, 'invalid_parameter');
    await expectError(await call('/v1/holidays?year=2027&type=fun'), 400, 'invalid_parameter');
    await expectError(await call('/v1/holidays?year=2027&calendar=moon'), 400, 'invalid_parameter');
  });
});

describe('/v1/is-holiday', () => {
  it('reports Victory Day 2027', async () => {
    const body = await expectOk(await call('/v1/is-holiday?date=2027-12-16'));
    expect(body.data).toMatchObject({
      holiday: true,
      working_day: false,
      bangla_date: '১ পৌষ ১৪৩৪ বঙ্গাব্দ',
      holidays: [{ name_bn: 'বিজয় দিবস' }],
    });
  });

  it('flags tentative Eid dates', async () => {
    const body = await expectOk(await call('/v1/is-holiday?date=2027-03-10'));
    expect(body.data).toMatchObject({ holiday: true, tentative: true });
  });

  it('keeps optional and district-only holidays from closing the day', async () => {
    const saraswati = await expectOk(await call('/v1/is-holiday?date=2027-02-11'));
    expect(saraswati.data).toMatchObject({
      working_day: true,
      other_holidays: [{ type: 'optional' }],
    });
    const sankranti = await expectOk(await call('/v1/is-holiday?date=2027-04-13'));
    expect(sankranti.data).toMatchObject({ working_day: true });
    const inHills = await expectOk(await call('/v1/is-holiday?date=2027-04-13&district=rangamati'));
    expect(inHills.data).toMatchObject({ holiday: true });
  });

  it('accepts Bangla digits and a custom weekend', async () => {
    const body = await expectOk(
      await call(`/v1/is-holiday?date=${encodeURIComponent('২০২৭-১২-১৬')}`),
    );
    expect(body.data).toMatchObject({ holiday: true });
    const sat = await expectOk(await call('/v1/is-holiday?date=2027-12-04&weekend=fri'));
    expect(sat.data).toMatchObject({ weekend: false, working_day: true });
  });

  it('400s bad input and 404s unavailable years', async () => {
    await expectError(await call('/v1/is-holiday?date=2027-02-30'), 400, 'invalid_parameter');
    await expectError(
      await call('/v1/is-holiday?date=2027-12-16&weekend=funday'),
      400,
      'invalid_parameter',
    );
    await expectError(
      await call('/v1/is-holiday?date=2027-12-16&district=atlantis'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/is-holiday?date=2028-01-02'), 404, 'not_found');
  });
});

describe('/v1/working-days', () => {
  it('counts December 2027', async () => {
    // Dec 2027: 1st is a Wednesday. Weekend: Fri 3,10,17,24,31 + Sat 4,11,18,25 = 9 days.
    // Weekday holidays: Thu 16 (Victory Day). Christmas falls on Saturday 25.
    const body = await expectOk(await call('/v1/working-days?from=2027-12-01&to=2027-12-31'));
    expect(body.data).toMatchObject({
      days: 31,
      weekend_days: 9,
      holidays: 1,
      working_days: 21,
      tentative: false,
    });
  });

  it('rejects reversed or over-long ranges', async () => {
    await expectError(
      await call('/v1/working-days?from=2027-12-31&to=2027-12-01'),
      400,
      'invalid_parameter',
    );
    await expectError(
      await call('/v1/working-days?from=2027-01-01&to=2028-01-02'),
      400,
      'invalid_parameter',
    );
  });
});
