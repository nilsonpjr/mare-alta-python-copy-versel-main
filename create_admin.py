
import requests

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"

def signup_alternate_user():
    print("Tentando cadastrar usuário alternativo admin@marealta.com...")
    
    payload = {
        "companyName": "Mare Alta Admin",
        "cnpj": "99999999000199", 
        "adminName": "Administrador Mare Alta",
        "adminEmail": "admin@marealta.com",
        "adminPassword": "123",
        "phone": "11999998888"
    }
    
    try:
        r = requests.post(f"{API_URL}/auth/signup", json=payload)
        
        if r.status_code == 200:
            print("---------------------------------------------------")
            print("SUCESSO! Use estas credenciais:")
            print("Email: admin@marealta.com")
            print("Senha: 123")
            print("---------------------------------------------------")
        else:
             print(f"Erro: {r.status_code} - {r.text}")
             
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    signup_alternate_user()
