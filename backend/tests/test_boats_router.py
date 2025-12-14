"""
Test boats router - FIXED VERSION 2
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.routers
class TestBoatsRouter:
    """Test boats router endpoints"""

    def test_get_boats(self, client: TestClient, auth_headers, test_tenant, db):
        """Test getting all boats"""
        from models import Client, Boat
        
        # Create a client first
        owner = Client(
            name="Boat Owner",
            document="12345678900",
            email="owner@example.com",
            tenant_id=test_tenant.id
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        
        # Create boats
        for i in range(2):
            boat = Boat(
                name=f"Boat {i}",
                model=f"Boat Model {i}",
                hull_id=f"ABC-123{i}", # ✅ CORRIGIDO
                client_id=owner.id,    # ✅ CORRIGIDO
                tenant_id=test_tenant.id
            )
            db.add(boat)
        db.commit()
        
        response = client.get("/api/boats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_create_boat(self, client: TestClient, auth_headers, test_tenant, db):
        """Test creating a new boat"""
        from models import Client
        
        # Create a client first
        owner = Client(
            name="Boat Owner",
            document="12345678900",
            email="owner@example.com",
            tenant_id=test_tenant.id
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        
        boat_data = {
            "name": "New Boat",
            "model": "New Boat Model",
            "hull_id": "XYZ-9999", # ✅ CORRIGIDO
            "client_id": owner.id   # ✅ CORRIGIDO
        }
        
        response = client.post(
            "/api/boats",
            json=boat_data,
            headers=auth_headers
        )
        
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["model"] == "New Boat Model"
    
    def test_get_boat_by_id(self, client: TestClient, auth_headers, test_tenant, db):
        """Test getting a specific boat"""
        from models import Client, Boat
        
        owner = Client(
            name="Boat Owner",
            document="12345678900",
            email="owner@example.com",
            tenant_id=test_tenant.id
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        
        boat = Boat(
            name="Specific Boat",
            model="Specific Model",
            hull_id="SPEC-001",    # ✅ CORRIGIDO
            client_id=owner.id,    # ✅ CORRIGIDO
            tenant_id=test_tenant.id
        )
        db.add(boat)
        db.commit()
        db.refresh(boat)
        
        response = client.get(f"/api/boats/{boat.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Specific Boat"
    
    def test_update_boat(self, client: TestClient, auth_headers, test_tenant, db):
        """Test updating a boat"""
        from models import Client, Boat
        
        owner = Client(
            name="Boat Owner",
            document="12345678900",
            email="owner@example.com",
            tenant_id=test_tenant.id
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        
        boat = Boat(
            name="Original Boat",
            model="Original Model",
            hull_id="ORIG-123",
            client_id=owner.id,
            tenant_id=test_tenant.id
        )
        db.add(boat)
        db.commit()
        db.refresh(boat)
        
        update_data = {
            "name": "Updated Boat",
            "model": "Updated Model"
        }
        
        response = client.put(
            f"/api/boats/{boat.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["model"] == "Updated Model"
        assert data["name"] == "Updated Boat"
    
    def test_unauthorized_access(self, client: TestClient):
        """Test accessing boats without authentication"""
        response = client.get("/api/boats")
        
        assert response.status_code == 401
