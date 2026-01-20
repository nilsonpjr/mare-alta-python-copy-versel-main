
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mare_alta.db")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def migrate():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    # Try Add Column
    try:
        with engine.connect() as conn:
            with conn.begin(): # Start transaction
                 conn.execute(text("ALTER TABLE company_info ADD COLUMN n8n_webhook_url VARCHAR(500)"))
            print("Column 'n8n_webhook_url' added successfully.")
    except Exception as e:
        print(f"Migration result (probably already exists): {e}")

if __name__ == "__main__":
    migrate()
