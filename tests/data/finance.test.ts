import { describe, expect, it } from 'vitest';
import categories from '../../src/generated/finance.tax-categories';
import years from '../../src/generated/finance.tax-years';

describe('finance tax data', () => {
  it('has a threshold for every category in every tax year', () => {
    const slugs = categories.map((c) => c.slug).sort();
    for (const y of years) expect(y.thresholds.map((t) => t.category).sort()).toEqual(slugs);
  });

  it('never sets a special category below the general threshold', () => {
    for (const y of years) {
      const general = y.thresholds.find((t) => t.category === 'general')?.amount ?? 0;
      for (const t of y.thresholds)
        expect(t.amount, `${y.tax_year} ${t.category}`).toBeGreaterThanOrEqual(general);
    }
  });

  it('has rising slab rates', () => {
    for (const y of years) {
      const rates = y.slabs.map((s) => s.rate);
      expect(rates).toEqual([...rates].sort((a, b) => a - b));
    }
  });

  it('cites the Act and lists what is still unverified', () => {
    for (const y of years) {
      expect(y.sources.some((s) => s.kind === 'act')).toBe(true);
      expect(Array.isArray(y.unverified)).toBe(true);
    }
  });

  it('matches the Finance Act 2026 general rules for 2026-27 and 2027-28', () => {
    for (const tax_year of ['2026-27', '2027-28']) {
      const y = years.find((r) => r.tax_year === tax_year);
      expect(y?.slabs).toEqual([
        { width: 300000, rate: 10 },
        { width: 400000, rate: 15 },
        { width: 500000, rate: 20 },
        { width: 2000000, rate: 25 },
        { width: null, rate: 30 },
      ]);
      expect(y?.thresholds.find((t) => t.category === 'general')?.amount).toBe(400000);
      expect(y?.minimum_tax).toEqual({ general: 5000, new_taxpayer: 1000 });
    }
  });
});
