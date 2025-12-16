
import requests

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"

# Credenciais desejadas
COMPANY_NAME = "Mare Alta"
ADMIN_NAME = "Administrador Mare Alta"
EMAIL = "admin@marealta.com"
SENHA = "123"

def create_remote_user():
    print(f"🌍 Conectando em: {API_URL}")
    print(f"👤 Tentando criar usuário: {EMAIL}")

    # Payload para signup
    payload = {
        "company_name": COMPANY_NAME,
        "admin_name": ADMIN_NAME,
        "admin_email": EMAIL,
        "admin_password": SENHA,
        "plan": "PRO" 
    }
    
    try:
        resp = requests.post(f"{API_URL}/auth/signup", json=payload)
        
        if resp.status_code == 200 or resp.status_code == 201:
            print("✅ SUCCESSO! Usuário criado no servidor remoto.")
            print(f"Login: {EMAIL}")
            print(f"Senha: {SENHA}")
        elif resp.status_code == 400:
            print(f"⚠️  Erro 400: {resp.json().get('detail')}")
            print("Isso geralmente significa que o email já existe.")
        else:
            print(f"❌ Erro {resp.status_code}: {resp.text}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")

if __name__ == "__main__":
    create_remote_user()
