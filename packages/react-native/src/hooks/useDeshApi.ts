import { useCallback, useState } from 'react';

export interface UseDeshApiOptions {
  baseUrl?: string;
  apiKey?: string;
}

export function useDeshApi(options: UseDeshApiOptions = {}) {
  const baseUrl = options.baseUrl || 'https://deshapi.riadul.com';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T = unknown>(path: string, init?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          Accept: 'application/json',
          ...(init?.headers as Record<string, string>),
        };
        if (options.apiKey) headers['X-API-Key'] = options.apiKey;

        const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
          ...init,
          headers,
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || 'Desh API request failed');
        }
        return json.data as T;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, options.apiKey],
  );

  return { request, loading, error };
}
