
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

# Fix postgres protocol
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def migrate():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column exists
        try:
            # Try to select the column
            conn.execute(text("SELECT n8n_webhook_url FROM company_info LIMIT 1"))
            print("Column 'n8n_webhook_url' already exists.")
        except Exception:
            print("Column 'n8n_webhook_url' not found. Adding it...")
            try:
                # Add column
                # Note: SQLite syntax for ADD COLUMN differs slightly in older versions but usually supports this.
                # Postgres supports this too.
                conn.execute(text("ALTER TABLE company_info ADD COLUMN n8n_webhook_url VARCHAR(500)"))
                conn.commit()
                print("Column 'n8n_webhook_url' added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    migrate()
