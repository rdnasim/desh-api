import { describe, expect, it } from 'vitest';
import {
  branchDetail,
  findBranchByRouting,
  getBank,
  getBranch,
  listBanks,
  listBranches,
} from '../../../src/modules/banks/service';
import { routingCheckDigitOk, validateRouting } from '../../../src/modules/validate/routing';

describe('routing check digit', () => {
  it('accepts published numbers, including ones with a leading zero', () => {
    for (const n of ['010130065', '200930370', '010010048'])
      expect(routingCheckDigitOk(n)).toBe(true);
  });

  it('rejects a single changed digit or a swap of neighbours', () => {
    expect(routingCheckDigitOk('010130066')).toBe(false);
    expect(routingCheckDigitOk('200930371')).toBe(false);
    expect(routingCheckDigitOk('100130065')).toBe(false);
  });

  it('validates format, length and Bangla digits', () => {
    expect(validateRouting('০১০১৩০০৬৫')).toMatchObject({ valid: true, normalized: '010130065' });
    expect(validateRouting('010-130-065')).toMatchObject({ valid: true });
    expect(validateRouting('10130065')).toMatchObject({ valid: false, reason: 'invalid_length' });
    expect(validateRouting('01013006x')).toMatchObject({ valid: false, reason: 'invalid_chars' });
    expect(validateRouting('010130066')).toMatchObject({
      valid: false,
      reason: 'invalid_check_digit',
    });
  });
});

describe('banks', () => {
  it('lists all 61 banks with branch counts', () => {
    const banks = listBanks();
    expect(banks).toHaveLength(61);
    expect(banks.reduce((s, b) => s + b.branch_count, 0)).toBe(11533);
    expect(banks.find((b) => b.slug === 'sonali-bank')).toMatchObject({
      bb_id: 15,
      branch_count: 1239,
      routing_code: '200',
    });
  });

  it('finds a bank by slug or Bangladesh Bank ID', () => {
    expect(getBank('dutch-bangla-bank')?.bb_id).toBe(59);
    expect(getBank('59')?.slug).toBe('dutch-bangla-bank');
    expect(getBank('nope')).toBeUndefined();
  });

  it('lists and filters branches', () => {
    const all = listBranches('agrani-bank');
    expect(all).toHaveLength(985);
    expect(
      listBranches('agrani-bank', { district: 'chandpur' }).every((b) => b.district === 'chandpur'),
    ).toBe(true);
    expect(listBranches('agrani-bank', { upazila: 'kachua-chandpur' }).map((b) => b.id)).toContain(
      '110003',
    );
    expect(listBranches('agrani-bank', { q: 'kachua' }).some((b) => b.id === '110003')).toBe(true);
    const names = all.map((b) => b.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('builds branch details with bank, district, division and upazila', () => {
    const branch = getBranch('110003');
    if (!branch) throw new Error('branch 110003 missing');
    expect(branchDetail(branch)).toMatchObject({
      id: '110003',
      routing_number: '010130065',
      bank: { slug: 'agrani-bank', bb_id: 11 },
      district: { slug: 'chandpur', name_bn: 'চাঁদপুর' },
      division: { slug: 'chattogram' },
      upazila: { slug: 'kachua-chandpur' },
    });
  });

  it('finds a branch by routing number', () => {
    expect(findBranchByRouting('010130065')?.id).toBe('110003');
    expect(findBranchByRouting('000000000')).toBeUndefined();
  });
});
