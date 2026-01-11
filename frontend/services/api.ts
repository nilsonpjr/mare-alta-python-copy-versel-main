import axios from 'axios';
import {
    User, ServiceOrder, Part, StockMovement, Client, Boat, Marina,
    ServiceOrderCreate, ServiceItemCreate, OrderNoteCreate, ServiceOrderUpdate,
    PartCreate, PartUpdate, StockMovementCreate,
    TransactionCreate, Transaction,
    Manufacturer, Model, CompanyInfo,
    BoatCreate, BoatUpdate, TenantSignup, ClientCreate, ClientUpdate,
    ApiMaintenanceKit, ApiMaintenanceKitCreate, MarinaCreate, FiscalInvoice
} from '../types';

/**
 * Este arquivo define o serviço de API para interagir com o backend.
 * Ele usa Axios para fazer requisições HTTP e inclui um interceptor
 * para adicionar o token JWT em todas as requisições autenticadas.
 */

// Define a URL base da API.
// Em produção, usa o caminho relativo '/api' (assumindo que o frontend é servido pelo backend).
// Em desenvolvimento, usa 'http://localhost:8000/api' para se conectar ao backend local.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mare-alta-python-copy-versel.onrender.com/api' : 'http://localhost:8000/api');

// Cria uma instância do Axios com a URL base e cabeçalhos padrão.
console.log('API_URL:', API_URL); // Debug: Check which API URL is being used
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json', // Define o tipo de conteúdo padrão para JSON.
    },
});

// Interceptor para adicionar o token JWT (JSON Web Token) a cada requisição.
// Isso é essencial para rotas que exigem autenticação.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Obtém o token armazenado no localStorage.
    if (token) {
        // Se um token existir, adiciona o cabeçalho Authorization no formato "Bearer token".
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Retorna a configuração da requisição modificada.
});

// Objeto que contém todos os métodos para interagir com a API do backend.
export const ApiService = {
    // --- AUTH (Autenticação) ---
    /**
     * Realiza o login do usuário.
     * @param email O email do usuário.
     * @param password A senha do usuário.
     * @returns Os dados da resposta do login, incluindo o token de acesso.
     */
    login: async (email: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await api.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Tipo de conteúdo específico para login via formulário.
            }
        });
        // O backend retorna camelCase devido ao alias_generator do Pydantic.
        const token = response.data.accessToken || response.data.access_token;
        localStorage.setItem('token', token); // Armazena o token no localStorage.
        return response.data;
    },

    /**
     * Registra uma nova empresa (Tenant).
     */
    /**
     * Registra uma nova empresa (Tenant).
     */
    signup: async (data: TenantSignup) => {
        // Atualizado para receber resposta com Token (não mais User)
        const response = await api.post<any>('/auth/signup', data);
        return response.data;
    },

    /**
     * Faz o upload de uma imagem e retorna a URL pública.
     */
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<{ url: string }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Obtém os dados do usuário atualmente autenticado.
     * @returns Os dados do usuário.
     */
    getMe: async () => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    /**
     * Realiza o logout do usuário, removendo o token do localStorage.
     */
    logout: () => {
        localStorage.removeItem('token');
    },

    // --- ORDERS (Ordens de Serviço) ---
    /**
     * Obtém uma lista de ordens de serviço.
     * @param status Opcional: filtra as ordens por status.
     * @returns Uma lista de ordens de serviço.
     */
    getOrders: async (status?: string) => {
        const params = status ? { status } : {};
        const response = await api.get<ServiceOrder[]>('/orders', { params });
        return response.data;
    },

    /**
     * Obtém uma ordem de serviço específica pelo ID.
     * @param id O ID da ordem de serviço.
     * @returns A ordem de serviço.
     */
    getOrder: async (id: number) => {
        const response = await api.get<ServiceOrder>(`/orders/${id}`);
        return response.data;
    },

    /**
     * Cria uma nova ordem de serviço.
     * @param order Os dados da ordem de serviço a ser criada.
     * @returns A ordem de serviço criada.
     */
    createOrder: async (order: ServiceOrderCreate) => {
        const response = await api.post<ServiceOrder>('/orders', order);
        return response.data;
    },

    /**
     * Atualiza uma ordem de serviço existente.
     * @param id O ID da ordem de serviço a ser atualizada.
     * @param order Os dados de atualização da ordem de serviço.
     * @returns A ordem de serviço atualizada.
     */
    updateOrder: async (id: number, order: ServiceOrderUpdate) => {
        const response = await api.put<ServiceOrder>(`/orders/${id}`, order);
        return response.data;
    },

    /**
     * Adiciona um item a uma ordem de serviço.
     * @param orderId O ID da ordem de serviço.
     * @param item Os dados do item a ser adicionado.
     * @returns A ordem de serviço atualizada com o novo item.
     */
    addOrderItem: async (orderId: number, item: ServiceItemCreate) => {
        const response = await api.post<ServiceOrder>(`/orders/${orderId}/items`, item);
        return response.data;
    },

    /**
     * Adiciona uma nota a uma ordem de serviço.
     * @param orderId O ID da ordem de serviço.
     * @param note Os dados da nota a ser adicionada.
     * @returns A nota adicionada.
     */
    addOrderNote: async (orderId: number, note: OrderNoteCreate) => {
        const response = await api.post(`/orders/${orderId}/notes`, note);
        return response.data;
    },

    /**
     * Completa uma ordem de serviço.
     * @param id O ID da ordem de serviço a ser completada.
     * @returns A ordem de serviço completada.
     */
    completeOrder: async (id: number) => {
        const response = await api.put<ServiceOrder>(`/orders/${id}/complete`);
        return response.data;
    },

    // --- INVENTORY (Inventário) ---
    /**
     * Obtém uma lista de todas as peças em estoque.
     * @returns Uma lista de peças.
     */
    getParts: async () => {
        const response = await api.get<Part[]>('/inventory/parts');
        return response.data;
    },

    /**
     * Obtém uma peça específica pelo ID.
     * @param id O ID da peça.
     * @returns A peça.
     */
    getPart: async (id: number) => {
        const response = await api.get<Part>(`/inventory/parts/${id}`);
        return response.data;
    },

    /**
     * Cria uma nova peça no estoque.
     * @param part Os dados da peça a ser criada.
     * @returns A peça criada.
     */
    createPart: async (part: PartCreate) => {
        const response = await api.post<Part>('/inventory/parts', part);
        return response.data;
    },

    /**
     * Atualiza uma peça existente.
     * @param id O ID da peça a ser atualizada.
     * @param part Os dados de atualização da peça.
     * @returns A peça atualizada.
     */
    updatePart: async (id: number, part: PartUpdate) => {
        const response = await api.put<Part>(`/inventory/parts/${id}`, part);
        return response.data;
    },

    /**
     * Deleta uma peça.
     * @param id O ID da peça a ser deletada.
     */
    deletePart: async (id: number) => {
        await api.delete(`/inventory/parts/${id}`);
    },

    /**
     * Obtém o histórico de movimentações de estoque.
     * @param partId Opcional: filtra as movimentações por ID da peça.
     * @returns Uma lista de movimentações de estoque.
     */
    getMovements: async (partId?: number) => {
        const params = partId ? { part_id: partId } : {};
        const response = await api.get<StockMovement[]>('/inventory/movements', { params });
        return response.data;
    },

    /**
     * Cria uma nova movimentação de estoque.
     * @param movement Os dados da movimentação a ser criada.
     * @returns A movimentação de estoque criada.
     */
    createMovement: async (movement: StockMovementCreate) => {
        const response = await api.post<StockMovement>('/inventory/movements', movement);
        return response.data;
    },

    /**
     * Processa uma Venda Direta (PDV).
     */
    quickSale: async (saleData: any) => {
        const response = await api.post('/inventory/quick-sale', saleData);
        return response.data;
    },

    completeOnboarding: async () => {
        const response = await api.patch('/users/me/complete-onboarding');
        return response.data;
    },

    // --- CLIENTS & BOATS (Clientes e Embarcações) ---
    /**
     * Obtém uma lista de todos os clientes.
     * @returns Uma lista de clientes.
     */
    getClients: async () => {
        const response = await api.get<Client[]>('/clients');
        return response.data;
    },

    /**
     * Obtém um cliente específico pelo ID.
     * @param id O ID do cliente.
     * @returns O cliente.
     */
    getClient: async (id: number) => {
        const response = await api.get<Client>(`/clients/${id}`);
        return response.data;
    },

    /**
     * Cria um novo cliente.
     * @param client Os dados do cliente a ser criado.
     * @returns O cliente criado.
     */
    createClient: async (client: ClientCreate) => {
        const response = await api.post<Client>('/clients', client);
        return response.data;
    },

    /**
     * Atualiza um cliente existente.
     * @param id O ID do cliente a ser atualizado.
     * @param client Os dados de atualização do cliente.
     * @returns O cliente atualizado.
     */
    updateClient: async (id: number, client: ClientUpdate) => {
        const response = await api.put<Client>(`/clients/${id}`, client);
        return response.data;
    },

    /**
     * Deleta um cliente.
     * @param id O ID do cliente a ser deletado.
     */
    deleteClient: async (id: number) => {
        await api.delete(`/clients/${id}`);
    },

    /**
     * Obtém uma lista de embarcações.
     * @param clientId Opcional: filtra as embarcações por ID do cliente.
     * @returns Uma lista de embarcações.
     */
    getBoats: async (clientId?: number) => {
        const params = clientId ? { client_id: clientId } : {};
        const response = await api.get<Boat[]>('/boats', { params });
        return response.data;
    },

    /**
     * Cria uma nova embarcação.
     * @param boat Os dados da embarcação a ser criada.
     * @returns A embarcação criada.
     */
    createBoat: async (boat: BoatCreate) => {
        const response = await api.post<Boat>('/boats', boat);
        return response.data;
    },

    /**
     * Atualiza uma embarcação existente.
     * @param id O ID da embarcação a ser atualizada.
     * @param boat Os dados de atualização da embarcação.
     * @returns A embarcação atualizada.
     */
    updateBoat: async (id: number, boat: BoatUpdate) => {
        const response = await api.put<Boat>(`/boats/${id}`, boat);
        return response.data;
    },

    /**
     * Deleta uma embarcação.
     * @param id O ID da embarcação a ser deletada.
     */
    deleteBoat: async (id: string) => {
        await api.delete(`/boats/${id}`);
    },

    // --- FISCAL ---
    /**
     * Obtém o histórico de notas fiscais.
     */
    getFiscalInvoices: async () => {
        const response = await api.get<FiscalInvoice[]>('/fiscal');
        return response.data;
    },

    /**
     * Emite uma nota fiscal.
     * @param invoiceData Os dados da nota fiscal.
     * @returns A resposta da emissão da nota fiscal.
     */
    emitFiscalInvoice: async (invoiceData: any) => {
        const response = await api.post('/fiscal/emit', invoiceData);
        return response.data;
    },

    // --- MERCURY ---
    /**
     * Pesquisa um produto no portal Mercury Marine.
     * @param code O código ou descrição do produto.
     * @returns Os resultados da pesquisa de produtos.
     */
    searchMercuryProduct: async (code: string) => {
        const response = await api.get(`/mercury/search/${encodeURIComponent(code)}`);
        return response.data;
    },

    /**
     * Obtém informações de garantia de um motor Mercury.
     * @param serial O número de série do motor.
     * @returns Os dados da garantia.
     */
    getMercuryWarranty: async (serial: string) => {
        const response = await api.get(`/mercury/warranty/${encodeURIComponent(serial)}`);
        return response.data;
    },

    /**
     * Sincroniza o preço de uma peça específica com o portal Mercury.
     * @param partId O ID da peça.
     * @returns Resultado da sincronização.
     */
    syncMercuryPrice: async (partId: number) => {
        const response = await api.post(`/mercury/sync-price/${partId}`);
        return response.data;
    },

    batchSyncMercuryPrices: async (partIds: number[]) => {
        const response = await api.post(`/mercury/batch-sync-prices`, partIds);
        return response.data;
    },

    // --- TRANSACTIONS (Transações Financeiras) ---
    /**
     * Obtém uma lista de todas as transações financeiras.
     * @returns Uma lista de transações.
     */
    getTransactions: async () => {
        const response = await api.get<Transaction[]>('/transactions');
        return response.data;
    },

    /**
     * Cria uma nova transação financeira.
     * @param transaction Os dados da transação a ser criada.
     * @returns A transação criada.
     */
    createTransaction: async (transaction: TransactionCreate) => {
        const response = await api.post<Transaction>('/transactions', transaction);
        return response.data;
    },

    // --- CONFIGURATION (Configuração) ---
    /**
     * Obtém uma lista de fabricantes.
     * @param type Opcional: filtra os fabricantes por tipo ('BOAT' ou 'ENGINE').
     * @returns Uma lista de fabricantes.
     */
    getManufacturers: async (type?: 'BOAT' | 'ENGINE') => {
        const params = type ? { type } : {};
        const response = await api.get<Manufacturer[]>('/config/manufacturers', { params });
        return response.data;
    },

    /**
     * Cria um novo fabricante.
     * @param manufacturer Os dados do fabricante a ser criado.
     * @returns O fabricante criado.
     */
    createManufacturer: async (manufacturer: Omit<Manufacturer, 'id' | 'models'>) => {
        const response = await api.post<Manufacturer>('/config/manufacturers', manufacturer);
        return response.data;
    },

    // Adicionei esta função para buscar modelos diretamente, caso seja necessário sem um fabricante específico.
    // Embora a API de backend não tenha um endpoint direto para isso sem manufacturer_id,
    // o crud.get_manufacturers já traz os modelos. Este método seria para um futuro endpoint /config/models.
    /**
     * Obtém uma lista de modelos, opcionalmente filtrados por ID do fabricante.
     * OBS: O endpoint do backend retorna fabricantes com seus modelos aninhados.
     * Esta função assume um endpoint futuro para buscar modelos diretamente.
     * @param manufacturerId Opcional: filtra os modelos por ID do fabricante.
     * @returns Uma lista de modelos.
     */
    getModels: async (manufacturerId?: number) => {
        const params = manufacturerId ? { manufacturer_id: manufacturerId } : {};
        // Nota: Atualmente, o backend não tem um endpoint /config/models direto.
        // A busca de modelos é feita através do getManufacturers.
        // Este é um placeholder para um endpoint futuro ou uma adaptação se necessário.
        const response = await api.get<Model[]>('/config/models', { params });
        return response.data;
    },

    /**
     * Cria um novo modelo.
     * @param manufacturerId O ID do fabricante.
     * @param name O nome do modelo.
     * @returns O modelo criado.
     */
    createModel: async (manufacturerId: number, name: string) => {
        const response = await api.post<Model>(`/config/manufacturers/${manufacturerId}/models`, { name });
        return response.data;
    },

    /**
     * Deleta um fabricante.
     * @param id O ID do fabricante.
     */
    deleteManufacturer: async (id: number) => {
        await api.delete(`/config/manufacturers/${id}`);
    },

    /**
     * Deleta um modelo.
     * @param id O ID do modelo.
     */
    deleteModel: async (id: number) => {
        await api.delete(`/config/models/${id}`);
    },

    /**
     * Obtém as informações da empresa.
     * @returns As informações da empresa.
     */
    getCompanyInfo: async () => {
        const response = await api.get<CompanyInfo>('/config/company');
        return response.data;
    },

    /**
     * Atualiza as informações da empresa.
     * @param info As informações da empresa a serem atualizadas.
     * @returns As informações da empresa atualizadas.
     */
    updateCompanyInfo: async (info: CompanyInfo) => {
        const response = await api.put<CompanyInfo>('/config/company', info);
        return response.data;
    },

    // --- MAINTENANCE KITS ---
    getMaintenanceKits: async () => {
        const response = await api.get<ApiMaintenanceKit[]>('/config/maintenance-kits');
        return response.data;
    },

    createMaintenanceKit: async (kit: ApiMaintenanceKitCreate) => {
        const response = await api.post<ApiMaintenanceKit>('/config/maintenance-kits', kit);
        return response.data;
    },

    // --- MARINAS ---
    getMarinas: async () => {
        const response = await api.get<Marina[]>('/config/marinas');
        return response.data;
    },

    createMarina: async (marina: MarinaCreate) => {
        const response = await api.post<Marina>('/config/marinas', marina);
        return response.data;
    },

    updateMarina: async (id: number, marina: MarinaCreate) => {
        const response = await api.put<Marina>(`/config/marinas/${id}`, marina);
        return response.data;
    },

    deleteMarina: async (id: number) => {
        await api.delete(`/config/marinas/${id}`);
    },

    deleteMaintenanceKit: async (id: number) => {
        await api.delete(`/config/maintenance-kits/${id}`);
    },

    // === Users (Usuários) ===

    /**
     * Obtém todos os usuários.
     */
    getUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data;
    },

    /**
     * Cria um novo usuário.
     */
    createUser: async (user: any) => {
        const response = await api.post('/auth/register', user);
        return response.data;
    },

    /**
     * Atualiza um usuário.
     */
    updateUser: async (id: number, user: any) => {
        const response = await api.put(`/auth/users/${id}`, user);
        return response.data;
    },

    /**
     * Deleta um usuário.
     */
    deleteUser: async (id: number) => {
        await api.delete(`/auth/users/${id}`);
    },

    // === Partners (Parceiros - Fase 3) ===

    /**
     * Obtém todos os parceiros.
     */
    getPartners: async (activeOnly: boolean = false) => {
        const params = activeOnly ? '?active_only=true' : '';
        const response = await api.get(`/partners${params}`);
        return response.data;
    },

    /**
     * Cria um novo parceiro.
     */
    createPartner: async (partner: any) => {
        const response = await api.post('/partners', partner);
        return response.data;
    },

    /**
     * Atualiza um parceiro.
     */
    updatePartner: async (id: number, partner: any) => {
        const response = await api.put(`/partners/${id}`, partner);
        return response.data;
    },

    /**
     * Deleta um parceiro.
     */
    deletePartner: async (id: number) => {
        await api.delete(`/partners/${id}`);
    },

    /**
     * Avalia um parceiro (0-5 estrelas).
     */
    ratePartner: async (id: number, rating: number) => {
        const response = await api.put(`/partners/${id}/rate?rating=${rating}`);
        return response.data;
    },

    // === Inspections (Inspeções Técnicas) ===

    /**
     * Obtém todas as inspeções.
     */
    getInspections: async (boatId?: number) => {
        const params = boatId ? `?boat_id=${boatId}` : '';
        const response = await api.get(`/partners/inspections${params}`);
        return response.data;
    },

    /**
     * Cria uma nova inspeção.
     */
    createInspection: async (inspection: any) => {
        const response = await api.post('/partners/inspections', inspection);
        return response.data;
    },

    /**
     * Atualiza uma inspeção.
     */
    updateInspection: async (id: number, inspection: any) => {
        const response = await api.put(`/partners/inspections/${id}`, inspection);
        return response.data;
    },

    /**
     * Adiciona item ao checklist de uma inspeção.
     */
    addChecklistItem: async (inspectionId: number, item: any) => {
        const response = await api.post(`/partners/inspections/${inspectionId}/checklist`, item);
        return response.data;
    },


    // === Partner Quotes (Orçamentos de Parceiros) ===

    getPartnerQuotes: async (inspectionId?: number, partnerId?: number) => {
        const params: any = {};
        if (inspectionId) params.inspection_id = inspectionId;
        if (partnerId) params.partner_id = partnerId;
        const response = await api.get('/partners/quotes', { params });
        return response.data;
    },

    createPartnerQuote: async (quote: any) => {
        const response = await api.post('/partners/quotes', quote);
        return response.data;
    },

    updatePartnerQuote: async (id: number, quote: any) => {
        const response = await api.put(`/partners/quotes/${id}`, quote);
        return response.data;
    },
    // --- SUBSCRIPTION ---
    getSubscription: async () => {
        const response = await api.get<any>('/config/subscription');
        return response.data;
    },

    // === SUPER ADMIN ===
    getTenants: async () => {
        const response = await api.get('/admin/tenants');
        return response.data;
    },

    updateTenant: async (id: number, data: any) => {
        const response = await api.put(`/admin/tenants/${id}`, data);
        return response.data;
    },

    // --- TECHNICAL DELIVERY ---
    getTechnicalDelivery: async (orderId: string | number) => {
        try {
            const response = await api.get(`/orders/${orderId}/technical-delivery`);
            return response.data;
        } catch (error) {
            return null;
        }

    },

    createTechnicalDelivery: async (orderId: string | number, data: any) => {
        const response = await api.post(`/orders/${orderId}/technical-delivery`, data);
        return response.data;
    },

    updateTechnicalDelivery: async (orderId: string | number, data: any) => {
        const response = await api.put(`/orders/${orderId}/technical-delivery`, data);
        return response.data;
    }
};
