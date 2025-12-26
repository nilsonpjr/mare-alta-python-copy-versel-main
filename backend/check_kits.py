from database import SessionLocal
from crud import get_maintenance_kits
from models import User

db = SessionLocal()
# MOCK A USER - Assuming user 1 exists and has tenant_id 1
class MockUser:
    tenant_id = 1

user = MockUser()
try:
    kits = get_maintenance_kits(db, tenant_id=user.tenant_id)
    print(f"Total Kits Found: {len(kits)}")
    for k in kits:
        print(f" - {k.id}: {k.brand} {k.engine_model} ({k.interval_hours}h) -> {len(k.items)} items")
finally:
    db.close()
