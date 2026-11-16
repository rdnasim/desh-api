import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const UniversityCategorySlugSchema = z.enum(['public', 'private', 'international', 'cbhe']);

export const UniversityCategorySchema = z
  .object({
    slug: UniversityCategorySlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    description: z.string().min(1),
  })
  .openapi('UniversityCategory');

export const UniversitySchema = z
  .object({
    slug: SlugSchema.openapi({ description: 'As used by UGC (ugc.gov.bd/university/{slug})' }),
    ugc_id: z.number().int().positive(),
    name_en: NameEnSchema,
    name_bn: NameBnSchema.optional().openapi({ description: 'Only when UGC publishes it' }),
    category: UniversityCategorySlugSchema,
    established: z.number().int().min(1800).max(2100).optional(),
    website: z.string().min(3).optional(),
    campus: z.string().min(3).optional().openapi({ description: 'Campus address as given by UGC' }),
    district: SlugSchema.optional().openapi({
      description: 'Only when the campus address names exactly one district',
    }),
    emails: z.array(z.string().email()).optional(),
    phone: z.string().min(3).optional(),
    fax: z.string().min(3).optional(),
    ugc_notes: z
      .array(z.object({ title: z.string(), description: z.string(), type: z.string() }))
      .optional()
      .openapi({ description: 'UGC notes on programmes (usually Bangla), as published' }),
  })
  .openapi('University', {
    example: {
      slug: 'university-of-dhaka',
      ugc_id: 180,
      name_en: 'University of Dhaka',
      category: 'public',
      established: 1921,
      website: 'www.du.ac.bd',
      campus: 'Dhaka University, Ramna, Dhaka-1000',
      district: 'dhaka',
      emails: ['vcoffice@du.ac.bd', 'registrar@du.ac.bd'],
      phone: '+88-09666911463',
      fax: '+880-2-9667222',
    },
  });

export type University = z.infer<typeof UniversitySchema>;
export type UniversityCategory = z.infer<typeof UniversityCategorySchema>;

export const EducationBoardTypeSchema = z
  .enum(['general', 'madrasah', 'technical'])
  .openapi('EducationBoardType');

export const EducationBoardSchema = z
  .object({
    slug: SlugSchema.openapi({ description: 'Canonical board slug (e.g. dhaka, chattogram, madrasah)' }),
    code: z
      .string()
      .min(3)
      .max(3)
      .openapi({ description: '3-letter board code used in exam portals (e.g. DHA, CHI, RAJ, MAD, TEC)' }),
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    short_name_en: z.string().min(1),
    short_name_bn: z.string().min(1),
    type: EducationBoardTypeSchema,
    established: z.number().int().min(1900).max(2100),
    headquarters: z.string().min(1),
    website: z.string().url(),
    phone: z.string().min(1),
    email: z.string().email(),
    districts: z.array(SlugSchema).openapi({
      description: 'District slugs under this board’s territorial jurisdiction (all 64 for madrasah/technical)',
    }),
  })
  .openapi('EducationBoard', {
    example: {
      slug: 'dhaka',
      code: 'DHA',
      name_en: 'Board of Intermediate and Secondary Education, Dhaka',
      name_bn: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
      short_name_en: 'BISE Dhaka',
      short_name_bn: 'ঢাকা শিক্ষা বোর্ড',
      type: 'general',
      established: 1921,
      headquarters: 'Dhaka',
      website: 'https://www.dhakaeducationboard.gov.bd',
      phone: '+880-2-9669701',
      email: 'chairmandhakaedu@gmail.com',
      districts: [
        'dhaka',
        'gazipur',
        'narayanganj',
        'tangail',
        'kishoreganj',
        'manikganj',
        'munshiganj',
        'narsingdi',
        'faridpur',
        'gopalganj',
        'madaripur',
        'rajbari',
        'shariatpur',
      ],
    },
  });

export const GradeTierSchema = z
  .object({
    slug: SlugSchema,
    grade: z.string().min(1).max(2).openapi({ description: 'Letter grade: A+, A, A-, B, C, D, or F' }),
    grade_point: z.number().min(0).max(5).openapi({ description: 'Grade Point on 5.0 scale' }),
    min_marks: z.number().int().min(0).max(100),
    max_marks: z.number().int().min(0).max(100),
    remark_en: z.string().min(1),
    remark_bn: z.string().min(1),
  })
  .openapi('GradeTier', {
    example: {
      slug: 'a-plus',
      grade: 'A+',
      grade_point: 5.0,
      min_marks: 80,
      max_marks: 100,
      remark_en: 'Outstanding',
      remark_bn: 'অসাধারণ',
    },
  });

export const SubjectScoreInputSchema = z
  .object({
    name: z.string().optional().openapi({ description: 'Subject name or code', example: 'Bangla' }),
    marks: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .openapi({ description: 'Exam mark (0-100). Either marks or grade_point is required', example: 85 }),
    grade_point: z
      .number()
      .min(0)
      .max(5)
      .optional()
      .openapi({ description: 'Grade point (0.0 to 5.0)', example: 5.0 }),
    is_fourth_subject: z
      .boolean()
      .optional()
      .openapi({ description: 'True if this is the optional 4th subject', example: false }),
  })
  .openapi('SubjectScoreInput');

export const CalculateGpaRequestSchema = z
  .object({
    subjects: z.array(SubjectScoreInputSchema).min(1).max(20),
  })
  .openapi('CalculateGpaRequest', {
    example: {
      subjects: [
        { name: 'Bangla', marks: 82 },
        { name: 'English', marks: 75 },
        { name: 'Mathematics', marks: 91 },
        { name: 'Physics', marks: 84 },
        { name: 'Chemistry', marks: 80 },
        { name: 'Biology', marks: 88, is_fourth_subject: true },
      ],
    },
  });

export const SubjectEvaluationSchema = z
  .object({
    name: z.string().optional(),
    marks: z.number().optional(),
    grade: z.string(),
    grade_point: z.number(),
    is_fourth_subject: z.boolean(),
    fourth_subject_bonus_points: z.number(),
  })
  .openapi('SubjectEvaluation');

export const CalculateGpaResponseSchema = z
  .object({
    gpa: z.number().min(0).max(5).openapi({ description: 'Final GPA (capped at 5.00)' }),
    letter_grade: z.string().openapi({ description: 'Overall letter grade (A+, A, A-, B, C, D, F)' }),
    passed: z.boolean().openapi({ description: 'True if no mandatory subject failed (grade F)' }),
    golden_a_plus: z
      .boolean()
      .openapi({ description: 'True if all mandatory subjects scored GPA 5.00 (Grade A+)' }),
    total_mandatory_subjects: z.number().int(),
    mandatory_grade_points: z.number(),
    fourth_subject_bonus: z.number(),
    subjects: z.array(SubjectEvaluationSchema),
  })
  .openapi('CalculateGpaResponse', {
    example: {
      gpa: 5.0,
      letter_grade: 'A+',
      passed: true,
      golden_a_plus: false,
      total_mandatory_subjects: 5,
      mandatory_grade_points: 24.0,
      fourth_subject_bonus: 3.0,
      subjects: [
        {
          name: 'Bangla',
          marks: 82,
          grade: 'A+',
          grade_point: 5.0,
          is_fourth_subject: false,
          fourth_subject_bonus_points: 0,
        },
        {
          name: 'English',
          marks: 75,
          grade: 'A',
          grade_point: 4.0,
          is_fourth_subject: false,
          fourth_subject_bonus_points: 0,
        },
        {
          name: 'Mathematics',
          marks: 91,
          grade: 'A+',
          grade_point: 5.0,
          is_fourth_subject: false,
          fourth_subject_bonus_points: 0,
        },
        {
          name: 'Physics',
          marks: 84,
          grade: 'A+',
          grade_point: 5.0,
          is_fourth_subject: false,
          fourth_subject_bonus_points: 0,
        },
        {
          name: 'Chemistry',
          marks: 80,
          grade: 'A+',
          grade_point: 5.0,
          is_fourth_subject: false,
          fourth_subject_bonus_points: 0,
        },
        {
          name: 'Biology',
          marks: 88,
          grade: 'A+',
          grade_point: 5.0,
          is_fourth_subject: true,
          fourth_subject_bonus_points: 3.0,
        },
      ],
    },
  });

export type EducationBoard = z.infer<typeof EducationBoardSchema>;
export type GradeTier = z.infer<typeof GradeTierSchema>;
export type CalculateGpaRequest = z.infer<typeof CalculateGpaRequestSchema>;
export type CalculateGpaResponse = z.infer<typeof CalculateGpaResponseSchema>;

