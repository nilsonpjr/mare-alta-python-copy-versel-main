
import requests

API_URL = "https://mare-alta-python-copy-versel.onrender.com/api"
EMAIL = "admin@marealta.com"
SENHA = "123"

# Dados para popular
# Formato: Chave = Fabricante, Valor = [Modelos]
ENGINE_MANUFACTURERS = {
    "Mercury": ["Verado V8", "Verado V10", "Verado V12", "SeaPro", "FourStroke", "ProXS", "Racing", "Diesel", "Mercruiser 4.5L", "Mercruiser 6.2L", "Mercruiser 8.2L"],
    "Yamaha": ["F300", "F350", "V8 XTO", "F150", "F115", "F90"],
    "Volvo Penta": ["D4", "D6", "D11", "D13", "IPS", "V6 Gasoline", "V8 Gasoline"],
    "Yanmar": ["4JH", "6LY", "8LV"]
}

BOAT_MANUFACTURERS = {
    "Focker": ["160", "190 Style", "210", "215", "240", "242", "255", "272", "305", "333"],
    "Schaefer Yachts": ["303", "375", "400", "450", "510", "560", "660", "770"],
    "Azimut": ["50", "56", "62", "70", "80", "Grand 27"],
    "Fibrafort": ["Focker 240", "Focker 255", "Focker 272"],
    "Real Powerboats": ["Class 24", "Class 29", "Top 40", "Top 60"],
    "Triton Yachts": ["300 Sport", "350", "370", "440", "520"],
    "NX Boats": ["250", "270", "290", "340", "400", "50"],
    "Coral": ["26", "28", "30", "34", "46"],
    "Ventura": ["195", "215", "220", "250", "265", "300"],
    "FS Yachts": ["180", "205", "230", "265", "290", "360"],
    "Intermarine": ["42", "55", "60", "66", "80"],
    "Sessa Marine": ["C36", "C40", "C44", "F42", "F48"]
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

    # Helper para criar fabricante e modelos
    def create_manufacturer(name, type_str, models):
        print(f"\n🏷️  Criando {name} ({type_str})...")
        try:
            # POST /manufacturers
            payload = {"name": name, "type": type_str}
            r = session.post(f"{API_URL}/config/manufacturers", json=payload)
            if r.status_code == 200:
                manuf = r.json()
                manuf_id = manuf['id']
                print(f"   ✅ Fabricante criado ID {manuf_id}")
                
                # Criar modelos
                for model_name in models:
                    payload_model = {"name": model_name}
                    rm = session.post(f"{API_URL}/config/manufacturers/{manuf_id}/models", json=payload_model)
                    if rm.status_code == 200:
                        print(f"      - Modelo {model_name} criado.")
                    else:
                        print(f"      ❌ Erro modelo {model_name}: {rm.status_code}")
            elif r.status_code == 422:
                print(f"   ❌ Erro de validação: {r.text}")
            else:
                print(f"   ⚠️ Erro criação: {r.status_code} - {r.text}")
        except Exception as e:
            print(f"   ❌ Exceção: {e}")

    # Criar Motores
    for name, models in ENGINE_MANUFACTURERS.items():
        create_manufacturer(name, "ENGINE", models)
        
    # Criar Barcos
    for name, models in BOAT_MANUFACTURERS.items():
        create_manufacturer(name, "BOAT", models)

if __name__ == "__main__":
    seed_manufacturers()
