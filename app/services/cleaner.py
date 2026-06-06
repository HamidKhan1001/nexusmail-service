import re
from app.config import settings

# Patterns that match common email reply artifacts
_STRIP_PATTERNS = re.compile(
    r"(-{5,}\s*Original Message\s*-{5,}"
    r"|^From:.*$"
    r"|^Sent:.*$"
    r"|^To:.*$"
    r"|^Subject:.*$"
    r"|^On .+? wrote:$"
    r"|_{3,}"
    r"|^>+.*$)",
    re.IGNORECASE | re.MULTILINE,
)


def clean_email_thread(raw: str) -> str:
    """Strip reply headers, signatures, and quoted blocks; prune to max_tokens words."""
    cleaned = _STRIP_PATTERNS.sub("", raw)
    # Collapse excess whitespace
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    words = cleaned.split()
    if len(words) > settings.max_tokens:
        cleaned = " ".join(words[: settings.max_tokens]) + " [truncated]"
    return cleaned
