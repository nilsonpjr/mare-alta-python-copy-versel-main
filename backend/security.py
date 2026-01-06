
import os
import base64
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# Tenta carregar a chave de encriptação do ambiente ou gera uma nova (inseguro para persistência se não salvo)
# Em produção, ENCRYPTION_KEY DEVE estar no .env
_key = os.getenv("ENCRYPTION_KEY")

if not _key:
    # Se não houver chave, usamos um fallback derivado da SECRET_KEY (para não quebrar em dev),
    # mas o ideal é ter uma chave Fernet válida gerada com Fernet.generate_key()
    # Aviso: Isso é um fallback. Produção deve ter ENCRYPTION_KEY.
    print("WARNING: ENCRYPTION_KEY not found. Using fallback based on SECRET_KEY (Not recommended for production rotation).")
    secret = os.getenv("SECRET_KEY", "your-secret-key-change-this")
    # Ajusta para 32 bytes url-safe base64 para o Fernet
    # Simplesmente fazendo um hash ou padding
    import hashlib
    raw_key = hashlib.sha256(secret.encode()).digest()
    _key = base64.urlsafe_b64encode(raw_key).decode()

try:
    cipher_suite = Fernet(_key)
except Exception as e:
    print(f"CRITICAL SECURITY ERROR: Invalid ENCRYPTION_KEY. {e}")
    # Fallback de emergência (não criptografa) - OU falha
    cipher_suite = None

def encrypt_value(value: str) -> str:
    """Criptografa uma string. Retorna formato: 'enc:<ciphertext>'"""
    if not value:
        return value
    if value.startswith("enc:"): # Já encriptado
        return value
        
    if not cipher_suite:
        return value # Fail-open (dangerous) or Raise error? Por enquanto retorna raw.

    try:
        encrypted_bytes = cipher_suite.encrypt(value.encode("utf-8"))
        return f"enc:{encrypted_bytes.decode('utf-8')}"
    except Exception as e:
        print(f"Encryption failed: {e}")
        return value

def decrypt_value(value: str) -> str:
    """Descriptografa uma string se ela começar com 'enc:'"""
    if not value or not value.startswith("enc:"):
        return value
    
    if not cipher_suite:
        return value
        
    try:
        ciphertext = value.split("enc:", 1)[1]
        decrypted_bytes = cipher_suite.decrypt(ciphertext.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        print(f"Decryption failed for value: {e}")
        return "" # Retorna vazio em falha para não quebrar fluxo, ou lidar com erro
