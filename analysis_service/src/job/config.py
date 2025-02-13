from pydantic_settings import BaseSettings


class JobConfig(BaseSettings):
    MODEL_NAME: str = "gemini-2-flash"


job_config = JobConfig()
