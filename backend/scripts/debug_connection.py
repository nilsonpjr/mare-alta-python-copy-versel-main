
import socket
import os
from sqlalchemy import create_engine, text

# Configurações do Novo Projeto
PROJECT_ID = "vrikuvzrnpzxianctycs"
DB_HOST = f"db.{PROJECT_ID}.supabase.co"
DB_USER = "postgres"
DB_PASS = "!Nildani12"
DB_PORT = "5432"

print(f"--- DIAGNÓSTICO DE REDE ---")
print(f"Tentando resolver DNS para: {DB_HOST}")

try:
    ip_list = socket.gethostbyname_ex(DB_HOST)
    print(f"✅ DNS Resolvido: {ip_list}")
except Exception as e:
    print(f"❌ Falha no DNS: {e}")
    # Fallback: Tentar conectar sem resolver (pode ser problema local de resolução)
    
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/postgres"

print(f"\n--- TESTE DE CONEXÃO ---")
print(f"Target: {DATABASE_URL.split('@')[1]}")

try:
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 10})
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"\n✅ CONEXÃO BEM SUCEDIDA!")
        print(f"Versão do Banco: {version}")
except Exception as e:
    print(f"\n❌ ERRO DE CONEXÃO:\n{e}")
