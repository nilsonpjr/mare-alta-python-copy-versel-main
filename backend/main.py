"""
Este é o ponto de entrada principal para a aplicação FastAPI do backend.
Ele configura a aplicação, inclui os roteadores (endpoints da API), configura o CORS
e serve os arquivos estáticos do frontend, se disponíveis.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text # Import para usar SQL cru
import os
import traceback

# Importa os modelos de banco de dados para garantir que as tabelas sejam criadas.
import models
# Importa a configuração do banco de dados e a função para obter a sessão do DB.
from database import engine, get_db

# Importa os roteadores (grupos de endpoints) para diferentes funcionalidades da API.
# Cada roteador gerencia um conjunto específico de rotas e suas operações.
from routers.auth_router import router as auth_router
from routers.orders_router import router as orders_router
from routers.inventory_router import router as inventory_router
from routers.clients_router import router as clients_router
from routers.boats_router import router as boats_router
from routers.fiscal_router import router as fiscal_router
from routers.mercury_router import router as mercury_router
from routers.transactions_router import router as transactions_router
from routers.config_router import router as config_router
from routers.partners_router import router as partners_router
from routers.upload_router import router as upload_router
from routers.admin_router import router as admin_router

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse # Importa JSONResponse para o erro 404

# Cria todas as tabelas definidas nos modelos (models.py) no banco de dados.
# Isso é feito apenas uma vez na inicialização da aplicação.
models.Base.metadata.create_all(bind=engine)

# Inicializa a aplicação FastAPI com um título.
app = FastAPI(title="Viverdi Nautica API")

# Configura o Middleware CORS (Cross-Origin Resource Sharing).
# Isso permite que o frontend (executando em um domínio/porta diferente)
# faça requisições para esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite requisições de qualquer origem. Em produção, isso deve ser mais restritivo.
    allow_credentials=True, # Permite cookies e cabeçalhos de autorização.
    allow_methods=["*"],  # Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"],  # Permite todos os cabeçalhos nas requisições.
)

# Exception Handler Global para Debug em Produção
@app.exception_handler(Exception)
async def debug_exception_handler(request, exc):
    error_msg = f"UNHANDLED EXCEPTION: {str(exc)}\n\nTraceback:\n{traceback.format_exc()}"
    print(error_msg) # Log no server logs (Vercel)
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "error_type": type(exc).__name__},
    )

# Middleware de Logging para Debug
@app.middleware("http")
async def log_requests(request, call_next):

    print(f"REQUEST LOG: {request.method} {request.url.path}")
    response = await call_next(request)
    # Log assets responses to see if they are 200 or 404
    if request.url.path.startswith("/assets"):
        print(f"ASSET RESPONSE: {request.url.path} -> {response.status_code}")
    return response

# Lógica para correcao de DB (Certificado Base64)
def run_patch_db_logic():
    try:
        with engine.connect() as conn:
            with conn.begin():
                # Postgres
                try:
                    conn.execute(text("ALTER TABLE company_info ALTER COLUMN cert_file_path TYPE TEXT;"))
                    return {"status": "success", "message": "Coluna alterada para TEXT (Postgres)"}
                except Exception as e:
                    # SQLite não precisa, MySQL sintaxe diferente
                    try:
                        conn.execute(text("ALTER TABLE company_info MODIFY COLUMN cert_file_path TEXT;"))
                        return {"status": "success", "message": "Coluna alterada para TEXT (MySQL)"}
                    except:
                        pass
                    return {"status": "warning", "message": f"Erro ou já aplicado: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Registra endpoint de patch em ambos os caminhos (com e sem /api)
app.add_api_route("/api/config/patch-db-cert", run_patch_db_logic, methods=["GET"])
app.add_api_route("/config/patch-db-cert", run_patch_db_logic, methods=["GET"])

# Lógica para inicializacao de DB
def run_init_db():
    try:
        models.Base.metadata.create_all(bind=engine)
        return {"message": "Tabelas criadas com sucesso!"}
    except Exception as e:
        return {"error": str(e)}

app.add_api_route("/api/config/init-db", run_init_db, methods=["GET"])
app.add_api_route("/config/init-db", run_init_db, methods=["GET"])

# Lógica para Debug DB
def run_debug_db(db: Session = Depends(get_db)):
    try:
        # Consulta o nome do banco e o host conectado
        result = db.execute(text("SELECT current_database(), inet_server_addr();")).fetchone()
        return {
            "connected_database": result[0],
            "server_ip": str(result[1]),
            "env_database_url_prefix": os.getenv("DATABASE_URL", "")[:15] + "..." # Mostra só o começo para não vazar senha
        }
    except Exception as e:
        return {"error": str(e)}

app.add_api_route("/api/debug/db-info", run_debug_db, methods=["GET"])
app.add_api_route("/debug/db-info", run_debug_db, methods=["GET"])

# --- ROUTERS CONFIGURATION ---
# Configuração robusta para suportar Vercel (que pode remover prefixo) e Render/Local (que mantêm)
all_routers = [
    auth_router, orders_router, inventory_router, clients_router, 
    boats_router, fiscal_router, mercury_router, transactions_router, 
    config_router, partners_router, upload_router, admin_router
]

for router in all_routers:
    # Normaliza: Remove /api do prefixo original se existir
    # Isso permite que o router seja base-agnostic (ex: /config em vez de /api/config)
    if router.prefix.startswith("/api"):
        router.prefix = router.prefix.replace("/api", "", 1)
    
    # 1. Inclui COM prefixo /api (Para Render e desenvolvimento local)
    # Resultado exec: /api/config
    app.include_router(router, prefix="/api")

    # 2. Inclui SEM prefixo extra (Fallback para Vercel se ele fizer strip do /api)
    # Resultado exec: /config
    # Se Vercel receber /api/config e fizer rewrite para index.py passando PATH /config,
    # esta rota irá capturar.
    app.include_router(router)


# --- ARQUIVOS ESTÁTICOS E SPA ---

# Define o caminho para a pasta 'dist' do frontend.
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

# Debug Paths (Logs aparecerão no Render)
print(f"DEBUG: Initial frontend_dist: {frontend_dist}")
print(f"DEBUG: Current __file__: {os.path.abspath(__file__)}")
print(f"DEBUG: CWD: {os.getcwd()}")
if os.path.exists("/app"):
    print(f"DEBUG: Listing /app: {os.listdir('/app')}")
if os.path.exists("/frontend"):
    print(f"DEBUG: Listing /frontend: {os.listdir('/frontend')}")

# Fallback para caminho absoluto no Docker (se o cálculo relativo falhar)
if not os.path.exists(frontend_dist) and os.path.exists("/frontend/dist"):
    print("DEBUG: Using absolute Docker path /frontend/dist")
    frontend_dist = "/frontend/dist"

# Verifica se a pasta 'dist' do frontend existe.
if os.path.exists(frontend_dist):
    print(f"DEBUG: frontend_dist found at {frontend_dist}")
    print(f"DEBUG: Listing frontend_dist: {os.listdir(frontend_dist)}")
    
    # Rota explícita para assets (JS/CSS) para garantir que sejam servidos corretamente
    # Isso evita problemas com o StaticFiles ou precedência de rotas
    @app.get("/assets/{filename}")
    async def serve_assets(filename: str):
        assets_path = os.path.join(frontend_dist, "assets")
        file_path = os.path.join(assets_path, filename)
        
        print(f"DEBUG: Request for asset: {filename}")
        if os.path.exists(file_path):
            print(f"DEBUG: Serving asset from {file_path}")
            return FileResponse(file_path)
        
        print(f"DEBUG: Asset not found: {file_path}")
        if os.path.exists(assets_path):
             print(f"DEBUG: Available assets: {os.listdir(assets_path)}")
        else:
             print(f"DEBUG: Assets folder not found at {assets_path}")

        return JSONResponse(status_code=404, content={"message": "Arquivo não encontrado"})

    # Mantemos o mount como fallback ou para outros arquivos estáticos se houver
    # app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Rota curinga para servir o aplicativo SPA (Single Page Application) do frontend.
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Permite que as chamadas de API do backend (e docs) passem sem serem interceptadas pelo SPA.
        # Se a rota começar com "api", "docs" ou for "openapi.json", retorna 404 json (já que não é um arquivo estático).
        # Assets já são tratados pela rota acima, mas mantemos a verificação por segurança
        if full_path.startswith("api") or full_path.startswith("docs") or full_path == "openapi.json" or full_path.startswith("assets"):
             # Se chegou aqui e não bateu em nenhum router acima, é 404 de API real
            return JSONResponse(status_code=404, content={"message": "Endpoint API não encontrado"})
            
        # Para qualquer outra rota, tenta servir o 'index.html' do frontend.
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            response = FileResponse(index_path)
            # Desabilita cache para o index.html para garantir que o cliente sempre receba a versão mais recente
            # o que evita problemas com hashes antigos de assets.
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response
        # Se 'index.html' não for encontrado, significa que o frontend não foi construído.
        return {"message": "Frontend não foi construído (dist/index.html não encontrado)."}
else:
    # Se a pasta 'dist' do frontend não existir, exibe uma mensagem no endpoint raiz.
    @app.get("/")
    def read_root():
        return {"message": "Diretório 'dist' do frontend não encontrado. Execute 'npm run build' no diretório 'frontend'."}

# Este bloco só é executado quando o script é rodado diretamente (ex: python main.py).
# Inicia o servidor Uvicorn para servir a aplicação FastAPI.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) # reload=True para recarregar automaticamente em mudanças.
