from app.services.cleaner import clean_email_thread


def test_strips_original_message_header():
    raw = "Thanks!\n--------- Original Message ---------\nFrom: x@x.com Sent: Monday\nOld content here."
    result = clean_email_thread(raw)
    assert "Original Message" not in result
    assert "Thanks!" in result


def test_strips_quoted_lines():
    raw = "My reply.\n> This was the original quoted line."
    result = clean_email_thread(raw)
    assert ">" not in result


def test_strips_from_sent_to_subject():
    raw = "Body text.\nFrom: someone@x.com\nSent: today\nTo: me@x.com\nSubject: Hello\nEnd."
    result = clean_email_thread(raw)
    assert "From:" not in result
    assert "Body text." in result


def test_prunes_to_max_tokens(monkeypatch):
    from app import config
    monkeypatch.setattr(config.settings, "max_tokens", 5)
    raw = "one two three four five six seven eight"
    result = clean_email_thread(raw)
    assert result.endswith("[truncated]")
    assert len(result.split()) <= 6  # 5 words + "[truncated]"


def test_clean_passthrough():
    raw = "Hello, this is a normal email with no headers."
    assert clean_email_thread(raw) == raw
