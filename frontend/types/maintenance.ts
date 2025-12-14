
export interface MaintenancePart {
    partNumber: string;
    name: string;
    quantity: number;
    unitPrice: number; // Preço unitário base
}

export interface MaintenanceService {
    description: string;
    hours: number; // Tempo estimado em horas
    hourlyRate: number; // Valor da hora técnica
}

export interface MaintenanceKit {
    id: string;
    brand: 'Mercury' | 'Yamaha' | 'Volvo Penta' | 'Mercruiser';
    engineModel: string; // ex: "Verado 300 V8", "Yamaha F150"
    intervalHours: number; // 50, 100, 200, 300...
    description: string; // ex: "Revisão de 100 Horas / Anual"
    parts: MaintenancePart[];
    labor: MaintenanceService[];
    notes?: string;
}

// Helper para calcular total
export const calculateKitTotal = (kit: MaintenanceKit): number => {
    const partsTotal = kit.parts.reduce((acc, part) => acc + (part.quantity * part.unitPrice), 0);
    const laborTotal = kit.labor.reduce((acc, serv) => acc + (serv.hours * serv.hourlyRate), 0);
    return partsTotal + laborTotal;
};
