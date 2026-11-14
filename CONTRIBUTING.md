# Contributing to Desh API

Thanks for helping. Most useful contributions are **data fixes**, and you don't need to write code
for those.

## Fixing or adding data (no coding needed)

All reference data is plain JSON in [`data/`](data/):

| Folder | What's there |
|---|---|
| `data/geo/` | Divisions, districts, upazilas, unions, city corporations, post offices |
| `data/hotlines/` | National hotline numbers |
| `data/fun/` | Proverbs, riddles, quiz questions, GI foods, history events |
| `data/land/` | Land units |
| `data/phone/` | Mobile operator prefixes |
| `data/convert/` | Bijoy ↔ Unicode character map |
| `data/meta.json` | Source, licence and credits for every dataset |

1. Edit the file on GitHub (pencil icon) or open an issue with the **Data correction** template.
2. **Say where the fact comes from.** Every change needs a source: an official `gov.bd` page, a
   gazette, or a published reference. Changes without a source can't be merged.
3. A check runs automatically and tells you if the file has a problem (missing Bangla name, wrong
   format, unsorted records). Run it yourself with `pnpm data:check`; `pnpm tsx scripts/build-data.ts --fix`
   re-sorts and formats files for you.

Extra rules for some data:

- **Hotlines and other safety information** need a second maintainer's review (see
  `.github/CODEOWNERS`) and an official source URL plus a `last_verified` date.
- **Proverbs and riddles** must be traditional (public domain). No song lyrics, poems or quotes by
  modern authors.
- **Quiz questions and history events** need a URL for the fact, and must be neutral. If reliable
  sources disagree, leave the fact out.
- **Land units** that vary by region need a cited source for each regional value.
- **Holidays** come only from the government's yearly notification (Ministry of Public
  Administration) and Bangladesh Bank's circular, never from news reports. When a moon-dependent
  date is confirmed or a holiday is moved, open a PR within 2 days of the official announcement:
  update `dates`, set `tentative: false`, add the announcement to that year's `documents` in
  `data/holidays/years.json` and reference it in `amended_by`. Two reviewers are required.

## Code changes

```bash
pnpm install
pnpm dev          # http://localhost:8787 and /docs
pnpm test         # all tests, inside the Workers runtime
pnpm typecheck && pnpm lint
```

- Converters, validators and calculators are **test-first**: add the failing test (and golden
  cases where relevant), then the code.
- Every endpoint needs a contract test, an OpenAPI `summary` and an example. The OpenAPI test fails
  if a route is undocumented or an example doesn't match its schema.
- Validators must never store or log what users send. The privacy test checks logs.
- Keep responses in the `{ success, data, meta }` envelope with `meta.source`.

## How the project is planned

Features are specified before they're built, with [Spec Kit](https://github.com/github/spec-kit):
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. Project rules are in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md); the current feature is in
[`specs/001-phase1-mvp/`](specs/001-phase1-mvp/). Good first issues are labelled
`good first issue`, and content curation (proverbs, riddles, quiz, history) is a great place to
start.

## Pull requests

- One topic per PR. Fill in the "Source of this change" section of the template.
- CI must pass: data check, type-check, lint, tests and bundle size.

By contributing you agree that code is licensed MIT and data CC BY 4.0.
