import banks from '../../generated/banks.banks';
import branches from '../../generated/banks.branches';
import { normalizeForSearch } from '../../lib/normalize';
import type { Ref } from '../../lib/schemas';
import { getDistrict, getDivision, getUpazila } from '../geo/service';
import type { Bank, Branch } from './schemas';

const bankBySlug = new Map(banks.map((b) => [b.slug, b]));
const bankById = new Map(banks.map((b) => [String(b.bb_id), b]));
const bankByCode = new Map(banks.filter((b) => b.routing_code).map((b) => [b.routing_code, b]));
const branchById = new Map(branches.map((b) => [b.id, b]));
const branchByRouting = new Map(
  branches.filter((b) => b.routing_number).map((b) => [b.routing_number as string, b]),
);
const branchesByBank = new Map<string, Branch[]>();
for (const b of branches) branchesByBank.set(b.bank, [...(branchesByBank.get(b.bank) ?? []), b]);
for (const list of branchesByBank.values()) list.sort((a, b) => a.name_en.localeCompare(b.name_en));

const ref = (r: Ref): Ref => ({ slug: r.slug, name_en: r.name_en, name_bn: r.name_bn });

function withCounts(bank: Bank) {
  const list = branchesByBank.get(bank.slug) ?? [];
  return {
    ...bank,
    branch_count: list.length,
    branches_with_routing: list.filter((b) => b.routing_number).length,
  };
}

export const listBanks = () => banks.map(withCounts);

/** A bank by slug or Bangladesh Bank bank ID. */
export function getBank(key: string) {
  const bank = bankBySlug.get(key) ?? bankById.get(key);
  return bank && withCounts(bank);
}

export const bankForRoutingCode = (code: string) => bankByCode.get(code);

export interface BranchFilter {
  district?: string;
  upazila?: string;
  q?: string;
}

export function listBranches(bank: string, { district, upazila, q }: BranchFilter = {}): Branch[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);
  return (branchesByBank.get(bank) ?? []).filter(
    (b) =>
      (district === undefined || b.district === district) &&
      (upazila === undefined || b.upazila === upazila) &&
      (query === undefined ||
        normalizeForSearch(b.name_en).includes(query) ||
        normalizeForSearch(b.thana).includes(query)),
  );
}

export const getBranch = (id: string) => branchById.get(id);
export const findBranchByRouting = (number: string) => branchByRouting.get(number);

/** A branch with its bank and bilingual geo references resolved. */
export function branchDetail(branch: Branch) {
  const bank = bankBySlug.get(branch.bank);
  const district = getDistrict(branch.district);
  const division = district && getDivision(district.division);
  const upazila = branch.upazila === undefined ? undefined : getUpazila(branch.upazila);
  if (!bank || !district || !division) throw new Error(`incomplete data for branch ${branch.id}`);
  return {
    id: branch.id,
    name_en: branch.name_en,
    thana: branch.thana,
    ...(branch.routing_number ? { routing_number: branch.routing_number } : {}),
    bank: { slug: bank.slug, name_en: bank.name_en, bb_id: bank.bb_id },
    district: ref(district),
    division: ref(division),
    ...(upazila ? { upazila: ref(upazila) } : {}),
  };
}
