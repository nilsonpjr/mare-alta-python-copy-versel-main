import os
import psycopg2
import sys

# Tenta carregar .env se python-dotenv estiver instalado
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback para hardcoded se necessario ou erro
    print("DATABASE_URL not found in environment")
    sys.exit(1)

print(f"Connecting to database...")

try:
    # Corrige URL para psycopg2 se necessário (geralmente postgresql:// funciona)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # Check if column exists
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='service_orders' AND column_name='checklist';")
    if cur.fetchone():
        print("Column 'checklist' already exists in 'service_orders'.")
    else:
        print("Adding column 'checklist' to 'service_orders'...")
        cur.execute("ALTER TABLE service_orders ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;")
        print("Column 'checklist' added successfully.")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error applying migration: {e}")
    sys.exit(1)
