import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload
from models import ServiceOrder, ServiceItem

# Tenta carregar .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Busca OS #46 (assumindo que 46 é o ID)
    order = db.query(ServiceOrder).options(joinedload(ServiceOrder.items)).filter(ServiceOrder.id == 46).first()
    
    if not order:
        print("Order #46 not found.")
    else:
        print(f"Order #{order.id} found.")
        print(f"Total Value (DB): {order.total_value}")
        print(f"Items count: {len(order.items)}")
        for item in order.items:
            print(f" - Item {item.id}: {item.description} (Type: {item.type}, Total: {item.total})")
            
        # Check raw items table just in case
        raw_items_count = db.query(ServiceItem).filter(ServiceItem.order_id == 46).count()
        print(f"Raw items count in service_items for order_id=46: {raw_items_count}")

finally:
    db.close()
