import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.join(os.getcwd()))

from backend.database import SessionLocal

def fix_parts_schema():
    db = SessionLocal()
    print("Correção de Schema: Tabela Parts")
    try:
        # Colunas a adicionar
        columns = [
            ("group", "VARCHAR(100)"),
            ("subgroup", "VARCHAR(100)"),
            ("compatibility", "JSONB") 
        ]

        for col_name, col_type in columns:
            # Garante rollback limpo antes de tentar
            db.rollback()
            try:
                print(f"Verificando/Adicionando coluna '{col_name}'...")
                
                # Usar aspas duplas para escapar palavras reservadas como "group"
                sql = f'ALTER TABLE parts ADD COLUMN IF NOT EXISTS "{col_name}" {col_type}'
                
                db.execute(text(sql))
                db.commit()
                print(f"✓ Coluna '{col_name}' verificada.")
            except Exception as e:
                print(f"⚠️ Erro ao adicionar '{col_name}': {e}")
                db.rollback()


    except Exception as e:
        print(f"Erro Geral: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_parts_schema()
