import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload
from models import ServiceOrder, ServiceItem, ItemType

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
    print(f"Checking {len(orders)} orders...")
    
    fixed_count = 0
    for order in orders:
        items_sum = sum(item.total for item in order.items)
        diff = order.total_value - items_sum
        
        # Se a diferença for significativa (> 0.01) e positiva
        if diff > 0.01:
            print(f"Fixing Order #{order.id}: DB Total={order.total_value:.2f}, Items Sum={items_sum:.2f}, Diff={diff:.2f}")
            
            # Cria um item de ajuste para cobrir a diferença
            adjustment_item = ServiceItem(
                order_id=order.id,
                type=ItemType.LABOR, # Usa LABOR como genérico para serviço/ajuste
                description="Saldo Inicial (Migração)",
                quantity=1,
                unit_cost=0,
                unit_price=diff,
                total=diff
            )
            db.add(adjustment_item)
            fixed_count += 1
    
    if fixed_count > 0:
        db.commit()
        print(f"Successfully fixed {fixed_count} orders by adding adjustment items.")
    else:
        print("No orders needed fixing.")

finally:
    db.close()
