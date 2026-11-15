import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { staticMeta } from './envelope';

export const ERROR_CODES = {
  invalid_parameter: 400,
  not_found: 404,
  method_not_allowed: 405,
  payload_too_large: 413,
  rate_limited: 429,
  internal_error: 500,
  upstream_unavailable: 503,
} as const satisfies Record<string, ContentfulStatusCode>;

export type ErrorCode = keyof typeof ERROR_CODES;

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly options: { message_bn?: string; details?: unknown } = {},
  ) {
    super(message);
  }

  get status(): ContentfulStatusCode {
    return ERROR_CODES[this.code];
  }
}

const errorMeta = () => staticMeta('desh-api', new Date().toISOString().slice(0, 10));

export function fail(c: Context, error: ApiError) {
  const { message_bn, details } = error.options;
  return c.json(
    {
      success: false as const,
      error: { code: error.code, message: error.message, message_bn, details },
      meta: errorMeta(),
    },
    error.status,
  );
}

/** Turns Zod validation failures into 400 `invalid_parameter` errors. */
export const validationHook = (
  result:
    | { success: true }
    | { success: false; error: { issues: readonly { path: PropertyKey[]; message: string }[] } },
  c: Context,
) => {
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.map(String).join('.'),
      message: i.message,
    }));
    const summary = details.map((d) => (d.path ? `${d.path}: ${d.message}` : d.message)).join('; ');
    return fail(
      c,
      new ApiError('invalid_parameter', `Invalid request: ${summary}`, {
        message_bn: 'অনুরোধের প্যারামিটার সঠিক নয়',
        details,
      }),
    );
  }
};

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ApiError) return fail(c, err);
  if (err instanceof HTTPException && err.status === 413) {
    return fail(c, new ApiError('payload_too_large', 'Request body is too large'));
  }
  console.error(JSON.stringify({ level: 'error', name: err.name, message: err.message }));
  return fail(c, new ApiError('internal_error', 'Internal server error'));
};

function routeMatches(pattern: string, path: string): boolean {
  if (pattern === '*' || pattern.endsWith('/*')) return false;
  const source = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[^/]+/g, '[^/]+');
  return new RegExp(`^${source}/?$`).test(path);
}

/** 404 for unknown paths, 405 when the path exists with a different method. */
export function notFoundHandler(
  routes: () => readonly { path: string; method: string }[],
): NotFoundHandler {
  return (c) => {
    const methods = routes()
      .filter((r) => r.method !== 'ALL' && routeMatches(r.path, c.req.path))
      .map((r) => r.method);
    if (methods.length > 0) {
      c.header('Allow', [...new Set(methods)].join(', '));
      return fail(
        c,
        new ApiError(
          'method_not_allowed',
          `Method ${c.req.method} is not allowed on ${c.req.path}`,
        ),
      );
    }
    return fail(
      c,
      new ApiError('not_found', `Route ${c.req.path} not found`, {
        message_bn: 'এই পাথটি পাওয়া যায়নি',
      }),
    );
  };
}
