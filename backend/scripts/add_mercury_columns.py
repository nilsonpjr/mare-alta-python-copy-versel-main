import sys
import os
from sqlalchemy import text, inspect

# Add backend dir to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine

def add_columns():
    print("Verifying database schema manually...")
    inspector = inspect(engine)
    
    # Check if table exists
    if not inspector.has_table('company_info'):
        print("Table 'company_info' does NOT exist. Creating tables via models...")
        import models
        models.Base.metadata.create_all(bind=engine)
        print("Tables created.")
        return

    columns = [col['name'] for col in inspector.get_columns('company_info')]
    print(f"Existing columns: {columns}")
    
    with engine.connect() as conn:
        if 'mercury_username' not in columns:
            print("Adding mercury_username column...")
            conn.execute(text("ALTER TABLE company_info ADD COLUMN mercury_username VARCHAR(100)"))
            print("mercury_username added.")
        else:
            print("mercury_username already exists.")

        if 'mercury_password' not in columns:
            print("Adding mercury_password column...")
            conn.execute(text("ALTER TABLE company_info ADD COLUMN mercury_password VARCHAR(100)"))
            print("mercury_password added.")
        else:
            print("mercury_password already exists.")
            
        conn.commit()
    print("Schema verification completed.")

if __name__ == "__main__":
    add_columns()
