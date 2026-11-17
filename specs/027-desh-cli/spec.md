# Feature Specification: 027-desh-cli (Desh Terminal Command-Line Interface)

**Feature Branch**: `027-desh-cli`  
**Status**: Built  

---

## 1. Overview

Developers, sysadmins, and terminal power users frequently need quick answers without leaving their shell: looking up a post code, checking today's prayer times, validating a Bangladeshi NID or vehicle registration plate, or converting numbers to Bangla words.

`desh` is a fast, lightweight terminal CLI installable via npm (`npm i -g @deshapi/cli`), Homebrew (`brew install desh-api/tap/desh`), or single-binary curl installer.

---

## 2. CLI Command Examples

```bash
# Geo & Postcodes
desh postcode 1205
desh upazila "mirpur"

# Prayer times
desh prayer today --district dhaka
desh prayer next

# Calculations & Conversions
desh words 1250000 --taka
desh tax 1500000 --year 2026-27
desh land 5 katha --to sqft

# Validations
desh validate nid 1990123456789
desh validate plate "ঢাকা মেট্রো-গ ১১-২২৩৩"

# Live Market & Gold
desh gold
desh fuel
```
