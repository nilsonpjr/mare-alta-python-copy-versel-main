
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.getcwd())
import models
from database import SessionLocal

def add_labor():
    db = SessionLocal()
    try:
        kits = db.query(models.MaintenanceKit).all()
        print(f"Checking {len(kits)} kits for labor items...")
        
        for kit in kits:
            # Check if labor exists
            labor = db.query(models.MaintenanceKitItem).filter(
                models.MaintenanceKitItem.kit_id == kit.id,
                models.MaintenanceKitItem.type == models.ItemType.LABOR
            ).first()
            
            if not labor:
                hours = 4.0
                if kit.interval_hours == 100: hours = 5.0
                elif kit.interval_hours == 300: hours = 8.0
                elif kit.interval_hours >= 1000: hours = 12.0
                
                new_labor = models.MaintenanceKitItem(
                    kit_id=kit.id,
                    type=models.ItemType.LABOR,
                    item_description="Mão de Obra Especializada (Estimada)",
                    part_id=None,
                    quantity=hours,
                    unit_price=250.0 # Default hourly rate
                )
                db.add(new_labor)
                print(f"Added {hours}h labor to Kit: {kit.name}")
        
        db.commit()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_labor()
