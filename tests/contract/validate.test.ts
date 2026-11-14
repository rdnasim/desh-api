import { afterEach, describe, expect, it, vi } from 'vitest';
import { call, expectError, expectOk } from './helpers';

const post = (type: string, value: unknown) =>
  call(`/v1/validate/${type}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ value }),
  });

afterEach(() => vi.restoreAllMocks());

describe('GET validators', () => {
  it.each([
    ['/v1/validate/nid/1234567890', 'nid'],
    [`/v1/validate/vehicle?plate=${encodeURIComponent('ঢাকা মেট্রো-গ ১১-২২৩৩')}`, 'vehicle'],
    ['/v1/validate/tin/123456789012', 'tin'],
    ['/v1/validate/bin/123456789', 'bin'],
    ['/v1/validate/postcode/1205', 'postcode'],
  ])('%s is valid and never cached', async (path, type) => {
    const res = await call(path);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await expectOk(res);
    expect(body.data).toMatchObject({ type, valid: true });
  });

  it('returns 200 with valid:false for a malformed value', async () => {
    const body = await expectOk(await call('/v1/validate/nid/12345'));
    expect(body.data).toEqual({ type: 'nid', valid: false, reason: 'invalid_length' });
  });

  it('400s a missing plate', async () => {
    await expectError(await call('/v1/validate/vehicle'), 400, 'invalid_parameter');
  });
});

describe('POST /v1/validate/{type}', () => {
  it.each([
    ['nid', '19901234567890123'],
    ['vehicle', 'Dhaka Metro-Ga 11-2233'],
    ['tin', '123456789012'],
    ['bin', '000123456-0101'],
    ['postcode', '1205'],
  ])('validates %s', async (type, value) => {
    const body = await expectOk(await post(type, value));
    expect(body.data).toMatchObject({ type, valid: true });
  });

  it('400s an unknown type or missing value', async () => {
    await expectError(await post('passport', 'X'), 400, 'invalid_parameter');
    await expectError(
      await call('/v1/validate/nid', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      }),
      400,
      'invalid_parameter',
    );
  });
});

describe('privacy', () => {
  it('never writes the submitted value to logs', async () => {
    const lines: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => lines.push(args.join(' ')));
    vi.spyOn(console, 'error').mockImplementation((...args) => lines.push(args.join(' ')));
    await call('/v1/validate/nid/19901234567890123');
    await post('nid', '19871234567890123');
    await call(`/v1/phone/${encodeURIComponent('+8801712345678')}`);
    const logged = lines.join('\n');
    expect(lines.length).toBeGreaterThan(0);
    expect(logged).not.toContain('1990123456789');
    expect(logged).not.toContain('1987123456789');
    expect(logged).not.toContain('1712345678');
    expect(logged).toContain('/v1/validate/nid/:number');
  });
});
