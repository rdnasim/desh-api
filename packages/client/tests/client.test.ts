import { describe, expect, it, vi } from 'vitest';
import { createDeshClient, DeshApiError, DeshClient } from '../src/index.js';

describe('@deshapi/client', () => {
  it('instantiates client with default configuration', () => {
    const client = createDeshClient();
    expect(client).toBeInstanceOf(DeshClient);
    expect(typeof client.geo.districts).toBe('function');
    expect(typeof client.bangla.numToWords).toBe('function');
    expect(typeof client.nlp.stem).toBe('function');
  });

  it('builds query parameters properly', async () => {
    let requestedUrl = '';
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      requestedUrl = url;
      return new Response(
        JSON.stringify({
          success: true,
          data: [{ slug: 'dhaka' }],
          meta: { source: 'BBS', last_updated: '2026-11-17', version: 'v1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = createDeshClient({
      baseUrl: 'https://test.deshapi.com',
      fetch: mockFetch,
    });

    const res = await client.geo.districts('dhaka');
    expect(res.success).toBe(true);
    expect(requestedUrl).toBe('https://test.deshapi.com/v1/districts?division=dhaka');
  });

  it('attaches X-API-Key header when provided', async () => {
    let headersUsed: HeadersInit | undefined;
    const mockFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      headersUsed = init?.headers;
      return new Response(
        JSON.stringify({
          success: true,
          data: { tier: 'developer' },
          meta: { source: 'desh-api', last_updated: '2026-11-17', version: 'v1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = createDeshClient({
      apiKey: 'desh_live_test_123',
      fetch: mockFetch,
    });

    await client.developer.quota();
    expect((headersUsed as Record<string, string>)?.['X-API-Key']).toBe('desh_live_test_123');
  });

  it('throws typed DeshApiError on API error responses', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'not_found', message: 'District not found', message_bn: 'জেলা পাওয়া যায়নি' },
          meta: { version: 'v1' },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = createDeshClient({ fetch: mockFetch });

    await expect(client.geo.district('unknown-place')).rejects.toThrowError(DeshApiError);
    try {
      await client.geo.district('unknown-place');
    } catch (err: any) {
      expect(err).toBeInstanceOf(DeshApiError);
      expect(err.status).toBe(404);
      expect(err.code).toBe('not_found');
      expect(err.messageBn).toBe('জেলা পাওয়া যায়নি');
    }
  });

  it('executes POST requests with JSON payload', async () => {
    let capturedBody = '';
    const mockFetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({
          success: true,
          data: { input: 'ছাত্রদেরকে', stem: 'ছাত্র', suffix: 'দেরকে' },
          meta: { source: 'Bangla Academy', last_updated: '2026-11-17', version: 'v1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = createDeshClient({ fetch: mockFetch });
    const res = await client.nlp.stem('ছাত্রদেরকে');

    expect(res.data.stem).toBe('ছাত্র');
    expect(JSON.parse(capturedBody)).toEqual({ word: 'ছাত্রদেরকে' });
  });
});
