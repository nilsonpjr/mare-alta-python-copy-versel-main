"""
Este arquivo configura a conexão com o banco de dados e gerencia as sessões do SQLAlchemy.
Ele é responsável por:
1. Carregar variáveis de ambiente.
2. Definir a URL do banco de dados.
3. Criar o "engine" do SQLAlchemy.
4. Criar uma classe de sessão para interagir com o DB.
5. Fornecer uma dependência para injeção de sessão do DB no FastAPI.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv # Biblioteca para carregar variáveis de ambiente de um arquivo .env

# Carrega as variáveis de ambiente do arquivo .env.
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

# Define a URL do banco de dados.
# Tenta obter a URL da variável de ambiente "DATABASE_URL".
# Se não estiver definida, usa SQLite com um arquivo local "mare_alta.db" por padrão.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Em produção, DATABASE_URL deve ser obrigatória (Supabase)
    raise ValueError("A variável de ambiente DATABASE_URL não está definida. Configure a conexão com o Supabase.")
else:
    # Correção para SQLAlchemy (postgres:// -> postgresql://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Se for Postgres, normalmente não usamos check_same_thread
    # Mas para Supabase/Neon, SSL mode pode ser exigido.
    # SQLAlchemy geralmente lida bem, mas podemos forçar sslmode=require se necessário na string.
    connect_args = {}

# Cria o "engine" do SQLAlchemy.
engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args
)

# Cria uma classe SessionLocal.
# Instâncias dessa classe serão nossas sessões de banco de dados.
# autocommit=False: não confirma transações automaticamente.
# autoflush=False: não descarrega operações para o DB automaticamente após cada query.
# bind=engine: associa a sessão ao engine criado.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos declarativos do SQLAlchemy.
# Todos os modelos de tabelas devem herdar desta classe.
Base = declarative_base()

# Função de dependência para obter a sessão do banco de dados.
# Esta função pode ser injetada em endpoints do FastAPI.
# Ela garante que uma nova sessão seja criada para cada requisição e que seja fechada
# corretamente após o processamento, mesmo em caso de erro.
def get_db():
    db = SessionLocal() # Cria uma nova sessão de banco de dados.
    try:
        yield db # Retorna a sessão para o bloco que a chamou (endpoint do FastAPI).
    finally:
        db.close() # Garante que a sessão seja fechada, liberando os recursos.

# --- TENANT MIDDLEWARE (SQLAlchemy Listener) ---
from sqlalchemy import event
from sqlalchemy.orm import Session
import context

@event.listens_for(SessionLocal, "do_orm_execute")
def receive_do_orm_execute(orm_execute_state):
    """
    Automaticamente adiciona filtro de tenant_id em buscas select
    se o modelo tiver a coluna tenant_id e um tenant estiver no contexto.
    
    Isso implementa Row Level Security (RLS) na camada de aplicação.
    """
    
    # Verifica se há tenant no contexto
    tenant_id = context.get_tenant_id()
    
    # Apenas intervimos se:
    # 1. Temos um tenant_id (usuário logado)
    # 2. É uma operação SELECT (is_select)
    # 3. Não é um carregamento interno de coluna ou relacionamento (para evitar recursão/erros complexos)
    if (
        tenant_id is not None
        and orm_execute_state.is_select
        and not orm_execute_state.is_column_load
        and not orm_execute_state.is_relationship_load
    ):
        mapper = orm_execute_state.bind_mapper
        # Verifica se a tabela mapeada possui a coluna tenant_id
        if mapper and hasattr(mapper.class_, "tenant_id"):
             # Adiciona automaticamente o filtro WHERE tenant_id = X
             orm_execute_state.statement = orm_execute_state.statement.filter(
                 mapper.class_.tenant_id == tenant_id
             )
