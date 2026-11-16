import { describe, expect, it } from 'vitest';
import providers from '../../../src/generated/mfs.providers';
import { calculateMfsFee, compareMfsFees } from '../../../src/modules/mfs/calculator';

describe('MFS Calculator', () => {
  const bkash = providers.find((p) => p.slug === 'bkash')!;
  const nagad = providers.find((p) => p.slug === 'nagad')!;
  const rocket = providers.find((p) => p.slug === 'rocket')!;
  const upay = providers.find((p) => p.slug === 'upay')!;
  const tap = providers.find((p) => p.slug === 'tap')!;

  it('calculates bKash app cash-out (1.75%) accurately', () => {
    const res = calculateMfsFee({
      provider: bkash,
      action: 'cash-out',
      channel: 'app',
      amount: 5000,
    });
    expect(res).not.toBeNull();
    expect(res?.amount).toBe(5000);
    expect(res?.fee).toBe(87.5);
    expect(res?.total_deducted).toBe(5087.5);
    expect(res?.rate_percent).toBe(1.75);
    expect(res?.exceeds_single_transaction_limit).toBe(false);
  });

  it('calculates bKash USSD cash-out (1.85%)', () => {
    const res = calculateMfsFee({
      provider: bkash,
      action: 'cash-out',
      channel: 'ussd',
      amount: 1000,
    });
    expect(res).not.toBeNull();
    expect(res?.fee).toBe(18.5);
    expect(res?.total_deducted).toBe(1018.5);
  });

  it('calculates bKash Priyo Agent cash-out (1.49%)', () => {
    const res = calculateMfsFee({
      provider: bkash,
      action: 'cash-out',
      channel: 'special',
      amount: 5000,
    });
    expect(res).not.toBeNull();
    expect(res?.fee).toBe(74.5);
    expect(res?.total_deducted).toBe(5074.5);
  });

  it('calculates Nagad app cash-out (1.149%) accurately', () => {
    const res = calculateMfsFee({
      provider: nagad,
      action: 'cash-out',
      channel: 'app',
      amount: 1000,
    });
    expect(res).not.toBeNull();
    expect(res?.fee).toBe(11.49);
    expect(res?.total_deducted).toBe(1011.49);
  });

  it('calculates Rocket ATM cash-out (0.90%)', () => {
    const res = calculateMfsFee({
      provider: rocket,
      action: 'cash-out',
      channel: 'atm',
      amount: 10000,
    });
    expect(res).not.toBeNull();
    expect(res?.fee).toBe(90.0);
    expect(res?.total_deducted).toBe(10090.0);
  });

  it('calculates send-money correctly (free on Nagad, Upay, TAP apps; ৳5 on bKash, Rocket)', () => {
    const nagadSend = calculateMfsFee({
      provider: nagad,
      action: 'send-money',
      channel: 'app',
      amount: 500,
    });
    expect(nagadSend?.fee).toBe(0);

    const upaySend = calculateMfsFee({
      provider: upay,
      action: 'send-money',
      channel: 'app',
      amount: 500,
    });
    expect(upaySend?.fee).toBe(0);

    const bkashSend = calculateMfsFee({
      provider: bkash,
      action: 'send-money',
      channel: 'app',
      amount: 500,
    });
    expect(bkashSend?.fee).toBe(5);
  });

  it('supports Bangla digits as amount input', () => {
    const res = calculateMfsFee({
      provider: bkash,
      action: 'cash-out',
      channel: 'app',
      amount: '৫০০০',
    });
    expect(res).not.toBeNull();
    expect(res?.amount).toBe(5000);
    expect(res?.fee).toBe(87.5);
  });

  it('flags transactions exceeding single-transaction limits', () => {
    const res = calculateMfsFee({
      provider: bkash,
      action: 'cash-out',
      channel: 'app',
      amount: 30000,
    });
    expect(res?.exceeds_single_transaction_limit).toBe(true);
  });

  it('returns null for invalid amounts or unsupported channels', () => {
    expect(
      calculateMfsFee({ provider: bkash, action: 'cash-out', channel: 'app', amount: -100 }),
    ).toBeNull();
    expect(
      calculateMfsFee({ provider: bkash, action: 'cash-out', channel: 'app', amount: 'abc' }),
    ).toBeNull();
    expect(
      calculateMfsFee({ provider: nagad, action: 'cash-out', channel: 'atm', amount: 1000 }),
    ).toBeNull();
  });

  it('ranks all providers by lowest fee for app cash-out of ৳10,000', () => {
    const comp = compareMfsFees([bkash, nagad, rocket, upay, tap], 'cash-out', 'app', 10000);
    expect(comp).not.toBeNull();
    expect(comp?.rankings.length).toBe(5);

    // Rankings: Nagad (114.9) < Upay (140) < TAP (147) < Rocket (167) < bKash (175)
    expect(comp?.rankings.map((r) => r.provider)).toEqual([
      'nagad',
      'upay',
      'tap',
      'rocket',
      'bkash',
    ]);
    expect(comp?.rankings[0]?.fee).toBe(114.9);
    expect(comp?.rankings[4]?.fee).toBe(175.0);
  });
});
