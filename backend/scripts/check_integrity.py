import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload
from models import ServiceOrder

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL mismatch")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    orders = db.query(ServiceOrder).options(joinedload(ServiceOrder.items)).all()
    print(f"Checking {len(orders)} orders for consistency...")

    import models
    total_items_in_db = db.query(models.ServiceItem).count()
    print(f"Total items in 'service_items' table: {total_items_in_db}")
    
    inconsistent_count = 0
    for order in orders:
        calculated_total = sum(item.total for item in order.items)
        # Use simple epsilon for float comparison or just round to 2 decimals
        if abs(calculated_total - order.total_value) > 0.01:
            print(f"Mismatch in Order #{order.id}: DB Total={order.total_value:.2f}, Items Sum={calculated_total:.2f}")
            inconsistent_count += 1
            
            # Uncomment to fix automatically
            # order.total_value = calculated_total
            # db.add(order)
    
    # if inconsistent_count > 0:
    #     db.commit()
    #     print("Fixed totals.")
            
    print(f"\nFound {inconsistent_count} orders with mismatched totals.")

finally:
    db.close()
