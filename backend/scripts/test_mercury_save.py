import sys
import os
from pathlib import Path

# Adiciona o diretório raiz ao path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

try:
    from backend import crud, schemas, models, database
    from backend.database import SessionLocal
    from dotenv import load_dotenv
    
    load_dotenv()
    
    # Criar sessão
    db = SessionLocal()
    
    # Simular dados vindos do frontend
    fake_info = schemas.CompanyInfoCreate(
        mercury_username="teste_user",
        mercury_password="teste_password"
    )
    
    # Tentar atualizar (assumindo tenant_id=1 que criamos)
    print("Tentando atualizar CompanyInfo via CRUD...")
    try:
        updated = crud.update_company_info(db, fake_info, tenant_id=1)
        print("✅ Sucesso!")
        print(f"Username salvo (criptografado?): {updated.mercury_username}")
        print(f"Password salvo (criptografado?): {updated.mercury_password}")
    except Exception as e:
        print(f"❌ Erro ao atualizar: {e}")
        import traceback
        traceback.print_exc()

    db.close()

except Exception as e:
    print(f"❌ Erro fatal no script: {e}")
