"""
Script para popular banco de dados com dados iniciais (seed data)
Execute: python seed.py
"""

from sqlalchemy.orm import Session
import models
from database import SessionLocal, engine
from auth import get_password_hash
from datetime import datetime, timedelta

def create_seed_data():
    db = SessionLocal()
    
    try:
        # Criar tabelas
        models.Base.metadata.create_all(bind=engine)
        
        # Verificar se já tem dados
        if db.query(models.User).first():
            print("❌ Banco já tem dados. Abortando seed.")
            return
        
        print("🌱 Criando dados iniciais...")
        
        # --- USUÁRIOS ---
        print("👥 Criando usuário Admin padrão...")
        
        admin_user = models.User(
            name="Administrador Viverdi",
            email="admin@viverdinautica.com",
            hashed_password=get_password_hash("123"),
            role=models.UserRole.ADMIN
        )
        db.add(admin_user)
        db.flush()
        
        db.commit()
        
        print("✅ Seed básico completo!")
        print("\n🔑 Credenciais de login:")
        print("   Admin: admin@viverdinautica.com / 123")
        
        # Commit tudo
        db.commit()
        
        print("✅ Seed completo!")
        print(f"   - {len(clients)} clientes")
        print(f"   - {len(users)} usuários")
        print(f"   - {len(marinas)} marinas")
        print(f"   - {len(boats)} barcos")
        print(f"   - {len(parts)} peças")
        print(f"   - {len(orders)} ordens de serviço")
        print("\n🔑 Credenciais de login:")
        print("   Admin: admin@viverdinautica.com / 123456")
        print("   Técnico: tecnico@viverdinautica.com / 123456")
        print("   Cliente: cliente@viverdinautica.com / 123456")
        
    except Exception as e:
        print(f"❌ Erro ao criar seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
