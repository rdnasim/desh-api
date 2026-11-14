import { round2 } from './money';

/**
 * Statutory minimum gratuity, Bangladesh Labour Act 2006 s. 2(10): 30 days' last wages per
 * completed year (a final part over six months counts as a year), or 45 days per year when
 * service is more than 10 years. One day's wage = monthly wage ÷ 30 (research F9).
 */
export function gratuity(monthlyWage: number, years: number, months = 0) {
  const countedYears = years + (months > 6 ? 1 : 0);
  const daysPerYear = years * 12 + months > 120 ? 45 : 30;
  const dailyWage = monthlyWage / 30;
  return {
    monthly_wage: monthlyWage,
    service: { years, months },
    counted_years: countedYears,
    days_per_year: daysPerYear,
    daily_wage: round2(dailyWage),
    gratuity: round2(dailyWage * daysPerYear * countedYears),
  };
}
