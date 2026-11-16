import hospitals from '../../generated/health.hospitals';
import { normalizeForSearch } from '../../lib/normalize';
import type { EmergencyHealthSummary, Hospital } from './schemas';

const sortedHospitals = [...hospitals].sort((a, b) => a.name_en.localeCompare(b.name_en));
const hospitalBySlug = new Map(hospitals.map((h) => [h.slug, h]));

export interface HospitalFilter {
  division?: string;
  district?: string;
  type?: Hospital['type'];
  has_emergency?: boolean;
  q?: string;
}

export function listHospitals({
  division,
  district,
  type,
  has_emergency,
  q,
}: HospitalFilter = {}): Hospital[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedHospitals.filter((h) => {
    if (division !== undefined && h.division !== division) return false;
    if (district !== undefined && h.district !== district) return false;
    if (type !== undefined && h.type !== type) return false;
    if (has_emergency !== undefined && h.has_emergency_24h !== has_emergency) return false;
    if (query !== undefined) {
      const matchName = normalizeForSearch(h.name_en).includes(query);
      const matchAddress = normalizeForSearch(h.address).includes(query);
      const matchServices = h.services.some((s) => normalizeForSearch(s).includes(query));
      if (!matchName && !matchAddress && !matchServices) return false;
    }
    return true;
  });
}

export function getHospital(slug: string): Hospital | undefined {
  return hospitalBySlug.get(slug.toLowerCase().trim());
}

export function getEmergencyHealthSummary(): EmergencyHealthSummary {
  const traumaCenters = [
    'national-institute-of-traumatology-and-orthopaedic-rehabilitation',
    'dhaka-medical-college-hospital',
    'chattogram-medical-college-hospital',
    'rajshahi-medical-college-hospital',
    'mag-osmani-medical-college-hospital',
    'sher-e-bangla-medical-college-hospital',
  ]
    .map((s) => hospitalBySlug.get(s))
    .filter((h): h is Hospital => h !== undefined)
    .map((h) => ({
      slug: h.slug,
      name_en: h.name_en,
      name_bn: h.name_bn,
      division: h.division,
      emergency_phone: h.emergency_phone,
    }));

  return {
    national_hotlines: [
      {
        name_en: 'Shastho Batayan',
        name_bn: 'স্বাস্থ্য বাতায়ন',
        number: '16263',
        description_en: '24/7 National health advice helpline operated by DGHS',
        description_bn: 'স্বাস্থ্য অধিদপ্তরের সার্বক্ষণিক জাতীয় স্বাস্থ্য সেবা হটলাইন',
      },
      {
        name_en: 'National Emergency Service',
        name_bn: 'জাতীয় জরুরি সেবা',
        number: '999',
        description_en: 'Toll-free police, ambulance, and fire rescue dispatch',
        description_bn: 'টোল-ফ্রি পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিস নিয়ন্ত্রণ কক্ষ',
      },
      {
        name_en: 'IEDCR Disease Control Helpline',
        name_bn: 'আইইডিসিআর নিয়ন্ত্রণ কক্ষ',
        number: '10655',
        description_en: 'Institute of Epidemiology, Disease Control and Research helpline',
        description_bn: 'রোগতত্ত্ব, রোগ নিয়ন্ত্রণ ও গবেষণা ইনস্টিটিউট হটলাইন',
      },
    ],
    trauma_and_burn_centers: traumaCenters,
    ambulance_services: [
      {
        name_en: 'National Ambulance Service (999)',
        name_bn: 'জাতীয় অ্যাম্বুলেন্স সেবা (৯৯৯)',
        number: '999',
        notes: 'Toll-free, nationwide emergency ambulance dispatch',
      },
      {
        name_en: 'Shastho Batayan Ambulance Helpline (16263)',
        name_bn: 'স্বাস্থ্য বাতায়ন অ্যাম্বুলেন্স তথ্য (১৬২৬৩)',
        number: '16263',
        notes: 'Official DGHS verified local government and private ambulance locator',
      },
      {
        name_en: 'Anjuman Mufidul Islam Ambulance Service',
        name_bn: 'আঞ্জুমান মুফিদুল ইসলাম অ্যাম্বুলেন্স সেবা',
        number: '+880-2-9336611',
        notes: 'Non-profit subsidized emergency patient transport service',
      },
    ],
  };
}
