from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class PipelineMode(str, Enum):
    acevane = "AceVane_Mock_Protected"
    live = "Live_Inference_Pass"


class PriorityRating(str, Enum):
    critical = "CRITICAL_ACTION"
    routine = "ROUTINE_READ"
    unassigned = "UNASSIGNED"


class EmailPayload(BaseModel):
    raw_body: str = Field(..., min_length=1, description="Raw email thread text")
    sender: EmailStr = Field(..., description="Sender email address")
    use_acevane: bool = Field(True, description="Use AceVane mock engine (no cloud credits)")


class AceVaneInsights(BaseModel):
    summary: str
    priority_rating: PriorityRating
    suggested_response_template: str


class ProcessResponse(BaseModel):
    status: str
    pipeline_mode: PipelineMode
    purged_context: str
    metrics: AceVaneInsights | dict


class HealthResponse(BaseModel):
    status: str
    version: str
    service: str
