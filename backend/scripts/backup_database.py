#!/usr/bin/env python3
"""
Backup completo do banco de dados antes de limpar
Gera arquivo SQL com todos os dados atuais
"""
import os
import subprocess
from datetime import datetime
from pathlib import Path

def create_backup():
    """Cria backup completo do banco de dados"""
    
    # Configurações
    backup_dir = Path("backups")
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"backup_pre_producao_{timestamp}.sql"
    
    print("=" * 60)
    print("🔒 BACKUP DO BANCO DE DADOS - PRÉ PRODUÇÃO")
    print("=" * 60)
    print(f"\n📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"📁 Arquivo: {backup_file}")
    print("\n⏳ Gerando backup...")
    
    # Obtém credenciais do .env
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("\n❌ DATABASE_URL não encontrada no .env")
            return False
        
        # Parse da URL do banco
        # Formato: postgresql://user:pass@host:port/dbname
        import re
        match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_url)
        if not match:
            print("\n❌ Formato de DATABASE_URL inválido")
            return False
        
        user, password, host, port, dbname = match.groups()
        
        # Cria backup usando pg_dump
        env = os.environ.copy()
        env['PGPASSWORD'] = password
        
        cmd = [
            'pg_dump',
            '-h', host,
            '-p', port,
            '-U', user,
            '-d', dbname,
            '-F', 'p',  # Plain text
            '-f', str(backup_file)
        ]
        
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            size = os.path.getsize(backup_file) / 1024  # KB
            print(f"\n✅ Backup criado com sucesso!")
            print(f"   📦 Tamanho: {size:.2f} KB")
            print(f"   📍 Local: {backup_file.absolute()}")
            
            # Cria também um backup compactado
            import gzip
            import shutil
            
            gz_file = backup_file.with_suffix('.sql.gz')
            with open(backup_file, 'rb') as f_in:
                with gzip.open(gz_file, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            gz_size = os.path.getsize(gz_file) / 1024  # KB
            print(f"   🗜️  Compactado: {gz_size:.2f} KB ({gz_file.name})")
            
            # Cria arquivo de metadados
            meta_file = backup_file.with_suffix('.meta.txt')
            with open(meta_file, 'w') as f:
                f.write(f"Data do Backup: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write(f"Tipo: Backup Pré-Produção (Limpeza)\n")
                f.write(f"Database: {dbname}\n")
                f.write(f"Host: {host}:{port}\n")
                f.write(f"Tamanho: {size:.2f} KB\n")
                f.write(f"Compactado: {gz_size:.2f} KB\n")
            
            print(f"\n📋 Metadados salvos em: {meta_file.name}")
            return True
        else:
            print(f"\n❌ Erro ao criar backup:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return False

def list_backups():
    """Lista todos os backups existentes"""
    backup_dir = Path("backups")
    if not backup_dir.exists():
        print("\n📁 Nenhum backup encontrado")
        return
    
    backups = sorted(backup_dir.glob("*.sql"), reverse=True)
    
    if not backups:
        print("\n📁 Nenhum backup encontrado")
        return
    
    print("\n" + "=" * 60)
    print("📚 BACKUPS EXISTENTES")
    print("=" * 60)
    
    for backup in backups:
        size = os.path.getsize(backup) / 1024  # KB
        mtime = datetime.fromtimestamp(backup.stat().st_mtime)
        print(f"\n📦 {backup.name}")
        print(f"   📅 {mtime.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"   📊 {size:.2f} KB")
        
        # Verifica se tem metadados
        meta_file = backup.with_suffix('.meta.txt')
        if meta_file.exists():
            print(f"   📋 Metadados: ✓")

if __name__ == "__main__":
    print("\n🔄 Verificando backups existentes...")
    list_backups()
    
    print("\n" + "=" * 60)
    response = input("\n🤔 Deseja criar um novo backup? (s/N): ").strip().lower()
    
    if response == 's':
        if create_backup():
            print("\n" + "=" * 60)
            print("✅ BACKUP CONCLUÍDO COM SUCESSO!")
            print("=" * 60)
            print("\n⚠️  Guarde este backup em local seguro antes de limpar o banco!")
        else:
            print("\n❌ Falha ao criar backup. Abortando operação.")
    else:
        print("\n❌ Backup cancelado pelo usuário")
