/** OpenAPI document settings and per-module tag descriptions shown on /docs. */
export const OPENAPI_CONFIG = {
  openapi: '3.1.0',
  info: {
    title: 'Desh API',
    version: '1.0.0',
    description: [
      'Free, open, bilingual API for Bangladesh reference data and Bangla language tools.',
      '',
      '- Every response is `{ success, data, meta }`; `meta.source` and `meta.last_updated` say where the data came from.',
      '- Errors are `{ success: false, error: { code, message } }` with a matching HTTP status.',
      '- Numbers can be sent in Latin (1250) or Bangla (১২৫০) digits.',
      '- No API key needed. Limit: 120 requests per minute per IP.',
      '- Validators check formats only and never store or log what you send.',
    ].join('\n'),
    license: { name: 'Code MIT, data CC BY 4.0' },
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [
    {
      name: 'Geo',
      description:
        'Divisions, districts, upazilas, unions and post offices with English and Bangla names. Sources: BBS geocodes and the Post Office list.',
    },
    {
      name: 'Bangla toolkit',
      description:
        'Number and taka in words, digit conversion, lakh/crore formatting, Bangla calendar dates, ordinals, slugs and Avro Phonetic transliteration.',
    },
    {
      name: 'Phone',
      description:
        'Validate and normalise Bangladesh mobile numbers. The operator is the original prefix allocation; ported numbers cannot be detected.',
    },
    {
      name: 'Convert',
      description: 'Convert text between legacy Bijoy (SutonnyMJ) encoding and Unicode Bangla.',
    },
    {
      name: 'Land',
      description:
        'Convert land measurements (katha, bigha, decimal, acre, …). Sizes of some units vary by region; standard values only.',
    },
    {
      name: 'Validate',
      description:
        'Format checks for NID, vehicle registration plates, e-TIN, VAT BIN and postcodes. Values are never looked up, stored or logged.',
    },
  ],
};
