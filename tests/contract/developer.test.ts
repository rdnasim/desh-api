import { beforeEach, describe, expect, it } from 'vitest';
import { clearDailyQuotaStore } from '../../src/lib/api-key';
import { DeveloperQuotaSchema } from '../../src/modules/developer/schemas';
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
});
