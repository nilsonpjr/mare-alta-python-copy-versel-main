import sys
import os

# Add current directory to path so we can import backend
sys.path.append(os.path.join(os.getcwd()))

# Needed to setup proper context/imports if needed
from backend.database import SessionLocal, engine, Base
# Ensure models are loaded
from backend import models

def fix_user():
    db = SessionLocal()
    try:
        # 1. Attempt to fix missing column 'preferences' first
        try:
             from sqlalchemy import text
             print("Checking/Adding 'preferences' column to users table...")
             db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'"))
             db.commit()
             print("Column 'preferences' check done.")
        except Exception as e:
             print(f"Warning: Could not add preferences column (maybe it's not Postgres or permission issue): {e}")
             db.rollback()

        email = "nilsonpjr@gmail.com"
        print(f"Searching for user: {email}")
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            print(f"User {email} NOT found!")
            # List some users to see whats happening
            users = db.query(models.User).limit(5).all()
            print("Users found in DB:", [u.email for u in users])
            return

        print(f"Found user: {user.email}")
        print(f"  ID: {user.id}")
        print(f"  Role: {user.role}")
        print(f"  Current Tenant ID: {user.tenant_id}")

        if user.tenant_id:
            # Check if tenant exists
            tenant = db.query(models.Tenant).filter(models.Tenant.id == user.tenant_id).first()
            if tenant:
                 print(f"  User's tenant exists: {tenant.name} (ID: {tenant.id})")
                 # If user says error, maybe they need to be re-saved or token issue.
                 # But let's assume if tenant exists, maybe it is inactive?
                 if not tenant.is_active:
                     print("  WARNING: Tenant is inactive! Activating...")
                     tenant.is_active = True
                     db.commit()
                 else:
                     print("  Tenant is active.")
            else:
                 print("  CRITICAL: User has tenant_id but Tenant does not exist in DB!")
                 user.tenant_id = None # Force re-assignment below
                 db.commit()

        if not user.tenant_id:
            # Find or create a tenant
            tenant = db.query(models.Tenant).first()
            
            if not tenant:
                print("No tenants found in DB. Creating a default tenant...")
                tenant = models.Tenant(
                    name="Mare Alta Matriz", 
                    subdomain="marealta", 
                    plan="ENTERPRISE"
                )
                db.add(tenant)
                db.commit()
                db.refresh(tenant)
                print(f"Created Tenant: {tenant.name} (ID: {tenant.id})")
            else:
                print(f"Using existing (first) Tenant: {tenant.name} (ID: {tenant.id})")

            # Assign tenant to user
            print(f"Assigning User {user.email} to Tenant {tenant.id}...")
            user.tenant_id = tenant.id
            db.commit()
            print("Done! User updated.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_user()
