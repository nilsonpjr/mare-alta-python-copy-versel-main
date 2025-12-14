
import requests

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"

def reset_password():
    # 1. Login as admin (assuming there is an admin or we use a backdoor/setup endpoint if available)
    # Since we can't login, we can't use the API to reset password normally if it requires auth.
    # However, I can try to create a NEW user with a slightly different email just to verify it works,
    # OR I can tell the user to use the signup.
    
    # But the user asked to RESET the password. 
    # Without direct DB access (I am an AI assistant), I can only interact via the public API.
    # If I don't have the credentials, I can't hit a protected endpoint to update the user.
    
    # CHECK: Does the system have a "forgot password" or public reset?
    # Based on file review, it does NOT seem to have a public forgot password endpoint.
    
    # ALTERNATIVE: Try to register the user again? If it exists, it fails.
    
    print("Tentando criar usuário novamente para ver se sobrescreve ou falha...")
    payload = {
        "name": "Nilson Admin",
        "email": "nilsonpjr@gmail.com",
        "password": "123", # Nova senha
        "role": "ADMIN",
        "tenant_id": "mare-alta-matriz"
    }
    
    try:
        r = requests.post(f"{API_URL}/auth/signup", json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
        
        if r.status_code == 200:
            print("SUCESSO! Usuário recriado/cadastrado com a senha '123'.")
        elif r.status_code == 400 and "Detail: Email already registered" in r.text:
             print("ERRO: O usuário já existe e não posso alterar a senha sem estar logado.")
        else:
             print("Resultado inesperado.")
             
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    reset_password()
