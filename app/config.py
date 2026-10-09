import os
from pathlib import Path
from dotenv import load_dotenv

# Load optional .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'vignan_academic.db'}")
DB_PATH = BASE_DIR / "vignan_academic.db"

# Crawler & Security configuration
ALLOWED_DOMAINS = [
    "vignan.ac.in",
    "www.vignan.ac.in",
    "erp.vignan.ac.in",
    "omega-hnqg.onrender.com",
    "omega-nine-tau.vercel.app"
]

USER_AGENT = os.getenv(
    "USER_AGENT",
    "VignanAcademicBot/1.0 (+https://omega-nine-tau.vercel.app; AI Student Success Platform)"
)

REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))
MAX_DOWNLOAD_SIZE_BYTES = int(os.getenv("MAX_DOWNLOAD_SIZE_BYTES", str(25 * 1024 * 1024))) # 25 MB limit
RATE_LIMIT_DELAY_SECONDS = float(os.getenv("RATE_LIMIT_DELAY_SECONDS", "1.0"))

# Administrative API token for triggering extraction pipeline
PIPELINE_ADMIN_KEY = os.getenv("PIPELINE_ADMIN_KEY", "vfstr-academic-secret-key-2026")

# Sample / Local Cache Directory
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
