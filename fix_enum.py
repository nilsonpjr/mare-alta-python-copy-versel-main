import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.join(os.getcwd()))

from backend.database import SessionLocal

def fix_enum_movement_type():
    db = SessionLocal()
    print("Correção de Enum: MovementType (SALE_DIRECT)")
    try:
        # Apenas para Postgres
        # Verifica se o valor 'SALE_DIRECT' já existe no enum
        # Se não, adiciona
        
        # Em SQLite, enums são Strings e não precisam de alteração.
        # Em Postgres, precisa de ALTER TYPE.
        
        # Tentativa 1: Adicionar valor ao enum
        sql = "ALTER TYPE movementtype ADD VALUE IF NOT EXISTS 'SALE_DIRECT'"
        
        try:
            db.execute(text(sql))
            db.commit()
            print("✓ Valor 'SALE_DIRECT' adicionado ao enum 'movementtype'.")
        except Exception as e:
            print(f"⚠️ Erro ao alterar enum (pode ser SQLite ou já existe/não suportado): {e}")
            db.rollback()

    except Exception as e:
        print(f"Erro Geral: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_enum_movement_type()
