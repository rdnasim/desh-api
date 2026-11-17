import { beforeEach, describe, expect, it } from 'vitest';
import { clearDailyQuotaStore } from '../../src/lib/api-key';
import {
  DeveloperQuotaSchema,
  DeveloperTiersResponseSchema,
  GeneratedKeyResponseSchema,
} from '../../src/modules/developer/schemas';
import { call, expectError, expectOk } from './helpers';

describe('Developer API Keys & Rate Limiting Contract', () => {
  beforeEach(() => {
    clearDailyQuotaStore();
  });

  it('anonymous request defaults to free tier headers', async () => {
    const res = await call('/v1/divisions');
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ratelimit-tier')).toBe('anonymous');
    expect(res.headers.get('x-ratelimit-limit-minute')).toBe('120');
    expect(res.headers.get('x-ratelimit-limit-daily')).toBe('10000');
    expect(Number(res.headers.get('x-ratelimit-remaining-daily'))).toBeLessThan(10000);
    expect(res.headers.get('x-ratelimit-reset')).toBeTruthy();
  });

  it('valid developer key sets developer tier and higher limits', async () => {
    const res = await call('/v1/divisions', {
      headers: { 'X-API-Key': 'desh_dev_test_key' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ratelimit-tier')).toBe('developer');
    expect(res.headers.get('x-ratelimit-limit-minute')).toBe('600');
    expect(res.headers.get('x-ratelimit-limit-daily')).toBe('50000');
  });

  it('valid enterprise key via Bearer token sets enterprise tier', async () => {
    const res = await call('/v1/divisions', {
      headers: { Authorization: 'Bearer desh_ent_test_key' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ratelimit-tier')).toBe('enterprise');
    expect(res.headers.get('x-ratelimit-limit-minute')).toBe('1800');
    expect(res.headers.get('x-ratelimit-limit-daily')).toBe('500000');
  });

  it('invalid API key returns 401 unauthorized', async () => {
    const res = await call('/v1/divisions', {
      headers: { 'X-API-Key': 'desh_invalid_key_xyz' },
    });
    await expectError(res, 401, 'unauthorized');
  });

  it('GET /v1/developer/quota returns anonymous quota info without key', async () => {
    const res = await call('/v1/developer/quota');
    const { data } = await expectOk(res, DeveloperQuotaSchema);
    expect(data.tier).toBe('anonymous');
    expect(data.api_key).toBeNull();
    expect(data.rate_limit_per_minute).toBe(120);
    expect(data.daily_quota).toBe(10000);
    expect(data.daily_used).toBeGreaterThanOrEqual(1);
  });

  it('GET /v1/developer/quota returns key and tier info with developer key', async () => {
    const res = await call('/v1/developer/quota', {
      headers: { 'X-API-Key': 'desh_dev_test_key' },
    });
    const { data } = await expectOk(res, DeveloperQuotaSchema);
    expect(data.tier).toBe('developer');
    expect(data.key_name).toBe('Developer Test Key');
    expect(data.rate_limit_per_minute).toBe(600);
    expect(data.daily_quota).toBe(50000);
    expect(data.api_key).toContain('***');
  });

  it('GET /v1/developer/tiers returns tier plans and feature comparisons', async () => {
    const res = await call('/v1/developer/tiers');
    const { data } = await expectOk(res, DeveloperTiersResponseSchema);
    expect(data.tiers.length).toBe(3);
    const tiers = data.tiers.map((t) => t.tier);
    expect(tiers).toContain('anonymous');
    expect(tiers).toContain('developer');
    expect(tiers).toContain('enterprise');
  });

  it('POST /v1/developer/keys/generate creates a new developer key token', async () => {
    const res = await call('/v1/developer/keys/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Dhaka Logistics Sandbox', email: 'dev@dhaka-logistics.com' }),
    });
    const { data } = await expectOk(res, GeneratedKeyResponseSchema);
    expect(data.api_key).toMatch(/^desh_dev_[a-f0-9]{16}$/);
    expect(data.tier).toBe('developer');
    expect(data.name).toBe('Dhaka Logistics Sandbox');
    expect(data.daily_quota).toBe(50000);
    expect(data.instructions).toContain(data.api_key);
  });
});
