import { describe, expect, it } from 'vitest';
import { emi } from '../../../src/modules/finance/emi';

describe('emi', () => {
  it('matches the reducing-balance formula (10 lakh, 9%, 5 years)', () => {
    const r = emi(1000000, 9, 60);
    expect(r.emi).toBe(20758.36);
    // 59 × 20,758.36 + a final 20,757.99: rounding to the paisa leaves the last one 37 paisa short.
    expect(r.total_payment).toBe(1245501.23);
    expect(r.total_interest).toBe(245501.23);
    expect(r.schedule).toBeUndefined();
  });

  it('divides evenly at 0%', () => {
    expect(emi(120000, 0, 12)).toMatchObject({ emi: 10000, total_interest: 0 });
  });

  it('handles a single month', () => {
    expect(emi(100000, 12, 1)).toMatchObject({ emi: 101000, total_interest: 1000 });
  });

  it('builds a schedule that closes at exactly 0 and adds up', () => {
    const r = emi(500000, 11.5, 36, true);
    const s = r.schedule ?? [];
    expect(s).toHaveLength(36);
    expect(s.at(-1)?.balance).toBe(0);
    const sum = (k: 'payment' | 'principal' | 'interest') =>
      Math.round(s.reduce((a, l) => a + l[k], 0) * 100) / 100;
    expect(sum('principal')).toBe(500000);
    expect(sum('payment')).toBe(r.total_payment);
    expect(sum('interest')).toBe(r.total_interest);
    expect(s[0]).toMatchObject({ month: 1, interest: 4791.67 });
    for (const l of s.slice(0, -1)) expect(l.payment).toBe(r.emi);
  });
});
