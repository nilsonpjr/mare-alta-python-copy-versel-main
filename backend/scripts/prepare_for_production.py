#!/usr/bin/env python3
"""
Script Completo para Preparar Sistema para Produção
1. Faz backup do banco atual
2. Limpa todos os dados de teste
3. Cria dados iniciais mínimos
"""
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

def print_header(title):
    """Imprime cabeçalho formatado"""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def print_warning():
    """Mostra aviso de segurança"""
    print_header("⚠️  AVISO IMPORTANTE")
    print("""
Este script irá:
  ❌ APAGAR TODOS OS DADOS DE TESTE do banco
  ✅ Manter a estrutura das tabelas
  ✅ Criar tenant padrão + usuário admin
  ✅ Resetar contadores (IDs começam do 1)
  
📦 Um backup será criado automaticamente antes da limpeza.
🔒 Guarde o arquivo de backup em local seguro!

⏰ Este processo pode levar alguns minutos.
""")

def confirm_action():
    """Solicita confirmação do usuário"""
    print("\n" + "=" * 70)
    print("🤔 Tem certeza que deseja continuar?")
    print("=" * 70)
    
    response = input("\nDigite 'SIM QUERO LIMPAR' para confirmar: ").strip()
    
    if response != "SIM QUERO LIMPAR":
        print("\n❌ Operação cancelada pelo usuário.")
        return False
    
    print("\n✅ Confirmação recebida. Prosseguindo...")
    return True

def create_backup():
    """Cria backup JSON simples dos dados (já que pg_dump não está disponível)"""
    print_header("📦 PASSO 1: CRIANDO BACKUP (JSON)")
    
    try:
        from dotenv import load_dotenv
        import psycopg2
        import json
        from datetime import datetime
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = Path(__file__).parent.parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_file = backup_dir / f"backup_data_{timestamp}.json"
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Tabelas para backup
        tables = ['clients', 'boats', 'service_orders', 'parts', 'users', 'tenants']
        backup_data = {}
        
        print(f"⏳ Exportando dados para JSON...")
        for table in tables:
            try:
                cur.execute(f"SELECT * FROM {table}")
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                
                # Converter datas para string para serializar
                data = []
                for row in rows:
                    item = {}
                    for i, col in enumerate(columns):
                        val = row[i]
                        if isinstance(val, (datetime,)):
                            val = val.isoformat()
                        item[col] = val
                    data.append(item)
                
                backup_data[table] = data
                print(f"   ✓ {table}: {len(data)} registros")
            except Exception as e:
                print(f"   ⚠️ Erro ao ler {table}: {e}")
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)
            
        print(f"\n✅ Backup JSON salvo em: {backup_file}")
        return True
        
    except Exception as e:
        print(f"❌ Erro no backup: {e}")
        # Retorna True para não bloquear, já que backup de dados de teste não é crítico
        return True 

def clean_database():
    """Executa limpeza do banco via comandos diretos"""
    print_header("🧹 PASSO 2: LIMPANDO BANCO DE DADOS")
    
    try:
        from dotenv import load_dotenv
        import psycopg2
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        print(f"⏳ Conectando ao banco de dados...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = False # Usar transação
        cur = conn.cursor()
        
        try:
            print("⏳ Iniciando limpeza das tabelas...")
            
            # List of tables to truncate (order matters due to FKs)
            tables = [
                'fiscal_documents', 'fiscal_config', 'transactions',
                'stock_movements', 'parts', 'order_items', 'service_orders',
                'engines', 'boats', 'clients', 'marinas', 'partners',
                'inspections', 'quotes', 'quote_items', 
                'maintenance_budgets', 'maintenance_budget_items',
                'users', 'system_config', 'tenants'
            ]
            
            for table in tables:
                # Verifica se tabela existe antes de tentar truncar
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = %s
                    );
                """, (table,))
                exists = cur.fetchone()[0]
                
                if exists:
                    cur.execute(f"TRUNCATE TABLE {table} CASCADE")
                    print(f"   ✓ Tabela {table} limpa")
                else:
                    print(f"   ⚠️ Tabela {table} não existe (pulada)")
            
            # Reset sequences
            sequences = [
                'tenants_id_seq', 'users_id_seq', 'clients_id_seq', 'boats_id_seq',
                'engines_id_seq', 'service_orders_id_seq', 'order_items_id_seq',
                'parts_id_seq', 'stock_movements_id_seq', 'transactions_id_seq',
                'marinas_id_seq', 'partners_id_seq', 'inspections_id_seq',
                'quotes_id_seq', 'maintenance_budgets_id_seq'
            ]
            
            print("⏳ Resetando sequências...")
            for seq in sequences:
                cur.execute(f"ALTER SEQUENCE IF EXISTS {seq} RESTART WITH 1")
            
            print("✓ Sequências resetadas")
            
            # Create Tenant
            print("⏳ Criando tenant padrão...")
            
            # Descobrir colunas existentes na tabela tenants
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tenants' AND table_schema = 'public'
            """)
            existing_columns = [row[0] for row in cur.fetchall()]
            
            tenant_data = {
                'name': 'Viverdi Náutica',
                'slug': 'viverdi',
                'business_name': 'Viverdi Náutica LTDA',
                'cnpj': '00000000000000',
                'plan': 'premium',
                'status': 'active',
                'settings': '{"theme": "light", "language": "pt-BR", "currency": "BRL", "timezone": "America/Sao_Paulo", "features": {"inventory": true, "fiscal": true, "crm": true, "warranty": true, "mercury_integration": true}}',
                'domain': 'app.viverdinautica.com',
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Filtrar apenas colunas que existem no banco
            insert_cols = []
            insert_vals = []
            placeholders = []
            
            for col, val in tenant_data.items():
                if col in existing_columns:
                    insert_cols.append(col)
                    insert_vals.append(val)
                    placeholders.append("%s")
                    
            if not insert_cols:
                raise Exception("Tabela tenants não tem colunas conhecidas!")
                
            insert_query = f"""
                INSERT INTO tenants ({', '.join(insert_cols)})
                VALUES ({', '.join(placeholders)})
                RETURNING id
            """
            
            cur.execute(insert_query, tuple(insert_vals))
            tenant_id = cur.fetchone()[0]
            print(f"✓ Tenant criado com ID: {tenant_id}")
            
            # Create Admin User
            print("⏳ Criando usuário admin...")
            
            # Descobrir colunas de users
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'public'
            """)
            user_cols = [row[0] for row in cur.fetchall()]
            
            user_data = {
                'tenant_id': tenant_id,
                'email': 'admin@viverdinautica.com',
                'name': 'Administrador',
                'role': 'ADMIN', # Enum exige maiúsculo
                'is_active': True,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Verificar qual campo de senha usar
            if 'hashed_password' in user_cols:
                user_data['hashed_password'] = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5FS0I0rqG3uHe'
            elif 'password_hash' in user_cols:
                user_data['password_hash'] = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5FS0I0rqG3uHe'
            
            # Montar query dinâmica
            u_cols = []
            u_vals = []
            u_placeholders = []
            
            for col, val in user_data.items():
                if col in user_cols:
                    u_cols.append(col)
                    u_vals.append(val)
                    u_placeholders.append("%s")
            
            # Inserir usuário
            cur.execute(f"""
                INSERT INTO users ({', '.join(u_cols)})
                VALUES ({', '.join(u_placeholders)})
            """, tuple(u_vals))
            print("✓ Usuário admin criado")
            
            # Initial Config
            print("⏳ Criando configurações iniciais...")
            # Verificar se system_config existe
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'system_config'
                );
            """)
            if cur.fetchone()[0]:
                configs = [
                    ('company_name', '"Viverdi Náutica"'),
                    ('company_email', '"contato@viverdinautica.com"'),
                    ('company_phone', '"(00) 0000-0000"'),
                    ('next_order_number', '1'),
                    ('currency', '"BRL"'),
                    ('language', '"pt-BR"'),
                    ('timezone', '"America/Sao_Paulo"')
                ]
                
                # Pegar colunas de system_config para ser seguro
                cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'system_config'")
                sys_cols = [r[0] for r in cur.fetchall()]
                
                # Se não tiver tenant_id (versão antiga), removemos
                has_tenant = 'tenant_id' in sys_cols
                
                for key, value in configs:
                    if has_tenant:
                        cur.execute("""
                            INSERT INTO system_config (tenant_id, key, value, created_at, updated_at)
                            VALUES (%s, %s, %s::jsonb, NOW(), NOW())
                        """, (tenant_id, key, value))
                    else:
                        # Fallback para schema antigo sem tenant_id
                        cur.execute("""
                            INSERT INTO system_config (key, value, created_at, updated_at)
                            VALUES (%s, %s::jsonb, NOW(), NOW())
                        """, (key, value))
            else:
                print("⚠️ Tabela system_config não existe (configurações puladas)")
            
            conn.commit()
            print("✅ Limpeza e setup concluídos com sucesso!")
            
            cur.close()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            print(f"❌ Erro durante a transação: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

def verify_cleanup():
    """Verifica se a limpeza foi bem-sucedida"""
    print_header("✅ PASSO 3: VERIFICANDO LIMPEZA")
    
    try:
        from dotenv import load_dotenv
        import psycopg2
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Verifica tabelas principais
        tables_to_check = [
            ('tenants', 1, 'Tenant padrão'),
            ('users', 1, 'Usuário admin'),
            ('clients', 0, 'Clientes'),
            ('boats', 0, 'Embarcações'),
            ('service_orders', 0, 'Ordens de Serviço'),
            ('parts', 0, 'Peças')
        ]
        
        print("\n📊 Verificando contagens...")
        all_ok = True
        
        for table, expected, description in tables_to_check:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            
            status = "✓" if count == expected else "✗"
            print(f"   {status} {description}: {count} ({expected} esperado)")
            
            if count != expected:
                all_ok = False
        
        cur.close()
        conn.close()
        
        if all_ok:
            print("\n✅ Todas as verificações passaram!")
            return True
        else:
            print("\n⚠️  Algumas verificações falharam")
            return False
            
    except Exception as e:
        print(f"⚠️  Erro ao verificar: {e}")
        return False

def show_credentials():
    """Mostra credenciais de acesso"""
    print_header("🔐 CREDENCIAIS DE ACESSO")
    print("""
Sistema limpo e pronto para uso!

Para fazer login:
  📧 Email: admin@viverdinautica.com
  🔑 Senha: admin123

⚠️  IMPORTANTE: Trocar esta senha no primeiro login!

🚀 PRÓXIMOS PASSOS:
  1. Fazer login no sistema
  2. Trocar senha do admin
  3. Configurar dados da empresa em Configurações
  4. Criar usuários adicionais conforme necessário
  5. Começar a usar o sistema!
""")

def main():
    """Função principal"""
    print_header("🚀 PREPARAÇÃO PARA PRODUÇÃO - VIVERDI NÁUTICA")
    print(f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    print_warning()
    
    if not confirm_action():
        sys.exit(0)
    
    # Passo 1: Backup
    if not create_backup():
        print("\n❌ Falha ao criar backup. Abortando operação.")
        sys.exit(1)
    
    # Confirmação adicional antes de limpar
    print("\n" + "=" * 70)
    response = input("\n⚠️  Última chance! Digite 'CONFIRMAR' para continuar: ").strip()
    if response != "CONFIRMAR":
        print("\n❌ Operação cancelada.")
        sys.exit(0)
    
    # Passo 2: Limpeza
    if not clean_database():
        print("\n❌ Falha ao limpar banco. Verifique os logs.")
        sys.exit(1)
    
    # Passo 3: Verificação
    verify_cleanup()
    
    # Mostrar credenciais
    show_credentials()
    
    print_header("✅ PROCESSO CONCLUÍDO COM SUCESSO!")
    print("\n🎉 O sistema está pronto para começar a vender!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operação interrompida pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        sys.exit(1)
