from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os
import traceback

# Configura paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

try:
    from backend.main import app
except Exception as e:
    # Se falhar o import (banco, dependencias, etc), cria um app de fallback que mostra o erro
    print("Tentando iniciar a aplicacao... (Versao com Try-Import SignXML)")
    error_msg = f"Startup Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
    print(error_msg) # Log no console do Vercel
    
    app = FastAPI()
    
    @app.get("/api/{full_path:path}")
    def api_error_handler(full_path: str):
         return JSONResponse(status_code=500, content={"error": "Failed to start application", "detail": error_msg})

    @app.get("/{full_path:path}")
    def error_handler(full_path: str):
         return JSONResponse(status_code=500, content={"error": "Failed to start application", "detail": error_msg})
