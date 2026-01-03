
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Carrega .env atualizado
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"--- TESTE FINAL CONEXÃO ---")
print(f"URL: {DATABASE_URL}")

try:
    # sslmode=require as vezes precisa ser passado em connect_args dependendo da lib, 
    # mas na connection string do psycopg2 geralmente funciona direto.
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"\n✅ CONEXÃO ESTABELECIDA COM SUCESSO!")
        print(f"Versão: {version}")
except Exception as e:
    print(f"\n❌ ERRO:\n{e}")
