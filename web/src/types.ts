export type HttpMethod = 'GET' | 'POST';

export interface ApiParam {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  default?: string;
  description: string;
  options?: string[];
}

export interface ApiEndpoint {
  id: string;
  module: string;
  name: string;
  nameBn?: string;
  method: HttpMethod;
  path: string;
  description: string;
  params?: ApiParam[];
  bodyExample?: string;
  defaultPathWithParams: string;
}

export interface DeveloperQuota {
  tier: string;
  tier_name: string;
  api_key: string | null;
  key_name: string | null;
  rate_limit_per_minute: number;
  daily_quota: number;
  daily_used: number;
  daily_remaining: number;
  resets_at: string;
  reset_seconds: number;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  success: boolean;
  response: any;
  headers: Record<string, string>;
}
