
import sys
import os
from sqlalchemy import text
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from database import engine

def add_column(statement):
    with engine.connect() as conn:
        try:
            conn.execute(text(statement))
            conn.commit()
            print(f"✅ Executado: {statement}")
        except Exception as e:
            print(f"ℹ️ Já existe ou erro: {str(e)[:100]}...")

def add_fiscal_columns():
    print("🔄 Atualizando schema do banco de dados (Fiscal Próprio)...")
    
    add_column("ALTER TABLE company_info ADD COLUMN cert_file_path VARCHAR(200);")
    add_column("ALTER TABLE company_info ADD COLUMN cert_password VARCHAR(100);")
    add_column("ALTER TABLE company_info ADD COLUMN fiscal_environment VARCHAR(20) DEFAULT 'homologation';")
    add_column("ALTER TABLE company_info ADD COLUMN sequence_nfe INTEGER DEFAULT 1;")
    add_column("ALTER TABLE company_info ADD COLUMN series_nfe INTEGER DEFAULT 1;")
    add_column("ALTER TABLE company_info ADD COLUMN city_code VARCHAR(7) DEFAULT '4118204';")

if __name__ == "__main__":
    add_fiscal_columns()
