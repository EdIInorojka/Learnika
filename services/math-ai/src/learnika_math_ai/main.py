from fastapi import FastAPI

from learnika_math_ai.config import load_settings
from learnika_math_ai.logging_config import configure_logging

settings = load_settings()
configure_logging(settings.log_level)

app = FastAPI(
    title="Learnika Math AI",
    version="0.0.0",
)


@app.get("/health/live")
def live() -> dict[str, str]:
    return {
        "service": settings.service_name,
        "status": "ok",
    }


@app.get("/health/ready")
def ready() -> dict[str, str]:
    return {
        "service": settings.service_name,
        "status": "ok",
    }

