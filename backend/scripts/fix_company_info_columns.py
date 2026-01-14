import sys
import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

load_dotenv()

try:
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("Corrigindo tamanho das colunas mercury_* na tabela company_info...")
    
    # Altera mercury_username para TEXT (ou VARCHAR(500))
    cur.execute("ALTER TABLE company_info ALTER COLUMN mercury_username TYPE VARCHAR(500);")
    print("✓ mercury_username alterado para VARCHAR(500)")
    
    # Altera mercury_password para TEXT
    cur.execute("ALTER TABLE company_info ALTER COLUMN mercury_password TYPE VARCHAR(500);")
    print("✓ mercury_password alterado para VARCHAR(500)")
    
    # Aproveito e corrijo cert_password também se precisar
    cur.execute("ALTER TABLE company_info ALTER COLUMN cert_password TYPE VARCHAR(500);")
    print("✓ cert_password alterado para VARCHAR(500)")

    conn.commit()
    print("✅ Schema corrigido com sucesso!")
    
    cur.close()
    conn.close()

except Exception as e:
    print(f"❌ Erro ao corrigir schema: {e}")
