import json
import logging
import re
from typing import Any

SENSITIVE_TEXT_PATTERN = re.compile(
    r"authorization|cookie|password|passwordhash|token|tokenhash|secret|bearer\s+[a-z0-9._~+/=-]+",
    re.IGNORECASE,
)


class SafeJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "message": redact_text(record.getMessage()),
            "service": "math-ai",
        }

        return json.dumps(payload, ensure_ascii=False)


def redact_text(value: str) -> str:
    if SENSITIVE_TEXT_PATTERN.search(value):
        return "[redacted]"
    return value


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(SafeJsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())
