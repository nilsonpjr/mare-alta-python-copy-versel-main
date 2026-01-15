import sys
import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

# Configura path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

load_dotenv()

def check_column(cursor, table, column, expected_type_check_func, description):
    cursor.execute("""
        SELECT data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = %s AND column_name = %s
    """, (table, column))
    result = cursor.fetchone()
    
    status = "❌"
    details = "Coluna não encontrada"
    
    if result:
        data_type, char_len = result
        if expected_type_check_func(data_type, char_len):
            status = "✅"
            details = f"{data_type}" + (f"({char_len})" if char_len else "")
        else:
            status = "⚠️"
            details = f"Tipo incorreto/arriscado: {data_type}" + (f"({char_len})" if char_len else "")
            
    print(f"{status} [{table}.{column}] - {description}: {details}")
    return status == "✅"

try:
    print("🚀 INICIANDO DIAGNÓSTICO DE INTEGRIDADE DO BANCO DE DADOS")
    print("=========================================================")
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ ERRO: DATABASE_URL não definida")
        sys.exit(1)
        
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Verificar campos grandes/criptografados em company_info
    print("\n--- Verificando Tabela company_info (Configurações) ---")
    
    # Text types check
    is_text = lambda dt, l: dt == 'text' or (dt == 'character varying' and (l is None or l > 500))
    is_large_varchar = lambda dt, l: dt == 'text' or (dt == 'character varying' and (l is None or l >= 500))
    
    check_column(cur, 'company_info', 'mercury_username', is_large_varchar, "Username Criptografado (>500)")
    check_column(cur, 'company_info', 'mercury_password', is_large_varchar, "Password Criptografado (>500)")
    check_column(cur, 'company_info', 'cert_password', is_large_varchar, "Senha Certificado Criptografada (>500)")
    check_column(cur, 'company_info', 'cert_file_path', is_text, "Certificado Base64 (TEXT)")
    
    # 2. Verificar Nota Fiscal (Campos grandes)
    print("\n--- Verificando Tabela fiscal_invoices (Notas Fiscais) ---")
    check_column(cur, 'fiscal_invoices', 'xml_content', is_text, "Conteúdo XML (TEXT)")
    check_column(cur, 'fiscal_invoices', 'cancellation_reason', is_text, "Motivo Cancelamento (TEXT)")
    
    # 3. Verificar Entregas Técnicas
    print("\n--- Verificando Tabela technical_deliveries ---")
    is_json = lambda dt, l: dt in ('json', 'jsonb', 'text')
    check_column(cur, 'technical_deliveries', 'data', is_json, "Dados Checklist (JSON/TEXT)")
    check_column(cur, 'technical_deliveries', 'technician_signature_url', is_text, "Assinaturas Base64/URL (TEXT)")
    
    # 4. Verificar Usuários
    print("\n--- Verificando Tabela users ---")
    check_column(cur, 'users', 'hashed_password', lambda dt, l: l is None or l >= 100, "Hash Senha (>=100)")
    
    conn.close()
    print("\n=========================================================")
    print("Diagnóstico Concluído. Se houver ⚠️ ou ❌, correções são necessárias.")

except Exception as e:
    print(f"\n❌ ERRO FATAL: {e}")
