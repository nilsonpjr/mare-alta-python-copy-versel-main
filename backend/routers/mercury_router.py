"""
Este módulo define as rotas da API para interagir com o Portal Mercury Marine.
Ele permite buscar produtos e obter informações de garantia de motores
ao realizar web scraping do portal.
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
import sys
import os
import requests # Biblioteca para fazer requisições HTTP.
import asyncio # Para rodar funções síncronas em um threadpool.
from bs4 import BeautifulSoup # Biblioteca para parsing de HTML (web scraping).
import re # Módulo para expressões regulares.
import auth
import schemas

# Adiciona o diretório pai (backend) ao sys.path para permitir importações relativas.
# Isso é necessário para importar `services.fiscal_service` de `main.py`.
# Mantido conforme estrutura existente.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(
    prefix="/api/mercury",
    tags=["Mercury"], # Tag para agrupar as rotas do Mercury na documentação.
    responses={404: {"description": "Não encontrado"}}, # Resposta padrão para 404.
)

# --- FUNÇÕES AUXILIARES ---
# Funções para realizar o web scraping e interagir com o portal Mercury.


# --- FUNÇÕES AUXILIARES (PLAYWRIGHT) ---

async def search_product_playwright(item: str, username: str, password: str) -> List[Dict[str, str]]:
    """
    Pesquisa produtos no Portal Mercury Marine usando Playwright.
    Adaptado de nilsonpjr/mercury-automation (pesqpreco_playwright).
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Playwright não instalado. Scraper desativado.")
        return []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Timeout maior para garantir carregamento em conexões lentas ou serverless
        page = await browser.new_page()

        try:
            # --- LOGIN ---
            login_url = "https://portal.mercurymarine.com.br/epdv/epdv001.asp"
            await page.goto(login_url, timeout=60000)
            
            # Tentar identificar frames (logic from automation repo)
            await page.wait_for_load_state(timeout=60000)
            frame = None
            # Tenta encontrar o frame de login
            for f in page.frames:
                try:
                    if await f.query_selector("input[name='sUsuar']"):
                        frame = f
                        break
                except Exception:
                    continue
            
            if frame is None:
                frame = page.main_frame
                
            # Preenche login no frame correto
            await frame.fill("input[name='sUsuar']", username)
            await frame.fill("input[name='sSenha']", password)
            await frame.press("input[name='sSenha']", "Enter")
            await page.wait_for_load_state(timeout=60000)

            # --- BUSCA DE ITEM ---
            # URL direta funciona para busca de preço
            # Usando o ID de pedido que estava no repositório original '11111111111111111'
            url_pesquisa = f"https://portal.mercurymarine.com.br/epdv/epdv002d2.asp?s_nr_pedido_web=11111111111111111&s_nr_tabpre=&s_fm_cod_com=null&s_desc_item={item}"
            print(f"Searching (Playwright): {url_pesquisa}")
            await page.goto(url_pesquisa, timeout=60000)
            await page.wait_for_load_state(timeout=60000)

            # Verificar sem resultados
            content = await page.content()
            if "NoRecords" in content or "Nenhum registro encontrado" in content:
                print(f"Mercury search returned 'NoRecords' for item: {item}")
                return []

            soup = BeautifulSoup(content, "html.parser")
            
            # lógica de parsing (mantida original/repo)
            form_preco_item_web = soup.find("form", id="preco_item_web")
            if not form_preco_item_web:
                return []

            first_table = form_preco_item_web.find("table")
            if not first_table: 
                return []
                
            tbody = first_table.find("tbody")
            if not tbody: 
                return []
                
            tr = tbody.find("tr")
            if not tr: 
                return []
                
            td = tr.find("td")
            if not td: 
                return []
                
            tables_in_td = td.find_all("table")
            data_table = tables_in_td[1] if len(tables_in_td) > 1 else None
            
            if not data_table:
                return []

            linhas = data_table.find_all("tr", class_="Row")
            dados = []
            for linha in linhas:
                colunas = linha.find_all("td")
                # Verificação de colunas conforme repo original
                if len(colunas) >= 8:
                    dados_linha = {
                        "codigo": colunas[1].text.strip(),
                        "qtd": colunas[2].text.strip(),
                        "descricao": colunas[3].text.strip(),
                        "qtdaEst": colunas[4].text.strip(),
                        "valorVenda": colunas[5].text.strip(),
                        "valorTabela": colunas[6].text.strip(),
                        "valorCusto": colunas[7].text.strip(),
                    }
                    dados.append(dados_linha)
            return dados

        except Exception as e:
            print(f"Erro Playwright Search Product: {e}")
            # Em caso de erro, retorna vazio para não quebrar a API
            return []
        finally:
            await browser.close()


async def search_warranty_playwright(nro_motor: str, username: str, password: str) -> Optional[Dict[str, str]]:
    """
    Busca garantia usando Playwright.
    Adaptado de nilsonpjr/mercury-automation (buscar_modelo_motor / consultar_garantia).
    Requer navegação complexa de frames e steps.
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Playwright não instalado. Scraper desativado.")
        return None

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # --- LOGIN (Com Frames) ---
            login_url = "https://portal.mercurymarine.com.br/epdv/epdv001.asp"
            await page.goto(login_url, timeout=60000)
            await page.wait_for_load_state(timeout=60000)
            
            frame = None
            for f in page.frames:
                try:
                    if await f.query_selector("input[name='sUsuar']"):
                        frame = f
                        break
                except Exception:
                    continue
            
            if frame is None:
                frame = page.main_frame
                
            await frame.fill("input[name='sUsuar']", username)
            await frame.fill("input[name='sSenha']", password)
            await frame.press("input[name='sSenha']", "Enter")
            await page.wait_for_load_state(timeout=60000)
            
            # --- VERIFICAR LOGIN ---
            # Esperar um pouco para processar o login
            await page.wait_for_timeout(5000)
            
            # Verificar se ainda estamos no login (erro) ou se mudou
            current_url = page.url
            current_title = await page.title()
            print(f"URL Pós-Login: {current_url}")
            print(f"Título Pós-Login: {current_title}")

            if "epdv001" in current_url and "mensagem" in await page.content():
                 # Tentar capturar mensagem de erro
                 print("Provável falha no login. URL ainda contém epdv001.")
                 # Opcional: tentar ler mensagem de erro da página

            # --- NAVEGAÇÃO DIRETA (OTIMIZADA) ---
            # Evita a navegação complexa de menus que causa timeout
            print("Navegando direto para módulo de garantia...")
            url_warranty_form = "https://portal.mercurymarine.com.br/epdv/ewr010.asp"
            await page.goto(url_warranty_form, timeout=60000)
            await page.wait_for_load_state(timeout=60000)

            # --- PREENCHER SERIAL ---
            print("Aguardando carregamento completo (networkidle)...")
            try:
                await page.wait_for_load_state('networkidle', timeout=10000)
            except Exception:
                print("Warning: Networkidle timeout, continuando...")

            # ID Correto descoberto no debug: warr_cardSearchs_nr_serie
            # Name Correto descoberto no debug: s_nr_serie
            motor_input_selector = "input[name='s_nr_serie']"
            
            motor_frame = None
            
            # Estratégia 1: Tentar encontrar o seletor exato em qualquer frame
            for f in page.frames:
                try:
                    if await f.query_selector(motor_input_selector):
                        motor_frame = f
                        print(f"Alvo encontrado no frame: {f.url}")
                        break
                except: continue

            if not motor_frame:
                 # Se não achou por name, tenta por ID (warr_cardSearchs_nr_serie)
                 motor_input_selector = "#warr_cardSearchs_nr_serie"
                 for f in page.frames:
                    try:
                        if await f.query_selector(motor_input_selector):
                            motor_frame = f
                            print(f"Alvo encontrado por ID no frame: {f.url}")
                            break
                    except: continue

            if not motor_frame:
                print("ERRO CRÍTICO: Input s_nr_serie não encontrado no módulo de garantia.")
                
                # Fallback: Tentar navegar via URL com parâmetro (GET)
                print("Tentando fallback via URL GET...")
                url_warranty_get = f"https://portal.mercurymarine.com.br/epdv/ewr010.asp?s_nr_serie={nro_motor}"
                await page.goto(url_warranty_get, timeout=60000)
            else:
                print(f"Preenchendo {motor_input_selector} no frame escolhido...")
                await motor_frame.fill(motor_input_selector, nro_motor)
                print("Clicando em Pesquisar...")
                
                # Botão descoberto no debug: name='Button_DoSearch', id='warr_cardSearchButton_DoSearch'
                btn_selector = "input[name='Button_DoSearch']"
                
                try:
                    await motor_frame.click(btn_selector, timeout=5000)
                except:
                    print("Botão Button_DoSearch não clicável, tentando submit genérico...")
                    await motor_frame.click("input[type='submit']", timeout=10000)
                
                await page.wait_for_load_state(timeout=60000)

            # --- TRATAR POPUP "ESTOU CIENTE" ---
            # Verificar se apareceu botão "Estou ciente" em algum frame
            for f in page.frames:
                estou = await f.query_selector("input[value='Estou ciente']")
                if estou:
                    await estou.click()
                    await page.wait_for_load_state(timeout=60000)
                    break

            # --- PARSE RESULTADOS ---
            content = await page.content() # Pega conteúdo de tudo (com iframes expandidos se possível ou source)
            # Melhor pegar o frame onde os dados estão
            # O resultado costuma estar num frame principal
            
            soup = BeautifulSoup(content, "html.parser")
            
            # Verificar se encontrou (código original procura string "Modelo do Motor")
            # Minha lógica anterior de procurar tabela row é boa, mas vamos combinar
            
            # Tentar achar linha com "Modelo do Motor" (como no repo original)
            linha_modelo = soup.find("td", string=lambda text: text and "Modelo do Motor" in text)
            
            if not linha_modelo:
                # Tentar lógica anterior minha (busca por classes Row em tabela específica)
                # Fallback
                return None
            
            # Se achou modelo, tenta extrair dados
            # O repo original só retorna modelo. Eu retornava mais dados.
            # Vou tentar extrair tudo que der.
            
            modelo = "Não identificado"
            prox = linha_modelo.find_next_sibling("td")
            if prox:
                modelo = prox.text.strip()
                
            # Tentar extrair Data Venda e Status também se possível
            dt_venda = ""
            status_garantia = ""
            
            linha_venda = soup.find("td", string=lambda text: text and "Data da Venda" in text)
            if linha_venda:
                p_v = linha_venda.find_next_sibling("td")
                if p_v: dt_venda = p_v.text.strip()

            # Retorno estruturado
            return {
                "nro_motor": nro_motor,
                "modelo": modelo,
                "dt_venda": dt_venda,
                "status_garantia": "Consultar Portal", # Scraping complexo pra status exato
                "vld_garantia": "",
                "nome_cli": "", # Cliente fica em outra página (ewr010c.asp), complexo navegar
            }

        except Exception as e:
            print(f"Erro Playwright Warranty: {e}")
            return None
        finally:
            await browser.close()

# --- ENDPOINTS ---

from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
import crud

@router.get("/search/{item}")
async def search_mercury_product(
    item: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    try:
        # Fetch credentials
        company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
        if not company or not company.mercury_username or not company.mercury_password:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credenciais Mercury não configuradas.")

        # Chama a função async diretamente (sem to_thread)
        results = await search_product_playwright(item, company.mercury_username, company.mercury_password)
        return {"status": "success", "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao buscar produto: {str(e)}")

@router.get("/warranty/{serial}")
async def get_engine_warranty(
    serial: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    try:
        # Fetch credentials
        company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
        if not company or not company.mercury_username or not company.mercury_password:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credenciais Mercury não configuradas.")

        # Chama a função async diretamente
        result = await search_warranty_playwright(serial, company.mercury_username, company.mercury_password)
        if result:
            return {"status": "success", "data": result}
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Motor com serial '{serial}' não encontrado.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao buscar garantia: {str(e)}")

# --- HELPER DE PARSING ---
def parse_brl_currency(value_str: str) -> float:
    """Converte string de moeda BRL ('1.234,56') para float (1234.56)."""
    if not value_str:
        return 0.0
    try:
        # Remove caracteres não numéricos exceto , e . (e R$)
        clean_str = value_str.strip().replace("R$", "").strip()
        # Remove pontos de milhar
        clean_str = clean_str.replace(".", "")
        # Troca vírgula decimal por ponto
        clean_str = clean_str.replace(",", ".")
        return float(clean_str)
    except ValueError:
        return 0.0

@router.post("/sync-price/{part_id}")
async def sync_part_price_mercury(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Sincroniza o preço de uma peça específica com o portal Mercury.
    Atualiza Custo e Preço se encontrado.
    """
    from datetime import datetime
    import models
    
    # 1. Fetch credentials
    company = crud.get_company_info(db, tenant_id=current_user.tenant_id)
    if not company or not company.mercury_username or not company.mercury_password:
        raise HTTPException(status_code=400, detail="Credenciais Mercury não configuradas")

    # 2. Buscar a peça
    part = crud.get_part(db, part_id=part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Peça não encontrada")
    
    # 3. Buscar no Portal
    print(f"Sincronizando SKU: {part.sku}")
    try:
        results = await search_product_playwright(part.sku, company.mercury_username, company.mercury_password)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Erro no scraper: {str(e)}")
    
    # 4. Processar Resultados
    matched_data = None
    for item in results:
        item_code = item['codigo'].strip()
        # Comparação flexível mas segura
        if item_code == part.sku or item_code in part.sku or part.sku in item_code:
             matched_data = item
             break
    
    if not matched_data:
        raise HTTPException(status_code=404, detail=f"Produto não encontrado no portal Mercury para SKU {part.sku}")
    
    # 5. Atualizar Preços
    cost = parse_brl_currency(matched_data.get('valorCusto', '0'))
    price = parse_brl_currency(matched_data.get('valorVenda', '0'))
    
    print(f"Atualizando peça {part.id}: Custo {part.cost}->{cost}, Preço {part.price}->{price}")
    
    part_update = schemas.PartUpdate(
        cost=cost,
        price=price
    )
    
    updated_part = crud.update_part(db, part_id, part_update)
    
    updated_part.last_price_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(updated_part)
    
    return {
        "status": "success",
        "part_id": part_id,
        "new_price": price,
        "new_cost": cost,
        "updated_at": updated_part.last_price_updated_at
    }
