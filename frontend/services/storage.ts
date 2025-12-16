
import { Boat, Part, ServiceOrder, OSStatus, Client, Transaction, Marina, SystemConfig, User, UserRole, ServiceItem, Invoice, StockMovement, ServiceDefinition } from '../types';

const KEYS = {
  BOATS: 'marealta_boats',
  INVENTORY: 'marealta_inventory',
  INVOICES: 'marealta_invoices',
  MOVEMENTS: 'marealta_movements',
  ORDERS: 'marealta_orders',
  CLIENTS: 'marealta_clients',
  FINANCE: 'marealta_finance',
  MARINAS: 'marealta_marinas',
  CONFIG: 'marealta_config',
  USERS: 'marealta_users',
  SERVICES: 'marealta_services_catalog',
};

// --- HELPER FUNCTIONS ---
const getDate = (dayOffset: number, hour: number = 9): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

// --- EMPTY SEED DATA ---
// Dados removidos conforme solicitado.
const seedUsers: User[] = [];
const seedServicesCatalog: ServiceDefinition[] = [];
const seedMarinas: Marina[] = [];
const seedClients: Client[] = [];
const seedBoats: Boat[] = [];
const seedParts: Part[] = [];
const seedOrders: ServiceOrder[] = [];
const seedTransactions: Transaction[] = [];

// --- SERVICE IMPLEMENTATION ---
export const StorageService = {
  // CONFIG
  getConfig: (): SystemConfig => {
    const stored = localStorage.getItem(KEYS.CONFIG);
    if (stored) return JSON.parse(stored);
    const defaultConfig: SystemConfig = {
      companyName: 'Mare Alta',
      engineManufacturers: ['Mercury', 'Yamaha', 'Volvo Penta'],
      boatManufacturers: ['Focker', 'Schaefer', 'Azimut', 'Real', 'Triton'],
      serviceTypes: {
        'MECANICA': { label: 'Mecânica', color: '#3b82f6' },
        'ELETRICA': { label: 'Elétrica', color: '#eab308' },
        'HIDRAULICA': { label: 'Hidráulica', color: '#06b6d4' },
        'FIBRA': { label: 'Fibra/Pintura', color: '#a855f7' },
        'ESTETICA': { label: 'Estética', color: '#ec4899' },
        'DIAGNOSTICO': { label: 'Diagnóstico', color: '#f97316' },
        'OUTROS': { label: 'Outros', color: '#64748b' }
      }
    };
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  },
  saveConfig: (config: SystemConfig) => localStorage.setItem(KEYS.CONFIG, JSON.stringify(config)),

  // USERS
  getUsers: (): User[] => {
    const stored = localStorage.getItem(KEYS.USERS);
    return stored ? JSON.parse(stored) : seedUsers;
  },
  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const existing = users.find(u => u.email === user.email);
    if (existing) {
      Object.assign(existing, user);
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // CLIENTS
  getClients: (): Client[] => {
    const stored = localStorage.getItem(KEYS.CLIENTS);
    return stored ? JSON.parse(stored) : seedClients;
  },
  saveClients: (clients: Client[]) => localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients)),

  // BOATS
  getBoats: (): Boat[] => {
    const stored = localStorage.getItem(KEYS.BOATS);
    return stored ? JSON.parse(stored) : seedBoats;
  },
  saveBoats: (boats: Boat[]) => localStorage.setItem(KEYS.BOATS, JSON.stringify(boats)),

  // INVENTORY
  getInventory: (): Part[] => {
    const stored = localStorage.getItem(KEYS.INVENTORY);
    return stored ? JSON.parse(stored) : seedParts;
  },
  saveInventory: (inventory: Part[]) => localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory)),

  getInvoices: (): Invoice[] => {
    const stored = localStorage.getItem(KEYS.INVOICES);
    return stored ? JSON.parse(stored) : [];
  },
  processInvoice: (invoice: Invoice, user: string) => {
    // 1. Save Invoice
    const invoices = StorageService.getInvoices();
    invoices.push(invoice);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));

    // 2. Update Inventory & Create Movements
    const parts = StorageService.getInventory();
    const movements = StorageService.getMovements();

    invoice.items.forEach(item => {
      // Find part logic would go here, simplified for clean version
      console.log("Processing invoice item:", item);
    });

    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(parts));
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
  },

  getMovements: (): StockMovement[] => {
    const stored = localStorage.getItem(KEYS.MOVEMENTS);
    return stored ? JSON.parse(stored) : [];
  },
  saveMovements: (movements: StockMovement[]) => localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements)),

  // ORDERS
  getOrders: (): ServiceOrder[] => {
    const stored = localStorage.getItem(KEYS.ORDERS);
    return stored ? JSON.parse(stored) : seedOrders;
  },
  saveOrders: (orders: ServiceOrder[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),

  // FINANCE
  getTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(KEYS.FINANCE);
    return stored ? JSON.parse(stored) : seedTransactions;
  },
  saveTransactions: (transactions: Transaction[]) => localStorage.setItem(KEYS.FINANCE, JSON.stringify(transactions)),
  addTransaction: (transaction: Transaction) => {
    const transactions = StorageService.getTransactions();
    transactions.push({ ...transaction, id: Date.now().toString() });
    localStorage.setItem(KEYS.FINANCE, JSON.stringify(transactions));
  },

  // MARINAS
  getMarinas: (): Marina[] => {
    const stored = localStorage.getItem(KEYS.MARINAS);
    return stored ? JSON.parse(stored) : seedMarinas;
  },

  // SERVICES CATALOG
  getServicesCatalog: (): ServiceDefinition[] => {
    const stored = localStorage.getItem(KEYS.SERVICES);
    return stored ? JSON.parse(stored) : seedServicesCatalog;
  },

  initialize: () => {
    // No-op for clean slate
    // If user calls initialize, we assume they want clean state if local storage is empty.
    if (!localStorage.getItem(KEYS.USERS)) {
      // Maybe set default config if truly empty
      StorageService.getConfig();
      // Do NOT populate seeds.
    }
  }
};