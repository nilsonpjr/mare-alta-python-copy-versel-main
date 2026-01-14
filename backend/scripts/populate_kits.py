from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import MaintenanceKit, MaintenanceKitItem, Part, ItemType, User
from passlib.context import CryptContext

# Data from frontend/data/maintenance_kits.ts
INITIAL_MAINTENANCE_KITS = [
    {
        "id": 'mercury-v8-100h',
        "brand": 'Mercury',
        "engineModel": 'Verado V8 250/300',
        "intervalHours": 100,
        "description": 'Revisão de 100 Horas ou 1 Ano (O que ocorrer primeiro)',
        "parts": [
            { "partNumber": '8M0123456', "name": 'Filtro de Óleo Mercury Verado', "quantity": 1, "unitPrice": 120.00 },
            { "partNumber": '92-858037K01', "name": 'Óleo Motor 25W40 (Quart)', "quantity": 8, "unitPrice": 85.00 },
            { "partNumber": '8M0000001', "name": 'Filtro de Combustível Baixa Pressão', "quantity": 1, "unitPrice": 150.00 },
            { "partNumber": '8M0000002', "name": 'Kit Anodos Rabeta', "quantity": 1, "unitPrice": 450.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
        ],
        "labor": [
            { "description": 'Troca de Óleo e Filtros', "hours": 1.5, "hourlyRate": 250.00 },
            { "description": 'Inspeção Computadorizada (Scanner CDS)', "hours": 0.5, "hourlyRate": 250.00 },
            { "description": 'Lubrificação Geral e Inspeção de Anodos', "hours": 1.0, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'mercury-v8-300h',
        "brand": 'Mercury',
        "engineModel": 'Verado V8 250/300',
        "intervalHours": 300,
        "description": 'Revisão de 300 Horas ou 3 Anos',
        "parts": [
            { "partNumber": '8M0123456', "name": 'Filtro de Óleo Mercury Verado', "quantity": 1, "unitPrice": 120.00 },
            { "partNumber": '92-858037K01', "name": 'Óleo Motor 25W40 (Quart)', "quantity": 8, "unitPrice": 85.00 },
            { "partNumber": '8M0000001', "name": 'Filtro de Combustível Baixa Pressão', "quantity": 1, "unitPrice": 150.00 },
            { "partNumber": '8M0000002', "name": 'Kit Anodos Rabeta', "quantity": 1, "unitPrice": 450.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '8M0000123', "name": 'Velas de Ignição Iridium', "quantity": 8, "unitPrice": 180.00 },
            { "partNumber": '8M0000456', "name": 'Kit Reparo Bomba D\'água', "quantity": 1, "unitPrice": 380.00 },
            { "partNumber": '8M0000789', "name": 'Correia do Alternador', "quantity": 1, "unitPrice": 420.00 },
        ],
        "labor": [
            { "description": 'Revisão Completa 300h (Óleos, Filtros, Velas, Rotor)', "hours": 5.0, "hourlyRate": 250.00 },
            { "description": 'Teste de Rodagem', "hours": 1.0, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'yamaha-f300-100h',
        "brand": 'Yamaha',
        "engineModel": 'F300 V6',
        "intervalHours": 100,
        "description": 'Revisão de 100 Horas - Yamaha',
        "parts": [
            { "partNumber": '69J-13440-03', "name": 'Filtro de Óleo Yamaha', "quantity": 1, "unitPrice": 140.00 },
            { "partNumber": 'YAM-LUBE-4M', "name": 'Yamalube 4M 10W-30', "quantity": 7, "unitPrice": 90.00 },
            { "partNumber": '6P2-WS24A-01', "name": 'Elemento Filtro Combustível', "quantity": 1, "unitPrice": 180.00 },
            { "partNumber": '90430-08003', "name": 'Gaxeta Dreno Óleo', "quantity": 1, "unitPrice": 15.00 },
        ],
        "labor": [
            { "description": 'Serviço de Revisão 100h Yamaha', "hours": 2.5, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'mercury-portable-50h',
        "brand": 'Mercury',
        "engineModel": 'FourStroke 3.5-9.9 HP',
        "intervalHours": 50,
        "description": 'Revisão de 50 Horas ou Anual - Portáteis',
        "parts": [
            { "partNumber": '8M0071840', "name": 'Óleo Motor 10W-30 (Quart)', "quantity": 2, "unitPrice": 65.00 },
            { "partNumber": '8M0065104', "name": 'Filtro de Óleo Pequeno', "quantity": 1, "unitPrice": 85.00 },
            { "partNumber": '35-879885T', "name": 'Vela de Ignição NGK', "quantity": 1, "unitPrice": 45.00 },
        ],
        "labor": [
            { "description": 'Troca de Óleo e Filtro', "hours": 0.5, "hourlyRate": 200.00 },
            { "description": 'Inspeção Geral', "hours": 0.5, "hourlyRate": 200.00 },
        ]
    },
    {
        "id": 'mercury-portable-100h',
        "brand": 'Mercury',
        "engineModel": 'FourStroke 3.5-9.9 HP',
        "intervalHours": 100,
        "description": 'Revisão de 100 Horas - Portáteis',
        "parts": [
            { "partNumber": '8M0071840', "name": 'Óleo Motor 10W-30 (Quart)', "quantity": 2, "unitPrice": 65.00 },
            { "partNumber": '8M0065104', "name": 'Filtro de Óleo Pequeno', "quantity": 1, "unitPrice": 85.00 },
            { "partNumber": '35-879885T', "name": 'Vela de Ignição NGK', "quantity": 1, "unitPrice": 45.00 },
            { "partNumber": '8M0100633', "name": 'Óleo de Rabeta SAE 90', "quantity": 1, "unitPrice": 85.00 },
        ],
        "labor": [
            { "description": 'Revisão Completa Motor Portátil', "hours": 1.5, "hourlyRate": 200.00 },
        ]
    },
    {
        "id": 'mercruiser-45-100h',
        "brand": 'Mercruiser',
        "engineModel": 'MerCruiser 4.5L V6 (200/250 HP)',
        "intervalHours": 100,
        "description": 'Revisão de 100 Horas - MerCruiser 4.5L',
        "parts": [
            { "partNumber": '8M0078630', "name": 'Óleo Motor 25W-40 (Quart)', "quantity": 6, "unitPrice": 80.00 },
            { "partNumber": '35-866340Q03', "name": 'Filtro de Óleo MerCruiser', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '35-60494A1', "name": 'Filtro de Combustível', "quantity": 1, "unitPrice": 130.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
        ],
        "labor": [
            { "description": 'Troca de Óleo e Filtros', "hours": 1.5, "hourlyRate": 250.00 },
            { "description": 'Inspeção de Rabeta e Trim', "hours": 1.0, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'mercruiser-45-300h',
        "brand": 'Mercruiser',
        "engineModel": 'MerCruiser 4.5L V6 (200/250 HP)',
        "intervalHours": 300,
        "description": 'Revisão de 300 Horas - MerCruiser 4.5L',
        "parts": [
            { "partNumber": '8M0078630', "name": 'Óleo Motor 25W-40 (Quart)', "quantity": 6, "unitPrice": 80.00 },
            { "partNumber": '35-866340Q03', "name": 'Filtro de Óleo MerCruiser', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '35-60494A1', "name": 'Filtro de Combustível', "quantity": 1, "unitPrice": 130.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '8M0105237', "name": 'Velas de Ignição NGK (Jogo)', "quantity": 6, "unitPrice": 95.00 },
            { "partNumber": '8M0100526', "name": 'Kit Reparo Bomba D\'água', "quantity": 1, "unitPrice": 320.00 },
        ],
        "labor": [
            { "description": 'Revisão Completa 300h', "hours": 4.0, "hourlyRate": 250.00 },
            { "description": 'Teste de Rodagem', "hours": 1.0, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'mercruiser-62-100h',
        "brand": 'Mercruiser',
        "engineModel": 'MerCruiser 6.2L V8 (300/350 HP)',
        "intervalHours": 100,
        "description": 'Revisão de 100 Horas - MerCruiser 6.2L',
        "parts": [
            { "partNumber": '8M0078630', "name": 'Óleo Motor 25W-40 (Quart)', "quantity": 8, "unitPrice": 80.00 },
            { "partNumber": '35-866340Q03', "name": 'Filtro de Óleo MerCruiser', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '35-60494A1', "name": 'Filtro de Combustível', "quantity": 1, "unitPrice": 130.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
        ],
        "labor": [
            { "description": 'Troca de Óleo e Filtros V8', "hours": 2.0, "hourlyRate": 250.00 },
            { "description": 'Inspeção Computadorizada', "hours": 0.5, "hourlyRate": 250.00 },
        ]
    },
    {
        "id": 'mercruiser-62-300h',
        "brand": 'Mercruiser',
        "engineModel": 'MerCruiser 6.2L V8 (300/350 HP)',
        "intervalHours": 300,
        "description": 'Revisão de 300 Horas - MerCruiser 6.2L',
        "parts": [
            { "partNumber": '8M0078630', "name": 'Óleo Motor 25W-40 (Quart)', "quantity": 8, "unitPrice": 80.00 },
            { "partNumber": '35-866340Q03', "name": 'Filtro de Óleo MerCruiser', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '35-60494A1', "name": 'Filtro de Combustível', "quantity": 1, "unitPrice": 130.00 },
            { "partNumber": '92-858064K01', "name": 'Óleo de Rabeta High Performance', "quantity": 1, "unitPrice": 110.00 },
            { "partNumber": '8M0105237', "name": 'Velas de Ignição IGX (Jogo)', "quantity": 8, "unitPrice": 110.00 },
            { "partNumber": '8M0100526', "name": 'Kit Reparo Bomba D\'água', "quantity": 1, "unitPrice": 380.00 },
            { "partNumber": '8M0100456', "name": 'Correia do Alternador', "quantity": 1, "unitPrice": 450.00 },
        ],
        "labor": [
            { "description": 'Revisão Completa 300h V8', "hours": 5.0, "hourlyRate": 250.00 },
            { "description": 'Teste de Rodagem', "hours": 1.0, "hourlyRate": 250.00 },
        ]
    }
]

def populate_kits():
    db = SessionLocal()
    try:
        # Default tenant (assuming id=1 for now, or fetch first)
        tenant_id = 1
        
        # Check if tenant exists
        # NOTE: In a real scenario, you'd handle multiple tenants. 
        # Here we assume a single tenant system or default logic.
        
        for kit_data in INITIAL_MAINTENANCE_KITS:
            # Check if kit already exists (by name/model/hours) to prevent duplicates
            kit_name = f"{kit_data['brand']} {kit_data['engineModel']} ({kit_data['intervalHours']}h)"
            
            existing_kit = db.query(MaintenanceKit).filter(
                MaintenanceKit.name == kit_name,
                MaintenanceKit.tenant_id == tenant_id
            ).first()
            
            if existing_kit:
                print(f"Kit {kit_name} already exists. Skipping.")
                continue
            
            print(f"Creating Kit: {kit_name}")
            
            new_kit = MaintenanceKit(
                tenant_id=tenant_id,
                name=kit_name,
                brand=kit_data['brand'],
                engine_model=kit_data['engineModel'],
                interval_hours=kit_data['intervalHours'],
                description=kit_data['description']
            )
            db.add(new_kit)
            db.commit()
            db.refresh(new_kit)
            
            # --- PARTS ---
            for part_data in kit_data['parts']:
                # 1. Tratar a Peça (Criar se não existir, Pegar ID)
                part_sku = part_data['partNumber']
                part_name = part_data['name']
                
                db_part = db.query(Part).filter(Part.sku == part_sku).first()
                if not db_part:
                    # Create the part if it doesn't exist
                    print(f"  -> Creating Part: {part_sku} - {part_name}")
                    db_part = Part(
                        tenant_id=tenant_id,
                        sku=part_sku,
                        name=part_name,
                        price=part_data['unitPrice'],
                        cost=part_data['unitPrice'] * 0.6, # Estimate cost
                        quantity=0, # Initial stock
                        min_stock=1
                    )
                    db.add(db_part)
                    db.commit()
                    db.refresh(db_part)
                else:
                    print(f"  -> Using Existing Part: {part_sku}")

                # 2. Add Item to Kit
                kit_item = MaintenanceKitItem(
                    kit_id=new_kit.id,
                    type=ItemType.PART,
                    part_id=db_part.id,
                    item_description=part_name, # Frontend relies on part lookup via this or part_id
                    quantity=part_data['quantity'],
                    unit_price=part_data['unitPrice']
                )
                db.add(kit_item)
            
            # --- LABOR ---
            for labor_data in kit_data['labor']:
                kit_item = MaintenanceKitItem(
                    kit_id=new_kit.id,
                    type=ItemType.LABOR,
                    item_description=labor_data['description'],
                    quantity=labor_data['hours'],
                    unit_price=labor_data['hourlyRate']
                )
                db.add(kit_item)
            
            db.commit()
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_kits()
