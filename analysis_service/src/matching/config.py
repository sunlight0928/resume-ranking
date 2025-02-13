from pydantic_settings import BaseSettings


class MachingConfig(BaseSettings):
    MODEL_NAME: str = "gemini-2-flash"


matching_config = MachingConfig()
