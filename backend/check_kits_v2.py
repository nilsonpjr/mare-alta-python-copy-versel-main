import sys
import os

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal
    from models import MaintenanceKit
    from sqlalchemy.orm import Session
    
    db = SessionLocal()
    print("Database connected.")
    
    kits = db.query(MaintenanceKit).all()
    print(f"Total Kits in DB: {len(kits)}")
    
    for k in kits:
        print(f"ID: {k.id} | Brand: {k.brand} | Model: {k.engine_model} | Interval: {k.interval_hours}h")
        
    db.close()
except Exception as e:
    print(f"Error: {e}")
