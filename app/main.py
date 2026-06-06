from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import HealthResponse
from app.routers import email

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Privacy-centric email context optimizer. Cleans raw email threads, "
        "extracts priority signals, and serves as the backend for the Odysseus AI workspace."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(email.router)

# Keep legacy /process-stream path working alongside the new router
app.include_router(email.router, prefix="", include_in_schema=False)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        service=settings.app_name,
    )


@app.get("/", tags=["System"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }
