from sqlalchemy.orm import Session
from database import SessionLocal
from models import Manufacturer, Model

# Comprehensive Engine List
ENGINES_DATA = {
    "Mercury": [
        # Verado (V8, V10, V12)
        "Verado V8 250", "Verado V8 300", "Verado V10 350", "Verado V10 400", "Verado V12 600",
        # Racing
        "Mercury Racing 300R", "Mercury Racing 400R", "Mercury Racing 450R", "Mercury Racing 500R",
        # Pro XS
        "Pro XS 115", "Pro XS 150", "Pro XS 175", "Pro XS 200", "Pro XS 225", "Pro XS 250", "Pro XS 300",
        # SeaPro (Commercial)
        "SeaPro 15", "SeaPro 25", "SeaPro 40", "SeaPro 60", "SeaPro 75", "SeaPro 90", "SeaPro 115", 
        "SeaPro 150", "SeaPro 200 V8", "SeaPro 225 V8", "SeaPro 250 V8", "SeaPro 300 V8", "SeaPro 500 (V12)",
        # FourStroke (Outboards)
        "FourStroke 2.5", "FourStroke 3.5", "FourStroke 4", "FourStroke 5", "FourStroke 6", 
        "FourStroke 8", "FourStroke 9.9", "FourStroke 15", "FourStroke 20", "FourStroke 25", 
        "FourStroke 30", "FourStroke 40", "FourStroke 50", "FourStroke 60", "FourStroke 75", 
        "FourStroke 80", "FourStroke 90", "FourStroke 100", "FourStroke 115", "FourStroke 150",
        # OptiMax (Legacy 2-Stroke DFI)
        "OptiMax 75", "OptiMax 90", "OptiMax 115", "OptiMax 135", "OptiMax 150", "OptiMax 175", 
        "OptiMax 200", "OptiMax 225", "OptiMax 250",
        # Diesel Outboard (Future/Rare) & Inboard (QSD/TDI)
        "Diesel Outboard 3.0L", "Diesel 2.0L QSD (115-170)", "Diesel 3.0L TDI (230-260)", "Diesel 4.2L TDI (335-370)"
    ],
    "Mercruiser": [
        # Sterndrives (Current & Legacy)
        "3.0L MPI (135 hp)", "3.0L TKS (135 hp)",
        "4.3L V6 MPI (220 hp)", "4.3L V6 TKS (190 hp)",
        "4.5L V6 (200 hp)", "4.5L V6 (250 hp)",
        "5.0L MPI (260 hp)", "5.0L TKS (220 hp)",
        "5.7L MPI (300 hp)", "350 MAG MPI (300 hp)",
        "6.2L V8 MPI (300 hp)", "6.2L V8 MPI (350 hp)", "377 MAG MPI (320 hp)",
        "8.1L 496 MAG (375 hp)", "8.1L 496 MAG HO (425 hp)",
        "8.2L MAG (380 hp)", "8.2L MAG HO (430 hp)"
    ],
    "Yamaha": [
        # Portables
        "F2.5", "F4", "F6", "F8", "F9.9", "F15", "F20",
        # Midrange
        "F25", "F30", "F40", "F50", "F60", "F70", "F75", "F90",
        # High Power
        "F115", "F130", "F150", "F175", "F200",
        # V6 Offshore
        "F225", "F250", "F300",
        # V8 XTO
        "XTO 425 V8", "XTO 450 V8",
        # VMAX SHO (Performance)
        "VMAX SHO 90", "VMAX SHO 115", "VMAX SHO 150", "VMAX SHO 175", 
        "VMAX SHO 200", "VMAX SHO 225", "VMAX SHO 250",
        # 2-Stroke (Legacy/Commercial)
        "15FM (15hp 2T)", "40X (40hp 2T)", "40V (40hp 2T)", "85A (85hp 2T)", "90A (90hp 2T)"
    ],
    "Volvo Penta": [
        # Gasoline Sterndrive (Aquamatic)
        "V6-200", "V6-240", "V6-250", "V6-280", 
        "V8-300", "V8-350", "V8-380", "V8-430",
        # Diesel Aquamatic (D-Series)
        "D3-140", "D3-170", "D3-200", "D3-220",
        "D4-150", "D4-230", "D4-270", "D4-300", "D4-320",
        "D6-300", "D6-340", "D6-380", "D6-400", "D6-440", "D6-480"
        # IPS not strictly "Engine" model but related, keeping simple for now
    ]
}

def populate_engines():
    db = SessionLocal()
    tenant_id = 1 # Default Tenant
    try:
        print("Starting Engine Population...")
        for brand, models in ENGINES_DATA.items():
            print(f"Processing Manufacturer: {brand}")
            # 1. Get or Create Manufacturer
            manufacturer = db.query(Manufacturer).filter(
                Manufacturer.name == brand,
                Manufacturer.type == "ENGINE",
                Manufacturer.tenant_id == tenant_id
            ).first()
            
            if not manufacturer:
                manufacturer = Manufacturer(
                    name=brand,
                    type="ENGINE",
                    tenant_id=tenant_id
                )
                db.add(manufacturer)
                db.commit()
                db.refresh(manufacturer)
                print(f"  -> Created Manufacturer: {brand}")
            else:
                print(f"  -> Found Manufacturer: {brand}")
            
            # 2. Add Models
            for model_name in models:
                existing_model = db.query(Model).filter(
                    Model.name == model_name,
                    Model.manufacturer_id == manufacturer.id
                ).first()
                
                if not existing_model:
                    new_model = Model(
                        name=model_name,
                        manufacturer_id=manufacturer.id
                    )
                    db.add(new_model)
                    print(f"    -> Added Model: {model_name}")
                else:
                    # print(f"    -> Skipped Model: {model_name}")
                    pass
            
            db.commit() # Commit after each brand
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()
        print("Engine population completed.")

if __name__ == "__main__":
    populate_engines()
