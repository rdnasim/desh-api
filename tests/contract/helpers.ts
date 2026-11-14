import { env } from 'cloudflare:workers';
import { expect } from 'vitest';
import type { z } from 'zod';
import app from '../../src/app';
import type { Env } from '../../src/env';

export interface TestEnvOverrides {
  RATE_LIMITER?: Env['RATE_LIMITER'];
}

/** Calls the app in-process inside workerd with the configured bindings. */
export async function call(path: string, init?: RequestInit, overrides: TestEnvOverrides = {}) {
  return app.request(path, init, { ...(env as unknown as Env), ...overrides });
}

export async function expectOk<T extends z.ZodTypeAny>(res: Response, dataSchema?: T) {
  expect(res.status, await res.clone().text()).toBe(200);
  expect(res.headers.get('content-type')).toContain('application/json');
  const body = (await res.json()) as {
    success: boolean;
    data: unknown;
    meta: Record<string, unknown>;
  };
  expect(body.success).toBe(true);
  expect(body.meta).toMatchObject({ version: 'v1' });
  expect(typeof body.meta.source).toBe('string');
  expect(body.meta.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  if (dataSchema) {
    const parsed = dataSchema.safeParse(body.data);
    expect(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 3))).toBe(true);
  }
  return body as { success: true; data: z.infer<T>; meta: Record<string, unknown> };
}

export async function expectError(res: Response, status: number, code: string) {
  expect(res.status, await res.clone().text()).toBe(status);
  const body = (await res.json()) as {
    success: boolean;
    error: { code: string; message: string };
    meta: Record<string, unknown>;
  };
  expect(body.success).toBe(false);
  expect(body.error.code).toBe(code);
  expect(body.error.message.length).toBeGreaterThan(0);
  expect(body.meta).toMatchObject({ version: 'v1' });
  return body;
}
