
import sys
import os
from dotenv import load_dotenv

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

# Load env
env_path = os.path.join(os.getcwd(), "backend", ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- Tenants ---")
try:
    tenants = db.query(models.Tenant).all()
    if not tenants:
        print("No tenants found in database!")
    for t in tenants:
        print(f"ID: {t.id} | Name: {t.name} | Subdomain: {t.subdomain} | Plan: {t.plan} | Active: {t.is_active}")
except Exception as e:
    print(f"Error querying tenants: {e}")

print("\n--- Users (checking detailed emails) ---")
try:
    users = db.query(models.User).filter(models.User.email.in_(["nilsonpjr@gmail.com", "admin@viverdinautica.com"])).all()
    for u in users:
        print(f"ID: {u.id} | Name: {u.name} | Email: '{u.email}' | Role: {u.role} | Tenant ID: {u.tenant_id}")
except Exception as e:
    print(f"Error querying users: {e}")
