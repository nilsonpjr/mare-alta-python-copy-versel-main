
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd()))

import models
import schemas
import crud
import auth
from database import Base

# Setup In-Memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def test_workflow():
    db = TestingSessionLocal()
    try:
        print("1. Testing Signup...")
        signup_data = schemas.TenantSignup(
            companyName="Test Corp",
            plan="START",
            adminName="Admin User",
            adminEmail="admin@test.com",
            adminPassword="password123"
        )
        # Simulate Signup Logic from auth_router
        user = crud.register_tenant(db, signup_data)
        print(f"   User created: ID={user.id}, Tenant={user.tenant_id}, Email={user.email}")
        
        print("2. Testing Login...")
        authenticated_user = auth.authenticate_user(db, "admin@test.com", "password123")
        if not authenticated_user:
            print("   LOGIN FAILED!")
            return
        print("   Login Successful.")

        print("3. Testing Update Company Info (Mercury)...")
        # Check initial info
        info = crud.get_company_info(db, user.tenant_id)
        print(f"   Initial Mercury User: {info.mercury_username}")

        # Update
        update_data = schemas.CompanyInfoCreate(
            mercuryUsername="mercury_user_123",
            mercuryPassword="secret_password"
        )
        updated_info = crud.update_company_info(db, update_data, user.tenant_id)
        
        # Verify
        db.refresh(updated_info)
        print(f"   Updated Mercury User: {updated_info.mercury_username}")
        print(f"   Updated Mercury Pass: {updated_info.mercury_password}")

        if updated_info.mercury_username == "mercury_user_123":
            print("   SUCCESS: Company Info Updated Correctly.")
        else:
            print("   FAILURE: Did not update correctly.")

    except Exception as e:
        print(f"EXCEPTION: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_workflow()
