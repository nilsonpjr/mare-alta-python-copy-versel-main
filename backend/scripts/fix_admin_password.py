import sys
import os
from pathlib import Path

# Adiciona o diretório raiz ao path para importar módulos do backend
# Se este script está em backend/scripts/script.py
# parent = backend/scripts
# parent.parent = backend
# parent.parent.parent = raiz (onde está a pasta backend)
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

try:
    from backend.auth import get_password_hash
    from backend.database import SessionLocal
    from backend import models
    from dotenv import load_dotenv
    import psycopg2
    
    # Carrega variáveis de ambiente
    load_dotenv()
    
    print("Iniciando correção de senha do admin...")
    
    # Gera o hash correto usando a mesma função que o app usa
    new_password = "admin123"
    correct_hash = get_password_hash(new_password)
    print(f"Novo hash gerado: {correct_hash[:10]}...")
    
    # Conecta ao banco diretamente para evitar problemas de ORM/Sessão se houver
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Atualiza a senha
    print("Atualizando banco de dados...")
    
    # Primeiro verifica se o usuário existe e qual o ID
    cursor.execute("SELECT id, email FROM users WHERE email = 'admin@viverdinautica.com'")
    result = cursor.fetchone()
    
    if result:
        user_id, email = result
        print(f"Usuário encontrado: {email} (ID: {user_id})")
        
        # Descobre o nome da coluna de senha de novo, só por precaução
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('hashed_password', 'password_hash', 'password')
        """)
        col_result = cursor.fetchone()
        
        if col_result:
            pwd_column = col_result[0]
            print(f"Coluna de senha detectada: {pwd_column}")
            
            cursor.execute(f"""
                UPDATE users 
                SET {pwd_column} = %s
                WHERE id = %s
            """, (correct_hash, user_id))
            
            conn.commit()
            print("✅ Senha atualizada com sucesso!")
            print(f"   Email: {email}")
            print(f"   Nova Senha: {new_password}")
        else:
            print("❌ Erro: Coluna de senha não encontrada na tabela users")
            
    else:
        print("❌ Erro: Usuário administrador não encontrado")
        
    conn.close()

except Exception as e:
    print(f"❌ Erro fatal: {e}")
    # Print traceback
    import traceback
    traceback.print_exc()
