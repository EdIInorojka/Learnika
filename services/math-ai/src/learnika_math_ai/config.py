from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    environment: str
    log_level: str
    service_name: str


def load_settings() -> Settings:
    return Settings(
        environment=os.getenv("MATH_AI_ENV", "development"),
        log_level=os.getenv("MATH_AI_LOG_LEVEL", "INFO"),
        service_name="math-ai",
    )

