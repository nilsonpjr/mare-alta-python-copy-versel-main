
import sys
import os
from sqlalchemy import text
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from database import engine

def add_column():
    print("🔄 Atualizando schema do banco de dados...")
    with engine.connect() as conn:
        try:
            # Tenta adicionar a coluna. Se já existir, vai dar erro e ignoraremos.
            conn.execute(text("ALTER TABLE company_info ADD COLUMN mercury_username VARCHAR(100);"))
            conn.commit()
            print("✅ Coluna 'mercury_username' adicionada com sucesso!")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("ℹ️ Coluna 'mercury_username' já existe.")
            else:
                print(f"❌ Erro ao adicionar coluna: {e}")

if __name__ == "__main__":
    add_column()
