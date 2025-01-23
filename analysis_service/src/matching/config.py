from pydantic_settings import BaseSettings


class MachingConfig(BaseSettings):
    MODEL_NAME: str = "gpt-4"


matching_config = MachingConfig()
