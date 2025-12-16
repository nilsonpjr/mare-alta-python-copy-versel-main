
import requests
import time

# Configurações
API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"
EMAIL = "admin@marealta.com"
SENHA = "123"

def test_mercury():
    print("--- TESTE DE CONEXÃO MERCURY API ---")
    session = requests.Session()
    
    # 1. Login
    print("1. Fazendo Login no sistema...")
    try:
        resp = session.post(f"{API_URL}/auth/login", data={"username": EMAIL, "password": SENHA})
        if resp.status_code != 200:
            print(f"❌ Falha no login: {resp.text}")
            return
        token = resp.json().get("access_token") or resp.json().get("accessToken")
        session.headers.update({"Authorization": f"Bearer {token}"})
        print("✅ Login OK.")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return

    # 2. Configurar Credenciais de Teste (Fake)
    # Isso é necessário para o backend tentar abrir o robô.
    # Se não tiver credencial, ele nem tenta.
    print("\n2. Configurando credenciais Mercury de TESTE...")
    try:
        # Primeiro, pegamos os dados atuais da empresa
        r_company = session.get(f"{API_URL}/config/company")
        if r_company.status_code == 200:
            company_data = r_company.json()
            # Atualizamos com credenciais falsas apenas para testar o acesso ao site
            company_data["mercuryUsername"] = "teste_bot_usuario"
            company_data["mercuryPassword"] = "teste_bot_senha"
            
            # PUT para salvar (O backend espera snake_case ou camel? Vamos tentar enviar como veio)
            # O endpoint é /config/company
            r_update = session.put(f"{API_URL}/config/company", json=company_data)
            if r_update.status_code == 200:
                print("✅ Credenciais de teste salvas.")
            else:
                print(f"⚠️ Aviso: Não consegui salvar credenciais ({r_update.status_code}). O teste pode falhar se já não existirem.")
        else:
            print("❌ Não consegui ler dados da empresa.")
    except Exception as e:
        print(f"⚠️ Erro ao configurar: {e}")

    # 3. Testar Busca de Peça (Isso aciona o Robô)
    print("\n3. Disparando busca de peça (SKU: 8M0151115)...")
    print("⏳ Isso pode demorar uns 10-20 segundos enquanto o robô abre o navegador no servidor...")
    
    start_time = time.time()
    try:
        # Endpoint de busca: /api/mercury/search/{item}
        resp = session.get(f"{API_URL}/mercury/search/8M0151115")
        elapsed = time.time() - start_time
        
        print(f"⏱️ Tempo de resposta: {elapsed:.2f}s")
        
        if resp.status_code == 200:
            print("✅ SUCESSO! O robô acessou a Mercury e retornou dados!")
            print(f"Dados: {resp.json()}")
        elif resp.status_code == 400:
            err = resp.json().get("detail", "")
            if "Login falhou" in err or "Credenciais inválidas" in err:
                print(f"✅ SUCESSO PARCIAL! O robô CONECTOU no site da Mercury, mas o login falhou (como esperado com senha fake).")
                print("Isso confirma que a automação está funcionando.")
            elif "Credenciais Mercury não configuradas" in err:
                 print("❌ FALHA: As credenciais não foram salvas.")
            else:
                print(f"❌ Erro 400: {err}")
        elif resp.status_code == 500:
            print(f"❌ ERRO INTERNO (500): O robô quebrou ou o servidor travou. Detalhe: {resp.text}")
        else:
            print(f"Resultado: {resp.status_code} - {resp.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    test_mercury()
