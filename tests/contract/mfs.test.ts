import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  MfsChargeCalculationSchema,
  MfsProviderSchema,
  MfsUssdEntrySchema,
} from '../../src/modules/mfs/schemas';
import { call, expectError, expectOk } from './helpers';

describe('MFS API routes', () => {
  it('GET /v1/mfs/providers returns all providers', async () => {
    const res = await call('/v1/mfs/providers');
    const { data } = await expectOk(res, z.array(MfsProviderSchema));
    expect(data.length).toBeGreaterThanOrEqual(5);
    const slugs = data.map((p) => p.slug);
    expect(slugs).toContain('bkash');
    expect(slugs).toContain('nagad');
    expect(slugs).toContain('rocket');
    expect(slugs).toContain('upay');
    expect(slugs).toContain('tap');
  });

  it('GET /v1/mfs/providers?q= filters by name or parent', async () => {
    const res = await call('/v1/mfs/providers?q=BRAC');
    const { data } = await expectOk(res, z.array(MfsProviderSchema));
    expect(data.length).toBe(1);
    expect(data[0]?.slug).toBe('bkash');
  });

  it('GET /v1/mfs/providers/{provider} returns details for single provider', async () => {
    const res = await call('/v1/mfs/providers/bkash');
    const { data } = await expectOk(res, MfsProviderSchema);
    expect(data.slug).toBe('bkash');
    expect(data.name_en).toBe('bKash');
    expect(data.name_bn).toBe('বিকাশ');
    expect(data.ussd_code).toBe('*247#');
  });

  it('GET /v1/mfs/providers/{provider} returns 404 for unknown provider', async () => {
    const res = await call('/v1/mfs/providers/unknown-wallet');
    await expectError(res, 404, 'not_found');
  });

  it('GET /v1/mfs/charges calculates fee for cash-out', async () => {
    const res = await call(
      '/v1/mfs/charges?provider=bkash&amount=5000&action=cash-out&channel=app',
    );
    const { data } = await expectOk(res, MfsChargeCalculationSchema);
    expect(data.provider).toBe('bkash');
    expect(data.amount).toBe(5000);
    expect(data.fee).toBe(87.5);
    expect(data.total_deducted).toBe(5087.5);
  });

  it('GET /v1/mfs/charges accepts Bangla digits', async () => {
    const res = await call(
      '/v1/mfs/charges?provider=bkash&amount=৫০০০&action=cash-out&channel=app',
    );
    const { data } = await expectOk(res, MfsChargeCalculationSchema);
    expect(data.amount).toBe(5000);
    expect(data.fee).toBe(87.5);
  });

  it('GET /v1/mfs/charges rejects invalid inputs', async () => {
    const res = await call('/v1/mfs/charges?provider=bkash&amount=-50');
    await expectError(res, 400, 'invalid_parameter');
  });

  it('GET /v1/mfs/compare returns ranked comparison', async () => {
    const res = await call('/v1/mfs/compare?amount=10000&action=cash-out&channel=app');
    const { data } = await expectOk(
      res,
      z.object({
        amount: z.number(),
        action: z.string(),
        channel: z.string(),
        rankings: z.array(MfsChargeCalculationSchema),
      }),
    );
    expect(data.amount).toBe(10000);
    expect(data.rankings.length).toBeGreaterThanOrEqual(4);
    // Nagad should be cheapest for standard app cash-out
    expect(data.rankings[0]?.provider).toBe('nagad');
  });

  it('GET /v1/mfs/ussd returns quick USSD directory', async () => {
    const res = await call('/v1/mfs/ussd');
    const { data } = await expectOk(res, z.array(MfsUssdEntrySchema));
    expect(data.length).toBeGreaterThanOrEqual(5);
    const bkashUssd = data.find((d) => d.provider === 'bkash');
    expect(bkashUssd?.ussd_code).toBe('*247#');
    expect(bkashUssd?.helpline).toBe('16247');
  });
});
