import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok, paginate } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { pageParams } from '../../lib/params';
import { getDistrict, getUpazila } from '../geo/service';
import { validateRouting } from '../validate/routing';
import { BankOutSchema, BranchOutSchema } from './schemas';
import {
  bankForRoutingCode,
  branchDetail,
  findBranchByRouting,
  getBank,
  getBranch,
  listBanks,
  listBranches,
} from './service';

const tags = ['Banks'];
const DISCLAIMER =
  'Branch details are from Bangladesh Bank (as on 31 August 2026). Routing numbers come from a secondary table and are included only when they match the branch and pass the check digit; branches without a confirmed number omit it. Confirm with your bank before sending money.';
const bankMeta = () => metaFor(['banks.banks', 'banks.branches']);
const branchMeta = (extra = {}) =>
  metaFor(['banks.banks', 'banks.branches'], { disclaimer: DISCLAIMER, ...extra });

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
});
const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });
const path = (name: string, description: string, example: string) =>
  z.object({ [name]: z.string().openapi({ param: { name, in: 'path', description }, example }) });

const notFound = (message: string, message_bn: string): never => {
  throw new ApiError('not_found', message, { message_bn });
};
const invalid = (message: string): never => {
  throw new ApiError('invalid_parameter', message);
};

function bankOr404(key: string) {
  return (
    getBank(key) ??
    notFound(`Bank '${key}' not found; see /v1/banks for slugs and IDs`, 'ব্যাংক পাওয়া যায়নি')
  );
}

export const bankRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

bankRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/banks',
    tags,
    summary: 'All scheduled banks with their Bangladesh Bank ID and branch counts',
    responses: responses(z.array(BankOutSchema), 'Banks'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listBanks(), bankMeta());
  },
);

bankRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/banks/{bank}',
    tags,
    summary: 'One bank by slug or Bangladesh Bank ID',
    request: {
      params: path('bank', 'Slug (sonali-bank) or Bangladesh Bank ID (15)', 'sonali-bank'),
    },
    responses: responses(BankOutSchema, 'Bank'),
  }),
  (c) => {
    const bank = bankOr404(c.req.valid('param').bank as string);
    cachePublic(c);
    return ok(c, bank, bankMeta());
  },
);

bankRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/banks/{bank}/branches',
    tags,
    summary: 'Branches of a bank, filtered by district, upazila or name',
    description:
      'Sorted by branch name. `q` matches the branch or thana name. Routing numbers are included where confirmed (see `meta.disclaimer`).',
    request: {
      params: path('bank', 'Slug or Bangladesh Bank ID', 'agrani-bank'),
      query: z.object({
        district: query('district', 'District slug', 'chandpur'),
        upazila: query('upazila', 'Upazila slug'),
        q: query('q', 'Search in branch and thana names'),
        page: query('page', 'Page (default 1)'),
        per_page: query('per_page', 'Items per page (1–500, default 100)'),
      }),
    },
    responses: responses(z.array(BranchOutSchema), 'Branches'),
  }),
  (c) => {
    const bank = bankOr404(c.req.valid('param').bank as string);
    const q = c.req.valid('query');
    const { page, perPage } = pageParams(q.page, q.per_page);
    if (q.district !== undefined && !getDistrict(q.district))
      invalid(`district '${q.district}' is not a district slug`);
    if (q.upazila !== undefined && !getUpazila(q.upazila))
      invalid(`upazila '${q.upazila}' is not an upazila slug`);
    const result = paginate(
      listBranches(bank.slug, { district: q.district, upazila: q.upazila, q: q.q }),
      page,
      perPage,
    );
    cachePublic(c);
    return ok(c, result.items.map(branchDetail), branchMeta({ pagination: result.pagination }));
  },
);

bankRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/branches/{id}',
    tags,
    summary: 'A branch by its Bangladesh Bank branch ID',
    request: { params: path('id', 'Bangladesh Bank branch ID', '110003') },
    responses: responses(BranchOutSchema, 'Branch'),
  }),
  (c) => {
    const id = c.req.valid('param').id as string;
    const branch = getBranch(id) ?? notFound(`Branch ${id} not found`, 'শাখা পাওয়া যায়নি');
    cachePublic(c);
    return ok(c, branchDetail(branch), branchMeta());
  },
);

bankRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/routing/{number}',
    tags,
    summary: 'Find the branch for a routing number',
    description:
      'The number must have 9 digits and a valid check digit (400 otherwise). A valid number that is not in the list returns 404, naming the bank when its code is known.',
    request: { params: path('number', '9-digit routing number', '010130065') },
    responses: responses(BranchOutSchema, 'Branch'),
  }),
  (c) => {
    const check = validateRouting(c.req.valid('param').number as string);
    if (!check.valid) {
      const why = {
        invalid_chars: 'must contain digits only',
        invalid_length: 'must have 9 digits',
        invalid_check_digit: 'has an invalid check digit (likely a typo)',
      }[check.reason as string];
      invalid(`Routing number ${why ?? 'is not valid'}`);
    }
    const number = check.normalized as string;
    const branch = findBranchByRouting(number);
    if (!branch) {
      const bank = bankForRoutingCode(number.slice(0, 3));
      notFound(
        bank
          ? `Routing number ${number} is valid and belongs to ${bank.name_en}, but the branch is not in our list`
          : `Routing number ${number} is valid but not in our list`,
        'রাউটিং নম্বরটি তালিকায় নেই',
      );
    }
    cachePublic(c);
    return ok(c, branchDetail(branch as NonNullable<typeof branch>), branchMeta());
  },
);
