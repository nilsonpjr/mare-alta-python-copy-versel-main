
import requests
import json

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"

def signup_user():
    print("Tentando cadastrar empresa e usuário admin...")
    
    # oi Payload ajustado para o schema TenantSignup
    payload = {
        "companyName": "Mare Alta Matriz",
        "cnpj": "00000000000100", # CNPJ Fictício para passar validação
        "adminName": "Nilson Admin",
        "adminEmail": "nilsonpjr@gmail.com",
        "adminPassword": "123", # A nova senha que queremos
        "phone": "11999999999"
    }
    
    try:
        print(f"Enviando payload para {API_URL}/auth/signup")
        r = requests.post(f"{API_URL}/auth/signup", json=payload)
        
        print(f"Status: {r.status_code}")
        
        if r.status_code == 200:
            print("---------------------------------------------------")
            print("SUCESSO! Conta criada com senha '123'.")
            print("Faça login agora com: nilsonpjr@gmail.com / 123")
            print("---------------------------------------------------")
        elif r.status_code == 400:
            print(f"ERRO: {r.text}")
            if "Email already registered" in r.text or "já cadastrado" in r.text:
                print("\nCONCLUSÃO: O email já existe no banco.")
                print("Como não temos acesso ao banco, tente cadastrar um NOVO email")
                print("para ter acesso de admin instantâneo. Ex: nilson2@gmail.com")
        else:
             print(f"Erro inesperado: {r.text}")
             
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    signup_user()
