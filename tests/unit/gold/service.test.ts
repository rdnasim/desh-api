import { describe, expect, it } from 'vitest';
import { parseBajus, VORI_GRAMS } from '../../../src/modules/gold/bajus';
import { zakat } from '../../../src/modules/gold/zakat';
import fixture from '../../golden/gold/bajus-gold-price-2026-11-14.txt?raw';

describe('parseBajus', () => {
  const prices = parseBajus(fixture);

  it('reads all gold and silver prices per gram and the effective date', () => {
    expect(prices.effective_date).toBe('2026-11-14');
    expect(prices.gold).toEqual({
      '22k': { per_gram: 18655, per_vori: 217592 },
      '21k': { per_gram: 17815, per_vori: 207794 },
      '18k': { per_gram: 15300, per_vori: 178459 },
      traditional: { per_gram: 12500, per_vori: 145800 },
    });
    expect(prices.silver['22k']).toEqual({ per_gram: 300, per_vori: 3499 });
    expect(prices.silver.traditional.per_gram).toBe(190);
  });

  it('uses 1 vori = 11.664 g', () => {
    expect(VORI_GRAMS).toBe(11.664);
  });

  it('throws when the page no longer has the table', () => {
    expect(() => parseBajus('<html>maintenance</html>')).toThrow();
    expect(() => parseBajus(fixture.replace('21 KARAT', '21 CARAT'))).toThrow();
  });
});

describe('zakat', () => {
  const prices = parseBajus(fixture);

  it('uses 52.5 vori of silver by default and charges 2.5%', () => {
    const r = zakat(prices, 1_000_000);
    expect(r).toMatchObject({ basis: 'silver', karat: '22k', nisab_grams: 612.36, rate: 2.5 });
    expect(r.nisab_value).toBe(183708); // 612.36 g × 300
    expect(r).toMatchObject({ due: true, zakat: 25000 });
  });

  it('can use 7.5 vori of gold', () => {
    const r = zakat(prices, 1_000_000, 'gold');
    expect(r.nisab_grams).toBe(87.48);
    expect(r.nisab_value).toBe(1631939.4); // 87.48 g × 18,655
    expect(r).toMatchObject({ due: false, zakat: 0 });
  });

  it('reports the other basis too', () => {
    const r = zakat(prices, 500_000);
    expect(r.other_basis).toMatchObject({ basis: 'gold', due: false });
  });

  it('is due exactly at the nisab, not below', () => {
    expect(zakat(prices, 183708).due).toBe(true);
    expect(zakat(prices, 183707.99).due).toBe(false);
  });
});
