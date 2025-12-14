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
