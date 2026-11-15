# Data Model: Banks

## Bank (`data/banks/banks.json`)
`slug` (unique), `name_en` (as in the source), `bb_id` (Bangladesh Bank bank ID),
`routing_code?` (3 digits, when known).

## Branch (`data/banks/branches.json`)
`id` (Bangladesh Bank branch ID = `bb_id` + 4 digits, unique, sort key), `bank` (slug),
`name_en`, `district` (geo slug), `thana` (as in the source), `upazila?` (geo slug, in `district`),
`routing_number?` (9 digits, valid check digit, starts with the bank's `routing_code`, unique).

## Responses
- **BankWithCounts**: Bank + `branch_count`, `branches_with_routing`.
- **BranchDetail**: `id`, `name_en`, `thana`, `routing_number?`, `bank` {slug, name_en, bb_id},
  `district`, `division`, `upazila?` (`{ slug, name_en, name_bn }`).
