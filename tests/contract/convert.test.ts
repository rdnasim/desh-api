import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

const postJson = (path: string, body: unknown) =>
  call(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /v1/convert/bijoy-to-unicode', () => {
  it('converts JSON bodies', async () => {
    const body = await expectOk(
      await postJson('/v1/convert/bijoy-to-unicode', { text: 'Avgvi †mvbvi evsjv' }),
    );
    expect(body.data).toEqual({ input_length: 18, output: 'আমার সোনার বাংলা' });
    expect(body.meta.source).toContain('SutonnyMJ');
  });

  it('converts plain-text bodies', async () => {
    const res = await call('/v1/convert/bijoy-to-unicode', {
      method: 'POST',
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: 'Avgvi †mvbvi evsjv',
    });
    const body = await expectOk(res);
    expect(body.data).toMatchObject({ output: 'আমার সোনার বাংলা' });
  });

  it('does not echo the input', async () => {
    const res = await postJson('/v1/convert/bijoy-to-unicode', { text: 'Avgvi' });
    expect(JSON.stringify(await res.json())).not.toContain('Avgvi');
  });

  it('400s empty input', async () => {
    await expectError(
      await postJson('/v1/convert/bijoy-to-unicode', { text: '' }),
      400,
      'invalid_parameter',
    );
    await expectError(await postJson('/v1/convert/bijoy-to-unicode', {}), 400, 'invalid_parameter');
  });

  it('413s bodies over 100 KB', async () => {
    const res = await postJson('/v1/convert/bijoy-to-unicode', { text: 'a'.repeat(101 * 1024) });
    await expectError(res, 413, 'payload_too_large');
  });
});

describe('POST /v1/convert/unicode-to-bijoy', () => {
  it('converts Unicode to Bijoy', async () => {
    const text = 'আপনার দিনটি শুভ হোক।';
    const body = await expectOk(await postJson('/v1/convert/unicode-to-bijoy', { text }));
    const { output } = body.data as { output: string };
    expect(output).not.toMatch(/[\u0980-\u09FF]/);
    const back = await expectOk(await postJson('/v1/convert/bijoy-to-unicode', { text: output }));
    expect(back.data).toMatchObject({ output: text });
  });
});
