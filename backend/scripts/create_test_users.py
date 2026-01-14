"""
Script para criar usuários de teste em um tenant específico.
Cria 1 Admin, 2 Técnicos e 2 Clientes de exemplo.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import auth

def create_test_users():
    db = SessionLocal()
    
    try:
        # Buscar o tenant do nilsonpjr@gmail.com
        admin_user = db.query(models.User).filter(models.User.email == "nilsonpjr@gmail.com").first()
        
        if not admin_user:
            print("❌ Usuário nilsonpjr@gmail.com não encontrado!")
            print("Execute o signup primeiro.")
            return
        
        tenant_id = admin_user.tenant_id
        print(f"✅ Tenant encontrado: {tenant_id}")
        print(f"📧 Admin: {admin_user.email}")
        
        # Verificar se já existem usuários de teste
        existing = db.query(models.User).filter(
            models.User.tenant_id == tenant_id,
            models.User.email.like('%teste%')
        ).all()
        
        if existing:
            print(f"\n⚠️  Já existem {len(existing)} usuários de teste. Deletando...")
            for user in existing:
                db.delete(user)
            db.commit()
        
        # Criar usuários de teste
        test_users = [
            # Admin adicional
            {
                "email": "admin.teste@marealta.com",
                "name": "Administrador Teste",
                "password": "admin123",
                "role": models.UserRole.ADMIN
            },
            # Técnicos
            {
                "email": "tecnico1.teste@marealta.com",
                "name": "José Silva - Técnico",
                "password": "tecnico123",
                "role": models.UserRole.TECHNICIAN
            },
            {
                "email": "tecnico2.teste@marealta.com",
                "name": "Carlos Santos - Técnico",
                "password": "tecnico123",
                "role": models.UserRole.TECHNICIAN
            },
            # Clientes
            {
                "email": "cliente1.teste@marealta.com",
                "name": "Maria Oliveira - Cliente",
                "password": "cliente123",
                "role": models.UserRole.CLIENT
            },
            {
                "email": "cliente2.teste@marealta.com",
                "name": "Pedro Costa - Cliente",
                "password": "cliente123",
                "role": models.UserRole.CLIENT
            }
        ]
        
        print("\n🔧 Criando usuários de teste...\n")
        
        created_users = []
        for user_data in test_users:
            # Hash da senha
            hashed_password = auth.get_password_hash(user_data["password"])
            
            # Criar usuário
            db_user = models.User(
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=hashed_password,
                role=user_data["role"],
                tenant_id=tenant_id
            )
            
            db.add(db_user)
            created_users.append(user_data)
        
        db.commit()
        
        print("✅ Usuários criados com sucesso!\n")
        print("=" * 70)
        print("📋 LISTA DE USUÁRIOS DE TESTE")
        print("=" * 70)
        
        for user in created_users:
            role_emoji = {
                models.UserRole.ADMIN: "👑",
                models.UserRole.TECHNICIAN: "🔧",
                models.UserRole.CLIENT: "👤"
            }
            
            print(f"\n{role_emoji[user['role']]} {user['role'].value}")
            print(f"   📧 Email: {user['email']}")
            print(f"   👤 Nome: {user['name']}")
            print(f"   🔑 Senha: {user['password']}")
        
        print("\n" + "=" * 70)
        print("\n💡 INSTRUÇÕES:")
        print("   1. Faça login com qualquer email acima")
        print("   2. Use a senha correspondente")
        print("   3. Teste as diferentes permissões de cada tipo")
        print("\n🔐 ADMIN tem acesso total a todos os módulos")
        print("🔧 TÉCNICO vê apenas suas tarefas")
        print("👤 CLIENTE vê apenas suas solicitações")
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🌊 MARE ALTA - Script de Criação de Usuários de Teste")
    print("=" * 70 + "\n")
    
    create_test_users()
    
    print("\n✨ Script finalizado!\n")
