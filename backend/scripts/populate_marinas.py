from sqlalchemy.orm import Session
from database import SessionLocal
from models import Marina, Tenant

# Lista Atualizada de Marinas (Paraná)
MARINAS_DATA = [
    # --- 1. Paranaguá ---
    { "name": "Iate Clube de Paranaguá (ICP)", "address": "Centro Histórico, Paranaguá - PR", "contact_name": "Secretaria" },
    { "name": "Marina Azul", "address": "Bairro Oceania, Paranaguá - PR", "contact_name": "Administração" },
    { "name": "Porto Marina Oceania", "address": "Paranaguá - PR", "contact_name": "Atendimento" },
    { "name": "Marina Marlin Azul", "address": "Entrada da Cidade, Paranaguá - PR", "contact_name": "Recepção" },
    { "name": "Marina Velho Marujo", "address": "Paranaguá - PR", "contact_name": "Gerência" },
    { "name": "Marina Barra do Itiberê", "address": "Rio Itiberê, Paranaguá - PR", "contact_name": "Atendimento" },
    { "name": "Marina Céu Azul", "address": "Paranaguá - PR", "contact_name": "Administração" },
    { "name": "Marina Iate Clube Literário", "address": "Paranaguá - PR", "contact_name": "Secretaria" },
    { "name": "Marina Estaleiro do Rocio", "address": "Rocio, Paranaguá - PR", "contact_name": "Gerência" },

    # --- 2. Pontal do Sul / Pontal do Paraná ---
    { "name": "Iate Clube Pontal do Sul (ICPS)", "address": "Pontal do Sul - PR", "contact_name": "Secretaria" },
    { "name": "Marina Biomar", "address": "Pontal do Paraná - PR", "contact_name": "Atendimento" },
    { "name": "Marina Las Palmas", "address": "Pontal do Paraná - PR", "contact_name": "Administração" },
    { "name": "Marina Quebra Mar", "address": "Canal de Pontal, Pontal do Paraná - PR", "contact_name": "Recepção" },
    { "name": "Ponta do Poço Marina Clube", "address": "Pontal do Sul - PR", "contact_name": "Gerência" },
    { "name": "Marina Acquazzu Jet Clube", "address": "Pontal do Paraná - PR", "contact_name": "Atendimento" },
    { "name": "Marina Sete Mares", "address": "Pontal do Paraná - PR", "contact_name": "Administração" },
    { "name": "Marina Tropical", "address": "Pontal do Paraná - PR", "contact_name": "Recepção" },
    { "name": "Condomínio Náutico Ilhas do Sul", "address": "Pontal do Paraná - PR", "contact_name": "Síndico/Admin" },
    { "name": "Condomínio Náutico Ilha do Mel", "address": "Pontal do Paraná - PR", "contact_name": "Administração" },
    { "name": "Marina Solaris", "address": "Pontal do Paraná - PR", "contact_name": "Atendimento" },

    # --- 3. Guaratuba ---
    { "name": "Iate Clube de Guaratuba (ICG)", "address": "Guaratuba - PR", "contact_name": "Secretaria" },
    { "name": "Marina Tauchen", "address": "Guaratuba - PR", "contact_name": "Atendimento" },
    { "name": "Marina do Sol", "address": "Guaratuba - PR", "contact_name": "Recepção" },
    { "name": "Marina Velamar", "address": "Baía de Guaratuba, Guaratuba - PR", "contact_name": "Gerência" },
    { "name": "Marina Carolina", "address": "Guaratuba - PR", "contact_name": "Administração" },
    { "name": "Marina GuaraPesca", "address": "Guaratuba - PR", "contact_name": "Atendimento" },
    { "name": "Marina Porto Estaleiro", "address": "Guaratuba - PR", "contact_name": "Oficina" },
    { "name": "Marina Bon Vivant", "address": "Guaratuba - PR", "contact_name": "Administração" },

    # --- 4. Matinhos e Caiobá ---
    { "name": "Iate Clube de Caiobá", "address": "Caiobá, Matinhos - PR", "contact_name": "Secretaria" },
    { "name": "JK Garagem Náutica", "address": "Caiobá, Matinhos - PR", "contact_name": "Atendimento" },
    { "name": "Garagem Náutica Ribeiro", "address": "Matinhos - PR", "contact_name": "Recepção" },
    { "name": "Marina Matinhos", "address": "Matinhos - PR", "contact_name": "Atendimento" }
]

def populate_marinas():
    db = SessionLocal()
    try:
        print("Iniciando cadastro das Marinas do Paraná para TODOS os Tenants...")
        tenants = db.query(Tenant).all()
        
        if not tenants:
            print("Nenhum tenant encontrado! Criando tenant default...")
            default_tenant = Tenant(name="Default Tenant", plan="START")
            db.add(default_tenant)
            db.commit()
            db.refresh(default_tenant)
            tenants = [default_tenant]

        total_new = 0
        
        for tenant in tenants:
            print(f"Processando Tenant ID: {tenant.id} - {tenant.name}")
            for data in MARINAS_DATA:
                existing = db.query(Marina).filter(
                    Marina.name == data["name"],
                    Marina.tenant_id == tenant.id
                ).first()
                
                if not existing:
                    marina = Marina(
                        tenant_id=tenant.id,
                        name=data["name"],
                        address=data.get("address"),
                        contact_name=data.get("contact_name"),
                        operating_hours="08:00 - 18:00" # Default
                    )
                    db.add(marina)
                    total_new += 1
            
            db.commit() # Commit per tenant
        
        print(f"\nConcluído! {total_new} novas marinas cadastradas no total.")
            
    except Exception as e:
        print(f"Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_marinas()
