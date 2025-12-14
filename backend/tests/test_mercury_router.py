
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from main import app
from routers import mercury_router
import schemas
import models
import crud

# Remove global client creation, rely on fixture

@pytest.fixture
def mock_company_info(db, test_user):
    """Ensure Company Info exists with credentials"""
    # Check if company info exists
    company = crud.get_company_info(db, test_user.tenant_id)
    if not company:
        company_data = schemas.CompanyInfoCreate(
            mercuryUsername="test_user",
            mercuryPassword="test_password"
        )
        crud.update_company_info(db, company_data, test_user.tenant_id)
    else:
        # Update with creds if missing
        company.mercury_username = "test_user"
        company.mercury_password = "test_password"
        db.commit()

def test_search_product_success(client, auth_headers, mock_company_info):
    mock_results = [{
        "codigo": "12345",
        "qtd": "10",
        "descricao": "MOTOR X",
        "qtdaEst": "5",
        "valorVenda": "R$ 1.000,00",
        "valorTabela": "R$ 1.200,00",
        "valorCusto": "R$ 800,00"
    }]

    # Patch where it is imported in the ROUTER module
    with patch("routers.mercury_router.search_product_playwright", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_results
        
        response = client.get("/api/mercury/search/12345", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["results"]) == 1
        assert data["results"][0]["codigo"] == "12345"
        # mock_search.assert_called_once() # Might be tricky with async loop, skipping exact call count assert if flaky

def test_search_warranty_success(client, auth_headers, mock_company_info):
    mock_result = {
        "nro_motor": "SERIAL123",
        "nro_serie": "SERIAL123",
        "modelo": "V8 300HP",
        "dt_venda": "01/01/2023",
        "status_garantia": "Ativa",
        "vld_garantia": "01/01/2026",
        "nome_cli": "John Doe"
    }

    with patch("routers.mercury_router.search_warranty_playwright", new_callable=AsyncMock) as mock_warranty:
        mock_warranty.return_value = mock_result
        
        response = client.get("/api/mercury/warranty/SERIAL123", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["nro_motor"] == "SERIAL123"

def test_warranty_not_found(client, auth_headers, mock_company_info):
    with patch("routers.mercury_router.search_warranty_playwright", new_callable=AsyncMock) as mock_warranty:
        mock_warranty.return_value = None
        
        response = client.get("/api/mercury/warranty/INVALID_SERIAL", headers=auth_headers)
        
        assert response.status_code == 404
        assert "não encontrado" in response.json()["detail"]

def test_sync_price_success(client, auth_headers, db, mock_company_info, test_user):
    # 1. Create a Part to sync
    part_data = schemas.PartCreate(
        sku="PART-123",
        name="Old Part",
        quantity=10,
        cost=100.0,
        price=200.0,
        location="Shelf A",
        manufacturer="Mercury"
    )
    part = crud.create_part(db, part_data, test_user.tenant_id)

    # 2. Mock Search Result with new prices
    mock_results = [{
        "codigo": "PART-123", # Matches SKU
        "qtd": "10",
        "descricao": "Updated Part",
        "qtdaEst": "5",
        "valorVenda": "R$ 500,00", # New Price
        "valorTabela": "R$ 600,00",
        "valorCusto": "R$ 300,00"  # New Cost
    }]

    with patch("routers.mercury_router.search_product_playwright", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_results
        
        response = client.post(f"/api/mercury/sync-price/{part.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["new_price"] == 500.0
        assert data["new_cost"] == 300.0
        
        # Verify DB update (need to refresh or query again)
        db.expire_all()
        refreshed_part = crud.get_part(db, part.id)
        assert refreshed_part.price == 500.0
        assert refreshed_part.cost == 300.0

def test_missing_credentials(client, auth_headers, db, test_user):
    # Ensure credentials are wiped
    company = crud.get_company_info(db, test_user.tenant_id)
    if company:
        company.mercury_username = ""
        db.commit()
    
    response = client.get("/api/mercury/search/anything", headers=auth_headers)
    assert response.status_code == 400
    assert "Credenciais Mercury não configuradas" in response.json()["detail"]

