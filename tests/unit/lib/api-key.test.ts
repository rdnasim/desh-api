import { beforeEach, describe, expect, it } from 'vitest';
import {
  TIERS,
  checkAndIncrementQuota,
  clearDailyQuotaStore,
  extractApiKey,
  resolveApiKey,
} from '../../../src/lib/api-key';

describe('API Key and Quota Service', () => {
  beforeEach(() => {
    clearDailyQuotaStore();
  });

  describe('extractApiKey', () => {
    it('extracts key from X-API-Key header', () => {
      const getHeader = (name: string) =>
        name.toLowerCase() === 'x-api-key' ? 'desh_test_123' : undefined;
      expect(extractApiKey(getHeader)).toBe('desh_test_123');
    });

    it('extracts key from Authorization Bearer header', () => {
      const getHeader = (name: string) =>
        name.toLowerCase() === 'authorization' ? 'Bearer desh_bearer_456' : undefined;
      expect(extractApiKey(getHeader)).toBe('desh_bearer_456');
    });

    it('returns null when neither header is present', () => {
      const getHeader = () => undefined;
      expect(extractApiKey(getHeader)).toBeNull();
    });
  });

  describe('resolveApiKey', () => {
    it('resolves built-in developer test key', () => {
      const key = resolveApiKey('desh_dev_test_key');
      expect(key).not.toBeNull();
      expect(key?.tier).toBe('developer');
      expect(key?.rate_limit_per_minute).toBe(600);
      expect(key?.daily_quota).toBe(50000);
      expect(key?.active).toBe(true);
    });

    it('resolves built-in enterprise test key', () => {
      const key = resolveApiKey('desh_ent_test_key');
      expect(key).not.toBeNull();
      expect(key?.tier).toBe('enterprise');
      expect(key?.rate_limit_per_minute).toBe(1800);
      expect(key?.daily_quota).toBe(500000);
    });

    it('resolves dynamic keys from env JSON', () => {
      const envJson = JSON.stringify([
        {
          key: 'custom_pro_key',
          name: 'Acme Corp',
          tier: 'developer',
          active: true,
        },
      ]);
      const key = resolveApiKey('custom_pro_key', envJson);
      expect(key).not.toBeNull();
      expect(key?.name).toBe('Acme Corp');
      expect(key?.tier).toBe('developer');
      expect(key?.daily_quota).toBe(TIERS.developer.daily_quota);
    });

    it('returns null for unknown keys', () => {
      expect(resolveApiKey('non_existent_key')).toBeNull();
    });

    it('respects inactive status in env JSON', () => {
      const envJson = JSON.stringify([
        {
          key: 'disabled_key',
          name: 'Inactive Key',
          tier: 'developer',
          active: false,
        },
      ]);
      const key = resolveApiKey('disabled_key', envJson);
      expect(key).not.toBeNull();
      expect(key?.active).toBe(false);
    });
  });

  describe('checkAndIncrementQuota', () => {
    it('increments usage and decreases remaining quota', async () => {
      const first = await checkAndIncrementQuota('test-id-1', 10, undefined, '2026-11-16');
      expect(first.used).toBe(1);
      expect(first.remaining).toBe(9);
      expect(first.allowed).toBe(true);

      const second = await checkAndIncrementQuota('test-id-1', 10, undefined, '2026-11-16');
      expect(second.used).toBe(2);
      expect(second.remaining).toBe(8);
      expect(second.allowed).toBe(true);
    });

    it('blocks requests once daily quota is exceeded', async () => {
      const limit = 2;
      await checkAndIncrementQuota('test-id-2', limit, undefined, '2026-11-16');
      const second = await checkAndIncrementQuota('test-id-2', limit, undefined, '2026-11-16');
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(0);

      const third = await checkAndIncrementQuota('test-id-2', limit, undefined, '2026-11-16');
      expect(third.allowed).toBe(false);
      expect(third.used).toBe(3);
      expect(third.remaining).toBe(0);
    });

    it('resets usage for different date strings', async () => {
      const day1 = await checkAndIncrementQuota('test-id-3', 5, undefined, '2026-11-16');
      expect(day1.used).toBe(1);

      const day2 = await checkAndIncrementQuota('test-id-3', 5, undefined, '2026-11-17');
      expect(day2.used).toBe(1);
    });

    it('works with KV storage binding', async () => {
      const kvStore = new Map<string, string>();
      const mockKv = {
        get: async (k: string) => kvStore.get(k) ?? null,
        put: async (k: string, v: string) => {
          kvStore.set(k, v);
        },
      };

      const res1 = await checkAndIncrementQuota('kv-client', 100, mockKv, '2026-11-16');
      expect(res1.used).toBe(1);
      expect(kvStore.get('quota:kv-client:2026-11-16')).toBe('1');

      const res2 = await checkAndIncrementQuota('kv-client', 100, mockKv, '2026-11-16');
      expect(res2.used).toBe(2);
      expect(kvStore.get('quota:kv-client:2026-11-16')).toBe('2');
    });
  });
});
