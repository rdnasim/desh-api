/**
 * Creates (or updates) a Cloudflare Configuration Rule so the API host is not served browser
 * challenges. Browser Integrity Check and a "medium" security level protect websites, but they
 * send Cloudflare's HTML challenge page to scripts and servers calling the API.
 *
 *   read -rs CF_CONFIG_TOKEN && export CF_CONFIG_TOKEN && pnpm cf:api-host-rule
 *
 * (`read -rs` reads the token without showing it.)
 * The token needs: Zone → Zone → Read, and Zone → Config Rules → Edit, for the zone only.
 * Other rules in the zone are kept; this rule is matched by its description and replaced.
 */
export {};

const ZONE = 'riadul.com';
const HOST = 'deshapi.riadul.com';
const DESCRIPTION = 'Desh API: no browser challenges';
const API = 'https://api.cloudflare.com/client/v4';

interface CfResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
}

async function cf<T>(token: string, path: string, init: RequestInit = {}): Promise<CfResponse<T>> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  });
  return (await res.json()) as CfResponse<T>;
}

interface Rule {
  id?: string;
  description?: string;
  expression: string;
  action: string;
  action_parameters?: Record<string, unknown>;
  enabled?: boolean;
}

const token = process.env.CF_CONFIG_TOKEN?.trim();
if (!token) {
  console.error('Set CF_CONFIG_TOKEN first: read -rs CF_CONFIG_TOKEN && export CF_CONFIG_TOKEN');
  process.exit(1);
}

const zones = await cf<{ id: string; name: string }[]>(token, `/zones?name=${ZONE}`);
const zone = zones.result?.[0];
if (!zones.success || !zone) {
  console.error(`Could not read zone ${ZONE}:`, zones.errors.map((e) => e.message).join('; '));
  process.exit(1);
}

const entry = `/zones/${zone.id}/rulesets/phases/http_config_settings/entrypoint`;
const current = await cf<{ rules?: Rule[] }>(token, entry);
// Saving replaces every rule in this phase, so stop unless the existing rules were read, or there are none yet.
const noneYet =
  !current.success && current.errors.some((e) => /could not find|not found/i.test(e.message));
if (!current.success && !noneYet) {
  console.error(
    'Could not read existing config rules:',
    current.errors.map((e) => e.message).join('; '),
  );
  process.exit(1);
}
const others = (current.success ? (current.result.rules ?? []) : []).filter(
  (r) => r.description !== DESCRIPTION,
);

const rule: Rule = {
  description: DESCRIPTION,
  expression: `(http.host eq "${HOST}")`,
  action: 'set_config',
  action_parameters: { bic: false, security_level: 'essentially_off' },
  enabled: true,
};

const keep = others.map(({ id: _id, ...r }) => r);
const updated = await cf<{ rules: Rule[] }>(token, entry, {
  method: 'PUT',
  body: JSON.stringify({ rules: [...keep, rule] }),
});
if (!updated.success) {
  console.error(
    'Could not save the rule:',
    updated.errors.map((e) => `${e.code} ${e.message}`).join('; '),
  );
  process.exit(1);
}

const saved = updated.result.rules.find((r) => r.description === DESCRIPTION);
console.log(
  `✓ Rule "${DESCRIPTION}" is active on ${ZONE}: ${saved?.expression} → ${JSON.stringify(saved?.action_parameters)}`,
);
console.log(`  Other config rules kept: ${keep.length}`);
