import universities from '../../generated/education.universities';
import categories from '../../generated/education.university-categories';
import { normalizeForSearch } from '../../lib/normalize';
import type { University, UniversityCategory } from './schemas';

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
