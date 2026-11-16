import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  EmergencyHealthSummarySchema,
  HospitalSchema,
} from '../../src/modules/health/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/health/hospitals', () => {
  it('lists hospitals citing DGHS, cacheable', async () => {
    const res = await call('/v1/health/hospitals');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(HospitalSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(20);
    expect(body.meta.source).toContain('Directorate General of Health Services');
  });

  it('filters by division, district, and type', async () => {
    const res1 = await call('/v1/health/hospitals?division=chattogram');
    const body1 = await expectOk(res1, z.array(HospitalSchema));
    expect(body1.data.every((h) => h.division === 'chattogram')).toBe(true);

    const res2 = await call('/v1/health/hospitals?type=specialized_institute');
    const body2 = await expectOk(res2, z.array(HospitalSchema));
    expect(body2.data.every((h) => h.type === 'specialized_institute')).toBe(true);
  });

  it('rejects invalid parameters with 400', async () => {
    await expectError(await call('/v1/health/hospitals?division=atlantis'), 400, 'invalid_parameter');
    await expectError(await call('/v1/health/hospitals?district=nowhere'), 400, 'invalid_parameter');
    await expectError(await call('/v1/health/hospitals?type=clinic'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/health/hospitals/{slug}', () => {
  it('returns details of a specific hospital', async () => {
    const res = await call('/v1/health/hospitals/dhaka-medical-college-hospital');
    const body = await expectOk(res, HospitalSchema);
    expect(body.data.slug).toBe('dhaka-medical-college-hospital');
    expect(body.data.bed_capacity).toBe(2600);
    expect(body.data.has_emergency_24h).toBe(true);
  });

  it('returns 404 for unknown hospital', async () => {
    await expectError(await call('/v1/health/hospitals/unknown-hospital-slug'), 404, 'not_found');
  });
});

describe('GET /v1/health/emergency', () => {
  it('returns emergency medical hotlines and trauma centers', async () => {
    const res = await call('/v1/health/emergency');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, EmergencyHealthSummarySchema);
    expect(body.data.national_hotlines.length).toBeGreaterThan(0);
    expect(body.data.trauma_and_burn_centers.length).toBeGreaterThan(0);
  });
});
