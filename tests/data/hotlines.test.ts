import { describe, expect, it } from 'vitest';
import hotlines from '../../src/generated/hotlines';
import { HotlineCategorySchema } from '../../src/modules/hotlines/schemas';

const DAY_MS = 86_400_000;

describe('hotlines dataset', () => {
  it('includes the national emergency number', () => {
    expect(hotlines.find((h) => h.number === '999')).toMatchObject({ category: 'emergency' });
  });

  it('has unique numbers, valid categories and bilingual names', () => {
    expect(new Set(hotlines.map((h) => h.number)).size).toBe(hotlines.length);
    for (const h of hotlines) {
      expect(HotlineCategorySchema.options).toContain(h.category);
      expect(h.name_bn).toMatch(/[ঀ-৿]/);
      expect(h.name_en.length).toBeGreaterThan(0);
    }
  });

  it('cites an official government source for every number', () => {
    for (const h of hotlines)
      expect(new URL(h.source).hostname, h.number).toMatch(/(^|\.)gov\.bd$/);
  });

  it('flags entries not re-verified within 180 days', () => {
    const stale = hotlines.filter((h) => Date.now() - Date.parse(h.last_verified) > 180 * DAY_MS);
    if (stale.length)
      console.warn(`Hotlines due for re-verification: ${stale.map((h) => h.number).join(', ')}`);
    expect(hotlines.every((h) => Date.parse(h.last_verified) <= Date.now())).toBe(true);
  });
});
