"""
Script Master de População - Mare Alta
Popula TODOS os dados de teste para análise completa
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from sqlalchemy.orm import Session
from database import SessionLocal
import models
import auth
from datetime import datetime, timedelta
import random

def populate_all():
    db = SessionLocal()
    
    try:
        print("\n" + "="*70)
        print("🌊 MARE ALTA - POPULAÇÃO COMPLETA DE DADOS")
        print("="*70 + "\n")
        
        # 1. Buscar tenant
        admin_user = db.query(models.User).filter(models.User.email == "nilsonpjr@gmail.com").first()
        if not admin_user:
            print("❌ Admin não encontrado! Execute signup primeiro.")
            return
        
        tenant_id = admin_user.tenant_id
        print(f"✅ Tenant: {tenant_id}\n")
        
        # 2. CLIENTES (10)
        print("👥 Criando Clientes...")
        clientes = []
        for i in range(1, 11):
            cliente = models.Client(
                name=f"Cliente Teste {i}",
                email=f"cliente{i}@teste.com",
                phone=f"(11) 9{8000+i:04d}-{1000+i:04d}",
                document=f"{random.randint(10000000000, 99999999999)}",
                tenant_id=tenant_id
            )
            db.add(cliente)
            clientes.append(cliente)
        db.commit()
        print(f"✅ {len(clientes)} clientes criados\n")
        
        # 3. MARINAS (5)
        print("⚓ Criando Marinas...")
        marinas_data = [
            {"name": "Marina Guarujá", "address": "Av. Miguel Stefano, 2001", "phone": "(13) 3355-4400"},
            {"name": "Yacht Club Santos", "address": "Av. Bartolomeu de Gusmão, 192", "phone": "(13) 3289-2000"},
            {"name": "Marina Porto Novo", "address": "Rua da Marinha, 500", "phone": "(11) 3355-8800"},
            {"name": "Iate Clube SP", "address": "Av. Represa, 1200", "phone": "(11) 5687-3300"},
            {"name": "Marina Tropical", "address": "Estrada do Mar, 850", "phone": "(13) 3377-5500"}
        ]
        marinas = []
        for m_data in marinas_data:
            marina = models.Marina(
                name=m_data["name"],
                address=m_data["address"],
                phone=m_data["phone"],
                operating_hours="Seg-Sex: 8h-18h, Sáb: 8h-14h",
                contact_name="Gerente",
                tenant_id=tenant_id
            )
            db.add(marina)
            marinas.append(marina)
        db.commit()
        print(f"✅ {len(marinas)} marinas criadas\n")
        
        # 4. EMBARCAÇÕES (15)
        print("⛵ Criando Embarcações...")
        boats_data = [
            ("Lancha Azul", "Phantom 500", "SEA123456"),
            ("Barco da Família", "Boston Whaler 270", "MAR789012"),
            ("Veleiro Sonho", "Beneteau 45", "VEL345678"),
            ("Jet Ski Master", "Sea-Doo GTX", "JET901234"),
            ("Saveiro do Mar", "Focker 230", "FOC567890"),
            ("Barco Pesqueiro", "Sea Ray 340", "PES123456"),
            ("Lancha Turbo", "Magnum 60", "MAG789012"),
            ("Veleiro Colonial", "Bavaria 46", "BAV345678"),
            ("JetBoat Xtreme", "Yamaha 242X", "YAM901234"),
            ("Escuna Paraíso", "Custom 72", "ESC567890"),
            ("Lancha Offshore", "Formula 430", "FOR123456"),
            ("Catamarã Tropical", "Lagoon 450", "LAG789012"),
            ("Trawler Explorer", "Nordic 42", "NOR345678"),
            ("Center Console", "Grady White 360", "GRA901234"),
            ("Fishing Machine", "Bertram 61", "BER567890")
        ]
        
        boats = []
        for i, (name, model, hull) in enumerate(boats_data):
            boat = models.Boat(
                name=name,
                model=model,
                hull_id=hull,
                usage_type="Lazer" if i % 2 == 0 else "Profissional",
                client_id=clientes[i % len(clientes)].id,
                marina_id=marinas[i % len(marinas)].id if i % 3 != 0 else None,
                tenant_id=tenant_id
            )
            db.add(boat)
            boats.append(boat)
        db.commit()
        print(f"✅ {len(boats)} embarcações criadas\n")
        
        # 5. MOTORES (20 - alguns barcos têm 2 motores)
        print("🛥️ Criando Motores...")
        motors_data = [
            ("Mercury 250 Verado", "70380954", 2022, 450),
            ("Yamaha F350", "12345678", 2021, 320),
            ("Honda BF250", "87654321", 2023, 150),
            ("Suzuki DF300", "11223344", 2022, 280),
            ("Evinrude G2 300", "55667788", 2020, 520),
        ]
        
        for i, boat in enumerate(boats[:15]):
            # Alguns barcos têm 2 motores
            num_motors = 2 if i % 3 == 0 else 1
            for m in range(num_motors):
                motor_data = motors_data[i % len(motors_data)]
                engine = models.Engine(
                    boat_id=boat.id,
                    serial_number=f"{motor_data[1]}{m}",
                    model=motor_data[0],
                    year=motor_data[2],
                    hours=motor_data[3] + (m * 50),
                    tenant_id=tenant_id
                )
                db.add(engine)
        db.commit()
        print(f"✅ Motores criados\n")
        
        # 6. PEÇAS NO ESTOQUE (30)
        print("📦 Criando Peças...")
        parts_data = [
            ("Óleo 2 Tempos Mercury", "SKU-OIL001", 45.90, 50),
            ("Filtro de Combustível Yamaha", "SKU-FIL002", 78.50, 30),
            ("Vela de Ignição Honda", "SKU-VEL003", 32.00, 100),
            ("Hélice 3 Pás Inox 14x19", "SKU-HEL004", 850.00, 12),
            ("Bomba d'Água Mercury", "SKU-BOM005", 320.00, 15),
            ("Termostato Yamaha", "SKU-TER006", 180.00, 20),
            ("Impeler Bomba Suzuki", "SKU-IMP007", 95.00, 25),
            ("Filtro de Ar Honda", "SKU-FAR008", 42.00, 40),
            ("Correia Mercury", "SKU-COR009", 125.00, 18),
            ("Junta do Cabeçote", "SKU-JUN010", 210.00, 10),
        ]
        
        for i in range(30):
            part_data = parts_data[i % len(parts_data)]
            part = models.Part(
                name=f"{part_data[0]} #{i+1}",
                sku=f"{part_data[1]}-{i+1}",
                description=f"Peça original compatível",
                stock_quantity=part_data[3] + random.randint(-10, 10),
                min_stock=5,
                unit_price=part_data[2],
                tenant_id=tenant_id
            )
            db.add(part)
        db.commit()
        print(f"✅ 30 peças criadas\n")
        
        # 7. PARCEIROS (8)
        print("🤝 Criando Parceiros...")
        partners_data = [
            ("Elétrica Silva", "ELECTRICIAN", "eletrica.silva@email.com", "(11) 9876-5432"),
            ("Mecânica Premium", "MECHANIC", "mecanica.premium@email.com", "(11) 9765-4321"),
            ("Pintor Expert", "PAINTER", "pintor.expert@email.com", "(11) 9654-3210"),
            ("Capotaria Top", "UPHOLSTERER", "capotaria.top@email.com", "(11) 9543-2109"),
            ("Fibra & Cia", "FIBERGLASS", "fibra.cia@email.com", "(11) 9432-1098"),
            ("Refrigeração Pro", "REFRIGERATION", "refrigeracao.pro@email.com", "(11) 9321-0987"),
            ("Eletrônica Marine", "ELECTRONICS", "eletronica.marine@email.com", "(11) 9210-9876"),
            ("Serviços Gerais Mar", "OTHER", "servicos.mar@email.com", "(11) 9109-8765")
        ]
        
        for p_data in partners_data:
            partner = models.Partner(
                name=p_data[0],
                partner_type=p_data[1],
                email=p_data[2],
                phone=p_data[3],
                rating=random.uniform(3.5, 5.0),
                tenant_id=tenant_id
            )
            db.add(partner)
        db.commit()
        print(f"✅ {len(partners_data)} parceiros criados\n")
        
        # 8. ORDENS DE SERVIÇO (20)
        print("🔧 Criando Ordens de Serviço...")
        os_status = [models.OSStatus.PENDING, models.OSStatus.IN_PROGRESS, models.OSStatus.COMPLETED]
        
        for i in range(20):
            boat = boats[i % len(boats)]
            scheduled = datetime.now() + timedelta(days=random.randint(-30, 30))
            
            order = models.ServiceOrder(
                boat_id=boat.id,
                description=f"Manutenção Preventiva - {boat.model}",
                diagnosis=f"Verificação geral, óleo e filtros",
                status=os_status[i % 3],
                total_value=random.uniform(500, 3000),
                scheduled_at=scheduled,
                technician_name=random.choice(["José Silva", "Carlos Santos"]),
                estimated_duration=random.randint(2, 8),
                tenant_id=tenant_id
            )
            db.add(order)
        db.commit()
        print(f"✅ 20 ordens de serviço  criadas\n")
        
        # 9. TRANSAÇÕES FINANCEIRAS (40)
        print("💰 Criando Transações...")
        for i in range(40):
            transaction = models.FinancialTransaction(
                type="INCOME" if i % 2 == 0 else "EXPENSE",
                category="Serviços" if i % 2 == 0 else "Peças",
                amount=random.uniform(100, 5000),
                description=f"Transação de teste #{i+1}",
                date=datetime.now() - timedelta(days=random.randint(0, 90)),
                tenant_id=tenant_id
            )
            db.add(transaction)
        db.commit()
        print(f"✅ 40 transações criadas\n")
        
        print("="*70)
        print("✅ POPULAÇÃO COMPLETA!")
        print("="*70)
        print(f"\n📊 RESUMO:")
        print(f"  • {len(clientes)} Clientes")
        print(f"  • {len(marinas)} Marinas")
        print(f"  • {len(boats)} Embarcações")
        print(f"  • ~20 Motores")
        print(f"  • 30 Peças")
        print(f"  • {len(partners_data)} Parceiros")
        print(f"  • 20 Ordens de Serviço")
        print(f"  • 40 Transações")
        print(f"\n🎯 Sistema pronto para testes!\n")
        
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_all()
