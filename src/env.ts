export interface Env {
  /** Workers Rate Limiting binding (120 requests / 60 s per key). Absent in some test setups. */
  RATE_LIMITER?:
    | Pick<RateLimit, 'limit'>
    | { limit: (o: RateLimitOptions) => Promise<{ success: boolean }> };
  /** Git SHA or release label, set at deploy time. */
  VERSION?: string;
}

export type AppEnv = { Bindings: Env };
