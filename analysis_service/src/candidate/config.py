from pydantic_settings import BaseSettings


class CandidateConfig(BaseSettings):
    MODEL_NAME: str = "deepseek-chat"

    CV_UPLOAD_DIR: str = "./candidate_cv/"


candidate_config = CandidateConfig()
