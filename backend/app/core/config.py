from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hotel Manager"
    API_V1_STR: str = "/api/v1"
    
    # BACKEND_CORS_ORIGINS is a comma-separated list of origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "samir"
    POSTGRES_PASSWORD: str = "samir"
    POSTGRES_DB: str = "hotel"
    SQLALCHEMY_DATABASE_URI: str | None = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v, info):
        if isinstance(v, str):
            return v
        data = info.data
        return f"postgresql://{data['POSTGRES_USER']}:{data['POSTGRES_PASSWORD']}@{data['POSTGRES_SERVER']}:{data['POSTGRES_PORT']}/{data['POSTGRES_DB']}?options=-c%20search_path%3Dpublic"

    # JWT settings
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 