import html
import re
from typing import Optional

# Regex patterns for identifying potential PII
EMAIL_REGEX = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b",
    re.IGNORECASE,
)
# Matches common Lao / International phone formats (e.g., +856 20..., 020..., 030..., 8-15 digits)
PHONE_REGEX = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b"
)
# Matches HTML tags
HTML_TAG_REGEX = re.compile(r"<[^>]*?>")
# Matches control characters except newline and tab
CONTROL_CHAR_REGEX = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")


def sanitize_text(
    text: Optional[str],
    max_length: int = 1000,
    redact_pii: bool = True,
) -> Optional[str]:
    """Sanitize free-form user input text to prevent injection and scrub PII."""
    if text is None:
        return None

    cleaned = str(text).strip()
    if not cleaned:
        return None

    # Remove null bytes and non-printable control characters
    cleaned = CONTROL_CHAR_REGEX.sub("", cleaned)

    # Strip HTML tags
    cleaned = HTML_TAG_REGEX.sub("", cleaned)

    # Escape HTML special characters
    cleaned = html.escape(cleaned, quote=True)

    # Scrub PII if enabled
    if redact_pii:
        cleaned = EMAIL_REGEX.sub("[REDACTED_EMAIL]", cleaned)
        cleaned = PHONE_REGEX.sub("[REDACTED_PHONE]", cleaned)

    # Limit length
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].strip()

    return cleaned


def sanitize_for_export(text: Optional[str]) -> str:
    """Sanitize text specifically for Markdown / JSON export context safety."""
    if text is None:
        return ""
    
    # Strip any markdown injection headers or harmful characters
    cleaned = str(text).replace("\r\n", " ").replace("\n", " ").replace("\r", " ")
    cleaned = EMAIL_REGEX.sub("[REDACTED_EMAIL]", cleaned)
    cleaned = PHONE_REGEX.sub("[REDACTED_PHONE]", cleaned)
    return cleaned.strip()


def check_for_pii(text: Optional[str]) -> bool:
    """Return True if text contains recognizable PII patterns."""
    if not text:
        return False
    return bool(EMAIL_REGEX.search(text) or PHONE_REGEX.search(text))
