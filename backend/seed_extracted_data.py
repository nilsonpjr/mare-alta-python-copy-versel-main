
import json
import sys
import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# App setup
sys.path.append(os.getcwd())
import models
from database import SessionLocal, engine

def get_or_create_part(db, item_data):
    # Check if SKU exists
    part = db.query(models.Part).filter(models.Part.sku == item_data['sku']).first()
    manufacturer = "Mercury" # Default
    if "ATTWOOD" in item_data['name'].upper(): manufacturer = "Attwood"
    if "SEACHOICE" in item_data['name'].upper(): manufacturer = "Seachoice"
    if "QUICKSILVER" in item_data['name'].upper(): manufacturer = "Quicksilver"

    if not part:
        # Truncate name to 200 chars
        safe_name = item_data['name'][:200]
        part = models.Part(
            sku=item_data['sku'],
            name=safe_name,
            # description removed as it is not in model
            price=item_data['price'],
            cost=item_data['cost'],
            quantity=0, 
            manufacturer=manufacturer,
            tenant_id=2 # Assuming 'Mare Alta Admin' tenant for now
        )
        db.add(part)
        db.commit()
        db.refresh(part)
        print(f"Created Part: {part.sku}")
    else:
        # Update price/name if needed
        part.price = item_data['price']
        part.name = item_data['name']
        part.manufacturer = manufacturer
        db.commit()
        # print(f"Updated Part: {part.sku}")
    return part

def parse_kit_info(description):
    brand = "Mercury"
    if "MERCRUISER" in description.upper():
        brand = "MerCruiser"
    
    # Try to extract model
    model = description.replace("KIT DE MANUTENÇÃO", "").strip()
    # Remove hours part "–100HS" or "- 100HS"
    model = re.sub(r'[-–]\s*\d+\.?\d*\s*HS.*', '', model, flags=re.IGNORECASE).strip()
    
    return brand, model

def seed_data():
    db = SessionLocal()
    try:
        json_path = os.path.join(os.getcwd(), "backend", "extracted_data.json")
        with open(json_path, "r") as f:
            data = json.load(f)
            
        print(f"Loading {len(data['parts'])} parts...")
        for p in data['parts']:
            get_or_create_part(db, p)
            
        print(f"Loading {len(data['kits'])} kits...")
        for k in data['kits']:
            # 1. Ensure the Kit itself exists as a Part (so it can be sold/stocked)
            kit_part_data = {
                "sku": k['sku'],
                "name": k['name'],
                "price": k['price'], # Likely 0
                "cost": 0,
                "category": "Kit Revisão"
            }
            kit_part = get_or_create_part(db, kit_part_data)
            
            # 2. Create MaintenanceKit Entry
            brand, model = parse_kit_info(k['desc_full'])
            hours = k['hours']
            
            # Check if kit exists
            m_kit = db.query(models.MaintenanceKit).filter(
                models.MaintenanceKit.description == k['desc_full']
            ).first()
            
            if not m_kit:
                m_kit = models.MaintenanceKit(
                    name=f"Revisão {hours}h - {model}",
                    description=k['desc_full'],
                    brand=brand,
                    engine_model=model,
                    interval_hours=hours,
                    tenant_id=2
                )
                db.add(m_kit)
                db.commit()
                db.refresh(m_kit)
                
                # 3. Add the Kit Part as the Item in this Maintenance Kit
                # Since we don't know the sub-components, the kit itself is the item.
                item = models.MaintenanceKitItem(
                    kit_id=m_kit.id,
                    type=models.ItemType.PART,
                    item_description=k['name'],  # Or the SKU
                    part_id=kit_part.id,
                    quantity=1,
                    unit_price=kit_part.price
                )
                db.add(item)
                db.commit()
                print(f"Created Kit: {m_kit.name}")
            else:
                pass 
                # print(f"Kit exists: {m_kit.name}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
