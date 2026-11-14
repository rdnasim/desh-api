import { describe, expect, it } from 'vitest';
import { dps } from '../../../src/modules/finance/dps';

const closedForm = (d: number, rate: number, n: number) => {
  const i = rate / 1200;
  return Math.round(d * (((1 + i) ** n - 1) / i) * (1 + i) * 100) / 100;
};

describe('dps', () => {
  it('matches the annuity-due closed form for monthly compounding', () => {
    const r = dps(5000, 8, 5);
    expect(r.total_deposit).toBe(300000);
    expect(r.maturity_value).toBeCloseTo(closedForm(5000, 8, 60), 1);
    expect(r.interest).toBeCloseTo(r.maturity_value - 300000, 2);
  });

  it('earns less with less frequent compounding', () => {
    const m = dps(5000, 8, 5, 'monthly').maturity_value;
    const q = dps(5000, 8, 5, 'quarterly').maturity_value;
    const h = dps(5000, 8, 5, 'half-yearly').maturity_value;
    const y = dps(5000, 8, 5, 'yearly').maturity_value;
    expect(m).toBeGreaterThan(q);
    expect(q).toBeGreaterThan(h);
    expect(h).toBeGreaterThan(y);
  });

  it('yearly compounding over one year is simple interest on each deposit', () => {
    // Deposit k (k = 1..12) earns (13 − k) months: 1000 × 12% / 12 × 78 = 780.
    expect(dps(1000, 12, 1, 'yearly')).toMatchObject({ interest: 780, maturity_value: 12780 });
  });

  it('pays no interest at 0%', () => {
    expect(dps(2000, 0, 3)).toMatchObject({
      total_deposit: 72000,
      interest: 0,
      maturity_value: 72000,
    });
  });
});
