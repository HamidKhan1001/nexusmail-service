from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "NexusMail Context Processor"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8050

    # Token pruning — max words kept after cleaning
    max_tokens: int = 250

    # AceVane urgency keywords
    urgency_triggers: list[str] = ["urgent", "escalation", "asap", "broken", "critical", "down", "emergency"]


settings = Settings()
