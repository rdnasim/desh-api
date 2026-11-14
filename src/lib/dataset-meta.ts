import { z } from '@hono/zod-openapi';

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date (YYYY-MM-DD)');

export const DatasetMetaSchema = z.object({
  dataset: z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/),
  source: z.string().min(1),
  source_url: z.string().url().optional(),
  licence: z.string().min(1),
  retrieved: IsoDate,
  last_updated: IsoDate,
  credits: z.array(z.string()),
});

export type DatasetMeta = z.infer<typeof DatasetMetaSchema>;
