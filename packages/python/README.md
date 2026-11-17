# desh-api

Official Python client for **[Desh API](https://deshapi.riadul.com)**.

---

## Installation

```bash
pip install desh-api
```

---

## Quick Start

```python
from desh_api import DeshClient

client = DeshClient(api_key="your_api_key_optional")

# 1. Geo Lookups
districts = client.get_districts(division="dhaka")
postcode = client.get_postcode(1205)

# 2. Bangla Toolkit
words = client.num_to_words(1250000)
# → {'input': 1250000, 'words': 'বারো লক্ষ পঞ্চাশ হাজার'}

# 3. NLP Tools
stemmed = client.stem("ছাত্রদেরকে")
# → {'input': 'ছাত্রদেরকে', 'stem': 'ছাত্র', 'suffix': 'দেরকে'}

# 4. Format Validation
valid_nid = client.validate_nid("1990123456789")
```
