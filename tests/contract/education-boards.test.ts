import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CalculateGpaResponseSchema,
  EducationBoardSchema,
  GradeTierSchema,
} from '../../src/modules/education/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/education/boards', () => {
  it('lists all 11 education boards', async () => {
    const res = await call('/v1/education/boards');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(EducationBoardSchema));
    expect(body.data).toHaveLength(11);
    expect(body.meta.source).toContain('Ministry of Education');
  });

  it('filters boards by type and district', async () => {
    const genRes = await call('/v1/education/boards?type=general');
    const genBody = await expectOk(genRes, z.array(EducationBoardSchema));
    expect(genBody.data).toHaveLength(9);

    const dRes = await call('/v1/education/boards?district=chattogram');
    const dBody = await expectOk(dRes, z.array(EducationBoardSchema));
    // Chattogram general board + Madrasah + Technical
    expect(dBody.data).toHaveLength(3);
  });

  it('rejects invalid board type or district', async () => {
    await expectError(await call('/v1/education/boards?type=unknown'), 400, 'invalid_parameter');
    await expectError(await call('/v1/education/boards?district=invalid_district'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/education/boards/{code}', () => {
  it('gets a board by 3-letter code or slug', async () => {
    const res1 = await call('/v1/education/boards/DHA');
    const b1 = await expectOk(res1, EducationBoardSchema);
    expect(b1.data.slug).toBe('dhaka');
    expect(b1.data.code).toBe('DHA');

    const res2 = await call('/v1/education/boards/madrasah');
    const b2 = await expectOk(res2, EducationBoardSchema);
    expect(b2.data.code).toBe('MAD');
  });

  it('returns 404 for unknown board code', async () => {
    await expectError(await call('/v1/education/boards/XYZ'), 404, 'not_found');
  });
});

describe('GET /v1/education/grading-scale', () => {
  it('returns the 7 grading tiers with A+ and F', async () => {
    const res = await call('/v1/education/grading-scale');
    const body = await expectOk(res, z.array(GradeTierSchema));
    expect(body.data).toHaveLength(7);
    expect(body.data[0].grade).toBe('A+');
    expect(body.data[6].grade).toBe('F');
  });
});

describe('GET /v1/education/grade-lookup', () => {
  it('converts mark score to grade tier', async () => {
    const res = await call('/v1/education/grade-lookup?marks=82');
    const body = await expectOk(res, GradeTierSchema);
    expect(body.data.grade).toBe('A+');
    expect(body.data.grade_point).toBe(5.0);
  });

  it('rejects invalid marks outside 0-100', async () => {
    await expectError(await call('/v1/education/grade-lookup?marks=150'), 400, 'invalid_parameter');
    await expectError(await call('/v1/education/grade-lookup?marks=abc'), 400, 'invalid_parameter');
  });
});

describe('POST /v1/education/calculate-gpa', () => {
  it('calculates GPA from subject scores', async () => {
    const res = await call('/v1/education/calculate-gpa', {
      method: 'POST',
      body: JSON.stringify({
        subjects: [
          { name: 'Bangla', marks: 85 },
          { name: 'English', marks: 80 },
          { name: 'Math', marks: 90 },
          { name: 'Biology', marks: 85, is_fourth_subject: true },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await expectOk(res, CalculateGpaResponseSchema);
    expect(body.data.passed).toBe(true);
    expect(body.data.gpa).toBe(5.0);
    expect(body.data.golden_a_plus).toBe(true);
  });
});
