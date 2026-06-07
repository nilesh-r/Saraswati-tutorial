import os

# Define our configuration variables simply with default fallbacks
class Settings:
    JWT_SECRET: str = os.getenv("JWT_SECRET", "saraswati_tutorial_mumbai_secret_key_98237498273498")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day

    # MongoDB Atlas Connection URI
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DB_NAME: str = os.getenv("DB_NAME", "saraswati_tutorials")

    # Local storage fallback database
    JSON_DB_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
        "local_db.json"
    )

    # API credentials for AI expansion
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Default Super Admin credentials for testing
    DEFAULT_ADMIN_EMAIL: str = "admin@saraswati.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"

settings = Settings()
