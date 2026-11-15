# Data Model: Bangla Mock Data Generator

## MockName (`data/mock/names.json`)

| Field | Type | Rules |
|---|---|---|
| `name_en` | string | plain Latin letters |
| `name_bn` | string | Bangla, NFC |
| `kind` | `given` \| `family` | |
| `gender` | `male` \| `female`? | required for given names; on family names only when one gender uses it |
| `tradition` | `muslim` \| `hindu` \| `buddhist` \| `christian` | internal; never returned |

Sorted and unique by `tradition/kind/name_en`.

## Responses (not stored)

- **MockAddress**: `line_en`, `line_bn`, `upazila`, `district`, `division` (`{ slug, name_en,
  name_bn }`), `postcode`.
- **MockPerson**: `name_en`, `name_bn`, `gender`, `date_of_birth`, `phone`, `email`, `nid`,
  `address`.
