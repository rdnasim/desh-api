import { describe, expect, it } from 'vitest';
import { gratuity } from '../../../src/modules/finance/gratuity';

describe('gratuity (Labour Act 2006 s. 2(10))', () => {
  it('pays 30 days per completed year', () => {
    expect(gratuity(30000, 5, 0)).toMatchObject({
      counted_years: 5,
      days_per_year: 30,
      daily_wage: 1000,
      gratuity: 150000,
    });
  });

  it('counts a final part over six months as a year', () => {
    expect(gratuity(30000, 5, 7)).toMatchObject({ counted_years: 6, gratuity: 180000 });
    expect(gratuity(30000, 5, 6)).toMatchObject({ counted_years: 5, gratuity: 150000 });
  });

  it('uses 30 days at exactly 10 years and 45 days beyond', () => {
    expect(gratuity(30000, 10, 0)).toMatchObject({ days_per_year: 30, gratuity: 300000 });
    expect(gratuity(30000, 10, 1)).toMatchObject({
      counted_years: 10,
      days_per_year: 45,
      gratuity: 450000,
    });
    expect(gratuity(30000, 12, 8)).toMatchObject({
      counted_years: 13,
      days_per_year: 45,
      gratuity: 585000,
    });
  });

  it('is 0 under six months and 1 year for 7 months', () => {
    expect(gratuity(30000, 0, 5).gratuity).toBe(0);
    expect(gratuity(30000, 0, 7)).toMatchObject({ counted_years: 1, gratuity: 30000 });
  });

  it('rounds to the paisa', () => {
    expect(gratuity(25555, 3, 0)).toMatchObject({ daily_wage: 851.83, gratuity: 76665 });
  });
});
