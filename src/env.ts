import type { ApiKeyRecord, QuotaCheckResult } from './lib/api-key';

export interface Env {
  /** Workers Rate Limiting binding (120 requests / 60 s per key). Absent in some test setups. */
  RATE_LIMITER?:
    | Pick<RateLimit, 'limit'>
    | { limit: (o: RateLimitOptions) => Promise<{ success: boolean }> };
  /** Last good copies of live data (gold prices). Absent in some test setups. */
  LIVE_DATA?: Pick<KVNamespace, 'get' | 'put'>;
  /** KV store for daily quota tracking or API keys. */
  QUOTA_KV?: Pick<KVNamespace, 'get' | 'put'>;
  /** JSON-serialized API keys or list for edge/local configuration. */
  API_KEYS?: string;
  /** Git SHA or release label, set at deploy time. */
  VERSION?: string;
}

export interface AppVariables {
  apiKey?: ApiKeyRecord;
  quotaResult?: QuotaCheckResult;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };
