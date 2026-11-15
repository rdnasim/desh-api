import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { BankOutSchema, BranchOutSchema } from '../../src/modules/banks/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/banks', () => {
  it('lists banks with counts, cacheable, citing Bangladesh Bank', async () => {
    const res = await call('/v1/banks');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(BankOutSchema));
    expect(body.data).toHaveLength(61);
    expect(body.meta.source).toContain('Bangladesh Bank');
  });

  it('returns one bank by slug or ID, 404 otherwise', async () => {
    const body = await expectOk(await call('/v1/banks/15'), BankOutSchema);
    expect(body.data.slug).toBe('sonali-bank');
    await expectError(await call('/v1/banks/fake-bank'), 404, 'not_found');
  });
});

describe('GET /v1/banks/{bank}/branches', () => {
  it('paginates and filters', async () => {
    const body = await expectOk(
      await call('/v1/banks/agrani-bank/branches?district=chandpur&per_page=5'),
      z.array(BranchOutSchema),
    );
    expect(body.data.length).toBeLessThanOrEqual(5);
    expect(body.data.every((b) => b.district.slug === 'chandpur')).toBe(true);
    expect(body.meta.pagination).toMatchObject({ page: 1, per_page: 5 });
    expect(body.meta.disclaimer).toMatch(/routing/i);
  });

  it('400s an unknown district or upazila, 404s an unknown bank', async () => {
    await expectError(
      await call('/v1/banks/agrani-bank/branches?district=atlantis'),
      400,
      'invalid_parameter',
    );
    await expectError(
      await call('/v1/banks/agrani-bank/branches?upazila=nowhere'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/banks/nope/branches'), 404, 'not_found');
  });
});

describe('GET /v1/branches/{id}', () => {
  it('returns a branch with its routing number', async () => {
    const body = await expectOk(await call('/v1/branches/110003'), BranchOutSchema);
    expect(body.data).toMatchObject({ routing_number: '010130065', bank: { slug: 'agrani-bank' } });
    await expectError(await call('/v1/branches/999999'), 404, 'not_found');
  });
});

describe('GET /v1/routing/{number}', () => {
  it('finds the branch (Bangla digits accepted)', async () => {
    const body = await expectOk(
      await call(`/v1/routing/${encodeURIComponent('০১০১৩০০৬৫')}`),
      BranchOutSchema,
    );
    expect(body.data.id).toBe('110003');
  });

  it('400s a malformed number or bad check digit', async () => {
    const bad = await expectError(await call('/v1/routing/010130066'), 400, 'invalid_parameter');
    expect(bad.error.message).toContain('check digit');
    await expectError(await call('/v1/routing/12345'), 400, 'invalid_parameter');
  });

  it('404s a valid number that is not in the list, naming the bank when known', async () => {
    // 200 (Sonali) + district 99 + branch 999 + check digit chosen to be valid
    const body = await expectError(await call('/v1/routing/200999995'), 404, 'not_found');
    expect(body.error.message).toContain('SONALI');
  });
});

describe('GET /v1/validate/routing/{number}', () => {
  it('checks format only', async () => {
    const body = await expectOk(await call('/v1/validate/routing/010130065'));
    expect(body.data).toMatchObject({
      type: 'routing',
      valid: true,
      details: { bank_code: '010' },
    });
    expect((await call('/v1/validate/routing/010130065')).headers.get('cache-control')).toBe(
      'no-store',
    );
  });
});
