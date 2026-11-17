export interface ApiResponseMeta {
  source: string;
  last_updated: string;
  version: string;
  disclaimer?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  maxRetries?: number;
}
