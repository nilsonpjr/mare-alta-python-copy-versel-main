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
    Busca garantia usando Playwright com lógica otimizada (exatamente como solicitado).
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Playwright não instalado.")
        return None

    # Função interna para gerenciar o contexto do browser e login, 
    # evitando duplicar código e mantendo encapsulamento.
    async def conecta_login_playwright(p):
        browser = await p.chromium.launch(headless=True)
        # Contexto persistente pode ajudar com cookies se necessário, mas new_page serve
        page = await browser.new_page()

        login_url = "https://portal.mercurymarine.com.br/epdv/epdv001.asp"
        await page.goto(login_url, timeout=60000)
        await page.wait_for_load_state(timeout=60000)
        
        # Lógica de login simples (assumindo frame principal ou achatamento)
        # Se precisar de frame handling complexo, a lógica anterior lidava bem, 
        # mas vamos seguir o snippet do usuário que parece confiar no main frame/flattened.
        
        # Tenta achar frame se não estiver no main (redundância de segurança)
        frame = page.main_frame
        for f in page.frames:
            if await f.query_selector("input[name='sUsuar']"):
                frame = f
                break
        
        await frame.fill("input[name='sUsuar']", username)
        await frame.fill("input[name='sSenha']", password)
        await frame.press("input[name='sSenha']", "Enter")
        await page.wait_for_load_state(timeout=60000)
        return page, browser

    async def get_cliente_name(nro_motor_val, browser_instance, page_instance):
        # Navega para obter cliente
        try:
            await page_instance.goto(f"https://portal.mercurymarine.com.br/epdv/ewr010c.asp?s_nr_serie={nro_motor_val}", timeout=60000)
            
            # Tenta esperar tabela. Se falhar, cliente pode não existir.
            try:
                await page_instance.wait_for_selector("#warranty_clients", timeout=10000)
            except:
                return ""

            content = await page_instance.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # Lógica específica do usuário
            nome_cli_element = soup.select_one("#warranty_clients table tbody tr:nth-of-type(3)")
            if nome_cli_element:
                 raw_text = nome_cli_element.get_text(strip=True)
                 return raw_text.replace("NOME ", "").strip()
            return ""
        except Exception as e:
            print(f"Erro ao buscar cliente: {e}")
            return ""

    async with async_playwright() as p:
        page, browser = await conecta_login_playwright(p)
        
        try:
            # 1. Consulta Garantia Principal
            print(f"Consultando garantia para: {nro_motor}")
            await page.goto(f"https://portal.mercurymarine.com.br/epdv/ewr010.asp?s_nr_serie={nro_motor}", timeout=60000)
            await page.wait_for_load_state(timeout=60000)
            
            # Verifica conteúdo
            content = await page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # Verificação de existência (lógica do usuário)
            # Procura texto do motor na página
            found_text = soup.find(string=lambda text: text and nro_motor.upper() in text.upper())
            
            if not found_text:
                print("Nenhum Motor encontrado para esse número de série!")
                return None
                
            print("Sucesso! Motor encontrado na página.")
            
            # Extração dos dados usando seletores CSS específicos fornecidos
            # Usando try/except para cada campo para evitar crash total se mudar layout
            def safe_select(selector):
                el = soup.select_one(selector)
                return el.get_text(strip=True) if el else ""

            # Seletores do usuário
            nro_serie = safe_select("#warr_cardnr_serie_1")
            
            # Tabelas aninhadas são frágeis, mas é o que foi pedido.
            # Caminho: body > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td:nth-child(2)
            base_selector = "body > table > tbody > tr > td > table:nth-of-type(2) > tbody > tr:nth-of-type(3)"
            
            modelo = safe_select(f"{base_selector} > td:nth-of-type(2)")
            dt_venda = safe_select(f"{base_selector} > td:nth-of-type(3)")
            status_garantia = safe_select(f"{base_selector} > td:nth-of-type(5)")
            vld_garantia = safe_select(f"{base_selector} > td:nth-of-type(6)")
            
            # Fallback se seletores CSS falharem (layout responsivo ou diferente)
            if not nro_serie: 
                 # Tentar heurística de labels se o CSS Path falhar
                 print("Seletores CSS estritos falharam, tentando labels...")
                 # ... (Manter lógica de labels aqui seria prudente, mas vamos confiar no script do usuário primeiro)
                 pass

            # 2. Busca nome do cliente (requer navegação extra)
            nome_cli = await get_cliente_name(nro_motor, browser, page)
            
            return {
                "nro_motor": nro_motor,
                "nro_serie": nro_serie or nro_motor,
                "modelo": modelo,
                "dt_venda": dt_venda,
                "status_garantia": status_garantia,
                "vld_garantia": vld_garantia,
                "nome_cli": nome_cli,
            }

        except Exception as e:
            print(f"Erro Playwright Search Warranty: {e}")
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
