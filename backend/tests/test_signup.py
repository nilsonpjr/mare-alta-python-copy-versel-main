
import pytest
from fastapi.testclient import TestClient

@pytest.mark.routers
@pytest.mark.auth
class TestAuthSignup:
    """Test tenant signup/registration"""

    def test_signup_new_company(self, client: TestClient, db):
        """Test creating a new company (tenant) and admin user"""
        signup_data = {
            "companyName": "Nova Empresa Ltda",
            "adminName": "Admin Proprietario",
            "adminEmail": "admin@novaempresa.com",
            "adminPassword": "securepassword123",
            "plan": "TRIAL"
        }

        response = client.post(
            "/api/auth/signup",
            json=signup_data
        )

        # Debug info
        if response.status_code != 200:
             print(f"Signup failed: {response.json()}")

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@novaempresa.com"
        assert data["name"] == "Admin Proprietario"
        assert data["role"] == "ADMIN"
        # Check if tenant was created
        from models import Tenant, User
        user = db.query(User).filter(User.email == "admin@novaempresa.com").first()
        assert user is not None
        assert user.tenant_id is not None
        
        tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
        assert tenant is not None
        assert tenant.name == "Nova Empresa Ltda"

    def test_signup_duplicate_email(self, client: TestClient, test_user):
        """Test signup with existing email should fail"""
        signup_data = {
            "companyName": "Outra Empresa",
            "adminName": "Outro Admin",
            "adminEmail": test_user.email, # Use existing email
            "adminPassword": "password123"
        }

        response = client.post(
            "/api/auth/signup",
            json=signup_data
        )

        assert response.status_code == 400
        assert "email já está cadastrado" in response.json()["detail"]
