import { describe, expect, it } from 'vitest';
import {
  calculateGpa,
  getEducationBoard,
  listEducationBoards,
  listGradingScale,
  lookupGrade,
} from '../../../src/modules/education/service';

describe('Education Boards', () => {
  it('lists all 11 education boards sorted by name', () => {
    const boards = listEducationBoards();
    expect(boards).toHaveLength(11);
    const names = boards.map((b) => b.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('filters boards by type', () => {
    const general = listEducationBoards({ type: 'general' });
    expect(general).toHaveLength(9);
    expect(general.every((b) => b.type === 'general')).toBe(true);

    const madrasah = listEducationBoards({ type: 'madrasah' });
    expect(madrasah).toHaveLength(1);
    expect(madrasah[0]!.code).toBe('MAD');

    const technical = listEducationBoards({ type: 'technical' });
    expect(technical).toHaveLength(1);
    expect(technical[0]!.code).toBe('TEC');
  });

  it('filters boards by district jurisdiction', () => {
    // Cumilla district is covered by Cumilla general board + Madrasah + Technical
    const cumillaBoards = listEducationBoards({ district: 'cumilla' });
    expect(cumillaBoards).toHaveLength(3);
    const codes = cumillaBoards.map((b) => b.code).sort();
    expect(codes).toEqual(['COM', 'MAD', 'TEC']);

    // Dinajpur district is covered by Dinajpur general board + Madrasah + Technical
    const dinajpurBoards = listEducationBoards({ district: 'dinajpur' });
    expect(dinajpurBoards).toHaveLength(3);
    expect(dinajpurBoards.map((b) => b.code).sort()).toEqual(['DIN', 'MAD', 'TEC']);
  });

  it('gets a board by slug or 3-letter code case-insensitively', () => {
    const dhakaSlug = getEducationBoard('dhaka');
    const dhakaCode = getEducationBoard('DHA');
    const dhakaLower = getEducationBoard('dha');
    expect(dhakaSlug).toBeDefined();
    expect(dhakaSlug?.slug).toBe('dhaka');
    expect(dhakaSlug).toEqual(dhakaCode);
    expect(dhakaSlug).toEqual(dhakaLower);

    const ctg = getEducationBoard('CHI');
    expect(ctg?.slug).toBe('chattogram');
    expect(ctg?.established).toBe(1995);

    expect(getEducationBoard('nonexistent')).toBeUndefined();
  });
});

describe('Grading Scale & GPA Calculation', () => {
  it('lists official 7-tier grading scale descending by marks', () => {
    const tiers = listGradingScale();
    expect(tiers).toHaveLength(7);
    expect(tiers.map((t) => t.grade)).toEqual(['A+', 'A', 'A-', 'B', 'C', 'D', 'F']);
    expect(tiers[0]!.min_marks).toBe(80);
    expect(tiers[0]!.grade_point).toBe(5.0);
    expect(tiers[6]!.grade).toBe('F');
    expect(tiers[6]!.grade_point).toBe(0.0);
  });

  it('looks up grade by marks', () => {
    expect(lookupGrade(95)?.grade).toBe('A+');
    expect(lookupGrade(80)?.grade).toBe('A+');
    expect(lookupGrade(79)?.grade).toBe('A');
    expect(lookupGrade(70)?.grade).toBe('A');
    expect(lookupGrade(65)?.grade).toBe('A-');
    expect(lookupGrade(52)?.grade).toBe('B');
    expect(lookupGrade(45)?.grade).toBe('C');
    expect(lookupGrade(33)?.grade).toBe('D');
    expect(lookupGrade(32)?.grade).toBe('F');
    expect(lookupGrade(0)?.grade).toBe('F');
  });

  it('calculates GPA with 4th subject bonus', () => {
    // 5 mandatory subjects (all A = 4.0), 1 fourth subject (A+ = 5.0)
    // 4th subject gives (5.0 - 2.0) = 3.0 bonus points
    // Total points = 5 * 4.0 + 3.0 = 23.0
    // GPA = 23.0 / 5 = 4.60
    const result = calculateGpa({
      subjects: [
        { name: 'Bangla', marks: 75 },
        { name: 'English', marks: 72 },
        { name: 'Math', marks: 78 },
        { name: 'Physics', marks: 74 },
        { name: 'Chemistry', marks: 70 },
        { name: 'Biology', marks: 85, is_fourth_subject: true },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.gpa).toBe(4.6);
    expect(result.letter_grade).toBe('A');
    expect(result.golden_a_plus).toBe(false);
    expect(result.fourth_subject_bonus).toBe(3.0);
  });

  it('identifies Golden A+ when all subjects achieve 5.0', () => {
    const result = calculateGpa({
      subjects: [
        { name: 'Bangla', marks: 85 },
        { name: 'English', marks: 90 },
        { name: 'Math', marks: 95 },
        { name: 'Physics', marks: 88 },
        { name: 'Biology', marks: 92, is_fourth_subject: true },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.gpa).toBe(5.0);
    expect(result.letter_grade).toBe('A+');
    expect(result.golden_a_plus).toBe(true);
  });

  it('fails overall if any mandatory subject fails (grade F)', () => {
    const result = calculateGpa({
      subjects: [
        { name: 'Bangla', marks: 85 },
        { name: 'English', marks: 25 }, // FAIL
        { name: 'Math', marks: 95 },
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.gpa).toBe(0.0);
    expect(result.letter_grade).toBe('F');
    expect(result.golden_a_plus).toBe(false);
  });

  it('does not fail overall if 4th subject fails', () => {
    const result = calculateGpa({
      subjects: [
        { name: 'Bangla', marks: 80 }, // 5.0
        { name: 'English', marks: 80 }, // 5.0
        { name: 'Agriculture', marks: 20, is_fourth_subject: true }, // F in 4th subject
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.gpa).toBe(5.0);
    expect(result.fourth_subject_bonus).toBe(0);
    expect(result.golden_a_plus).toBe(false);
  });
});
