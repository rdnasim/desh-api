import { DeshApiError } from './errors.js';
import type { ApiResponse, ClientConfig } from './types.js';

export class DeshClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = (config.baseUrl || 'https://deshapi.riadul.com').replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.fetchFn = config.fetch || globalThis.fetch;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  /** Generic request helper */
  async request<T>(
    path: string,
    options: {
      method?: string;
      query?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
    } = {},
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (options.query) {
      const q = new URLSearchParams();
      for (const [key, val] of Object.entries(options.query)) {
        if (val !== undefined && val !== null) {
          q.set(key, String(val));
        }
      }
      const qs = q.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    let bodyData: BodyInit | undefined;
    if (options.body !== undefined) {
      if (typeof options.body === 'string') {
        bodyData = options.body;
        if (!headers['Content-Type']) headers['Content-Type'] = 'text/plain';
      } else {
        bodyData = JSON.stringify(options.body);
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      }
    }

    let attempts = 0;
    while (attempts <= this.maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await this.fetchFn(url, {
          method: options.method || 'GET',
          headers,
          body: bodyData,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.status === 429 && attempts <= this.maxRetries) {
          const retryHeader = res.headers.get('Retry-After');
          const delaySec = retryHeader ? Number.parseInt(retryHeader, 10) || 1 : 1;
          await new Promise((resolve) => setTimeout(resolve, Math.min(delaySec * 1000, 5000)));
          continue;
        }

        const json = (await res.json()) as any;
        if (!res.ok || json.success === false) {
          throw new DeshApiError(
            res.status,
            json.error || { code: 'request_failed', message: res.statusText },
          );
        }

        return json as ApiResponse<T>;
      } catch (err: any) {
        clearTimeout(timer);
        if (err instanceof DeshApiError) throw err;
        if (attempts > this.maxRetries) {
          throw new DeshApiError(0, {
            code: 'network_error',
            message: err.message || 'Network request failed',
          });
        }
      }
    }

    throw new DeshApiError(0, { code: 'retry_limit_exceeded', message: 'Maximum retries reached' });
  }

  // ==================== 1. Geo Module ====================
  readonly geo = {
    divisions: () => this.request<any[]>('/v1/divisions'),
    division: (div: string) => this.request<any>(`/v1/divisions/${div}`),
    divisionDistricts: (div: string) => this.request<any[]>(`/v1/divisions/${div}/districts`),
    districts: (div?: string) => this.request<any[]>('/v1/districts', { query: { division: div } }),
    district: (dist: string) => this.request<any>(`/v1/districts/${dist}`),
    upazilas: (dist?: string) => this.request<any[]>('/v1/upazilas', { query: { district: dist } }),
    upazila: (upz: string) => this.request<any>(`/v1/upazilas/${upz}`),
    unions: (upz?: string) => this.request<any[]>('/v1/unions', { query: { upazila: upz } }),
    postcode: (code: string | number) => this.request<any>(`/v1/postcodes/${code}`),
    search: (q: string, limit?: number) =>
      this.request<any[]>('/v1/search', { query: { q, limit } }),
    nearest: (lat: number, lon: number) =>
      this.request<any>('/v1/nearest', { query: { lat, lon } }),
  };

  // ==================== 2. Bangla Toolkit ====================
  readonly bangla = {
    numToWords: (n: number | string) =>
      this.request<any>('/v1/bangla/num-to-words', { query: { n } }),
    takaInWords: (amount: number | string) =>
      this.request<any>('/v1/bangla/taka-in-words', { query: { amount } }),
    digits: (text: string, to: 'bn' | 'en') =>
      this.request<any>('/v1/bangla/digits', { query: { text, to } }),
    formatNumber: (n: number | string) =>
      this.request<any>('/v1/bangla/format-number', { query: { n } }),
    transliterate: (text: string) =>
      this.request<any>('/v1/bangla/transliterate', { query: { text } }),
    date: (date?: string) => this.request<any>('/v1/bangla/date', { query: { date } }),
    ordinal: (n: number | string) => this.request<any>('/v1/bangla/ordinal', { query: { n } }),
    slug: (text: string) => this.request<any>('/v1/bangla/slug', { query: { text } }),
  };

  // ==================== 3. Phone Validator ====================
  readonly phone = {
    validate: (number: string) => this.request<any>(`/v1/phone/${number}`),
    validatePost: (number: string) =>
      this.request<any>('/v1/phone/validate', { method: 'POST', body: { number } }),
    bulk: (numbers: string[]) =>
      this.request<any[]>('/v1/phone/bulk', { method: 'POST', body: { numbers } }),
  };

  // ==================== 4. Bijoy Converter ====================
  readonly convert = {
    bijoyToUnicode: (text: string) =>
      this.request<any>('/v1/convert/bijoy-to-unicode', { method: 'POST', body: { text } }),
    unicodeToBijoy: (text: string) =>
      this.request<any>('/v1/convert/unicode-to-bijoy', { method: 'POST', body: { text } }),
  };

  // ==================== 5. Land Units ====================
  readonly land = {
    convert: (value: number, from: string, to: string) =>
      this.request<any>('/v1/land/convert', { query: { value, from, to } }),
    units: () => this.request<any[]>('/v1/land/units'),
  };

  // ==================== 6. Format Validators ====================
  readonly validate = {
    nid: (number: string) => this.request<any>(`/v1/validate/nid/${number}`),
    vehicle: (plate: string) => this.request<any>('/v1/validate/vehicle', { query: { plate } }),
    tin: (number: string) => this.request<any>(`/v1/validate/tin/${number}`),
    bin: (number: string) => this.request<any>(`/v1/validate/bin/${number}`),
    postcode: (code: string | number) => this.request<any>(`/v1/validate/postcode/${code}`),
  };

  // ==================== 7. Hotlines ====================
  readonly hotlines = {
    list: (category?: string) => this.request<any[]>('/v1/hotlines', { query: { category } }),
    categories: () => this.request<any[]>('/v1/hotlines/categories'),
    get: (number: string) => this.request<any>(`/v1/hotlines/${number}`),
  };

  // ==================== 8. Fun & Culture ====================
  readonly fun = {
    proverb: (seed?: string) => this.request<any>('/v1/fun/proverb/random', { query: { seed } }),
    riddle: (seed?: string) => this.request<any>('/v1/fun/riddle/random', { query: { seed } }),
    food: (seed?: string) => this.request<any>('/v1/fun/food/random', { query: { seed } }),
    todayInHistory: () => this.request<any[]>('/v1/fun/today-in-history'),
    quiz: (topic?: string, seed?: string) =>
      this.request<any>('/v1/fun/quiz', { query: { topic, seed } }),
  };

  // ==================== 9. Holidays ====================
  readonly holidays = {
    years: () => this.request<any[]>('/v1/holidays/years'),
    list: (
      year?: number | string,
      opts?: { type?: string; community?: string; closed?: boolean },
    ) => this.request<any[]>('/v1/holidays', { query: { year, ...opts } }),
    check: (date: string) => this.request<any>('/v1/holidays/check', { query: { date } }),
    workingDays: (from: string, to: string) =>
      this.request<any>('/v1/working-days', { query: { from, to } }),
  };

  // ==================== 10. Finance Calculators ====================
  readonly finance = {
    incomeTax: (
      income: number | string,
      opts?: { tax_year?: string; category?: string; monthly?: boolean },
    ) => this.request<any>('/v1/finance/income-tax', { query: { income, ...opts } }),
    vat: (amount: number | string, opts?: { standard_rate?: boolean; rate?: number }) =>
      this.request<any>('/v1/finance/vat', { query: { amount, ...opts } }),
    emi: (principal: number, rate: number, months: number) =>
      this.request<any>('/v1/finance/emi', { query: { principal, rate, months } }),
    dps: (monthly_deposit: number, annual_rate: number, months: number) =>
      this.request<any>('/v1/finance/dps', { query: { monthly_deposit, annual_rate, months } }),
    gratuity: (basic_salary: number, completed_years: number) =>
      this.request<any>('/v1/finance/gratuity', { query: { basic_salary, completed_years } }),
  };

  // ==================== 11. Mock Data ====================
  readonly mock = {
    people: (count?: number, seed?: string) =>
      this.request<any[]>('/v1/mock/people', { query: { count, seed } }),
    addresses: (count?: number, seed?: string) =>
      this.request<any[]>('/v1/mock/addresses', { query: { count, seed } }),
  };

  // ==================== 12. Banks ====================
  readonly banks = {
    list: () => this.request<any[]>('/v1/banks'),
    get: (bankSlug: string) => this.request<any>(`/v1/banks/${bankSlug}`),
    branches: (bankSlug: string, opts?: { district?: string; upazila?: string }) =>
      this.request<any[]>(`/v1/banks/${bankSlug}/branches`, { query: opts }),
    routing: (routingNumber: string) => this.request<any>(`/v1/routing/${routingNumber}`),
  };

  // ==================== 13. Education ====================
  readonly education = {
    universities: (opts?: { type?: string; district?: string }) =>
      this.request<any[]>('/v1/universities', { query: opts }),
    university: (slug: string) => this.request<any>(`/v1/universities/${slug}`),
    boards: (opts?: { type?: string; district?: string }) =>
      this.request<any[]>('/v1/education/boards', { query: opts }),
    board: (slug: string) => this.request<any>(`/v1/education/boards/${slug}`),
    gradingScale: () => this.request<any[]>('/v1/education/grading-scale'),
    calculateGpa: (subjects: Array<{ marks: number; is_optional?: boolean }>) =>
      this.request<any>('/v1/education/calculate-gpa', { method: 'POST', body: { subjects } }),
  };

  // ==================== 14. Gold & Zakat ====================
  readonly gold = {
    prices: () => this.request<any>('/v1/gold/prices'),
    zakat: (opts?: {
      assets_bdt?: number;
      gold_gram?: number;
      silver_gram?: number;
      cash_bdt?: number;
    }) => this.request<any>('/v1/zakat', { query: opts }),
  };

  // ==================== 15. Market Prices ====================
  readonly market = {
    prices: (category?: string) =>
      this.request<any[]>('/v1/market/prices', { query: { category } }),
    fuel: (month?: string) => this.request<any>('/v1/fuel/prices', { query: { month } }),
  };

  // ==================== 16. MFS ====================
  readonly mfs = {
    providers: () => this.request<any[]>('/v1/mfs/providers'),
    provider: (slug: string) => this.request<any>(`/v1/mfs/providers/${slug}`),
    compare: (amount: number, action?: string, channel?: string) =>
      this.request<any>('/v1/mfs/compare', { query: { amount, action, channel } }),
    ussd: () => this.request<any[]>('/v1/mfs/ussd'),
  };

  // ==================== 17. Prayer Times ====================
  readonly prayer = {
    times: (opts?: { district?: string; date?: string }) =>
      this.request<any>('/v1/prayer/times', { query: opts }),
    ramadan: (district?: string) =>
      this.request<any>('/v1/prayer/ramadan', { query: { district } }),
    offsets: () => this.request<any[]>('/v1/prayer/offsets'),
  };

  // ==================== 18. Metro Rail ====================
  readonly metro = {
    stations: () => this.request<any[]>('/v1/metro/stations'),
    fare: (from: string, to: string) =>
      this.request<any>('/v1/metro/fare', { query: { from, to } }),
    timetable: () => this.request<any>('/v1/metro/timetable'),
    lines: () => this.request<any[]>('/v1/metro/lines'),
  };

  // ==================== 19. Health ====================
  readonly health = {
    hospitals: (opts?: { division?: string; district?: string; type?: string; q?: string }) =>
      this.request<any[]>('/v1/health/hospitals', { query: opts }),
    hospital: (slug: string) => this.request<any>(`/v1/health/hospitals/${slug}`),
    emergency: () => this.request<any[]>('/v1/health/emergency'),
  };

  // ==================== 20. Weather & AQI ====================
  readonly weather = {
    maritimeSignals: () => this.request<any[]>('/v1/weather/signals/maritime'),
    riverportSignals: () => this.request<any[]>('/v1/weather/signals/riverport'),
    aqi: (opts?: { district?: string }) => this.request<any>('/v1/weather/aqi', { query: opts }),
    seasons: () => this.request<any[]>('/v1/weather/seasons'),
  };

  // ==================== 21. Bangladesh Railway ====================
  readonly railway = {
    trains: (opts?: {
      origin?: string;
      destination?: string;
      class?: string;
      off_day?: string;
      q?: string;
    }) => this.request<any[]>('/v1/railway/trains', { query: opts }),
    train: (numberOrSlug: string | number) =>
      this.request<any>(`/v1/railway/trains/${numberOrSlug}`),
    classes: () => this.request<any[]>('/v1/railway/classes'),
    stations: () => this.request<any[]>('/v1/railway/stations'),
  };

  // ==================== 22. Constituencies ====================
  readonly constituencies = {
    list: (opts?: {
      division?: string;
      district?: string;
      q?: string;
      limit?: number;
      offset?: number;
    }) => this.request<any[]>('/v1/constituencies', { query: opts }),
    get: (idOrSlug: string | number) => this.request<any>(`/v1/constituencies/${idOrSlug}`),
    districts: (district?: string) =>
      this.request<any[]>('/v1/constituencies/districts', { query: { district } }),
  };

  // ==================== 23. Airports ====================
  readonly airports = {
    list: (opts?: {
      division?: string;
      district?: string;
      type?: string;
      status?: string;
      q?: string;
    }) => this.request<any[]>('/v1/airports', { query: opts }),
    get: (codeOrSlug: string) => this.request<any>(`/v1/airports/${codeOrSlug}`),
    types: () => this.request<any[]>('/v1/airports/types'),
  };

  // ==================== 24. Heritage & Tourism ====================
  readonly heritage = {
    list: (opts?: {
      division?: string;
      district?: string;
      category?: string;
      type?: string;
      q?: string;
    }) => this.request<any[]>('/v1/heritage', { query: opts }),
    get: (slugOrId: string | number) => this.request<any>(`/v1/heritage/${slugOrId}`),
    unesco: () => this.request<any[]>('/v1/heritage/unesco'),
  };

  // ==================== 25. Rivers ====================
  readonly rivers = {
    list: (opts?: {
      division?: string;
      district?: string;
      is_transboundary?: boolean;
      q?: string;
    }) => this.request<any[]>('/v1/rivers', { query: opts }),
    get: (slug: string) => this.request<any>(`/v1/rivers/${slug}`),
    transboundary: () => this.request<any[]>('/v1/rivers/transboundary'),
  };

  // ==================== 26. Ports ====================
  readonly ports = {
    land: (opts?: {
      division?: string;
      district?: string;
      status?: string;
      has_rail_link?: boolean;
      q?: string;
    }) => this.request<any[]>('/v1/ports/land', { query: opts }),
    landPort: (codeOrSlug: string) => this.request<any>(`/v1/ports/land/${codeOrSlug}`),
  };

  // ==================== 27. Bangla NLP ====================
  readonly nlp = {
    stopwords: (category?: string, limit?: number) =>
      this.request<any>('/v1/nlp/stopwords', { query: { category, limit } }),
    removeStopwords: (text: string) =>
      this.request<any>('/v1/nlp/stopwords/remove', { method: 'POST', body: { text } }),
    normalize: (text: string, strip_zw = true) =>
      this.request<any>('/v1/nlp/normalize', { method: 'POST', body: { text, strip_zw } }),
    tokenize: (text: string, mode: 'word' | 'sentence' = 'word') =>
      this.request<any>('/v1/nlp/tokenize', { method: 'POST', body: { text, mode } }),
    stem: (wordOrWords: string | string[]) => {
      const body = Array.isArray(wordOrWords) ? { words: wordOrWords } : { word: wordOrWords };
      return this.request<any>('/v1/nlp/stem', { method: 'POST', body });
    },
  };

  // ==================== 28. Developer ====================
  readonly developer = {
    quota: () => this.request<any>('/v1/developer/quota'),
  };
}

export function createDeshClient(config?: ClientConfig): DeshClient {
  return new DeshClient(config);
}
