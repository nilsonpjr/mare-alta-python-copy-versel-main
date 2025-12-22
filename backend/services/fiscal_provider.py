
# backend/services/fiscal_provider.py
from services.nfe_builder import NFeBuilder
from services.nfse_drivers import CuritibaDriver, ParanaguaDriver

class FiscalProvider:
    def __init__(self, company_info):
        self.company = company_info
        
    def get_builder(self, invoice_type: str, invoice_data: dict, sequence: int):
        """Retorna o Builder correto baseado no tipo de nota e no município da empresa"""
        
        if invoice_type == "NFE":
            # NFe de Produtos usa padrão nacional (SEFAZ)
            return NFeBuilder(invoice_data, self.company, sequence, self.company.series_nfe or 1)
            
        elif invoice_type == "NFSE":
            # NFSe de Serviços depende do município
            city_code = getattr(self.company, 'city_code', '4118204') # Default Paranaguá para MVP
            
            # Normalizar código (pode vir como string ou int)
            city_code = str(city_code)
            
            if city_code == '4106902': # Curitiba
                return CuritibaDriver(invoice_data, self.company, sequence)
                
            elif city_code == '4118204': # Paranaguá
                return ParanaguaDriver(invoice_data, self.company, sequence)
                
            else:
                raise ValueError(f"Município {city_code} não suportado para NFS-e ainda.")
        
        else:
            raise ValueError(f"Tipo de nota desconhecido: {invoice_type}")

    def emit(self, invoice_type: str, invoice_data: dict, sequence: int):
        """Processo completo de emissão (Simulado para MVP Custo Zero)"""
        builder = self.get_builder(invoice_type, invoice_data, sequence)
        
        if invoice_type == "NFE":
            xml = builder.build_xml()
        else:
            xml = builder.build_rps_xml()
            
        # TODO: Passo de Assinatura Digital (SignXML) viria aqui
        # TODO: Passo de Envio SOAP (Zeep ou Requests) viria aqui
            
        return {
            "status": "AUTHORIZED", # Simulado
            "xml": xml,
            "protocol": f"1{sequence:09d}",
            "message": "Nota gerada localmente (Modo Custo Zero)"
        }
