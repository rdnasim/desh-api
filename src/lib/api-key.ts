export type ApiKeyTier = 'anonymous' | 'developer' | 'enterprise';

export interface ApiTierConfig {
  tier: ApiKeyTier;
  name: string;
  rate_limit_per_minute: number;
  daily_quota: number;
}

export const TIERS: Record<ApiKeyTier, ApiTierConfig> = {
  anonymous: {
    tier: 'anonymous',
    name: 'Free / Anonymous',
    rate_limit_per_minute: 120,
    daily_quota: 10_000,
  },
  developer: {
    tier: 'developer',
    name: 'Developer',
    rate_limit_per_minute: 600,
    daily_quota: 50_000,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise / Partner',
    rate_limit_per_minute: 1800,
    daily_quota: 500_000,
  },
};

export interface ApiKeyRecord {
  key: string;
  name: string;
  tier: ApiKeyTier;
  active: boolean;
  rate_limit_per_minute: number;
  daily_quota: number;
  owner?: string;
  created_at?: string;
}

/** Built-in demo / test keys enabled out-of-the-box. */
const BUILTIN_KEYS: Record<string, ApiKeyRecord> = {
  desh_dev_test_key: {
    key: 'desh_dev_test_key',
    name: 'Developer Test Key',
    tier: 'developer',
    active: true,
    rate_limit_per_minute: TIERS.developer.rate_limit_per_minute,
    daily_quota: TIERS.developer.daily_quota,
    owner: 'test@example.com',
  },
  desh_ent_test_key: {
    key: 'desh_ent_test_key',
    name: 'Enterprise Test Key',
    tier: 'enterprise',
    active: true,
    rate_limit_per_minute: TIERS.enterprise.rate_limit_per_minute,
    daily_quota: TIERS.enterprise.daily_quota,
    owner: 'partner@example.com',
  },
};

/** Extracts API key from request headers. */
export function extractApiKey(getHeader: (name: string) => string | undefined): string | null {
  const xApiKey = getHeader('x-api-key') || getHeader('X-API-Key');
  if (xApiKey && typeof xApiKey === 'string') {
    return xApiKey.trim();
  }

  const auth = getHeader('authorization') || getHeader('Authorization');
  if (auth && typeof auth === 'string') {
    const trimmed = auth.trim();
    if (trimmed.toLowerCase().startsWith('bearer ')) {
      return trimmed.slice(7).trim();
    }
  }

  return null;
}

/** Validates and retrieves the record for a given API key string. */
export function resolveApiKey(keyString: string, envApiKeysJson?: string): ApiKeyRecord | null {
  if (!keyString) return null;

  // Check built-in test keys
  if (BUILTIN_KEYS[keyString]) {
    return BUILTIN_KEYS[keyString];
  }

  // Check environment-provided keys JSON
  if (envApiKeysJson) {
    try {
      const parsed = JSON.parse(envApiKeysJson);
      if (Array.isArray(parsed)) {
        const found = parsed.find(
          (k: unknown) =>
            typeof k === 'object' && k !== null && (k as Record<string, unknown>).key === keyString,
        ) as Record<string, any> | undefined;
        if (found) {
          const tier: ApiKeyTier =
            found.tier && TIERS[found.tier as ApiKeyTier] ? found.tier : 'developer';
          const tierDefaults = TIERS[tier];
          return {
            key: found.key,
            name: found.name ?? `${tierDefaults.name} Key`,
            tier,
            active: found.active !== false,
            rate_limit_per_minute:
              found.rate_limit_per_minute ?? tierDefaults.rate_limit_per_minute,
            daily_quota: found.daily_quota ?? tierDefaults.daily_quota,
            owner: found.owner,
            created_at: found.created_at,
          };
        }
      }
    } catch {
      // Ignore malformed JSON env
    }
  }

  return null;
}

/** In-memory store for tracking daily quotas (tests & local dev). */
const inMemoryDailyUsage = new Map<string, number>();

export function clearDailyQuotaStore(): void {
  inMemoryDailyUsage.clear();
}

export interface QuotaCheckResult {
  used: number;
  remaining: number;
  allowed: boolean;
  daily_quota: number;
  reset_seconds: number;
  resets_at: string;
}

export type QuotaKvStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: Record<string, unknown>): Promise<unknown>;
};

/** Checks and increments the daily request quota for a key/IP. */
export async function checkAndIncrementQuota(
  identifier: string,
  dailyQuota: number,
  kv?: QuotaKvStore | Pick<KVNamespace, 'get' | 'put'>,
  dateOverride?: string,
): Promise<QuotaCheckResult> {
  const now = new Date();
  const todayStr = dateOverride ?? now.toISOString().slice(0, 10); // YYYY-MM-DD

  // Compute seconds until midnight UTC
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const resetSeconds = Math.max(1, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
  const resetsAt = tomorrow.toISOString();

  const quotaKey = `quota:${identifier}:${todayStr}`;

  let currentCount = 0;

  if (kv) {
    try {
      const val = await kv.get(quotaKey);
      if (val) {
        currentCount = Number.parseInt(val, 10) || 0;
      }
    } catch {
      currentCount = inMemoryDailyUsage.get(quotaKey) || 0;
    }
  } else {
    currentCount = inMemoryDailyUsage.get(quotaKey) || 0;
  }

  const newCount = currentCount + 1;

  if (kv) {
    try {
      await kv.put(quotaKey, String(newCount), { expirationTtl: 86400 * 2 });
    } catch {
      inMemoryDailyUsage.set(quotaKey, newCount);
    }
  } else {
    inMemoryDailyUsage.set(quotaKey, newCount);
  }

  const allowed = newCount <= dailyQuota;
  const remaining = Math.max(0, dailyQuota - newCount);

  return {
    used: newCount,
    remaining,
    allowed,
    daily_quota: dailyQuota,
    reset_seconds: resetSeconds,
    resets_at: resetsAt,
  };
}
