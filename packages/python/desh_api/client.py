import requests
from typing import Any, Dict, List, Optional, Union
from .exceptions import DeshApiError

class DeshClient:
    """Official Python client for Desh API."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://deshapi.riadul.com", timeout: int = 15):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})
        if self.api_key:
            self.session.headers.update({"X-API-Key": self.api_key})

    def request(self, method: str, path: str, params: Optional[Dict[str, Any]] = None, json: Optional[Any] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/{path.lstrip('/')}"
        clean_params = {k: v for k, v in (params or {}).items() if v is not None}
        
        try:
            res = self.session.request(method, url, params=clean_params, json=json, timeout=self.timeout)
            data = res.json()
        except requests.RequestException as e:
            raise DeshApiError(0, "network_error", str(e))
        except ValueError:
            raise DeshApiError(res.status_code, "invalid_json", res.text)

        if not res.ok or not data.get("success", False):
            err = data.get("error", {})
            raise DeshApiError(
                res.status_code,
                err.get("code", "unknown_error"),
                err.get("message", res.reason),
                err.get("message_bn"),
                err.get("details"),
            )

        return data

    # 1. Geo
    def get_divisions(self) -> List[Dict[str, Any]]:
        return self.request("GET", "/v1/divisions")["data"]

    def get_districts(self, division: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.request("GET", "/v1/districts", params={"division": division})["data"]

    def get_upazilas(self, district: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.request("GET", "/v1/upazilas", params={"district": district})["data"]

    def get_postcode(self, code: Union[str, int]) -> Dict[str, Any]:
        return self.request("GET", f"/v1/postcodes/{code}")["data"]

    # 2. Bangla Toolkit
    def num_to_words(self, n: Union[int, str]) -> Dict[str, Any]:
        return self.request("GET", "/v1/bangla/num-to-words", params={"n": n})["data"]

    def taka_in_words(self, amount: Union[float, int, str]) -> Dict[str, Any]:
        return self.request("GET", "/v1/bangla/taka-in-words", params={"amount": amount})["data"]

    # 3. Validation
    def validate_nid(self, number: str) -> Dict[str, Any]:
        return self.request("GET", f"/v1/validate/nid/{number}")["data"]

    def validate_phone(self, number: str) -> Dict[str, Any]:
        return self.request("GET", f"/v1/phone/{number}")["data"]

    # 4. Finance
    def calculate_income_tax(self, income: Union[int, float], tax_year: str = "2027-28") -> Dict[str, Any]:
        return self.request("GET", "/v1/finance/income-tax", params={"income": income, "tax_year": tax_year})["data"]

    # 5. NLP
    def get_stopwords(self, category: Optional[str] = None) -> Dict[str, Any]:
        return self.request("GET", "/v1/nlp/stopwords", params={"category": category})["data"]

    def stem(self, word: str) -> Dict[str, Any]:
        return self.request("POST", "/v1/nlp/stem", json={"word": word})["data"]

    def normalize(self, text: str) -> Dict[str, Any]:
        return self.request("POST", "/v1/nlp/normalize", json={"text": text})["data"]
