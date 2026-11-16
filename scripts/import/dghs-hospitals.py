"""
Enriches and syncs hospital records from the official DGHS report (hospitaldghs.gov.bd)
into data/health/hospitals.json.

Usage:
    python scripts/import/dghs-hospitals.py [path-to-excel]
"""
import json
import sys
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = ROOT / "data" / "health" / "hospitals.json"
DEFAULT_EXCEL = Path(r"C:\Users\HP\Downloads\Report-2026-11-16 16_12_39.xlsx")

excel_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_EXCEL

if not excel_path.exists():
    print(f"Excel file not found at {excel_path}")
    sys.exit(1)

print(f"Loading DGHS registry from {excel_path}...")
wb = openpyxl.load_workbook(excel_path, read_only=True)
sheet = wb.active

dghs_by_name = {}
dghs_by_code = {}

for i, row in enumerate(sheet.iter_rows(values_only=True)):
    if i == 0:
        continue
    facility_id, name, name_bn, code, email, agency, f_type, division, district, city_corp, upazila, paurasava, union, private = row[:14]
    if not name:
        continue
    code_str = str(code).strip()
    entry = {
        "code": code_str,
        "name": str(name).strip() if name else "",
        "name_bn": str(name_bn).strip() if name_bn else "",
        "email": str(email).strip() if email else "",
        "type": str(f_type) if f_type else "",
        "division": str(division).strip() if division else "",
        "district": str(district).strip() if district else "",
        "upazila": str(upazila).strip() if upazila else "",
        "private": private,
    }
    dghs_by_code[code_str] = entry
    norm = name.lower().replace(" ", "").replace("&", "and").replace(",", "").replace(".", "").replace("-", "")
    dghs_by_name[norm] = entry

print(f"Loaded {len(dghs_by_code)} facilities from DGHS registry.")

# Load existing data/health/hospitals.json
with open(DATA_FILE, "r", encoding="utf-8") as f:
    existing = json.load(f)

matched = 0
for h in existing:
    h_norm = h["name_en"].lower().replace(" ", "").replace("&", "and").replace(",", "").replace(".", "").replace("-", "")
    
    # Try direct or substring match
    match = dghs_by_name.get(h_norm)
    if not match:
        for k, v in dghs_by_name.items():
            if (h_norm in k or k in h_norm) and (v["district"].lower() in h["district"].lower() or h["district"].lower() in v["district"].lower()):
                match = v
                break

    if match:
        h["dghs_code"] = match["code"]
        if not h.get("email") and match.get("email"):
            h["email"] = match["email"]
        matched += 1
        print(f"  Matched: {h['slug']} -> DGHS [{match['code']}] {match['name']}")
    else:
        print(f"  Unmatched: {h['slug']}")

print(f"\nMatched {matched}/{len(existing)} hospitals with DGHS facility codes.")

# Sort by slug
existing.sort(key=lambda x: x["slug"])

with open(DATA_FILE, "w", encoding="utf-8") as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Saved updated {DATA_FILE}")
