import { z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import datasetMeta from '../generated/meta';

export const MetaSchema = z
  .object({
    source: z.string(),
    last_updated: z.string(),
    version: z.literal('v1'),
    disclaimer: z.string().optional(),
    pagination: z
      .object({ page: z.number().int(), per_page: z.number().int(), total: z.number().int() })
      .optional(),
  })
  .openapi('Meta');

export type Meta = z.infer<typeof MetaSchema>;

export const ErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: 'not_found' }),
      message: z.string(),
      message_bn: z.string().optional(),
      details: z.unknown().optional(),
    }),
    meta: MetaSchema,
  })
  .openapi('Error');

export function envelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ success: z.literal(true), data, meta: MetaSchema });
}

/** Meta for responses built from one or more datasets in data/meta.json. */
export function metaFor(datasets: readonly string[], extra: Partial<Meta> = {}): Meta {
  const entries = datasets.map((key) => {
    const entry = datasetMeta[key];
    if (!entry) throw new Error(`Unknown dataset meta: ${key}`);
    return entry;
  });
  const sources = [...new Set(entries.map((e) => e.source))];
  const lastUpdated = entries
    .map((e) => e.last_updated)
    .sort()
    .at(-1) as string;
  return { source: sources.join('; '), last_updated: lastUpdated, version: 'v1', ...extra };
}

/** Meta for computed responses that do not read a dataset. */
export function staticMeta(source: string, lastUpdated: string, extra: Partial<Meta> = {}): Meta {
  return { source, last_updated: lastUpdated, version: 'v1', ...extra };
}

export function ok<T>(c: Context, data: T, meta: Meta) {
  return c.json({ success: true as const, data, meta }, 200);
}

export interface Page<T> {
  items: T[];
  pagination: { page: number; per_page: number; total: number };
}

export function paginate<T>(items: readonly T[], page = 1, perPage = 100): Page<T> {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    pagination: { page, per_page: perPage, total: items.length },
  };
}
