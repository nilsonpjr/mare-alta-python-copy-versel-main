import { MaintenanceKit } from '../types/maintenance';

export const INITIAL_MAINTENANCE_KITS: MaintenanceKit[] = [
    {
        id: 'mercury-v8-100h',
        brand: 'Mercury',
        engineModel: 'Verado V8 250/300',
        intervalHours: 100,
        description: 'Revisão de 100 Horas ou 1 Ano (O que ocorrer primeiro)',
        parts: [
            { partNumber: '8M0123456', name: 'Filtro de Óleo Mercury Verado', quantity: 1, unitPrice: 120.00 },
            { partNumber: '92-858037K01', name: 'Óleo Motor 25W40 (Quart)', quantity: 8, unitPrice: 85.00 },
            { partNumber: '8M0000001', name: 'Filtro de Combustível Baixa Pressão', quantity: 1, unitPrice: 150.00 },
            { partNumber: '8M0000002', name: 'Kit Anodos Rabeta', quantity: 1, unitPrice: 450.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Troca de Óleo e Filtros', hours: 1.5, hourlyRate: 250.00 },
            { description: 'Inspeção Computadorizada (Scanner CDS)', hours: 0.5, hourlyRate: 250.00 },
            { description: 'Lubrificação Geral e Inspeção de Anodos', hours: 1.0, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'mercury-v8-300h',
        brand: 'Mercury',
        engineModel: 'Verado V8 250/300',
        intervalHours: 300,
        description: 'Revisão de 300 Horas ou 3 Anos',
        parts: [
            { partNumber: '8M0123456', name: 'Filtro de Óleo Mercury Verado', quantity: 1, unitPrice: 120.00 },
            { partNumber: '92-858037K01', name: 'Óleo Motor 25W40 (Quart)', quantity: 8, unitPrice: 85.00 },
            { partNumber: '8M0000001', name: 'Filtro de Combustível Baixa Pressão', quantity: 1, unitPrice: 150.00 },
            { partNumber: '8M0000002', name: 'Kit Anodos Rabeta', quantity: 1, unitPrice: 450.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '8M0000123', name: 'Velas de Ignição Iridium', quantity: 8, unitPrice: 180.00 },
            { partNumber: '8M0000456', name: 'Kit Reparo Bomba D\'água', quantity: 1, unitPrice: 380.00 },
            { partNumber: '8M0000789', name: 'Correia do Alternador', quantity: 1, unitPrice: 420.00 },
        ],
        labor: [
            { description: 'Revisão Completa 300h (Óleos, Filtros, Velas, Rotor)', hours: 5.0, hourlyRate: 250.00 },
            { description: 'Teste de Rodagem', hours: 1.0, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'yamaha-f300-100h',
        brand: 'Yamaha',
        engineModel: 'F300 V6',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - Yamaha',
        parts: [
            { partNumber: '69J-13440-03', name: 'Filtro de Óleo Yamaha', quantity: 1, unitPrice: 140.00 },
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30', quantity: 7, unitPrice: 90.00 },
            { partNumber: '6P2-WS24A-01', name: 'Elemento Filtro Combustível', quantity: 1, unitPrice: 180.00 },
            { partNumber: '90430-08003', name: 'Gaxeta Dreno Óleo', quantity: 1, unitPrice: 15.00 },
        ],
        labor: [
            { description: 'Serviço de Revisão 100h Yamaha', hours: 2.5, hourlyRate: 250.00 },
        ]
    },

    // --- PORTÁTEIS (FOURSTROKE PEQUENOS) ---
    {
        id: 'mercury-portable-50h',
        brand: 'Mercury',
        engineModel: 'FourStroke 3.5-9.9 HP',
        intervalHours: 50,
        description: 'Revisão de 50 Horas ou Anual - Portáteis',
        parts: [
            { partNumber: '8M0071840', name: 'Óleo Motor 10W-30 (Quart)', quantity: 2, unitPrice: 65.00 },
            { partNumber: '8M0065104', name: 'Filtro de Óleo Pequeno', quantity: 1, unitPrice: 85.00 },
            { partNumber: '35-879885T', name: 'Vela de Ignição NGK', quantity: 1, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Troca de Óleo e Filtro', hours: 0.5, hourlyRate: 200.00 },
            { description: 'Inspeção Geral', hours: 0.5, hourlyRate: 200.00 },
        ]
    },
    {
        id: 'mercury-portable-100h',
        brand: 'Mercury',
        engineModel: 'FourStroke 3.5-9.9 HP',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - Portáteis',
        parts: [
            { partNumber: '8M0071840', name: 'Óleo Motor 10W-30 (Quart)', quantity: 2, unitPrice: 65.00 },
            { partNumber: '8M0065104', name: 'Filtro de Óleo Pequeno', quantity: 1, unitPrice: 85.00 },
            { partNumber: '35-879885T', name: 'Vela de Ignição NGK', quantity: 1, unitPrice: 45.00 },
            { partNumber: '8M0100633', name: 'Óleo de Rabeta SAE 90', quantity: 1, unitPrice: 85.00 },
        ],
        labor: [
            { description: 'Revisão Completa Motor Portátil', hours: 1.5, hourlyRate: 200.00 },
        ]
    },

    // --- MERCRUISER 4.5L V6 ---
    {
        id: 'mercruiser-45-100h',
        brand: 'Mercruiser',
        engineModel: 'MerCruiser 4.5L V6 (200/250 HP)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - MerCruiser 4.5L',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 6, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo MerCruiser', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-60494A1', name: 'Filtro de Combustível', quantity: 1, unitPrice: 130.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Troca de Óleo e Filtros', hours: 1.5, hourlyRate: 250.00 },
            { description: 'Inspeção de Rabeta e Trim', hours: 1.0, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'mercruiser-45-300h',
        brand: 'Mercruiser',
        engineModel: 'MerCruiser 4.5L V6 (200/250 HP)',
        intervalHours: 300,
        description: 'Revisão de 300 Horas - MerCruiser 4.5L',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 6, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo MerCruiser', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-60494A1', name: 'Filtro de Combustível', quantity: 1, unitPrice: 130.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '8M0105237', name: 'Velas de Ignição NGK (Jogo)', quantity: 6, unitPrice: 95.00 },
            { partNumber: '8M0100526', name: 'Kit Reparo Bomba D\'água', quantity: 1, unitPrice: 320.00 },
        ],
        labor: [
            { description: 'Revisão Completa 300h (Rotor, Velas)', hours: 4.0, hourlyRate: 250.00 },
            { description: 'Teste de Rodagem', hours: 1.0, hourlyRate: 250.00 },
        ]
    },

    // --- MERCRUISER 6.2L V8 ---
    {
        id: 'mercruiser-62-100h',
        brand: 'Mercruiser',
        engineModel: 'MerCruiser 6.2L V8 (300/350 HP)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - MerCruiser 6.2L',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 8, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo MerCruiser', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-60494A1', name: 'Filtro de Combustível', quantity: 1, unitPrice: 130.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Troca de Óleo e Filtros V8', hours: 2.0, hourlyRate: 250.00 },
            { description: 'Inspeção Computadorizada', hours: 0.5, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'mercruiser-62-300h',
        brand: 'Mercruiser',
        engineModel: 'MerCruiser 6.2L V8 (300/350 HP)',
        intervalHours: 300,
        description: 'Revisão de 300 Horas - MerCruiser 6.2L',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 8, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo MerCruiser', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-60494A1', name: 'Filtro de Combustível', quantity: 1, unitPrice: 130.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '8M0105237', name: 'Velas de Ignição IGX (Jogo)', quantity: 8, unitPrice: 110.00 },
            { partNumber: '8M0100526', name: 'Kit Reparo Bomba D\'água', quantity: 1, unitPrice: 380.00 },
            { partNumber: '8M0100456', name: 'Correia do Alternador', quantity: 1, unitPrice: 450.00 },
        ],
        labor: [
            { description: 'Revisão Completa 300h V8', hours: 5.0, hourlyRate: 250.00 },
            { description: 'Teste de Rodagem', hours: 1.0, hourlyRate: 250.00 },
        ]
    },

    // --- MERCURY DIESEL 3.0L ---
    {
        id: 'diesel-30-100h',
        brand: 'Mercury',
        engineModel: 'Mercury Diesel 3.0L (150-270 HP)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - Diesel 3.0L',
        parts: [
            { partNumber: '8M0123456', name: 'Óleo Diesel 15W-40 (Quart)', quantity: 7, unitPrice: 75.00 },
            { partNumber: '35-8M0065104', name: 'Filtro de Óleo Diesel', quantity: 1, unitPrice: 140.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível Primário', quantity: 1, unitPrice: 180.00 },
            { partNumber: '8M0059688', name: 'Filtro de Combustível Secundário', quantity: 1, unitPrice: 180.00 },
        ],
        labor: [
            { description: 'Troca de Óleo e Filtros Diesel', hours: 2.0, hourlyRate: 280.00 },
            { description: 'Sangria de Combustível', hours: 0.5, hourlyRate: 280.00 },
        ]
    },
    {
        id: 'diesel-30-500h',
        brand: 'Mercury',
        engineModel: 'Mercury Diesel 3.0L (150-270 HP)',
        intervalHours: 500,
        description: 'Revisão de 500 Horas - Diesel 3.0L',
        parts: [
            { partNumber: '8M0123456', name: 'Óleo Diesel 15W-40 (Quart)', quantity: 7, unitPrice: 75.00 },
            { partNumber: '35-8M0065104', name: 'Filtro de Óleo Diesel', quantity: 1, unitPrice: 140.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível Primário', quantity: 1, unitPrice: 180.00 },
            { partNumber: '8M0059688', name: 'Filtro de Combustível Secundário', quantity: 1, unitPrice: 180.00 },
            { partNumber: '8M0100789', name: 'Kit Reparo Bomba D\'água Diesel', quantity: 1, unitPrice: 520.00 },
            { partNumber: '8M0100790', name: 'Correia Poly-V', quantity: 1, unitPrice: 380.00 },
        ],
        labor: [
            { description: 'Revisão Completa Diesel 500h', hours: 6.0, hourlyRate: 280.00 },
            { description: 'Teste de Rodagem e Diagnóstico', hours: 1.5, hourlyRate: 280.00 },
        ]
    },

    // YAMAHA F300 already exists above

    // --- MERCURY SEAPRO (USO COMERCIAL - INTERVALOS ESTENDIDOS) ---
    {
        id: 'seapro-150-500h',
        brand: 'Mercury',
        engineModel: 'SeaPro 150 HP (Comercial)',
        intervalHours: 500,
        description: 'Revisão de 500 Horas - SeaPro Comercial',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 7, unitPrice: 85.00 },
            { partNumber: '8M0065104', name: 'Filtro de Óleo SeaPro', quantity: 1, unitPrice: 120.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível', quantity: 1, unitPrice: 150.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: 'ANODO-KIT-V6', name: 'Kit Anodos Comercial', quantity: 1, unitPrice: 350.00 },
        ],
        labor: [
            { description: 'Revisão SeaPro 500h (Uso Comercial)', hours: 3.0, hourlyRate: 250.00 },
            { description: 'Inspeção Reforçada e Scanner', hours: 1.0, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'seapro-150-1000h',
        brand: 'Mercury',
        engineModel: 'SeaPro 150 HP (Comercial)',
        intervalHours: 1000,
        description: 'Revisão de 1000 Horas - SeaPro (Garantia Comercial)',
        parts: [
            { partNumber: '8M0078630', name: 'Óleo Motor 25W-40 (Quart)', quantity: 7, unitPrice: 85.00 },
            { partNumber: '8M0065104', name: 'Filtro de Óleo SeaPro', quantity: 1, unitPrice: 120.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível', quantity: 1, unitPrice: 150.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: 'NGK-IZFR5G', name: 'Velas de Ignição Iridium', quantity: 6, unitPrice: 150.00 },
            { partNumber: 'ANODO-KIT-V6', name: 'Kit Anodos Comercial', quantity: 1, unitPrice: 350.00 },
            { partNumber: '8M0100526', name: 'Kit Reparo Bomba D\'água', quantity: 1, unitPrice: 380.00 },
            { partNumber: '8M0100456', name: 'Correia do Alternador', quantity: 1, unitPrice: 420.00 },
        ],
        labor: [
            { description: 'Revisão Completa 1000h SeaPro', hours: 6.0, hourlyRate: 250.00 },
            { description: 'Teste de Carga e Diagnóstico Avançado', hours: 2.0, hourlyRate: 250.00 },
        ]
    },

    // --- MERCURY OPTIMAX (2 TEMPOS DE INJEÇÃO DIRETA) ---
    {
        id: 'optimax-200-100h',
        brand: 'Mercury',
        engineModel: 'OptiMax 200-250 HP',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - OptiMax 2T DFI',
        parts: [
            { partNumber: '92-858037K01', name: 'Óleo TCW3 Premium (Quart)', quantity: 4, unitPrice: 95.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível OptiMax', quantity: 1, unitPrice: 180.00 },
            { partNumber: '35-879984T', name: 'Vela de Ignição OptiMax', quantity: 6, unitPrice: 120.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Revisão OptiMax 100h', hours: 2.0, hourlyRate: 280.00 },
            { description: 'Diagnóstico SmartCraft', hours: 0.5, hourlyRate: 280.00 },
        ]
    },
    {
        id: 'optimax-200-300h',
        brand: 'Mercury',
        engineModel: 'OptiMax 200-250 HP',
        intervalHours: 300,
        description: 'Revisão de 300 Horas - OptiMax 2T DFI',
        parts: [
            { partNumber: '92-858037K01', name: 'Óleo TCW3 Premium (Quart)', quantity: 4, unitPrice: 95.00 },
            { partNumber: '8M0059687', name: 'Filtro de Combustível OptiMax', quantity: 1, unitPrice: 180.00 },
            { partNumber: '35-879984T', name: 'Vela de Ignição OptiMax', quantity: 6, unitPrice: 120.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '8M0100789', name: 'Kit Reparo Bomba D\'água OptiMax', quantity: 1, unitPrice: 450.00 },
            { partNumber: 'ANODO-KIT-V6', name: 'Kit Anodos', quantity: 1, unitPrice: 320.00 },
        ],
        labor: [
            { description: 'Revisão Completa 300h OptiMax (Rotor)', hours: 4.5, hourlyRate: 280.00 },
            { description: 'Limpeza Sistema DFI e Teste', hours: 1.5, hourlyRate: 280.00 },
        ]
    },

    // --- OPTIMAX MENORES (75-125 HP) ---
    {
        id: 'optimax-75-125-100h',
        brand: 'Mercury',
        engineModel: 'OptiMax 75-125 HP (1.5L/2.5L)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - OptiMax 3 e 4 Cilindros',
        parts: [
            { partNumber: '92-858038K01', name: 'Óleo DFI/OptiMax (Galão)', quantity: 1, unitPrice: 380.00 },
            { partNumber: '35-18458Q4', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: '35-8M0020349', name: 'Filtro de Combustível Alta Pressão', quantity: 1, unitPrice: 190.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: 'IZFR5J', name: 'Vela de Ignição NGK Iridium', quantity: 3, unitPrice: 140.00 },
        ],
        labor: [
            { description: 'Revisão 100h OptiMax 75-125', hours: 2.0, hourlyRate: 250.00 },
            { description: 'Verificação Compressor de Ar', hours: 0.5, hourlyRate: 250.00 },
        ]
    },

    // --- PORTÁTEIS ESPECÍFICOS ---
    {
        id: 'merc-33-2t-100h',
        brand: 'Mercury',
        engineModel: '3.3 HP TwoStroke',
        intervalHours: 100,
        description: 'Revisão Anual - 3.3 HP 2T',
        parts: [
            { partNumber: '92-858026K01', name: 'Óleo Premium Plus 2T (Quart)', quantity: 1, unitPrice: 65.00 },
            { partNumber: 'BP8H-N-10', name: 'Vela de Ignição NGK', quantity: 1, unitPrice: 35.00 },
            { partNumber: '92-802846Q1', name: 'Óleo de Rabeta Premium (Bisnaga)', quantity: 1, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão Leve 3.3 HP', hours: 1.0, hourlyRate: 180.00 },
        ]
    },
    {
        id: 'merc-15-super-100h',
        brand: 'Mercury',
        engineModel: '15 HP Super TwoStroke',
        intervalHours: 100,
        description: 'Revisão Anual - 15 HP Super 2T',
        parts: [
            { partNumber: '92-858026K01', name: 'Óleo Premium Plus 2T (Quart)', quantity: 1, unitPrice: 65.00 },
            { partNumber: 'BP8H-N-10', name: 'Vela de Ignição NGK', quantity: 2, unitPrice: 35.00 },
            { partNumber: '35-16248', name: 'Filtro de Combustível em Linha', quantity: 1, unitPrice: 40.00 },
            { partNumber: '92-802846Q1', name: 'Óleo de Rabeta Premium (Bisnaga)', quantity: 2, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão Completa 15 HP', hours: 1.5, hourlyRate: 180.00 },
            { description: 'Limpeza de Carburador', hours: 1.0, hourlyRate: 180.00 },
        ]
    },

    // --- MERCRUISER CLÁSSICOS (LEGACY) ---
    {
        id: 'mercruiser-30-100h',
        brand: 'Mercruiser',
        engineModel: '3.0L MPI / TKS (135 HP)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - MerCruiser 3.0L 4-Cil',
        parts: [
            { partNumber: '92-8M0078628', name: 'Óleo Motor 25W-40 (Quart)', quantity: 4, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo Curto', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-802893Q01', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Revisão Básica 3.0L', hours: 2.0, hourlyRate: 220.00 },
        ]
    },
    {
        id: 'mercruiser-v6-legacy-100h',
        brand: 'Mercruiser',
        engineModel: '4.3L V6 MPI (190-220 HP)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - MerCruiser 4.3L V6 Clássico',
        parts: [
            { partNumber: '92-8M0078628', name: 'Óleo Motor 25W-40 (Quart)', quantity: 5, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-802893Q01', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '33-816336Q', name: 'Vela de Ignição AC Delco MR43LTS', quantity: 6, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão V6 MPI', hours: 2.5, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'mercruiser-v8-smallblock-100h',
        brand: 'Mercruiser',
        engineModel: '5.0L / 350 MAG / 377 MAG',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - V8 Small Block (5.0/5.7/6.2 Antigo)',
        parts: [
            { partNumber: '92-8M0078628', name: 'Óleo Motor 25W-40 (Quart)', quantity: 6, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-802893Q01', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
            { partNumber: '805626A03', name: 'Kit Anodos Alpha/Bravo', quantity: 1, unitPrice: 380.00 },
        ],
        labor: [
            { description: 'Revisão V8', hours: 2.5, hourlyRate: 250.00 },
            { description: 'Alinhamento Motor', hours: 0.5, hourlyRate: 250.00 },
        ]
    },
    {
        id: 'mercruiser-496-mag-100h',
        brand: 'Mercruiser',
        engineModel: '496 Magnum / HO (8.1L)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - Big Block 496 MAG',
        parts: [
            { partNumber: '92-8M0078628', name: 'Óleo Motor 25W-40 (Quart)', quantity: 9, unitPrice: 80.00 },
            { partNumber: '35-866340Q03', name: 'Filtro de Óleo', quantity: 1, unitPrice: 110.00 },
            { partNumber: '35-802893Q01', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: '35-884380T', name: 'Filtro de Combustível Cool Fuel', quantity: 1, unitPrice: 280.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Revisão Big Block 496', hours: 3.0, hourlyRate: 300.00 },
        ]
    },

    // --- MERCRUISER ATUAL (8.2L) ---
    {
        id: 'mercruiser-82-mag-100h',
        brand: 'Mercruiser',
        engineModel: '8.2L V8 MAG / HO',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - 8.2L V8',
        parts: [
            { partNumber: '92-8M0078628', name: 'Óleo Motor 25W-40 (Quart)', quantity: 8, unitPrice: 80.00 },
            { partNumber: '35-8M0122423', name: 'Filtro de Óleo V8 Gen 5', quantity: 1, unitPrice: 130.00 },
            { partNumber: '35-8M0060041', name: 'Filtro de Combustível Gen 3', quantity: 1, unitPrice: 220.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Revisão V8 8.2L', hours: 2.5, hourlyRate: 300.00 },
        ]
    },

    // --- DIESEL OUTROS ---
    {
        id: 'diesel-20-100h',
        brand: 'Mercury',
        engineModel: 'Mercury Diesel 2.0L (115-170 HP)',
        intervalHours: 100,
        description: 'Revisão 100h - Diesel 2.0L QSD',
        parts: [
            { partNumber: '92-858042K01', name: 'Óleo Diesel 5W-30 (Quart)', quantity: 6, unitPrice: 120.00 },
            { partNumber: '35-8M0055106', name: 'Filtro de Óleo Diesel 2.0', quantity: 1, unitPrice: 160.00 },
            { partNumber: '35-8M0055008', name: 'Filtro Combustível', quantity: 1, unitPrice: 190.00 },
        ],
        labor: [
            { description: 'Revisão Diesel 2.0L', hours: 2.0, hourlyRate: 280.00 },
        ]
    },
    {
        id: 'diesel-67-100h',
        brand: 'Mercury',
        engineModel: 'Mercury Diesel 6.7L (480-550 HP)',
        intervalHours: 100,
        description: 'Revisão 100h - Diesel 6.7L Zeus',
        parts: [
            { partNumber: '92-8M0096538', name: 'Óleo Diesel 15W-40 Premium (Galão)', quantity: 4, unitPrice: 320.00 },
            { partNumber: '35-8M0101234', name: 'Filtro de Óleo 6.7L', quantity: 1, unitPrice: 250.00 },
            { partNumber: '35-8M0105678', name: 'Filtro Combustível 6.7L', quantity: 1, unitPrice: 280.00 },
            { partNumber: '92-802875Q1', name: 'Óleo Transmissão Zeus', quantity: 2, unitPrice: 450.00 },
        ],
        labor: [
            { description: 'Revisão Diesel Pesado 6.7L', hours: 4.0, hourlyRate: 350.00 },
            { description: 'Inspeção Pod Drive Zeus', hours: 1.5, hourlyRate: 350.00 },
        ]
    },

    // --- MERCURY RACING ---
    {
        id: 'racing-520-50h',
        brand: 'Mercury Racing',
        engineModel: 'Racing 520 / 540 / 600 SCi',
        intervalHours: 50,
        description: 'Troca de Óleo e Inspeção Racing (25h/50h)',
        parts: [
            { partNumber: '92-8M0078021', name: 'Óleo Racing 25W-50 Synthetic (Quart)', quantity: 9, unitPrice: 110.00 },
            { partNumber: '35-8M0062637', name: 'Filtro de Óleo Racing (Alto Fluxo)', quantity: 1, unitPrice: 180.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta XR High Performance', quantity: 2, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Serviço Racing Performance', hours: 3.0, hourlyRate: 400.00 },
            { description: 'Inspeção de Compressão e Leakdown', hours: 2.0, hourlyRate: 400.00 },
        ]
    },

    // --- OPTIMAX V6 2.5L (135-175 HP) ---
    {
        id: 'optimax-135-175-100h',
        brand: 'Mercury',
        engineModel: 'OptiMax 135-175 HP (2.5L V6)',
        intervalHours: 100,
        description: 'Revisão de 100 Horas - OptiMax V6 2.5L',
        parts: [
            { partNumber: '92-858037K01', name: 'Óleo TCW3 Premium (Quart)', quantity: 3, unitPrice: 95.00 },
            { partNumber: '35-18458Q4', name: 'Filtro Separador de Água', quantity: 1, unitPrice: 120.00 },
            { partNumber: 'IZFR5G', name: 'Vela de Ignição NGK Iridium', quantity: 6, unitPrice: 130.00 },
            { partNumber: '92-858064K01', name: 'Óleo de Rabeta High Performance', quantity: 1, unitPrice: 110.00 },
        ],
        labor: [
            { description: 'Revisão 100h OptiMax 135-175', hours: 2.5, hourlyRate: 250.00 },
        ]
    },

    // --- 9.9 HP 2 TEMPOS ---
    {
        id: 'merc-99-2t-100h',
        brand: 'Mercury',
        engineModel: '9.9 HP TwoStroke',
        intervalHours: 100,
        description: 'Revisão Anual - 9.9 HP 2T',
        parts: [
            { partNumber: '92-858026K01', name: 'Óleo Premium Plus 2T (Quart)', quantity: 1, unitPrice: 65.00 },
            { partNumber: 'BP8H-N-10', name: 'Vela de Ignição NGK', quantity: 2, unitPrice: 35.00 },
            { partNumber: '92-802846Q1', name: 'Óleo de Rabeta Premium (Bisnaga)', quantity: 1, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão 9.9 2T', hours: 1.0, hourlyRate: 180.00 },
        ]
    },

    // ==========================================
    // --- YAMAHA FOURSTROKE (4 TEMPOS) ---
    // ==========================================

    // --- PORTÁTEIS (F15 / F20) ---
    {
        id: 'yamaha-f15-f20-100h',
        brand: 'Yamaha',
        engineModel: 'F15 / F20 (4 Tempos)',
        intervalHours: 100,
        description: 'Revisão 100h - Yamaha F15/F20',
        parts: [
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30 (Frasco)', quantity: 2, unitPrice: 65.00 },
            { partNumber: '5GH-13440-71', name: 'Filtro de Óleo Curto', quantity: 1, unitPrice: 85.00 },
            { partNumber: '6D8-WS24A-00', name: 'Elemento Filtro Combustível', quantity: 1, unitPrice: 75.00 },
            { partNumber: '90430-08143', name: 'Gaxeta Dreno Óleo', quantity: 1, unitPrice: 15.00 },
            { partNumber: 'YAM-LUBE-GEAR', name: 'Óleo de Rabeta Yamaha (Bisnaga)', quantity: 1, unitPrice: 55.00 },
        ],
        labor: [
            { description: 'Revisão Básica Portátil 4T', hours: 1.5, hourlyRate: 200.00 },
        ]
    },

    // --- MID-RANGE (F40 / F50 / F60) ---
    {
        id: 'yamaha-f40-f60-100h',
        brand: 'Yamaha',
        engineModel: 'F40 / F50 / F60 (FETL)',
        intervalHours: 100,
        description: 'Revisão 100h - Yamaha F40-F60',
        parts: [
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30 (Frasco)', quantity: 3, unitPrice: 65.00 },
            { partNumber: '5GH-13440-71', name: 'Filtro de Óleo', quantity: 1, unitPrice: 85.00 },
            { partNumber: '6C5-24251-00', name: 'Filtro Combustível', quantity: 1, unitPrice: 95.00 },
            { partNumber: 'YAM-LUBE-GEAR-QT', name: 'Óleo de Rabeta Yamaha (Frasco)', quantity: 1, unitPrice: 120.00 },
            { partNumber: 'DPR6EA-9', name: 'Vela de Ignição NGK', quantity: 4, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão Yamaha 40-60HP', hours: 2.0, hourlyRate: 220.00 },
            { description: 'Verificação Correia Dentada', hours: 0.5, hourlyRate: 220.00 },
        ]
    },

    // --- HIGH POWER (F90 / F115) ---
    {
        id: 'yamaha-f90-f115-100h',
        brand: 'Yamaha',
        engineModel: 'F90 / F115 / F130',
        intervalHours: 100,
        description: 'Revisão 100h - Yamaha F90-F115',
        parts: [
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30 (Frasco)', quantity: 4, unitPrice: 65.00 },
            { partNumber: '5GH-13440-71', name: 'Filtro de Óleo', quantity: 1, unitPrice: 85.00 },
            { partNumber: '68V-24563-00', name: 'Filtro Combustível Copo', quantity: 1, unitPrice: 110.00 },
            { partNumber: 'YAM-LUBE-GEAR-QT', name: 'Óleo de Rabeta Yamaha (Frasco)', quantity: 1, unitPrice: 120.00 },
            { partNumber: 'LFR6A-11', name: 'Vela de Ignição NGK', quantity: 4, unitPrice: 55.00 },
        ],
        labor: [
            { description: 'Revisão Yamaha 90-115HP', hours: 2.5, hourlyRate: 250.00 },
        ]
    },

    // --- F150 (BEST SELLER) ---
    {
        id: 'yamaha-f150-100h',
        brand: 'Yamaha',
        engineModel: 'F150 (2.7L / 2.8L)',
        intervalHours: 100,
        description: 'Revisão 100h - Yamaha F150',
        parts: [
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30 (Frasco)', quantity: 5, unitPrice: 65.00 },
            { partNumber: '69J-13440-03', name: 'Filtro de Óleo Longo', quantity: 1, unitPrice: 140.00 },
            { partNumber: '6P3-WS24A-01', name: 'Filtro Combustível Primário', quantity: 1, unitPrice: 160.00 },
            { partNumber: 'YAM-LUBE-GEAR-QT', name: 'Óleo de Rabeta Yamaha (Frasco)', quantity: 1, unitPrice: 120.00 },
            { partNumber: 'LFR5A-11', name: 'Vela de Ignição NGK', quantity: 4, unitPrice: 55.00 },
            { partNumber: '63P-11325-00', name: 'Anodo Bloco', quantity: 2, unitPrice: 85.00 },
        ],
        labor: [
            { description: 'Revisão Yamaha F150', hours: 3.0, hourlyRate: 250.00 },
            { description: 'Inspeção Eixo Balanceiro', hours: 0.5, hourlyRate: 250.00 },
        ]
    },

    // --- V6 4.2L (F225 / F250 / F300) ---
    {
        id: 'yamaha-v6-42-100h',
        brand: 'Yamaha',
        engineModel: 'F225 / F250 / F300 (4.2L V6)',
        intervalHours: 100,
        description: 'Revisão 100h - Yamaha V6 4.2L Offshore',
        parts: [
            { partNumber: 'YAM-LUBE-4M', name: 'Yamalube 4M 10W-30 (Frasco)', quantity: 7, unitPrice: 65.00 },
            { partNumber: '69J-13440-03', name: 'Filtro de Óleo', quantity: 1, unitPrice: 140.00 },
            { partNumber: '6CB-24563-00', name: 'Filtro Combustível', quantity: 1, unitPrice: 180.00 },
            { partNumber: 'YAM-LUBE-GEAR-QT', name: 'Óleo de Rabeta Yamaha (Frasco)', quantity: 1, unitPrice: 120.00 },
            { partNumber: 'LFR6A-11', name: 'Vela de Ignição NGK', quantity: 6, unitPrice: 55.00 },
            { partNumber: '6CE-45373-00', name: 'Anodo Trim', quantity: 1, unitPrice: 150.00 },
        ],
        labor: [
            { description: 'Revisão V6 Offshore', hours: 3.5, hourlyRate: 250.00 },
            { description: 'Scanner YDIS e Diagnóstico', hours: 1.0, hourlyRate: 250.00 },
        ]
    },

    // ==========================================
    // --- YAMAHA TWO STROKE (2 TEMPOS) ---
    // ==========================================

    {
        id: 'yamaha-15-2t-100h',
        brand: 'Yamaha',
        engineModel: '15 HP 2 Tempos (15FM)',
        intervalHours: 100,
        description: 'Revisão Anual - Yamaha 15 HP 2T',
        parts: [
            { partNumber: 'YAM-LUBE-2T', name: 'Yamalube 2T TC-W3 (Frasco)', quantity: 1, unitPrice: 55.00 },
            { partNumber: 'BR7HS', name: 'Vela de Ignição NGK', quantity: 2, unitPrice: 35.00 },
            { partNumber: 'YAM-LUBE-GEAR', name: 'Óleo de Rabeta Yamaha (Bisnaga)', quantity: 1, unitPrice: 55.00 },
            { partNumber: '90430-08003', name: 'Kit Gaxetas Dreno', quantity: 2, unitPrice: 12.00 },
        ],
        labor: [
            { description: 'Revisão Yamaha 15 2T', hours: 1.0, hourlyRate: 180.00 },
            { description: 'Limpeza Carburador', hours: 1.0, hourlyRate: 180.00 },
        ]
    },
    {
        id: 'yamaha-40-2t-100h',
        brand: 'Yamaha',
        engineModel: '40 HP 2 Tempos (40X / 40AW)',
        intervalHours: 100,
        description: 'Revisão Anual - Yamaha 40hp 2T',
        parts: [
            { partNumber: 'YAM-LUBE-2T', name: 'Yamalube 2T TC-W3 (Frasco)', quantity: 1, unitPrice: 55.00 },
            { partNumber: 'BR7HS-10', name: 'Vela de Ignição NGK', quantity: 2, unitPrice: 35.00 },
            { partNumber: 'YAM-LUBE-GEAR-QT', name: 'Óleo de Rabeta Yamaha (Frasco)', quantity: 1, unitPrice: 120.00 },
            { partNumber: '6F5-24251-00', name: 'Filtro Combustível Copinho', quantity: 1, unitPrice: 45.00 },
        ],
        labor: [
            { description: 'Revisão Yamaha 40 2T', hours: 2.0, hourlyRate: 200.00 },
        ]
    },

    // ==========================================
    // --- YAMAHA VMAX SHO (PERFORMANCE) ---
    // ==========================================

    {
        id: 'yamaha-vmax-150-100h',
        brand: 'Yamaha',
        engineModel: 'VMAX SHO 150 (VF150)',
        intervalHours: 100,
        description: 'Revisão 100h - VMAX SHO 150',
        parts: [
            { partNumber: 'YAM-LUBE-4M-FC', name: 'Yamalube Full Synthetic 5W-30 (Frasco)', quantity: 5, unitPrice: 95.00 },
            { partNumber: '69J-13440-03', name: 'Filtro de Óleo Longo', quantity: 1, unitPrice: 140.00 },
            { partNumber: '6P3-WS24A-01', name: 'Filtro Combustível', quantity: 1, unitPrice: 160.00 },
            { partNumber: 'YAM-LUBE-GEAR-SHO', name: 'Óleo de Rabeta VMAX SHO', quantity: 1, unitPrice: 140.00 },
            { partNumber: 'LFR6A-11', name: 'Vela de Ignição NGK', quantity: 4, unitPrice: 55.00 },
        ],
        labor: [
            { description: 'Revisão VMAX Performance', hours: 3.0, hourlyRate: 300.00 },
        ]
    },
    {
        id: 'yamaha-vmax-250-100h',
        brand: 'Yamaha',
        engineModel: 'VMAX SHO 250 (VF250)',
        intervalHours: 100,
        description: 'Revisão 100h - VMAX SHO 250 V6',
        parts: [
            { partNumber: 'YAM-LUBE-4M-FC', name: 'Yamalube Full Synthetic 5W-30 (Frasco)', quantity: 7, unitPrice: 95.00 },
            { partNumber: '69J-13440-03', name: 'Filtro de Óleo', quantity: 1, unitPrice: 140.00 },
            { partNumber: '6CB-24563-00', name: 'Filtro Combustível', quantity: 1, unitPrice: 180.00 },
            { partNumber: 'YAM-LUBE-GEAR-SHO', name: 'Óleo de Rabeta VMAX SHO', quantity: 1, unitPrice: 140.00 },
            { partNumber: 'LFR6A-11', name: 'Vela de Ignição NGK', quantity: 6, unitPrice: 55.00 },
        ],
        labor: [
            { description: 'Revisão VMAX 250 SHO', hours: 3.5, hourlyRate: 300.00 },
        ]
    }
];

// Warranty Information Reference (based on Mercury official table)
export const WARRANTY_INFO = {
    'Verado V8': { lazer: '3 anos', comercial: '1 ano / 500h' },
    'FourStroke 3.5-9.9 HP': { lazer: '3 anos', comercial: '1 ano / 500h' },
    'MerCruiser 4.5L V6': { lazer: '3 anos', comercial: '1 ano / 500h' },
    'MerCruiser 6.2L V8': { lazer: '3 anos', comercial: '1 ano / 500h' },
    'Mercury Diesel 3.0L': { lazer: '3 anos', comercial: '1 ano / 500h' },
    'SeaPro 150 HP': { lazer: '3 anos', comercial: '2 anos / 1000h' },
    'OptiMax 200-250 HP': { lazer: '2 anos (Racing)', comercial: '-' },
};
