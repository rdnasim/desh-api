# Architecture & Implementation Plan: Education Boards & SSC/HSC Exam System

## 1. Data Design
- `data/education/boards.json`: 11 boards. Sorted by `slug`.
- `data/education/grading-scale.json`: 7 grade levels. Sorted by `min_marks` descending.
- Add both to `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/education/schemas.ts`:
  - `EducationBoardTypeSchema`: `'general' | 'madrasah' | 'technical'`
  - `EducationBoardSchema`: `slug`, `code`, `name_en`, `name_bn`, `short_name_en`, `short_name_bn`, `type`, `established`, `headquarters`, `website`, `phone`, `email`, `districts` (array of district slugs).
  - `GradeTierSchema`: `grade`, `grade_point`, `min_marks`, `max_marks`, `remark_en`, `remark_bn`.
  - `CalculateGpaInputSchema`: list of subjects with marks (0-100) or grade point (0.00-5.00), flag for `is_fourth_subject`.
  - `CalculateGpaResultSchema`: `gpa`, `letter_grade`, `passed`, `golden_a_plus`, `details`.

## 3. Services
- `src/modules/education/service.ts`:
  - `listEducationBoards({ type, district, q })`
  - `getEducationBoard(codeOrSlug)`
  - `listGradingScale()`
  - `lookupGrade(marks)`
  - `calculateGpa(subjects)`

## 4. Route Endpoints
- `GET /v1/education/boards`
- `GET /v1/education/boards/:code`
- `GET /v1/education/grading-scale`
- `GET /v1/education/grade-lookup?marks=...`
- `POST /v1/education/calculate-gpa`

## 5. Tests
- Unit tests: `tests/unit/education/boards.test.ts` (board lookups, district mappings, GPA computation, 4th subject rules, Golden A+).
- Contract tests: `tests/contract/education-boards.test.ts` (status codes, envelope structure, schema validation).
