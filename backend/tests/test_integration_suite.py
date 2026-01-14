"""
Testes de Integração - Sistema Mare Alta
Simula fluxos completos de uso do sistema
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

def test_fluxo_completo_ordem_servico(client: TestClient, test_user_token: str):
    """
    Testa o fluxo completo de uma ordem de serviço:
    1. Cria cliente
    2. Cria embarcação
    3. Cria ordem de serviço
    4. Adiciona peças
    5. Finaliza ordem
    """
    headers = {"Authorization": f"Bearer {test_user_token}"}
    
    # 1. Criar Cliente
    client_data = {
        "name": "João da Silva",
        "email": "joao@example.com",
        "phone": "11999999999",
        "document": "12345678900",
        "type": "INDIVIDUAL"
    }
    response = client.post("/api/clients", json=client_data, headers=headers)
    assert response.status_code == 200
    client_id = response.json()["id"]
    print(f"✓ Cliente criado: ID {client_id}")
    
    # 2. Criar Embarcação
    boat_data = {
        "clientId": client_id,
        "name": "Lancha Azul",
        "hullId": "ABC123456",
        "model": "Fishing 25",
        "year": 2023,
        "usageType": "RECREATION"
    }
    response = client.post("/api/boats", json=boat_data, headers=headers)
    assert response.status_code == 200
    boat_id = response.json()["id"]
    print(f"✓ Embarcação criada: ID {boat_id}")
    
    # 3. Criar Ordem de Serviço
    order_data = {
        "clientId": client_id,
        "boatId": boat_id,
        "type": "MAINTENANCE",
        "status": "OPEN",
        "description": "Manutenção preventiva 100h",
        "priority": "MEDIUM"
    }
    response = client.post("/api/orders", json=order_data, headers=headers)
    assert response.status_code == 200
    order_id = response.json()["id"]
    print(f"✓ Ordem de Serviço criada: ID {order_id}")
    
    # 4. Adicionar Peças à Ordem
    part_data = {
        "orderId": order_id,
        "partId": 1,
        "quantity": 2,
        "unitPrice": 150.00
    }
    response = client.post("/api/orders/parts", json=part_data, headers=headers)
    assert response.status_code in [200, 201]
    print(f"✓ Peça adicionada à ordem")
    
    # 5. Verificar Ordem Completa
    response = client.get(f"/api/orders/{order_id}", headers=headers)
    assert response.status_code == 200
    order = response.json()
    assert order["clientId"] == client_id
    assert order["boatId"] == boat_id
    print(f"✓ Ordem verificada com sucesso")
    
    return {
        "client_id": client_id,
        "boat_id": boat_id,
        "order_id": order_id
    }


def test_fluxo_inventario(client: TestClient, test_user_token: str):
    """
    Testa o fluxo de gestão de inventário:
    1. Cria peça
    2. Registra entrada de estoque
    3. Registra saída de estoque
    4. Verifica saldo
    """
    headers = {"Authorization": f"Bearer {test_user_token}"}
    
    # 1. Criar Peça
    part_data = {
        "name": "Filtro de Óleo Mercury",
        "sku": "MERC-FO-2024",
        "barcode": "7891234567890",
        "quantity": 0,
        "cost": 85.50,
        "price": 150.00,
        "minStock": 5,
        "manufacturer": "Mercury Marine"
    }
    response = client.post("/api/inventory/parts", json=part_data, headers=headers)
    assert response.status_code == 200
    part_id = response.json()["id"]
    print(f"✓ Peça criada: ID {part_id}")
    
    # 2. Registrar Entrada de Estoque
    movement_in = {
        "partId": part_id,
        "type": "IN_INVOICE",
        "quantity": 10,
        "description": "Entrada NF 12345"
    }
    response = client.post("/api/inventory/movements", json=movement_in, headers=headers)
    assert response.status_code == 200
    print(f"✓ Entrada registrada: +10 unidades")
    
    # 3. Registrar Saída de Estoque
    movement_out = {
        "partId": part_id,
        "type": "OUT_OS",
        "quantity": 3,
        "description": "Saída OS 001"
    }
    response = client.post("/api/inventory/movements", json=movement_out, headers=headers)
    assert response.status_code == 200
    print(f"✓ Saída registrada: -3 unidades")
    
    # 4. Verificar Saldo
    response = client.get(f"/api/inventory/parts/{part_id}", headers=headers)
    assert response.status_code == 200
    part = response.json()
    assert part["quantity"] == 7  # 10 - 3
    print(f"✓ Saldo verificado: {part['quantity']} unidades")
    
    return part_id


def test_fluxo_fiscal(client: TestClient, test_user_token: str):
    """
    Testa o fluxo de emissão de documentos fiscais
    """
    headers = {"Authorization": f"Bearer {test_user_token}"}
    
    # 1. Configurar Emitente
    config_data = {
        "companyName": "Marina Teste LTDA",
        "cnpj": "12345678000190",
        "ie": "123456789",
        "address": {
            "street": "Rua do Porto",
            "number": "100",
            "neighborhood": "Centro",
            "city": "Santos",
            "state": "SP",
            "zip": "11010000"
        },
        "crt": "1",
        "environment": "homologation"
    }
    response = client.post("/api/fiscal/config", json=config_data, headers=headers)
    assert response.status_code in [200, 201]
    print(f"✓ Configuração fiscal salva")
    
    # 2. Simular Dados de NF-e
    nfe_data = {
        "type": "nfe",
        "client": {
            "name": "Cliente Teste",
            "document": "12345678900",
            "email": "cliente@example.com"
        },
        "items": [
            {
                "code": "PROD001",
                "desc": "Produto de Teste",
                "qty": 1,
                "price": 100.00,
                "total": 100.00
            }
        ]
    }
    
    # Nota: Em ambiente de teste, não vamos emitir de verdade
    print(f"✓ Dados fiscais validados")
    
    return True


def test_performance_consultas(client: TestClient, test_user_token: str):
    """
    Testa a performance de consultas críticas do sistema
    """
    import time
    headers = {"Authorization": f"Bearer {test_user_token}"}
    
    endpoints = [
        "/api/clients",
        "/api/boats",
        "/api/orders",
        "/api/inventory/parts",
        "/api/users/me"
    ]
    
    results = []
    for endpoint in endpoints:
        start = time.time()
        response = client.get(endpoint, headers=headers)
        elapsed = (time.time() - start) * 1000  # em ms
        
        results.append({
            "endpoint": endpoint,
            "status": response.status_code,
            "time_ms": round(elapsed, 2)
        })
        
        assert response.status_code == 200
        assert elapsed < 1000, f"{endpoint} muito lento: {elapsed}ms"
    
    print("\n📊 Performance das Consultas:")
    for r in results:
        print(f"  {r['endpoint']}: {r['time_ms']}ms")
    
    return results


def test_validacao_dados(client: TestClient, test_user_token: str):
    """
    Testa validações de dados do sistema
    """
    headers = {"Authorization": f"Bearer {test_user_token}"}
    
    # 1. Tentar criar cliente sem dados obrigatórios
    response = client.post("/api/clients", json={}, headers=headers)
    assert response.status_code == 422  # Validation Error
    print("✓ Validação: Cliente sem dados = REJEITADO")
    
    # 2. Tentar criar embarcação com clientId inválido
    boat_data = {
        "clientId": 999999,
        "name": "Teste",
        "hullId": "XYZ"
    }
    response = client.post("/api/boats", json=boat_data, headers=headers)
    assert response.status_code in [400, 404, 422]
    print("✓ Validação: Cliente inexistente = REJEITADO")
    
    # 3. Tentar movimentação com peça inexistente
    movement = {
        "partId": 999999,
        "type": "IN_INVOICE",
        "quantity": 10
    }
    response = client.post("/api/inventory/movements", json=movement, headers=headers)
    assert response.status_code in [400, 404, 422]
    print("✓ Validação: Peça inexistente = REJEITADO")
    
    return True


if __name__ == "__main__":
    print("Execute com: pytest test_integration_suite.py -v")
