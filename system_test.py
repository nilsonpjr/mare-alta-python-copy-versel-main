
import requests
import json
import time

# Configurações
API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"
EMAIL = "admin@marealta.com"
SENHA = "123"

# Cores para o terminal
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def log(msg, success=True):
    color = GREEN if success else RED
    icon = "✅" if success else "❌"
    print(f"{color}{icon} {msg}{RESET}")

def run_test():
    print(f"{BOLD}--- INICIANDO TESTE SISTÊMICO COMPLETO (BACKEND) ---{RESET}\n")
    session = requests.Session()
    
    # 1. LOGIN
    print(f"{BOLD}1. Autenticação (Login){RESET}")
    try:
        resp = session.post(f"{API_URL}/auth/login", data={"username": EMAIL, "password": SENHA})
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            session.headers.update({"Authorization": f"Bearer {token}"})
            log("Login bem-sucedido.")
        else:
            log(f"Falha no login: {resp.text}", False)
            return
    except Exception as e:
        log(f"Erro de conexão no login: {e}", False)
        return

    # 2. CRIAR CLIENTE
    print(f"\n{BOLD}2. Cadastro de Cliente{RESET}")
    client_id = None
    try:
        payload = {
            "name": "Cliente Teste Automatizado",
            "email": f"teste_{int(time.time())}@exemplo.com",
            "phone": "11999999999",
            "address": "Rua Teste, 100"
        }
        resp = session.post(f"{API_URL}/clients", json=payload)
        if resp.status_code == 200:
            client_data = resp.json()
            client_id = client_data['id']
            log(f"Cliente criado: ID {client_id} - {client_data['name']}")
        else:
            log(f"Falha ao criar cliente: {resp.text}", False)
    except Exception as e:
        log(f"Erro ao criar cliente: {e}", False)

    # 3. CRIAR EMBARCAÇÃO
    print(f"\n{BOLD}3. Cadastro de Embarcação{RESET}")
    boat_id = None
    if client_id:
        try:
            payload = {
                "clientId": client_id, # Backend might expect snake_case 'client_id' or camelCase depending on config
                # Trying camelCase as per Frontend code
                "name": "Lancha Veloz Teste",
                "hullId": "BR-TESTE123",
                "brand": "Focker",
                "model": "240",
                "size": 24,
                "engine": "Mercury 150"
            }
            # Se a API esperar snake_case, o Pydantic com alias generator deve resolver.
            # Se falhar, tentamos snake_case manuais.
            resp = session.post(f"{API_URL}/boats", json=payload)
            if resp.status_code == 200:
                boat_data = resp.json()
                boat_id = boat_data['id']
                log(f"Embarcação criada: ID {boat_id} - {boat_data['name']}")
            else:
                # Tentar snake_case se falhar
                payload_snake = {
                    "client_id": client_id,
                    "name": "Lancha Veloz Teste",
                    "hull_id": "BR-TESTE123",
                    "type": "Lancha", # Extra fields usually required
                    "brand": "Focker",
                    "model": "240",
                    "year": 2024,
                    "usage": "Lazer"
                }
                resp = session.post(f"{API_URL}/boats", json=payload_snake)
                if resp.status_code == 200:
                     boat_data = resp.json()
                     boat_id = boat_data['id']
                     log(f"Embarcação criada (snake_case): ID {boat_id} - {boat_data['name']}")
                else:
                    log(f"Falha ao criar embarcação: {resp.text}", False)
        except Exception as e:
            log(f"Erro ao criar embarcação: {e}", False)

    # 4. CRIAR PEÇA (INVENTÁRIO)
    print(f"\n{BOLD}4. Cadastro de Peça (Estoque){RESET}")
    part_id = None
    try:
        sku = f"SKU-{int(time.time())}"
        payload = {
            "name": "Filtro de Óleo Teste",
            "sku": sku,
            "quantity": 10,
            "cost": 50.0,
            "price": 100.0,
            "minStock": 5,
            "location": "A1",
            "manufacturer": "Mercury"
        }
        resp = session.post(f"{API_URL}/inventory/parts", json=payload)
        if resp.status_code == 200:
            part_data = resp.json()
            part_id = part_data['id']
            log(f"Peça criada: ID {part_id} - {part_data['name']} (SKU: {sku})")
        else:
            log(f"Falha ao criar peça: {resp.text}", False)
    except Exception as e:
        log(f"Erro ao criar peça: {e}", False)

    # 5. SINCRONIZAR PREÇO MERCURY (TESTE DA CORREÇÃO)
    print(f"\n{BOLD}5. Teste de Sincronização Mercury (A Correção){RESET}")
    if part_id:
        try:
            # Esse teste pode falhar se o SKU não for real da Mercury, mas esperamos um 404 ou 200, NÃO um 422.
            # Se for 422, a correção falhou.
            resp = session.post(f"{API_URL}/mercury/sync-price/{part_id}")
            if resp.status_code == 200:
                log("Sincronização executada com sucesso (Peça encontrada).")
            elif resp.status_code == 404:
                log("Sincronização executada: API respondeu 404 (Peça não existe na Mercury), o que é ESPERADO para um SKU fake.", True)
            elif resp.status_code == 422:
                log("FALHA CRÍTICA: API respondeu 422 Unprocessable Content. O ID não foi aceito.", False)
            else:
                log(f"Resposta da API: {resp.status_code} - {resp.text} (OK para teste de conexão)", True)
        except Exception as e:
            log(f"Erro na sincronização: {e}", False)

    # 6. CRIAR ORDEM DE SERVIÇO
    print(f"\n{BOLD}6. Abertura de Ordem de Serviço{RESET}")
    order_id = None
    if client_id and boat_id:
        try:
            payload = {
                "clientId": client_id,
                "boatId": boat_id,
                "description": "Revisão Geral de Teste",
                "status": "ABERTA",
                "priority": "normal"
            }
            resp = session.post(f"{API_URL}/orders", json=payload)
            if resp.status_code == 200:
                order_data = resp.json()
                order_id = order_data['id']
                log(f"Ordem de Serviço criada: ID {order_id} - Status: {order_data['status']}")
            else:
                 # Tentativa snake_case
                payload_snake = {
                    "client_id": client_id,
                    "boat_id": boat_id,
                    "description": "Revisão Geral de Teste",
                    "status": "ABERTA",
                    "priority": "normal"
                }
                resp = session.post(f"{API_URL}/orders", json=payload_snake)
                if resp.status_code == 200:
                    order_data = resp.json()
                    order_id = order_data['id']
                    log(f"Ordem de Serviço criada (snake): ID {order_id} - Status: {order_data['status']}")
                else:
                    log(f"Falha ao criar OS: {resp.text}", False)
        except Exception as e:
            log(f"Erro ao criar OS: {e}", False)

    # 7. VERIFICAR AGENDA (BACKLOG)
    print(f"\n{BOLD}7. Verificação de Integração com Agenda{RESET}")
    try:
        # Busca todas as ordens. A nova deve estar lá.
        resp = session.get(f"{API_URL}/orders")
        if resp.status_code == 200:
            orders = resp.json()
            found = False
            for o in orders:
                if o['id'] == order_id:
                    found = True
                    break
            
            if found:
                log(f"Integração Confirmada: Ordem {order_id} encontrada na lista geral.")
            else:
                log("Falha: Ordem criada não foi encontrada na listagem.", False)
        else:
            log(f"Erro ao buscar ordens: {resp.text}", False)
    except Exception as e:
        log(f"Erro na verificação da agenda: {e}", False)

    print(f"\n{BOLD}--- FIM DO TESTE ---{RESET}")

if __name__ == "__main__":
    run_test()
