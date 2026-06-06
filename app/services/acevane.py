from app.config import settings
from app.models import AceVaneInsights, PriorityRating


class AceVaneMockEngine:
    """
    Local heuristic engine that classifies email priority without any cloud calls.
    Checks for urgency trigger keywords and returns structured insights.
    """

    @staticmethod
    def analyze(text: str) -> AceVaneInsights:
        text_lower = text.lower()
        is_urgent = any(kw in text_lower for kw in settings.urgency_triggers)

        if is_urgent:
            return AceVaneInsights(
                summary="[AceVane] High-priority bottleneck detected in communication stream.",
                priority_rating=PriorityRating.critical,
                suggested_response_template=(
                    "Acknowledged receipt. We are actively isolating the issue and will update you shortly."
                ),
            )

        return AceVaneInsights(
            summary="[AceVane] Routine communication or project checkpoint sync.",
            priority_rating=PriorityRating.routine,
            suggested_response_template=(
                "Received and noted. Added to the end-of-week compilation."
            ),
        )
