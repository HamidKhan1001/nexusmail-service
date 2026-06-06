from fastapi import APIRouter
from app.models import EmailPayload, ProcessResponse, PipelineMode, PriorityRating, AceVaneInsights
from app.services.cleaner import clean_email_thread
from app.services.acevane import AceVaneMockEngine

router = APIRouter(prefix="/email", tags=["Email Processing"])


@router.post("/process-stream", response_model=ProcessResponse, summary="Clean and score an email thread")
async def process_email_stream(payload: EmailPayload) -> ProcessResponse:
    """
    Accepts a raw email thread, strips reply artifacts, and returns a condensed
    version with an urgency score. Set `use_acevane=true` (default) for zero-cost
    local analysis; `false` reserves the slot for a live LLM pass.
    """
    cleaned = clean_email_thread(payload.raw_body)

    if payload.use_acevane:
        insights = AceVaneMockEngine.analyze(cleaned)
        return ProcessResponse(
            status="success",
            pipeline_mode=PipelineMode.acevane,
            purged_context=cleaned,
            metrics=insights,
        )

    return ProcessResponse(
        status="success",
        pipeline_mode=PipelineMode.live,
        purged_context=cleaned,
        metrics=AceVaneInsights(
            summary="Live processing pass initialised.",
            priority_rating=PriorityRating.unassigned,
            suggested_response_template="",
        ),
    )
