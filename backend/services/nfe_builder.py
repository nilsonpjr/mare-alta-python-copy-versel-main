
# backend/services/nfe_builder.py
import os
from datetime import datetime
from uuid import uuid4
import random

def format_date_sefaz(dt):
    """Formata data para padrão SEFAZ: AAAA-MM-DDTHH:MM:SS-03:00"""
    return dt.strftime("%Y-%m-%dT%H:%M:%S") + "-03:00"

class NFeBuilder:
    def __init__(self, invoice_data, company_info, seq_nfe, series_nfe):
        self.data = invoice_data
        self.company = company_info
        self.seq = seq_nfe
        self.series = series_nfe
        self.access_key = self.generate_access_key()
        
    def generate_access_key(self):
        """Gera a Chave de Acesso de 44 dígitos"""
        # Estrutura: UF(2) + AAMM(4) + CNPJ(14) + Mod(2) + Serie(3) + nNF(9) + tpEmis(1) + cNF(8) + DV(1)
        uf = "41" # PR (Hardcoded for MVP, should come from IBGE table)
        aamm = datetime.now().strftime("%y%m")
        cnpj = self.company.cnpj.replace(".", "").replace("/", "").replace("-", "") if self.company.cnpj else "00000000000000"
        mod = "55" # NFe
        serie = f"{self.series:03d}"
        nNM = f"{self.seq:09d}"
        tpEmis = "1" # Normal
        cNF = f"{random.randint(0, 99999999):08d}" # Código numérico aleatório
        
        base_key = f"{uf}{aamm}{cnpj}{mod}{serie}{nNM}{tpEmis}{cNF}"
        dv = self.calculate_dv(base_key)
        
        return f"{base_key}{dv}"

    def calculate_dv(self, key):
        """Cálculo do Dígito Verificador (Módulo 11)"""
        weights = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        soma = 0
        for i, char in enumerate(key):
            soma += int(char) * weights[i]
        
        resto = soma % 11
        if resto == 0 or resto == 1:
            return "0"
        else:
            return str(11 - resto)

    def build_xml(self):
        """Constrói o XML da NFe 4.00"""
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe{self.access_key}" versao="4.00">
        <ide>
            <cUF>41</cUF>
            <cNF>{self.access_key[35:43]}</cNF>
            <natOp>Venda de Mercadoria</natOp>
            <mod>55</mod>
            <serie>{self.series}</serie>
            <nNF>{self.seq}</nNF>
            <dhEmi>{format_date_sefaz(datetime.now())}</dhEmi>
            <tpNF>1</tpNF>
            <idDest>1</idDest>
            <cMunFG>{self.company.city_code if hasattr(self.company, 'city_code') else '4118204'}</cMunFG> <!-- 4118204=Paranaguá, 4106902=Curitiba -->
            <tpImp>1</tpImp>
            <tpEmis>1</tpEmis>
            <cDV>{self.access_key[43]}</cDV>
            <tpAmb>2</tpAmb> <!-- 2=Homologação -->
            <finNFe>1</finNFe>
            <indFinal>1</indFinal>
            <indPres>1</indPres>
            <procEmi>0</procEmi>
            <verProc>MareAlta 1.0</verProc>
        </ide>
        <emit>
            <CNPJ>{self.company.cnpj.replace(".", "").replace("/", "").replace("-", "")}</CNPJ>
            <xNome>{self.company.company_name}</xNome>
            <xFant>{self.company.trade_name}</xFant>
            <enderEmit>
                <xLgr>{self.company.street}</xLgr>
                <nro>{self.company.number}</nro>
                <xBairro>{self.company.neighborhood}</xBairro>
                <cMun>{self.company.city_code if hasattr(self.company, 'city_code') else '4118204'}</cMun>
                <xMun>{self.company.city}</xMun>
                <UF>{self.company.state}</UF>
                <CEP>{self.company.zip_code}</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
            </enderEmit>
            <IE>{self.company.ie}</IE>
            <CRT>{self.company.crt}</CRT>
        </emit>
        <dest>
            <CNPJ>00000000000191</CNPJ> <!-- Destinatário Teste -->
            <xNome>NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL</xNome>
            <enderDest>
                <xLgr>Rua Teste</xLgr>
                <nro>100</nro>
                <xBairro>Centro</xBairro>
                <cMun>4118204</cMun>
                <xMun>Paranaguá</xMun>
                <UF>PR</UF>
                <CEP>83200000</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
            </enderDest>
            <indIEDest>9</indIEDest>
        </dest>
        <det nItem="1">
            <prod>
                <cProd>0001</cProd>
                <cEAN>SEM GTIN</cEAN>
                <xProd>Produto Teste Mare Alta</xProd>
                <NCM>89039900</NCM>
                <CFOP>5102</CFOP>
                <uCom>UN</uCom>
                <qCom>1.0000</qCom>
                <vUnCom>100.00</vUnCom>
                <vProd>100.00</vProd>
                <cEANTrib>SEM GTIN</cEANTrib>
                <uTrib>UN</uTrib>
                <qTrib>1.0000</qTrib>
                <vUnTrib>100.00</vUnTrib>
                <indTot>1</indTot>
            </prod>
            <imposto>
                <vTotTrib>0.00</vTotTrib>
                <ICMS>
                    <ICMSSN102>
                        <orig>0</orig>
                        <CSOSN>102</CSOSN>
                    </ICMSSN102>
                </ICMS>
                <PIS>
                    <PISOutr>
                        <CST>99</CST>
                        <vBC>0.00</vBC>
                        <pPIS>0.00</pPIS>
                        <vPIS>0.00</vPIS>
                    </PISOutr>
                </PIS>
                <COFINS>
                    <COFINSOutr>
                        <CST>99</CST>
                        <vBC>0.00</vBC>
                        <pCOFINS>0.00</pCOFINS>
                        <vCOFINS>0.00</vCOFINS>
                    </COFINSOutr>
                </COFINS>
            </imposto>
        </det>
        <total>
            <ICMSTot>
                <vBC>0.00</vBC>
                <vICMS>0.00</vICMS>
                <vICMSDeson>0.00</vICMSDeson>
                <vFCP>0.00</vFCP>
                <vBCST>0.00</vBCST>
                <vST>0.00</vST>
                <vFCPST>0.00</vFCPST>
                <vFCPSTRet>0.00</vFCPSTRet>
                <vProd>100.00</vProd>
                <vFrete>0.00</vFrete>
                <vSeg>0.00</vSeg>
                <vDesc>0.00</vDesc>
                <vII>0.00</vII>
                <vIPI>0.00</vIPI>
                <vIPIDevol>0.00</vIPIDevol>
                <vPIS>0.00</vPIS>
                <vCOFINS>0.00</vCOFINS>
                <vOutro>0.00</vOutro>
                <vNF>100.00</vNF>
            </ICMSTot>
        </total>
        <transp>
            <modFrete>9</modFrete>
        </transp>
    </infNFe>
</NFe>"""
