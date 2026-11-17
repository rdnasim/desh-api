import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const RiverSchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'padma' }),
    name_en: NameEnSchema.openapi({ example: 'Padma' }),
    name_bn: NameBnSchema.openapi({ example: 'পদ্মা' }),
    origin: z.string().openapi({
      example:
        'Himalayas (Gangotri Glacier), flows through India as the Ganges and enters Bangladesh at Shibganj (Chapainababganj)',
    }),
    outflow: z.string().openapi({ example: 'Lower Meghna River near Chandpur' }),
    length_km: z.number().positive().openapi({ example: 120 }),
    divisions: z
      .array(SlugSchema)
      .openapi({ example: ['rajshahi', 'dhaka', 'khulna', 'barishal'] }),
    districts: z.array(SlugSchema).openapi({
      example: [
        'chapainababganj',
        'rajshahi',
        'pabna',
        'kushtia',
        'rajbari',
        'faridpur',
        'munshiganj',
      ],
    }),
    tributaries: z.array(z.string()).openapi({ example: ['Mahananda', 'Jamuna'] }),
    distributaries: z.array(z.string()).openapi({ example: ['Gorai', 'Madhumati', 'Arialkhan'] }),
    is_transboundary: z.boolean().openapi({ example: true }),
    description_en: z.string().openapi({
      example:
        'One of the three principal rivers of the Bengal Delta, carrying the combined flows of the Ganges and Jamuna to the Bay of Bengal.',
    }),
    description_bn: z.string().openapi({
      example: 'বঙ্গীয় বদ্বীপের অন্যতম প্রধান নদী, যা গঙ্গা ও যমুনার সম্মিলিত জলধারা বহন করে মেঘনায় পতিত হয়।',
    }),
    special_features: z.array(z.string()).openapi({
      example: [
        'Combined flow with Jamuna at Goalondo Ghat',
        'Traversed by Padma Multipurpose Bridge (6.15 km)',
        'One of the three principal rivers of the Bengal Delta',
      ],
    }),
  })
  .openapi('River', {
    example: {
      slug: 'padma',
      name_en: 'Padma',
      name_bn: 'পদ্মা',
      origin:
        'Himalayas (Gangotri Glacier), flows through India as the Ganges and enters Bangladesh at Shibganj (Chapainababganj)',
      outflow: 'Lower Meghna River near Chandpur',
      length_km: 120,
      divisions: ['rajshahi', 'dhaka', 'khulna', 'barishal'],
      districts: [
        'chapainababganj',
        'rajshahi',
        'pabna',
        'kushtia',
        'rajbari',
        'faridpur',
        'manikganj',
        'munshiganj',
        'shariatpur',
        'chandpur',
      ],
      tributaries: ['Mahananda', 'Jamuna'],
      distributaries: ['Gorai', 'Madhumati', 'Arialkhan'],
      is_transboundary: true,
      description_en:
        'One of the three principal rivers of the Bengal Delta, carrying the combined flows of the Ganges and Jamuna to the Bay of Bengal.',
      description_bn:
        'বঙ্গীয় বদ্বীপের অন্যতম প্রধান নদী, যা গঙ্গা ও যমুনার সম্মিলিত জলধারা বহন করে মেঘনায় পতিত হয়।',
      special_features: [
        'Combined flow with Jamuna at Goalondo Ghat',
        'Traversed by Padma Multipurpose Bridge (6.15 km)',
        'One of the three principal rivers of the Bengal Delta',
      ],
    },
  });

export type River = z.infer<typeof RiverSchema>;
