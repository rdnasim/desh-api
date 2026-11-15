"""
Imports Bangladesh Bank's branch list and attaches routing numbers into data/banks/*.json.

    pip install pypdf
    python3 -I scripts/import/banks.py <geo_bank.pdf> <routing.csv>

<geo_bank.pdf>  https://www.bb.org.bd/econdata/bs/geo_bank.pdf (behind a captcha: download it in a
                browser). Bank, bank ID, branch, branch ID, division, district, thana.
<routing.csv>   https://www.bddata.org/all-banks/ publishes its table as a Google Sheet CSV
                (District, Bank, Branch, RoutingNo); only the routing numbers are used.

Branch details always come from Bangladesh Bank. A routing number is attached only when
  1. its check digit is valid (weights 5-7-1, sum divisible by 10; leading zeros restored),
  2. its bank and district match the Bangladesh Bank branch, and
  3. the branch name matches exactly, or is the single close spelling (difflib ratio >= 0.88,
     at least 0.1 ahead of the next candidate) and the routing number's district code agrees
     with what exact matches show for that code.
A branch that would receive two different numbers gets none. See specs/005-banks/research.md.
"""

import collections
import csv
import difflib
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
DIVISIONS = 'BARISHAL|CHATTOGRAM|DHAKA|KHULNA|MYMENSINGH|RAJSHAHI|RANGPUR|SYLHET'
TOTAL_ROW = re.compile(r'(\d+) (?=[A-Z][^\d]*? \d{2,3} )')
RECORD = re.compile(rf'^(.+?) (\d{{2,3}}) (.+) (\d{{6,7}}) ({DIVISIONS}) (.+)$')

# Spellings in the two sources that differ from data/geo names and aliases.
DISTRICT_SPELLINGS = {
    'BOGRA': 'bogura', 'CHITTAGONG': 'chattogram', 'COMILLA': 'cumilla', 'BARISAL': 'barishal',
    'JESSORE': 'jashore', 'NARSHINGDI': 'narsingdi', 'JAYPURHAT': 'joypurhat',
    'MOULVI BAZAR': 'moulvibazar',
}
# Old or misspelt bank names in the routing table -> Bangladesh Bank bank ID.
BANK_SPELLINGS = {
    'CITI BANK': 26, 'COMMERCIAL BANK OF CYLON': 27, 'EXIM BANK': 63,
    'HONGKONG AND SHANGHAI BANKING CORP': 74, 'ISLAMI BANK BANGLDESH': 42, 'STANDARD BANK': 61,
    'NRB COMMERCIAL BANK': 76, 'FARMERS BANK': 80, 'NRB GLOBAL BANK': 84,
}
BRANCH_NOISE = {'BRANCH', 'BR', 'SME', 'SERVICE', 'CENTRE', 'CENTER', 'UNIT', 'KRISHI', 'SHAKHA'}


def norm(s):
    s = s.upper().replace('&', ' AND ').replace('N.A.', 'N A')
    s = re.sub(r'\b(PLC|LTD|LIMITED|N A|THE)\b\.?', ' ', s)
    return re.sub(r'[^A-Z0-9]+', ' ', s).strip()


def branch_key(s):
    return ' '.join(w for w in norm(s.replace('(', ' ').replace(')', ' ')).split() if w not in BRANCH_NOISE)


def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", '')).strip('-')


def valid_routing(n):
    weights = (5, 7, 1)
    return len(n) == 9 and n.isdigit() and sum(int(c) * weights[i % 3] for i, c in enumerate(n)) % 10 == 0


def bank_slug(name):
    if 'HSBC' in name:
        return 'hsbc'
    return slugify(re.sub(r'\b(PLC|LTD|LIMITED|THE)\b\.?|\(.*?\)|,', ' ', name).replace('N.A.', 'NA'))


def read_branches(pdf):
    text = ' '.join(page.extract_text() or '' for page in PdfReader(pdf).pages)
    text = re.sub(r'BANK NAME BANK ID BRANCH NAME FI BRANCH ID DIVISION DISTRICT THANA\s*1 2 3 4 5 6 7', ' ', text)
    text = re.sub(r'Source: Banking Statistics.*?Bangladesh Bank', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    starts, pos, serial = [], 0, 1
    while True:
        m = re.compile(rf'(?<![\d.]){serial} (?=[A-Z][^\d]*? \d{{2,3}} )').search(text, pos)
        if not m:
            break
        starts.append(m)
        pos, serial = m.end(), serial + 1
    rows = []
    for i, m in enumerate(starts):
        chunk = text[m.end():(starts[i + 1].start() if i + 1 < len(starts) else len(text))].strip()
        r = RECORD.match(chunk)
        if not r or not r.group(4).startswith(r.group(2)):
            sys.exit(f'cannot parse row {i + 1}: {chunk[:120]}')
        bank, bank_id, branch, branch_id, division, rest = r.groups()
        rows.append(dict(bank=bank.strip(), bank_id=int(bank_id), branch=branch.strip(),
                         branch_id=branch_id, division=division, rest=rest.strip()))
    return rows


def main(pdf, routing_csv):
    geo = json.loads((ROOT / 'data/geo/districts.json').read_text())
    upazilas = json.loads((ROOT / 'data/geo/upazilas.json').read_text())
    districts = {}
    for d in geo:
        for n in [d['name_en'], d['slug'].replace('-', ' '), *d.get('aliases', [])]:
            districts[norm(n)] = d['slug']
    districts.update(DISTRICT_SPELLINGS)
    upazila_names = collections.defaultdict(dict)
    for u in upazilas:
        for n in [u['name_en'], *u.get('aliases', [])]:
            upazila_names[u['district']][norm(n)] = u['slug']

    rows = read_branches(pdf)
    for r in rows:
        words = r['rest'].split(' ')
        r['district'] = None
        for n in range(min(3, len(words)), 0, -1):
            name = norm(' '.join(words[:n]))
            if name in districts:
                r['district'], r['thana'] = districts[name], ' '.join(words[n:]).strip()
                break
        if r['district'] is None:
            sys.exit(f"unknown district in: {r['rest']}")
        r['upazila'] = upazila_names[r['district']].get(norm(r['thana'].replace('_', ' ')))

    # Routing numbers.
    bank_ids = {norm(r['bank']): r['bank_id'] for r in rows}
    by_place = collections.defaultdict(list)
    for r in rows:
        by_place[(r['bank_id'], r['district'])].append(r)
    found = collections.defaultdict(set)
    fuzzy, code_district = [], collections.defaultdict(collections.Counter)
    stats = collections.Counter()
    with open(routing_csv, encoding='utf-8') as f:
        for s in csv.DictReader(f):
            number = s['RoutingNo'].strip().zfill(9)
            if not valid_routing(number):
                stats['bad check digit'] += 1
                continue
            bank_id = bank_ids.get(norm(s['Bank'])) or BANK_SPELLINGS.get(norm(s['Bank']))
            district = districts.get(norm(s['Distritct']))
            candidates = by_place.get((bank_id, district), [])
            key = branch_key(s['Branch'])
            exact = [c for c in candidates if branch_key(c['branch']) == key]
            if len(exact) == 1:
                found[exact[0]['branch_id']].add(number)
                code_district[number[3:5]][district] += 1
                stats['exact'] += 1
                continue
            scored = sorted(((difflib.SequenceMatcher(None, key, branch_key(c['branch'])).ratio(), c)
                             for c in candidates), key=lambda x: -x[0])
            if scored and scored[0][0] >= 0.88 and (len(scored) == 1 or scored[0][0] - scored[1][0] >= 0.1):
                fuzzy.append((number, scored[0][1]))
            else:
                stats['no match' if bank_id else 'bank not in Bangladesh Bank list'] += 1
    for number, branch in fuzzy:
        expected = code_district[number[3:5]].most_common(1)
        if expected and expected[0][0] != branch['district']:
            stats['close spelling, district code disagrees'] += 1
            continue
        found[branch['branch_id']].add(number)
        stats['close spelling'] += 1

    conflicts = {k for k, v in found.items() if len(v) > 1}
    routing = {k: next(iter(v)) for k, v in found.items() if k not in conflicts}
    taken = collections.Counter(routing.values())
    routing = {k: v for k, v in routing.items() if taken[v] == 1}
    bank_codes = collections.defaultdict(collections.Counter)
    for branch_id, number in routing.items():
        bank_codes[int(branch_id[:-4])][number[:3]] += 1

    banks = {}
    for r in rows:
        banks.setdefault(r['bank_id'], dict(slug=bank_slug(r['bank']), name_en=r['bank'], bb_id=r['bank_id']))
    for b in banks.values():
        codes = bank_codes.get(b['bb_id'])
        if codes:
            b['routing_code'] = codes.most_common(1)[0][0]
    slugs = collections.Counter(b['slug'] for b in banks.values())
    assert all(c == 1 for c in slugs.values()), slugs

    branches = []
    for r in rows:
        rec = dict(id=r['branch_id'], bank=banks[r['bank_id']]['slug'], name_en=r['branch'],
                   district=r['district'], thana=r['thana'])
        if r['upazila']:
            rec['upazila'] = r['upazila']
        if r['branch_id'] in routing:
            rec['routing_number'] = routing[r['branch_id']]
        branches.append(rec)

    out = ROOT / 'data/banks'
    out.mkdir(exist_ok=True)
    dump = lambda v: json.dumps(v, indent=2, ensure_ascii=False) + '\n'
    (out / 'banks.json').write_text(dump(sorted(banks.values(), key=lambda b: b['slug'])))
    (out / 'branches.json').write_text(dump(sorted(branches, key=lambda b: b['id'])))
    print(f'{len(banks)} banks, {len(branches)} branches; '
          f"{sum('upazila' in b for b in branches)} with an upazila; {len(routing)} with a routing number "
          f'({len(conflicts)} branches dropped for conflicting numbers)')
    print(dict(stats))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
