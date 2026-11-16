import providers from '../../generated/mfs.providers';
import type { MfsProvider, MfsUssdEntry } from './schemas';

const providerBySlug = new Map(providers.map((p) => [p.slug, p]));

export function listProviders(): MfsProvider[] {
  return providers as unknown as MfsProvider[];
}

export function getProvider(slug: string): MfsProvider | undefined {
  return providerBySlug.get(slug.toLowerCase().trim());
}

export function listUssdCodes(): MfsUssdEntry[] {
  return providers.map((p) => ({
    provider: p.slug,
    name_en: p.name_en,
    name_bn: p.name_bn,
    ussd_code: p.ussd_code,
    helpline: p.helpline,
    parent_en: p.parent_en,
  }));
}
