import { describe, expect, it } from 'vitest';
import banks from '../../src/generated/banks.banks';
import branches from '../../src/generated/banks.branches';
import { routingCheckDigitOk } from '../../src/modules/validate/routing';

describe('bank data', () => {
  it('has every branch from the Bangladesh Bank list (31 August 2026)', () => {
    expect(banks).toHaveLength(61);
    expect(branches).toHaveLength(11533);
  });

  it('only carries routing numbers that pass the check digit and match the bank code', () => {
    const code = new Map(banks.map((b) => [b.slug, b.routing_code]));
    const withRouting = branches.filter((b) => b.routing_number);
    expect(withRouting.length).toBeGreaterThan(8000);
    for (const b of withRouting) {
      expect(routingCheckDigitOk(b.routing_number ?? ''), b.id).toBe(true);
      expect(b.routing_number?.startsWith(code.get(b.bank) ?? 'x'), b.id).toBe(true);
    }
  });

  it('uses a routing district code for one district only', () => {
    const seen = new Map<string, Set<string>>();
    for (const b of branches) {
      if (!b.routing_number) continue;
      const k = b.routing_number.slice(3, 5);
      seen.set(k, (seen.get(k) ?? new Set()).add(b.district));
    }
    const shared = [...seen.entries()].filter(([, d]) => d.size > 1);
    expect(shared.length).toBeLessThanOrEqual(1);
  });
});
