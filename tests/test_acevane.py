from app.models import PriorityRating
from app.services.acevane import AceVaneMockEngine


def test_routine_email():
    result = AceVaneMockEngine.analyze("Just checking in on the weekly report.")
    assert result.priority_rating == PriorityRating.routine
    assert result.summary != ""
    assert result.suggested_response_template != ""


def test_urgent_keyword_triggers_critical():
    for kw in ["urgent", "broken", "asap", "escalation", "critical", "down", "emergency"]:
        result = AceVaneMockEngine.analyze(f"This is {kw} please help")
        assert result.priority_rating == PriorityRating.critical, f"failed for keyword: {kw}"


def test_case_insensitive():
    result = AceVaneMockEngine.analyze("URGENT situation in production!")
    assert result.priority_rating == PriorityRating.critical
