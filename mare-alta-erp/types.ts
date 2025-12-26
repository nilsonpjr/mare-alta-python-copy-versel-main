// Enums for Status Management
export enum OSStatus {
    OPEN = 'OPEN',
    ANALYSIS = 'ANALYSIS',
    APPROVED = 'APPROVED',
    EXECUTION = 'EXECUTION',
    COMPLETED = 'COMPLETED'
}

export enum EngineBrand {
    MERCURY = 'Mercury',
    YAMAHA = 'Yamaha',
    VOLVO = 'Volvo Penta'
}

// Interfaces mirroring the requested SQLAlchemy Schema (Phase 1)
export interface Tenant {
    id: string;
    name: string; // e.g., "Marina Porto Imperial"
    plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface Boat {
    id: string;
    name: string;
    model: string;
    clientId: string;
    engineBrand: EngineBrand;
    engineModel: string;
    engineHours: number;
    lastServiceDate: string;
    imageUrl?: string;
}

export interface Part {
    id: string;
    partNumber: string; // SKU
    name: string;
    brand: EngineBrand;
    costPrice: number;
    sellingPrice: number; // Applied markup
    stockQuantity: number;
}

export interface ServiceKit {
    id: string;
    name: string; // e.g., "Review 100h Verado"
    engineBrand: EngineBrand;
    parts: Part[]; // Simplified for frontend; in DB would be Many-to-Many
    estimatedLaborHours: number;
    totalPrice: number;
}

export interface ServiceOrder {
    id: string;
    tenantId: string;
    number: string; // OS-2024-001
    boatId: string;
    status: OSStatus;
    description: string;
    createdAt: string;
    totalAmount: number;
    items: {
        partName: string;
        quantity: number;
        price: number;
    }[];
}

// Marina & Logistics Types
export type SlipType = 'DRY_STACK' | 'WET_SLIP';
export type SlipStatus = 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE';

export interface MarinaSlip {
    id: string;
    code: string; // e.g., A-12, D-05
    type: SlipType;
    status: SlipStatus;
    boatId?: string; // Nullable if empty
}

// Analyst Checklist Types
export interface ChecklistItem {
    id: string;
    category: 'MOTOR' | 'ELECTRIC' | 'HULL' | 'INTERIOR';
    label: string;
    status: 'OK' | 'ATTENTION' | 'CRITICAL';
    notes?: string;
}

// Navigation State
export type ViewState = 
    | 'DASHBOARD' 
    | 'WORKSHOP' 
    | 'ESTIMATOR' 
    | 'MARINA_MAP'     
    | 'MECHANIC_APP'   
    | 'ANALYST_MODE'   
    | 'AI_DIAGNOSTICS' 
    | 'ARCHITECTURE';

// i18n
export type Language = 'pt-BR' | 'en-US';