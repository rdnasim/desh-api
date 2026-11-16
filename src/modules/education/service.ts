import boards from '../../generated/education.boards';
import gradingScale from '../../generated/education.grading-scale';
import universities from '../../generated/education.universities';
import categories from '../../generated/education.university-categories';
import { normalizeForSearch } from '../../lib/normalize';
import type {
  CalculateGpaRequest,
  CalculateGpaResponse,
  EducationBoard,
  GradeTier,
  SubjectEvaluation,
  University,
  UniversityCategory,
} from './schemas';

const sorted = [...universities].sort((a, b) => a.name_en.localeCompare(b.name_en));
const bySlug = new Map(universities.map((u) => [u.slug, u]));

export interface UniversityFilter {
  category?: UniversityCategory['slug'];
  district?: string;
  q?: string;
}

export function listUniversities({ category, district, q }: UniversityFilter = {}): University[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);
  return sorted.filter(
    (u) =>
      (category === undefined || u.category === category) &&
      (district === undefined || u.district === district) &&
      (query === undefined || normalizeForSearch(u.name_en).includes(query)),
  );
}

export const getUniversity = (slug: string) => bySlug.get(slug);

export const listUniversityCategories = () =>
  categories.map((c) => ({
    ...c,
    count: universities.filter((u) => u.category === c.slug).length,
  }));

// --- Education Boards & Grading System ---

const sortedBoards = [...boards].sort((a, b) => a.name_en.localeCompare(b.name_en));
const boardBySlug = new Map(boards.map((b) => [b.slug, b]));
const boardByCode = new Map(boards.map((b) => [b.code.toUpperCase(), b]));

// Sort grading scale descending by min_marks (A+ to F)
const sortedGradingScale = [...gradingScale].sort((a, b) => b.min_marks - a.min_marks);

export interface BoardFilter {
  type?: EducationBoard['type'];
  district?: string;
  q?: string;
}

export function listEducationBoards({ type, district, q }: BoardFilter = {}): EducationBoard[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);
  return sortedBoards.filter((b) => {
    if (type !== undefined && b.type !== type) return false;
    if (district !== undefined && !b.districts.includes(district)) return false;
    if (query !== undefined) {
      const matchName = normalizeForSearch(b.name_en).includes(query);
      const matchShort = normalizeForSearch(b.short_name_en).includes(query);
      const matchCode = b.code.toLowerCase().includes(query.toLowerCase());
      if (!matchName && !matchShort && !matchCode) return false;
    }
    return true;
  });
}

export function getEducationBoard(codeOrSlug: string): EducationBoard | undefined {
  const key = codeOrSlug.trim();
  return boardBySlug.get(key.toLowerCase()) ?? boardByCode.get(key.toUpperCase());
}

export function listGradingScale(): GradeTier[] {
  return sortedGradingScale;
}

export function lookupGrade(marks: number): GradeTier | undefined {
  return sortedGradingScale.find((tier) => marks >= tier.min_marks && marks <= tier.max_marks);
}

export function letterGradeForGpa(gpa: number): string {
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

export function calculateGpa(input: CalculateGpaRequest): CalculateGpaResponse {
  let fourthSubjectEncountered = false;
  const evaluations: SubjectEvaluation[] = [];

  for (const sub of input.subjects) {
    const isFourth = Boolean(sub.is_fourth_subject && !fourthSubjectEncountered);
    if (isFourth) {
      fourthSubjectEncountered = true;
    }

    let grade = 'F';
    let gradePoint = 0.0;

    if (sub.marks !== undefined) {
      const tier = lookupGrade(sub.marks);
      grade = tier ? tier.grade : 'F';
      gradePoint = tier ? tier.grade_point : 0.0;
    } else if (sub.grade_point !== undefined) {
      gradePoint = sub.grade_point;
      grade = letterGradeForGpa(gradePoint);
    }

    let bonus = 0;
    if (isFourth && gradePoint > 2.0) {
      bonus = Number((gradePoint - 2.0).toFixed(2));
    }

    evaluations.push({
      name: sub.name,
      marks: sub.marks,
      grade,
      grade_point: gradePoint,
      is_fourth_subject: isFourth,
      fourth_subject_bonus_points: bonus,
    });
  }

  const mandatorySubjects = evaluations.filter((s) => !s.is_fourth_subject);
  const fourthSubject = evaluations.find((s) => s.is_fourth_subject);

  // If any mandatory subject failed (grade F / 0 grade points), student failed overall
  const failedMandatory = mandatorySubjects.some((s) => s.grade === 'F' || s.grade_point === 0);
  const passed = mandatorySubjects.length > 0 && !failedMandatory;

  const mandatoryPoints = mandatorySubjects.reduce((acc, s) => acc + s.grade_point, 0);
  const fourthBonus = fourthSubject ? fourthSubject.fourth_subject_bonus_points : 0;

  let gpa = 0.0;
  if (passed && mandatorySubjects.length > 0) {
    const rawGpa = (mandatoryPoints + fourthBonus) / mandatorySubjects.length;
    gpa = Math.min(5.0, Number(rawGpa.toFixed(2)));
  }

  const letterGrade = passed ? letterGradeForGpa(gpa) : 'F';

  // Golden A+ means all mandatory subjects scored GPA 5.0 (A+) and 4th subject (if present) also 5.0
  const goldenAPlus =
    passed &&
    mandatorySubjects.length > 0 &&
    mandatorySubjects.every((s) => s.grade_point === 5.0) &&
    (fourthSubject === undefined || fourthSubject.grade_point === 5.0);

  return {
    gpa,
    letter_grade: letterGrade,
    passed,
    golden_a_plus: goldenAPlus,
    total_mandatory_subjects: mandatorySubjects.length,
    mandatory_grade_points: Number(mandatoryPoints.toFixed(2)),
    fourth_subject_bonus: fourthBonus,
    subjects: evaluations,
  };
}
