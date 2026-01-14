
from models import Base
from database import engine

from sqlalchemy import text

print("Iniciando migração de esquema de banco de dados (alter table)...")
try:
    with engine.connect() as conn:
        with conn.begin(): # Transaction
            # Tenta alterar a coluna cert_file_path para TEXT para suportar Base64
            # Postgres syntax. Se for SQLite, falhará (mas sqlite não checa length anyway em VARCHAR)
            try:
                conn.execute(text("ALTER TABLE company_info ALTER COLUMN cert_file_path TYPE TEXT;"))
                print("Sucesso: Coluna cert_file_path alterada para TEXT (Postgres).")
            except Exception as e:
                print(f"Aviso (esperado se não for Postgres): {e}")
                if 'sqlite' in str(engine.url):
                    print("SQLite detectado: Nenhuma ação necessária (SQLite não impõe limite de VARCHAR).")
                else:
                    # Tenta sintaxe MySQL só por garantia
                    try:
                        conn.execute(text("ALTER TABLE company_info MODIFY COLUMN cert_file_path TEXT;"))
                        print("Sucesso: Coluna cert_file_path alterada para TEXT (MySQL).")
                    except:
                        pass

except Exception as e:
    print(f"Erro geral: {e}")

print("Migração concluída.")
