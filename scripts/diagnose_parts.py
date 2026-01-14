import sys
import os
from sqlalchemy import text, inspect

# Add current directory to path
sys.path.append(os.path.join(os.getcwd()))

from backend.database import SessionLocal, engine
from backend import models

def diagnose_parts_table():
    db = SessionLocal()
    print("--- DIAGNÓSTICO DE BANCO DE DADOS: TB PARTS ---")
    
    try:
        # Check database generic info
        try:
             res = db.execute(text("SELECT current_database(), version()")).fetchone()
             print(f"Database: {res[0]}")
             print(f"Version: {res[1]}")
        except Exception as e:
             print(f"Could not get DB version (sqlite?): {e}")

        # 1. Inspecionar colunas fisicamente
        inspector = inspect(engine)
        columns = inspector.get_columns('parts')
        
        print(f"\nColunas na tabela 'parts' ({len(columns)}):")
        found_group = False
        found_subgroup = False
        found_compatibility = False
        
        for col in columns:
            cname = col['name']
            ctype = col['type']
            print(f" - {cname}: {ctype}")
            if cname == 'group': found_group = True
            if cname == 'subgroup': found_subgroup = True
            if cname == 'compatibility': found_compatibility = True
            
        print("\nVerificação de campos críticos:")
        print(f" - group: {'OK' if found_group else 'FALTANDO'}")
        print(f" - subgroup: {'OK' if found_subgroup else 'FALTANDO'}")
        print(f" - compatibility: {'OK' if found_compatibility else 'FALTANDO'}")

        # 2. Testar ORM Query (simula o endpoint)
        print("\nTestando ORM Query (Select All)...")
        try:
            parts = db.query(models.Part).limit(1).all()
            print(f"Query sucesso: {len(parts)} peças encontradas.")
            if parts:
                p = parts[0]
                print(f"Exemplo de peça: ID={p.id}, Nome={p.name}")
                print(f"Novos campos: Group='{p.group}', Sub='{p.subgroup}'")
            else:
                print("Tabela vazia (mas query funcionou).")
                
        except Exception as e:
            print(f"\n❌ ERRO NA QUERY ORM: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"Erro Geral no Diagnóstico: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_parts_table()
