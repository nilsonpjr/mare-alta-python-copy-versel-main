
import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not set in .env")
    exit(1)

def fix_schema():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('company_info')]
    
    print(f"Current columns in 'company_info': {columns}")
    
    with engine.connect() as conn:
        # Check and add mercury_username
        if 'mercury_username' not in columns:
            print("Adding 'mercury_username' column...")
            conn.execute(text("ALTER TABLE company_info ADD COLUMN mercury_username VARCHAR(100)"))
            print("Added 'mercury_username'.")
        else:
            print("'mercury_username' already exists.")

        # Check and add mercury_password
        if 'mercury_password' not in columns:
            print("Adding 'mercury_password' column...")
            conn.execute(text("ALTER TABLE company_info ADD COLUMN mercury_password VARCHAR(100)"))
            print("Added 'mercury_password'.")
        else:
            print("'mercury_password' already exists.")
            
        conn.commit()
        print("Schema check/update completed.")

if __name__ == "__main__":
    fix_schema()
