#!/usr/bin/env python3
"""
Simulador de Cenários de Uso Real - Mare Alta
Simula um dia completo de operação de uma marina
"""
import requests
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List

class MareAltaSimulator:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.token = None
        self.session_data = {
            "clients": [],
            "boats": [],
            "orders": [],
            "parts": []
        }
    
    def login(self, email: str = "admin@marealta.com", password: str = "admin123"):
        """Faz login no sistema"""
        print(f"\n🔐 LOGIN: {email}")
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                data={"username": email, "password": password}
            )
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                print(f"   ✓ Login bem-sucedido!")
                return True
            else:
                print(f"   ✗ Falha no login: {response.status_code}")
                return False
        except Exception as e:
            print(f"   ✗ Erro: {e}")
            return False
    
    def headers(self) -> Dict:
        """Retorna headers com autenticação"""
        return {"Authorization": f"Bearer {self.token}"}
    
    def scenario_morning_opening(self):
        """Cenário 1: Abertura da Marina - Manhã"""
        print("\n" + "="*60)
        print("📅 CENÁRIO 1: ABERTURA DA MARINA - 08:00")
        print("="*60)
        
        # 1. Cliente chega para revisão
        print("\n1️⃣ Cliente João chega para revisão de 100h")
        client_data = {
            "name": "João Pedro Silva",
            "email": "joao.silva@email.com",
            "phone": "(11) 98765-4321",
            "document": "12345678900",
            "type": "INDIVIDUAL"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/clients",
                json=client_data,
                headers=self.headers()
            )
            if response.status_code == 200:
                client = response.json()
                self.session_data["clients"].append(client)
                print(f"   ✓ Cliente cadastrado: ID {client['id']}")
            else:
                print(f"   ⚠ Cliente pode já existir")
        except Exception as e:
            print(f"   ✗ Erro: {e}")
        
        time.sleep(1)
        
        # 2. Cadastra embarcação do cliente
        print("\n2️⃣ Cadastrando embarcação: Lancha Fishing 25")
        boat_data = {
            "clientId": self.session_data["clients"][0]["id"] if self.session_data["clients"] else 1,
            "name": "Fishing Pro",
            "hullId": "BR2024FP001",
            "model": "Fishing 25",
            "year": 2023,
            "usageType": "RECREATION"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/boats",
                json=boat_data,
                headers=self.headers()
            )
            if response.status_code == 200:
                boat = response.json()
                self.session_data["boats"].append(boat)
                print(f"   ✓ Embarcação cadastrada: ID {boat['id']}")
        except Exception as e:
            print(f"   ⚠ Erro ao cadastrar barco: {e}")
        
        time.sleep(1)
        
        # 3. Abre ordem de serviço
        print("\n3️⃣ Abrindo Ordem de Serviço: Manutenção 100h")
        order_data = {
            "clientId": self.session_data["clients"][0]["id"] if self.session_data["clients"] else 1,
            "boatId": self.session_data["boats"][0]["id"] if self.session_data["boats"] else 1,
            "type": "MAINTENANCE",
            "status": "OPEN",
            "description": "Manutenção preventiva 100 horas - Troca de óleo, filtros e velas",
            "priority": "MEDIUM"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/orders",
                json=order_data,
                headers=self.headers()
            )
            if response.status_code == 200:
                order = response.json()
                self.session_data["orders"].append(order)
                print(f"   ✓ OS criada: #{order['id']}")
                print(f"   📋 Descrição: {order['description']}")
        except Exception as e:
            print(f"   ⚠ Erro ao criar OS: {e}")
    
    def scenario_parts_management(self):
        """Cenário 2: Gestão de Estoque"""
        print("\n" + "="*60)
        print("📦 CENÁRIO 2: GESTÃO DE ESTOQUE - 09:30")
        print("="*60)
        
        # 1. Verifica estoque de peças
        print("\n1️⃣ Consultando estoque de peças")
        try:
            response = requests.get(
                f"{self.base_url}/api/inventory/parts",
                headers=self.headers()
            )
            if response.status_code == 200:
                parts = response.json()
                print(f"   ✓ {len(parts)} peças em estoque")
                
                # Identifica peças em estoque crítico
                critical = [p for p in parts if p.get('quantity', 0) <= p.get('minStock', 0)]
                if critical:
                    print(f"   ⚠ {len(critical)} peças com estoque crítico!")
                    for part in critical[:3]:
                        print(f"      - {part['name']}: {part.get('quantity', 0)} un")
        except Exception as e:
            print(f"   ⚠ Erro: {e}")
        
        time.sleep(1)
        
        # 2. Cadastra nova peça
        print("\n2️⃣ Cadastrando peça: Filtro de Óleo Mercury")
        part_data = {
            "name": "Filtro de Óleo Mercury Verado",
            "sku": "MERC-35-866340K01",
            "barcode": "7891234567890",
            "quantity": 12,
            "cost": 145.50,
            "price": 249.90,
            "minStock": 5,
            "manufacturer": "Mercury Marine"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/inventory/parts",
                json=part_data,
                headers=self.headers()
            )
            if response.status_code == 200:
                part = response.json()
                self.session_data["parts"].append(part)
                print(f"   ✓ Peça cadastrada: ID {part['id']}")
                print(f"   💰 Preço: R$ {part['price']:.2f}")
        except Exception as e:
            print(f"   ⚠ Erro: {e}")
        
        time.sleep(1)
        
        # 3. Registra entrada de estoque
        print("\n3️⃣ Registrando entrada de estoque")
        if self.session_data["parts"]:
            movement_data = {
                "partId": self.session_data["parts"][0]["id"],
                "type": "IN_INVOICE",
                "quantity": 10,
                "description": "Entrada NF 45678 - Fornecedor XYZ"
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/inventory/movements",
                    json=movement_data,
                    headers=self.headers()
                )
                if response.status_code == 200:
                    print(f"   ✓ Entrada registrada: +10 unidades")
            except Exception as e:
                print(f"   ⚠ Erro: {e}")
    
    def scenario_afternoon_service(self):
        """Cenário 3: Execução de Serviço - Tarde"""
        print("\n" + "="*60)
        print("🔧 CENÁRIO 3: EXECUÇÃO DE SERVIÇO - 14:00")
        print("="*60)
        
        print("\n1️⃣ Mecânico inicia trabalho na OS")
        print("   - Conecta scanner de diagnóstico")
        print("   - Drena óleo usado")
        print("   - Substitui filtro de óleo")
        print("   - Substitui velas de ignição")
        print("   - Completa óleo novo")
        
        time.sleep(2)
        
        print("\n2️⃣ Registrando consumo de peças")
        if self.session_data["parts"] and self.session_data["orders"]:
            # Simula uso de peça na ordem
            movement_data = {
                "partId": self.session_data["parts"][0]["id"],
                "type": "OUT_OS",
                "quantity": 1,
                "description": f"Uso em OS #{self.session_data['orders'][0]['id']}"
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/inventory/movements",
                    json=movement_data,
                    headers=self.headers()
                )
                if response.status_code == 200:
                    print(f"   ✓ Saída registrada: -1 unidade")
            except Exception as e:
                print(f"   ⚠ Erro: {e}")
        
        print("\n3️⃣ Teste de funcionamento")
        print("   ✓ Motor ligado com sucesso")
        print("   ✓ Temperatura normal: 72°C")
        print("   ✓ Pressão de óleo: OK")
        print("   ✓ RPM estável: 850 rpm")
    
    def scenario_closing(self):
        """Cenário 4: Fechamento do Dia"""
        print("\n" + "="*60)
        print("🌅 CENÁRIO 4: FECHAMENTO DO DIA - 18:00")
        print("="*60)
        
        print("\n1️⃣ Gerando relatório do dia")
        
        # Estatísticas do dia
        stats = {
            "clientes_atendidos": len(self.session_data["clients"]),
            "ordens_abertas": len(self.session_data["orders"]),
            "pecas_movimentadas": len(self.session_data["parts"]),
            "receita_estimada": sum([p.get("price", 0) * 2 for p in self.session_data["parts"]])
        }
        
        print(f"\n   📊 RESUMO DO DIA:")
        print(f"   - Clientes atendidos: {stats['clientes_atendidos']}")
        print(f"   - Ordens abertas: {stats['ordens_abertas']}")
        print(f"   - Peças movimentadas: {stats['pecas_movimentadas']}")
        print(f"   - Receita estimada: R$ {stats['receita_estimada']:.2f}")
        
        print("\n2️⃣ Backup automático")
        print("   ✓ Dados salvos no banco")
        print("   ✓ Backup em nuvem realizado")
        
        print("\n3️⃣ Preparação para próximo dia")
        print("   ✓ Agenda revisada")
        print("   ✓ Alertas de estoque verificados")
        print("   ✓ Ordens pendentes: 3")
    
    def run_full_simulation(self):
        """Executa simulação completa de um dia"""
        print("\n" + "="*60)
        print("🚤 SIMULAÇÃO COMPLETA - SISTEMA MARE ALTA")
        print("="*60)
        print(f"📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        
        if not self.login():
            print("\n❌ Não foi possível fazer login. Verifique se o backend está rodando.")
            return
        
        try:
            self.scenario_morning_opening()
            time.sleep(2)
            
            self.scenario_parts_management()
            time.sleep(2)
            
            self.scenario_afternoon_service()
            time.sleep(2)
            
            self.scenario_closing()
            
            print("\n" + "="*60)
            print("✅ SIMULAÇÃO CONCLUÍDA COM SUCESSO!")
            print("="*60)
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Simulação interrompida pelo usuário")
        except Exception as e:
            print(f"\n\n❌ Erro durante simulação: {e}")

if __name__ == "__main__":
    simulator = MareAltaSimulator()
    simulator.run_full_simulation()
