import { Boat, EngineBrand, MarinaSlip, OSStatus, Part, ServiceKit, ServiceOrder } from "./types";

export const MOCK_BOATS: Boat[] = [
    {
        id: '1',
        name: 'Ocean Runner',
        model: 'Phantom 303',
        clientId: 'c1',
        engineBrand: EngineBrand.MERCURY,
        engineModel: 'Verado 300 V8',
        engineHours: 98,
        lastServiceDate: '2023-05-15',
        imageUrl: 'https://picsum.photos/id/400/800/600'
    },
    {
        id: '2',
        name: 'Blue Horizon',
        model: 'Focker 280',
        clientId: 'c2',
        engineBrand: EngineBrand.YAMAHA,
        engineModel: 'F300',
        engineHours: 250,
        lastServiceDate: '2023-11-20',
        imageUrl: 'https://picsum.photos/id/401/800/600'
    },
    {
        id: '3',
        name: 'Sea Spirit',
        model: 'Azimut 50',
        clientId: 'c3',
        engineBrand: EngineBrand.VOLVO,
        engineModel: 'IPS 600',
        engineHours: 1200,
        lastServiceDate: '2024-01-10',
        imageUrl: 'https://picsum.photos/id/402/800/600'
    }
];

export const MOCK_PARTS: Part[] = [
    { id: 'p1', partNumber: '8M0063190', name: 'Oil Filter Verado', brand: EngineBrand.MERCURY, costPrice: 40, sellingPrice: 85, stockQuantity: 20 },
    { id: 'p2', partNumber: '8M0157616', name: 'Gear Lube SAE 90', brand: EngineBrand.MERCURY, costPrice: 25, sellingPrice: 55, stockQuantity: 50 },
    { id: 'p3', partNumber: 'NGK-ILFR6G', name: 'Spark Plug NGK', brand: EngineBrand.MERCURY, costPrice: 15, sellingPrice: 45, stockQuantity: 100 },
    { id: 'p4', partNumber: '90430-08003', name: 'Gasket', brand: EngineBrand.YAMAHA, costPrice: 2, sellingPrice: 8, stockQuantity: 200 },
];

export const MOCK_KITS: ServiceKit[] = [
    {
        id: 'k1',
        name: 'Review 100h / 1 Year - Mercury Verado V8',
        engineBrand: EngineBrand.MERCURY,
        parts: [MOCK_PARTS[0], MOCK_PARTS[1], MOCK_PARTS[1]], // 1 Filter, 2 Oils
        estimatedLaborHours: 3,
        totalPrice: 1200
    },
    {
        id: 'k2',
        name: 'Review 300h - Yamaha F300',
        engineBrand: EngineBrand.YAMAHA,
        parts: [MOCK_PARTS[3], MOCK_PARTS[3]],
        estimatedLaborHours: 5,
        totalPrice: 2400
    }
];

export const MOCK_ORDERS: ServiceOrder[] = [
    {
        id: 'os-101',
        tenantId: 't1',
        number: 'OS-2024-045',
        boatId: '1',
        status: OSStatus.OPEN,
        description: 'Engine making ticking noise at low RPM',
        createdAt: '2024-05-20',
        totalAmount: 0,
        items: []
    },
    {
        id: 'os-102',
        tenantId: 't1',
        number: 'OS-2024-042',
        boatId: '2',
        status: OSStatus.EXECUTION,
        description: 'Annual 100h Maintenance',
        createdAt: '2024-05-18',
        totalAmount: 1200,
        items: [{ partName: 'Kit Review 100h', quantity: 1, price: 1200 }]
    },
    {
        id: 'os-103',
        tenantId: 't1',
        number: 'OS-2024-039',
        boatId: '3',
        status: OSStatus.COMPLETED,
        description: 'Gelcoat repair on starboard',
        createdAt: '2024-05-10',
        totalAmount: 4500,
        items: [{ partName: 'Gelcoat Application', quantity: 1, price: 4500 }]
    }
];

export const MOCK_SLIPS: MarinaSlip[] = [
    { id: 's1', code: 'A-01', type: 'WET_SLIP', status: 'OCCUPIED', boatId: '3' },
    { id: 's2', code: 'A-02', type: 'WET_SLIP', status: 'AVAILABLE' },
    { id: 's3', code: 'A-03', type: 'WET_SLIP', status: 'MAINTENANCE' },
    { id: 's4', code: 'D-101', type: 'DRY_STACK', status: 'OCCUPIED', boatId: '1' },
    { id: 's5', code: 'D-102', type: 'DRY_STACK', status: 'OCCUPIED', boatId: '2' },
    { id: 's6', code: 'D-103', type: 'DRY_STACK', status: 'AVAILABLE' },
    { id: 's7', code: 'D-104', type: 'DRY_STACK', status: 'AVAILABLE' },
    { id: 's8', code: 'D-105', type: 'DRY_STACK', status: 'AVAILABLE' },
];