class DeshApiError(Exception):
    """Exception raised when an API request fails."""

    def __init__(self, status_code: int, code: str, message: str, message_bn: str = None, details=None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.message_bn = message_bn
        self.details = details

    def __str__(self):
        return f"[{self.status_code}] {self.code}: {self.message}"
