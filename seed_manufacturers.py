
import requests

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"
EMAIL = "admin@marealta.com"
SENHA = "123"

MANUFACTURERS = {
    "engineManufacturers": {
        "Mercury": ["Verado V8", "Verado V10", "Verado V12", "SeaPro", "FourStroke", "ProXS", "Racing", "Diesel", "Mercruiser 4.5L", "Mercruiser 6.2L", "Mercruiser 8.2L"],
        "Yamaha": ["F300", "F350", "V8 XTO", "F150", "F115", "F90"],
        "Volvo Penta": ["D4", "D6", "D11", "D13", "IPS", "V6 Gasoline", "V8 Gasoline"],
        "Yanmar": ["4JH", "6LY", "8LV"]
    },
    "boatManufacturers": [
        "Focker", "Schaefer Yachts", "Azimut", "Fibrafort", "Real Powerboats", 
        "Triton Yachts", "NX Boats", "Coral", "Ventura", "FS Yachts", 
        "Intermarine", "Sessa Marine"
    ]
}

def seed_manufacturers():
    print("--- POPULANDO FABRICANTES E MODELOS ---")
    session = requests.Session()
    
    # 1. Login
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

    # 2. Enviar Config
    # O endpoint /config espera um SystemConfig.
    # Baseado no frontend, parece ser um objeto SystemConfig.
    # Mas como o backend implementa isso? 
    # Vou assumir que o backend tem um endpoint para salvar essa config ou criar marcas.
    # Se não tiver endpoint específico de config JSON, teria que criar marcas uma a uma?
    # Olhando os arquivos anteriores, não vi router de "manufacturers".
    # Mas vi system_config na tabela.
    
    # Tentativa A: Salvar objeto JSON inteiro em /config (se existir)
    # Tentativa B: Se a estrutura de config mudou (agora no DB), talvez backend precise de update.
    
    # Vou tentar salvar no endpoint /config (geral) ou /config/system
    
    # Vamos adaptar para o formato que vi no types.ts (engineManufacturers é Dict, boatManufacturers sumiu?).
    # Se boatManufacturers não existe no types.ts, talvez o backend não suporte mais?
    # Mas o usuário precisa cadastrar BARCO.
    # Eu vou enviar AMBOS, se o backend ignorar, ok.
    
    payload = {
        "engineManufacturers": MANUFACTURERS["engineManufacturers"],
        # Se o backend aceitar extra fields:
        "boatManufacturers": MANUFACTURERS["boatManufacturers"]
    }
    
    # Tentar PUT /config
    # Ou PUT /config/system
    endpoints = ["/config", "/config/system", "/system/config"]
    
    success = False
    for ep in endpoints:
        print(f"Tentando PUT {ep}...")
        try:
            r = session.put(f"{API_URL}{ep}", json=payload)
            if r.status_code == 200:
                print(f"✅ Configuração salva com sucesso em {ep}!")
                success = True
                break
            elif r.status_code == 422:
                print(f"⚠️ 422 em {ep} (Schema incorreto?)")
                print(r.text)
            else:
                 print(f"⚠️ {r.status_code} em {ep}")
        except:
            pass
            
    if not success:
        print("❌ Não foi possível salvar configuração. O endpoint pode ser diferente.")
        print("Tentando buscar a config atual para ver o formato...")
        try:
            r = session.get(f"{API_URL}/config")
            print(r.text)
        except:
            pass

if __name__ == "__main__":
    seed_manufacturers()
