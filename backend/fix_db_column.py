
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def fix_db():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if technician_id exists in service_orders
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'service_orders' AND column_name = 'technician_id'"))
        exists = result.fetchone()
        
        if not exists:
            print("Adding technician_id column to service_orders table...")
            conn.execute(text("ALTER TABLE service_orders ADD COLUMN technician_id INTEGER REFERENCES users(id)"))
            conn.commit()
            print("Column added successfully.")
        else:
            print("technician_id column already exists.")
            
        # Check if telegram_id exists in clients
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'telegram_id'"))
        exists_tg = result.fetchone()
        
        if not exists_tg:
            print("Adding telegram_id column to clients table...")
            conn.execute(text("ALTER TABLE clients ADD COLUMN telegram_id VARCHAR(50)"))
            conn.commit()
            print("Column added successfully.")
        else:
            print("telegram_id column already exists.")

        print("Done.")

if __name__ == "__main__":
    fix_db()
