
import sys
import os
from sqlalchemy import create_engine, text

# URL do Supabase
DATABASE_URL = "postgresql://postgres.vrikuvzrnpzxianctycs:!Nildani12@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require"

def force_reset():
    engine = create_engine(DATABASE_URL)
    
    # SQL para dropar tabelas na força bruta (CASCADE)
    tables_to_drop = [
        "stock_movements",
        "service_items",
        "order_notes",
        "transactions",
        "service_orders",
        "engines",
        "boats",
        "models",
        "manufacturers",
        "company_info",
        "users", 
        "clients",
        "tenants",
        "invoices", # Adicionando outras tabelas que possam existir
        "parts",
        "alembic_version" # Se houver migrações
    ]

    print(">>> INICIANDO LIMPEZA FORÇADA (SQL CASCADE) <<<")
    
    with engine.connect() as conn:
        # Habilitar autocommit para operações DDL
        conn.execution_options(isolation_level="AUTOCOMMIT")
        
        for table in tables_to_drop:
            try:
                print(f"Apagando tabela: {table}...")
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            except Exception as e:
                print(f"Erro ao apagar {table}: {e}")
        
    print(">>> TABELAS REMOVIDAS. RECRIANDO AGORA... <<<")
    
    # Reimportar models para criar
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    import backend.database as database
    import backend.models as models
    
    database.Base.metadata.create_all(bind=engine)
    print(">>> BANCO RECRIADO E ZERADO COM SUCESSO! <<<")

if __name__ == "__main__":
    try:
        force_reset()
    except Exception as e:
        print(f"ERRO FATAL: {e}")
