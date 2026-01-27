import React, { useState, useEffect, useRef } from 'react';
import { ServiceOrder, OSStatus, Boat, Part, ServiceItem, UserRole, Client, Marina, ChecklistItem, AttachmentType, ServiceDefinition, ItemType, User as UserType } from '../types';
import { ApiService } from '../services/api';
import { uploadImage } from '../services/supabase';
import { GeminiService } from '../services/geminiService';
import {
    Plus, FileText, CheckCircle, Clock,
    BrainCircuit, Printer, Search, Ban, AlertOctagon,
    ArrowLeft,
    Wrench,
    Package,
    Lock,
    Unlock,
    DollarSign,
    MessageCircle,
    FileDigit,
    User,
    CheckSquare,
    Clipboard,
    AlertTriangle,
    Camera,
    Trash2,
    Pencil,
    X,
    ImagePlus,
    Info,
    ClipboardCheck,
    ArrowUpRight,
    Target,
    Send
} from 'lucide-react';
import { TechnicalDeliveryForm } from './TechnicalDeliveryForm';
import { QuickClientModal } from './QuickClientModal';
import { QuickBoatModal } from './QuickBoatModal';
import { QuickMarinaModal } from './QuickMarinaModal';

interface OrdersViewProps {
    role: UserRole;
    onNavigate?: (view: string, data?: any) => void;
}

const CHECKLIST_TEMPLATES = {
    'REVISAO_100': [
        'Troca de óleo do motor e filtro',
        'Troca de filtro de combustível',
        'Verificação de velas de ignição',
        'Inspeção do rotor da bomba d\'água',
        'Verificação do nível de óleo da rabeta',
        'Lubrificação dos pontos de graxa',
        'Inspeção de anodos de sacrifício',
        'Teste de funcionamento do Power Trim',
        'Verificação de vazamentos',
        'Leitura de falhas no scanner'
    ],
    'ENTREGA_TECNICA': [
        'Conferência de itens de segurança',
        'Teste de partida',
        'Verificação de instrumentos do painel',
        'Teste de navegação (Sea Trial)',
        'Explicação de funcionamento ao cliente',
        'Limpeza final'
    ]
};

export const OrdersView: React.FC<OrdersViewProps> = ({ role, onNavigate }) => {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [servicesCatalog, setServicesCatalog] = useState<ServiceDefinition[]>([]);
    const [marinas, setMarinas] = useState<Marina[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);  // ← Usuários técnicos
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isItemSearchOpen, setIsItemSearchOpen] = useState(false); // New State for Modal

    const isReadOnly = selectedOrder ? (selectedOrder.status === OSStatus.COMPLETED || selectedOrder.status === OSStatus.CANCELED) : false;
    const isTechnician = role === UserRole.TECHNICIAN;

    // Tab State
    const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'parts' | 'media' | 'report' | 'profit' | 'delivery'>('details');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingAttachmentType, setPendingAttachmentType] = useState<AttachmentType | null>(null);

    // Add Item States
    const [partSearch, setPartSearch] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [partQty, setPartQty] = useState(1);
    const [partPrice, setPartPrice] = useState(0);
    const [partCost, setPartCost] = useState(0);

    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [servicePrice, setServicePrice] = useState(0);

    // Edit Item State
    const [editingItemId, setEditingItemId] = useState<string | number | null>(null);
    const [editQty, setEditQty] = useState(0);
    const [editPrice, setEditPrice] = useState(0);

    // Quick Actions State
    const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
    const [isQuickBoatOpen, setIsQuickBoatOpen] = useState(false);
    const [isQuickMarinaOpen, setIsQuickMarinaOpen] = useState(false);
    const [preSelectedClientId, setPreSelectedClientId] = useState<number | undefined>(undefined);
    const [newlyCreatedBoatId, setNewlyCreatedBoatId] = useState<string>('');

    const handleQuickClientSuccess = (client: Client) => {
        setClients(prev => [...prev, client]);
        setPreSelectedClientId(client.id);
        setIsQuickClientOpen(false);
    };

    const handleQuickBoatSuccess = (boat: Boat) => {
        setBoats(prev => [...prev, boat]);
        setNewlyCreatedBoatId(String(boat.id));
        setIsQuickBoatOpen(false);
    };

    const handleQuickMarinaSuccess = (marina: Marina) => {
        setMarinas(prev => [...prev, marina]);
        setIsQuickMarinaOpen(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        try {
            const [ordersData, boatsData, partsData, clientsData, usersData] = await Promise.all([
                ApiService.getOrders(),
                ApiService.getBoats(),
                ApiService.getParts(),
                ApiService.getClients(),
                ApiService.getUsers()
            ]);

            // Normalizar checklist - garantir array vazio se undefined
            const normalizedOrders = ordersData.map(order => ({
                ...order,
                checklist: order.checklist || []
            }));

            setOrders(normalizedOrders);
            setBoats(boatsData);
            setParts(partsData);
            setClients(clientsData);
            setUsers(usersData);

            // Mock Services Catalog (Backend integration pending)
            setServicesCatalog([
                { id: '1', name: 'Mão de Obra Mecânica', category: 'Serviço', defaultPrice: 250 },
                { id: '2', name: 'Mão de Obra Elétrica', category: 'Serviço', defaultPrice: 280 },
                { id: '3', name: 'Lavagem Completa', category: 'Serviço', defaultPrice: 150 },
                { id: '4', name: 'Polimento', category: 'Serviço', defaultPrice: 800 },
                { id: '5', name: 'Diagnóstico Computadorizado', category: 'Serviço', defaultPrice: 350 }
            ]);
            setMarinas([]); // Backend doesn't support marinas listing yet
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    const isClient = role === UserRole.CLIENT;

    if (isClient) {
        return (
            <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Central do Proprietário</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Bem-vindo ao portal de monitoramento da sua embarcação.</p>
                    </div>
                </header>

                <div id="boat-status-card" className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Package className="w-48 h-48 dark:text-white" />
                    </div>
                    <div className="w-full md:w-2/5 relative">
                        <img
                            src="https://images.unsplash.com/photo-1569263979104-865ab7dd8d17?auto=format&fit=crop&q=80&w=1000"
                            alt="Boat"
                            className="rounded-3xl w-full h-64 object-cover shadow-2xl"
                        />
                        <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-2xl shadow-xl">
                            <Wrench className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6 w-full relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Schaefer 303</h2>
                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Phantom 303 • Mercury V8 300hp</p>
                            </div>
                            <span className="bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-400/20 shadow-sm">Operacional</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1 leading-none">Próxima Revisão</p>
                                <p className="font-black text-slate-800 dark:text-slate-200 text-lg">15/04/2026</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1 leading-none">Horas Motor</p>
                                <p className="font-black text-slate-800 dark:text-slate-200 text-lg">142.5 h</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saúde do Sistema</span>
                                <span className="text-sm font-black text-primary italic">85% Optimal</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div id="pending-approvals" className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <div className="p-2 bg-amber-50 dark:bg-amber-400/10 rounded-xl text-amber-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            Aprovações Pendentes
                        </h3>
                        {orders.filter(o => o.status === OSStatus.PENDING).length > 0 ? (
                            <div className="space-y-4">
                                {orders.filter(o => o.status === OSStatus.PENDING).map(o => (
                                    <div key={o.id} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-slate-800 dark:text-slate-200 truncate pr-4">{o.description}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">Estimativa: R$ {o.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <button className="p-3 bg-white dark:bg-slate-800 text-primary rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all">
                                            <ArrowLeft className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm inline-block mb-4">
                                    <CheckCircle className="w-10 h-10 text-emerald-500 opacity-40" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">Tudo em conformidade</p>
                            </div>
                        )}
                    </div>

                    <div id="boat-history" className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 flex flex-col">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <div className="p-2 bg-blue-50 dark:bg-blue-400/10 rounded-xl text-blue-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            Histórico de Manutenções
                        </h3>
                        <div className="space-y-6 flex-1">
                            {orders.filter(o => o.status === OSStatus.COMPLETED).slice(0, 3).map(o => (
                                <div key={o.id} className="flex gap-5 items-start relative group">
                                    <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-100 dark:bg-slate-700 group-last:hidden" />
                                    <div className="bg-emerald-50 dark:bg-emerald-400/10 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400 ring-4 ring-white dark:ring-slate-800 z-10 transition-transform group-hover:scale-110">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{o.description}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1 italic">Concluído • {new Date(o.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.status === OSStatus.COMPLETED).length === 0 && (
                                <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-slate-300 dark:text-slate-600">
                                    <Clipboard className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sem registros históricos</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            Ver prontuário digital completo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const saveOrderUpdate = async (updatedOrder: ServiceOrder) => {
        console.log("Saving order update:", updatedOrder);
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (selectedOrder && selectedOrder.id === updatedOrder.id) {
                setSelectedOrder(updatedOrder);
            }

            // Persist to Backend (Only supported fields)
            // Note: Checklist, TimeLogs, Attachments are not yet supported by Backend schema
            await ApiService.updateOrder(updatedOrder.id, {
                description: updatedOrder.description,
                technicianName: updatedOrder.technicianName,
                diagnosis: updatedOrder.diagnosis,
                status: updatedOrder.status,
                checklist: updatedOrder.checklist // Agora suportado pelo Backend
            });
        } catch (error) {
            console.error("Falha ao atualizar ordem:", error);
            alert("Erro ao salvar alterações no servidor.");
        }
    };

    const handleStatusChange = async (id: number, newStatus: OSStatus) => {
        try {
            if (newStatus === OSStatus.COMPLETED) {
                if (!window.confirm("CONFIRMAÇÃO DE BAIXA:\n\n1. O estoque dos itens utilizados será baixado.\n2. A receita será lançada no financeiro.\n3. A OS será bloqueada para edição.\n\nDeseja concluir o serviço?")) return;

                await ApiService.completeOrder(id);
                alert("Ordem concluída com sucesso!");
                refreshData();
                setSelectedOrder(prev => prev ? ({ ...prev, status: OSStatus.COMPLETED }) : null);
            } else if (newStatus === OSStatus.CANCELED) {
                if (!window.confirm("Deseja cancelar esta ordem?")) return;
                await ApiService.updateOrder(id, { status: OSStatus.CANCELED });
                refreshData();
            } else {
                await ApiService.updateOrder(id, { status: newStatus });
                refreshData();
                // Update local selected order status immediately for UI responsiveness
                if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            }
        } catch (error) {
            console.error("Erro ao mudar status:", error);
            alert("Erro ao atualizar status. Verifique conexao.");
        }
    };

    const handleSendQuotation = async (id: number) => {
        try {
            if (!window.confirm("Deseja enviar este orçamento para aprovação do cliente via Telegram/E-mail?")) return;

            const updated = await ApiService.sendQuotation(id);
            alert("Orçamento enviado com sucesso!");
            setSelectedOrder(updated);
            refreshData();

        } catch (error) {
            console.error("Erro ao enviar orçamento:", error);
            alert("Falha ao enviar orçamento. Verifique a integração com n8n.");
        }
    };

    const handleReopenOrder = async (id: number) => {
        try {
            if (!window.confirm("CONFIRMAÇÃO DE REABERTURA:\n\n1. O estoque será devolvido.\n2. A receita pendente será cancelada.\n3. A OS voltará para status 'Em Execução'.\n\nDeseja reabrir esta ordem?")) return;

            await ApiService.reopenOrder(id);
            alert("Ordem reaberta com sucesso!");
            refreshData();
            // Optional: Update selected order specifically
            const updated = await ApiService.getOrder(id);
            setSelectedOrder(updated);

        } catch (error) {
            console.error("Erro ao reabrir ordem:", error);
            alert("Falha ao reabrir ordem de serviço. Verifique se ela pode ser reaberta.");
        }
    };


    const handleCreateOrder = async (boatId: string, description: string, duration?: number) => {
        if (!boatId || !description) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const newOrder = await ApiService.createOrder({
                boatId: parseInt(boatId),
                description,
                estimatedDuration: duration || 2
            });
            await refreshData();
            setIsCreating(false);
            // Optionally auto-select:
            const freshOrders = await ApiService.getOrders();
            const created = freshOrders.find((o: ServiceOrder) => o.id.toString() === newOrder.id.toString()); // flexible compare
            if (created) setSelectedOrder(created);

        } catch (error) {
            console.error("Erro ao criar OS:", error);
            alert("Falha ao criar ordem de serviço.");
        }
    };

    const handleTimeLog = (action: 'START' | 'STOP') => {
        if (!selectedOrder) return;

        const now = new Date().toISOString();
        let logs = [...(selectedOrder.timeLogs || [])];

        if (action === 'START') {
            const lastLog = logs[logs.length - 1];
            if (lastLog && !lastLog.end) {
                return;
            }
            logs.push({ start: now });
        } else {
            const lastIndex = logs.length - 1;
            if (lastIndex >= 0 && !logs[lastIndex].end) {
                logs[lastIndex] = { ...logs[lastIndex], end: now };
            } else {
                return;
            }
        }

        saveOrderUpdate({ ...selectedOrder, timeLogs: logs });
    };

    const loadChecklistTemplate = (templateKey: string) => {
        if (!selectedOrder || isReadOnly) return;
        const template = CHECKLIST_TEMPLATES[templateKey as keyof typeof CHECKLIST_TEMPLATES];
        const checklistItems: ChecklistItem[] = template.map((label, idx) => ({
            id: `chk-${Date.now()}-${idx}`,
            label,
            checked: false
        }));

        saveOrderUpdate({ ...selectedOrder, checklist: checklistItems });
    };

    const toggleChecklistItem = (itemId: string) => {
        if (!selectedOrder || !selectedOrder.checklist || isReadOnly) return;
        const updatedChecklist = selectedOrder.checklist.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        saveOrderUpdate({ ...selectedOrder, checklist: updatedChecklist });
    };

    const triggerFileUpload = (type: AttachmentType) => {
        setPendingAttachmentType(type);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedOrder || !pendingAttachmentType) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem é muito grande. Por favor, use uma imagem menor que 5MB.");
            return;
        }

        try {
            // Try uploading to Supabase
            const publicUrl = await uploadImage(file, `orders/${selectedOrder.id}`);

            if (publicUrl) {
                const newAttachment = {
                    type: pendingAttachmentType,
                    url: publicUrl,
                    description: `Foto adicionada em ${new Date().toLocaleTimeString()}`,
                    createdAt: new Date().toISOString()
                };

                saveOrderUpdate({
                    ...selectedOrder,
                    attachments: [...(selectedOrder.attachments || []), newAttachment]
                });

                setPendingAttachmentType(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
        } catch (err) {
            console.error("Supabase upload failed, falling back to Base64", err);
            // Fallback to Base64 logic if Supabase fails (e.g. no connection or no config)
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;

            const newAttachment = {
                type: pendingAttachmentType,
                url: base64String,
                description: `Foto (Local) adicionada em ${new Date().toLocaleTimeString()}`,
                createdAt: new Date().toISOString()
            };

            saveOrderUpdate({
                ...selectedOrder,
                attachments: [...(selectedOrder.attachments || []), newAttachment]
            });

            setPendingAttachmentType(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const deleteAttachment = (indexToRemove: number) => {
        if (!selectedOrder || !selectedOrder.attachments || isReadOnly) return;
        if (!window.confirm("Deseja excluir esta foto?")) return;

        const updatedAttachments = selectedOrder.attachments.filter((_, idx) => idx !== indexToRemove);
        saveOrderUpdate({ ...selectedOrder, attachments: updatedAttachments });
    };

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !selectedOrder) return;
        const files = Array.from(e.target.files);

        // Simulação de upload para design premium
        for (const file of files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newAttachment = {
                    type: 'OTHER',
                    url: base64String,
                    description: `Anexado em ${new Date().toLocaleTimeString()}`,
                    createdAt: new Date().toISOString()
                };
                saveOrderUpdate({
                    ...selectedOrder,
                    attachments: [...(selectedOrder.attachments || []), newAttachment]
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const sendWhatsApp = () => {
        if (!selectedOrder) return;
        const boat = boats.find(b => b.id === selectedOrder.boatId);
        const client = clients.find(c => c.id === boat?.clientId);
        if (!client || !client.phone) {
            alert("Telefone do cliente não cadastrado.");
            return;
        }

        const msg = `Olá ${client.name}, aqui é da Mare Alta Náutica.\n\nAtualização sobre a OS #${selectedOrder.id} (${boat?.name}):\nStatus: ${selectedOrder.status}\n\nQualquer dúvida, estamos à disposição.`;
        const url = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const onPrintOrder = () => {
        if (!selectedOrder) return;
        onNavigate?.('print-order', { order: selectedOrder });
    };

    const handleEmitFiscal = () => {
        if (!selectedOrder || !onNavigate) return;
        const boat = boats.find(b => b.id === selectedOrder.boatId);
        const client = clients.find(c => c.id === boat?.clientId);

        onNavigate('fiscal', {
            type: 'from_order',
            order: selectedOrder,
            client: client,
            items: selectedOrder.items
        });
    };

    const runAiDiagnosis = async () => {
        if (!selectedOrder) return;
        setIsAnalyzing(true);
        setAiAnalysis('');
        const boat = boats.find(b => b.id === selectedOrder.boatId);
        const engine = boat?.engines.find(e => e.id === selectedOrder.engineId);
        const result = await GeminiService.analyzeProblem(
            boat?.model || 'Desconhecido',
            engine?.model || 'Desconhecido',
            selectedOrder.description
        );
        setAiAnalysis(result);
        setIsAnalyzing(false);
    };

    // --- ITEM ADDITION LOGIC ---

    const handlePartSelect = (item: Part) => {
        setSelectedPartId(item.id.toString());
        setPartPrice(item.price);
        setPartCost(item.cost);
        setPartSearch(item.name);
    };

    const handleAddPart = async () => {
        if (!selectedOrder || !selectedPartId || isReadOnly) return;
        const part = parts.find(p => p.id.toString() === selectedPartId);
        if (!part) return;

        try {
            await ApiService.addOrderItem(selectedOrder.id, {
                type: ItemType.PART,
                description: part.name,
                partId: part.id as number,
                quantity: partQty,
                unitPrice: partPrice,
                total: partQty * partPrice
            });

            // Reload order to reflect items
            const updated = await ApiService.getOrder(selectedOrder.id);
            setSelectedOrder(updated);

            // Reset Form
            setSelectedPartId('');
            setPartQty(1);
            setPartPrice(0);
            setPartCost(0);
            setPartSearch('');

        } catch (error) {
            console.error("Erro ao adicionar peça:", error);
            alert("Não foi possível adicionar o item.");
        }
    };

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceId = e.target.value;
        setSelectedServiceId(serviceId);
        const service = servicesCatalog.find(s => s.id === serviceId);
        if (service) {
            setServicePrice(service.defaultPrice);
        }
    };

    const handleAddService = async () => {
        if (!selectedOrder || !selectedServiceId || isReadOnly) return;
        const service = servicesCatalog.find(s => s.id === selectedServiceId);
        if (!service) return;

        try {
            await ApiService.addOrderItem(selectedOrder.id, {
                type: ItemType.LABOR,
                description: service.name,
                quantity: 1,
                unitPrice: servicePrice,
                total: servicePrice
            });

            // Reload order to reflect items
            const updated = await ApiService.getOrder(selectedOrder.id);
            setSelectedOrder(updated);

            setSelectedServiceId('');
            setServicePrice(0);

        } catch (error) {
            console.error("Erro ao adicionar serviço:", error);
            alert("Não foi possível adicionar o serviço.");
        }
    };

    const handleEditItem = (item: ServiceItem) => {
        if (isReadOnly) return;
        setEditingItemId(item.id);
        setEditQty(item.quantity);
        setEditPrice(item.unitPrice);
    };

    const handleSaveItem = () => {
        alert("Edição de serviço/item não suportada pelo backend no momento.");
        setEditingItemId(null);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
    };

    const removeItemFromOrder = (itemId: string | number) => {
        alert("Remoção de item não suportada pelo backend no momento.");
    };

    const filteredOrders = orders.filter(order => {
        const boat = boats.find(b => b.id === order.boatId);
        const client = clients.find(c => c.id === boat?.clientId);
        const matchesText =
            String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            boat?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesText && matchesStatus;
    });

    const getOrderContext = (order: ServiceOrder) => {
        const boat = boats.find(b => b.id === order.boatId);
        const client = clients.find(c => c.id === boat?.clientId);
        const marina = marinas.find(m => m.id === boat?.marinaId);
        return { boat, client, marina };
    };

    const getLastLog = () => selectedOrder?.timeLogs?.[selectedOrder.timeLogs.length - 1];
    const isTimerRunning = !!(getLastLog() && !getLastLog()?.end);

    const filteredParts = parts.filter(p =>
        !partSearch ||
        p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(partSearch.toLowerCase()) ||
        (p.barcode && p.barcode.includes(partSearch))
    );

    const [isPrintOrderOpen, setIsPrintOrderOpen] = useState(false);
    const [isPrintBudgetOpen, setIsPrintBudgetOpen] = useState(false);

    const calculateProfit = (order: ServiceOrder) => {
        const totalRevenue = order.totalValue;
        const totalPartCost = order.items.reduce((acc, item) => {
            if (item.type === ItemType.PART && item.unitCost) {
                return acc + (item.unitCost * item.quantity);
            }
            return acc;
        }, 0);

        // Assume estimated internal labor cost is 30% of labor price (commission + salary)
        const estimatedLaborCost = order.items.reduce((acc, item) => {
            if (item.type === ItemType.LABOR) {
                return acc + (item.total * 0.3);
            }
            return acc;
        }, 0);

        const totalCost = totalPartCost + estimatedLaborCost;
        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalPartCost, estimatedLaborCost, profit, margin };
    };

    const CreateOrderModal = () => {
        const [desc, setDesc] = useState('');
        const [boatId, setBoatId] = useState('');
        const [duration, setDuration] = useState(2);

        // Sync with newly created boat
        useEffect(() => {
            if (newlyCreatedBoatId) {
                setBoatId(newlyCreatedBoatId);
            } else if (boats.length > 0 && !boatId) {
                setBoatId(String(boats[0].id));
            }
        }, [boats, newlyCreatedBoatId]);

        return (
            <div className="w-full animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nova Ordem de Serviço</h3>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Embarcação</label>
                        <select
                            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                            value={boatId}
                            onChange={(e) => {
                                if (e.target.value === 'new_boat') {
                                    setIsQuickBoatOpen(true);
                                } else {
                                    setBoatId(e.target.value);
                                }
                            }}
                        >
                            <option value="new_boat" className="font-bold text-primary">+ Nova Embarcação</option>
                            {boats.map(b => (
                                <option key={b.id} value={b.id}>{b.name} ({b.model})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Tempo Estimado (Horas)</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="number"
                                    className="w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-black focus:ring-4 focus:ring-primary/10 transition-all"
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Escopo Inicial / Problemas Relatados</label>
                        <textarea
                            className="w-full p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-slate-800 dark:text-slate-200 h-40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium leading-relaxed resize-none shadow-inner"
                            placeholder="Descreva o que seu cliente reportou..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={() => handleCreateOrder(boatId, desc, duration)}
                            className="flex-[2] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Formalizar Abertura
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ItemSearchModal = () => {
        const [search, setSearch] = useState('');

        const filtered = parts.filter(p =>
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode && p.barcode.includes(search))
        ).slice(0, 50);

        const selectPart = (part: Part) => {
            setSelectedPartId(part.id.toString());
            setPartPrice(part.price);
            setPartCost(part.cost);
            setPartSearch(`${part.name} (${part.sku})`);
            setIsItemSearchOpen(false);
        };

        return (
            <div className="w-full animate-fade-in flex flex-col h-[70vh]">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Catálogo de Peças</h3>
                    </div>
                </div>

                <div className="relative mb-8 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        autoFocus
                        className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none shadow-inner"
                        placeholder="Procure por SKU, Nome ou Código de Barras..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto rounded-[2rem] border border-slate-100 dark:border-slate-700 scrollbar-thin shadow-xl shadow-slate-200/40 dark:shadow-black/20 bg-white dark:bg-slate-800/50">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SKU do Item</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Disponível</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Venda (R$)</th>
                                <th className="p-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group/row">
                                    <td className="p-6 font-mono text-xs text-slate-400 group-hover/row:text-primary transition-colors">{p.sku}</td>
                                    <td className="p-6">
                                        <p className="font-black text-slate-800 dark:text-slate-200 tracking-tight leading-tight">{p.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{p.manufacturer || 'Original'}</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.quantity > 0 ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-400/10 text-rose-600'}`}>
                                            {p.quantity} UN
                                        </span>
                                    </td>
                                    <td className="p-6 text-right font-black text-slate-900 dark:text-white">
                                        {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => selectPart(p)}
                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/row:opacity-100"
                                        >
                                            Adicionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Package className="w-12 h-12 mb-4" />
                                            <p className="text-[11px] font-black uppercase tracking-widest">Nenhum item localizado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
            />

            {/* PRINT LAYOUT - Uses Global CSS .print-only-content */}
            {selectedOrder && (
                <div className="print-only-content hidden">
                    <div className="text-center mb-6 border-b pb-4">
                        <h1 className="text-2xl font-bold uppercase tracking-wide">Mare Alta Náutica</h1>
                        <p className="text-sm">Ordem de Serviço #{selectedOrder.id}</p>
                        <p className="text-sm">{new Date().toLocaleDateString()}</p>
                        <div className="mt-2 text-xl font-bold">{selectedOrder.status.toUpperCase()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <p className="font-bold text-slate-600 uppercase text-xs">Cliente</p>
                            <p className="font-bold text-lg">{getOrderContext(selectedOrder).client?.name}</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-600 uppercase text-xs">Embarcação</p>
                            <p className="font-bold text-lg">{getOrderContext(selectedOrder).boat?.name}</p>
                            <p>{getOrderContext(selectedOrder).boat?.model}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="font-bold text-slate-600 uppercase text-xs mb-1">Descrição do Serviço</p>
                        <div className="border p-4 rounded bg-slate-50">{selectedOrder.description}</div>
                    </div>

                    <table className="w-full border-collapse mb-6 text-sm">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border p-2 text-left">Item / Serviço</th>
                                <th className="border p-2 text-right">Qtd</th>
                                <th className="border p-2 text-right">V. Unit</th>
                                <th className="border p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.items.map(i => (
                                <tr key={i.id}>
                                    <td className="border p-2">{i.description}</td>
                                    <td className="border p-2 text-right">{i.quantity}</td>
                                    <td className="border p-2 text-right">R$ {i.unitPrice.toFixed(2)}</td>
                                    <td className="border p-2 text-right">R$ {i.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 font-bold">
                                <td colSpan={3} className="border p-2 text-right">TOTAL GERAL</td>
                                <td className="border p-2 text-right">R$ {selectedOrder.totalValue.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {selectedOrder.technicianNotes && (
                        <div className="border p-4 mb-4 rounded">
                            <h3 className="font-bold text-sm uppercase mb-2">Observações Técnicas</h3>
                            <p className="text-sm">{selectedOrder.technicianNotes}</p>
                        </div>
                    )}

                    <div className="mt-12 flex justify-between text-xs text-center">
                        <div className="w-1/3 border-t pt-2">Assinatura Cliente</div>
                        <div className="w-1/3 border-t pt-2">Assinatura Técnico</div>
                    </div>
                </div>
            )}

            {/* SCREEN LAYOUT */}
            <div className="flex h-full w-full print:hidden">
                {/* Left List */}
                <div className={`w-full lg:w-[380px] border-r border-slate-200 dark:border-slate-700 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 transition-all duration-500 ${selectedOrder ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                {isTechnician ? 'Meus Serviços' : 'Serviços'}
                            </h2>
                            {!isTechnician && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                                    title="Nova Ordem de Serviço"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar por OS, Barco ou Cliente..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Todos os Status</option>
                                {Object.values(OSStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 lg:pb-6 scrollbar-thin">
                        {filteredOrders.map(order => {
                            const boat = boats.find(b => b.id === order.boatId);
                            const isActive = selectedOrder?.id === order.id;
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => { setSelectedOrder(order); setActiveTab('details'); }}
                                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden group ${isActive
                                        ? 'bg-white dark:bg-slate-800 border-primary shadow-xl shadow-primary/10'
                                        : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                >
                                    {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">#{order.id}</span>
                                        <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border ${order.status === OSStatus.COMPLETED ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50' :
                                            order.status === OSStatus.CANCELED ? 'bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border-red-100/50' :
                                                'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100/50'
                                            }`}>{order.status}</span>
                                    </div>
                                    <h4 className={`font-black tracking-tight ${isActive ? 'text-primary' : 'text-slate-800 dark:text-white transition-colors group-hover:text-primary'}`}>{boat?.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 italic font-medium">{order.description}</p>
                                </div>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12 flex flex-col items-center opacity-40">
                                <Search className="w-12 h-12 mb-4 text-slate-300" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum resultado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Detail */}
                <div className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-800 overflow-hidden transition-all duration-500 ${!selectedOrder ? 'hidden lg:flex items-center justify-center' : 'flex fixed inset-0 z-[60] lg:static'}`}>
                    {!selectedOrder ? (
                        <div className="text-center animate-fade-in group">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-700">
                                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Selecione uma Ordem de Serviço</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center bg-white dark:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="lg:hidden p-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">OS #{selectedOrder.id}</h2>

                                            {role === UserRole.ADMIN && !isReadOnly ? (
                                                <div className="relative">
                                                    <select
                                                        className="text-[10px] font-black px-4 py-2 rounded-xl cursor-pointer border-2 border-primary/20 bg-primary/5 text-primary focus:ring-4 focus:ring-primary/10 outline-none uppercase tracking-widest appearance-none pr-8 transition-all"
                                                        value={selectedOrder.status}
                                                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OSStatus)}
                                                    >
                                                        <option value={OSStatus.PENDING}>Pendente</option>
                                                        <option value={OSStatus.QUOTATION}>Em Orçamento</option>
                                                        <option value={OSStatus.APPROVED}>Aprovado</option>
                                                        <option value={OSStatus.IN_PROGRESS}>Em Execução</option>
                                                        <option value={OSStatus.COMPLETED}>Concluir (Baixar)</option>
                                                        <option value={OSStatus.CANCELED}>Cancelar</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-primary" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border ${selectedOrder.status === OSStatus.COMPLETED ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50' :
                                                    'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100/50'
                                                    }`}>{selectedOrder.status}</span>
                                            )}

                                            {isReadOnly && (
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-slate-400 group relative" title="OS Bloqueada">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{getOrderContext(selectedOrder).client?.name}</p>
                                            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{getOrderContext(selectedOrder).boat?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                                    <div className="flex gap-2 mr-2 border-r border-slate-100 dark:border-slate-700 pr-3">
                                        <button onClick={sendWhatsApp} className="p-3 bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-400/20 hover:scale-110 transition-all shadow-sm" title="WhatsApp">
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                        {!isTechnician && (
                                            <button onClick={onPrintOrder} className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all shadow-sm">
                                                <Printer className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleEmitFiscal}
                                            disabled={!onNavigate}
                                            className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                                        >
                                            <FileDigit className="w-4 h-4" />
                                            <span className="hidden sm:inline">Emitir Nota</span>
                                        </button>

                                        {role === UserRole.ADMIN && (selectedOrder.status === OSStatus.PENDING || selectedOrder.status === OSStatus.QUOTATION) && (
                                            <button
                                                onClick={() => handleSendQuotation(selectedOrder.id)}
                                                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                                            >
                                                <Send className="w-4 h-4" /> Enviar Orçamento
                                            </button>
                                        )}

                                        {role === UserRole.ADMIN && !isReadOnly && (
                                            <button
                                                onClick={() => handleStatusChange(selectedOrder.id, OSStatus.COMPLETED)}
                                                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Finalizar & Baixar
                                            </button>
                                        )}

                                        {role === UserRole.ADMIN && selectedOrder.status === OSStatus.COMPLETED && (
                                            <button
                                                onClick={() => handleReopenOrder(selectedOrder.id)}
                                                className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-amber-200 dark:shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
                                            >
                                                <Unlock className="w-4 h-4" /> Reabrir OS
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isReadOnly && (
                                <div className="bg-amber-50/50 dark:bg-amber-400/5 p-4 text-center">
                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" /> Arquivado • Somente Leitura
                                    </p>
                                </div>
                            )}

                            {/* Tabs Navigation */}
                            <div className="flex border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 lg:px-12 overflow-x-auto no-scrollbar print:hidden">
                                {[
                                    { id: 'details', label: 'Detalhes' },
                                    { id: 'checklist', label: 'Checklist' },
                                    { id: 'parts', label: 'Itens & Peças' },
                                    { id: 'media', label: 'Mídia' },
                                    { id: 'report', label: 'Relatório', tech: true },
                                    { id: 'delivery', label: 'E. Técnica' },
                                    { id: 'profit', label: 'Lucratividade', admin: true },
                                ].map((tab) => {
                                    if (tab.tech && !isTechnician && role !== UserRole.ADMIN) return null;
                                    if (tab.admin && isTechnician) return null;
                                    const active = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] min-w-max relative transition-all duration-300 ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {tab.label}
                                            {active && (
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 lg:p-12 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                                {activeTab === 'details' && (
                                    <div className="space-y-10 max-w-5xl animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 group hover:border-primary/30 transition-all">
                                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Informações da Embarcação</h3>
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-[1.5rem] text-primary group-hover:scale-110 transition-transform">
                                                        <Package className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{getOrderContext(selectedOrder).boat?.name}</p>
                                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 italic">{getOrderContext(selectedOrder).boat?.model}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 group hover:border-primary/30 transition-all">
                                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Proprietário</h3>
                                                <div className="flex items-center gap-5">
                                                    <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-[1.5rem] text-primary group-hover:scale-110 transition-transform">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{getOrderContext(selectedOrder).client?.name}</p>
                                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 italic">{getOrderContext(selectedOrder).client?.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Escopo do Serviço</h3>
                                            </div>
                                            <textarea
                                                readOnly={isReadOnly}
                                                className="w-full p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl text-slate-800 dark:text-slate-200 h-40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium leading-relaxed resize-none"
                                                placeholder="Descreva as tarefas e observações iniciais..."
                                                value={selectedOrder.description}
                                                onChange={(e) => saveOrderUpdate({ ...selectedOrder, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                                    <User className="w-4 h-4" /> Técnico Responsável
                                                </label>
                                                <select
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none disabled:opacity-50"
                                                    value={selectedOrder.technicianName || ''}
                                                    onChange={e => saveOrderUpdate({ ...selectedOrder, technicianName: e.target.value })}
                                                    disabled={isTechnician || isReadOnly}
                                                >
                                                    <option value="">Selecione um técnico...</option>
                                                    {users.filter(u => u.role === UserRole.TECHNICIAN).map(tech => (
                                                        <option key={tech.id} value={tech.name}>{tech.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                                    <Clock className="w-4 h-4" /> Data Agendamento
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                                                    value={selectedOrder.scheduledAt ? new Date(selectedOrder.scheduledAt).toISOString().slice(0, 16) : ''}
                                                    onChange={e => saveOrderUpdate({ ...selectedOrder, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 flex flex-col justify-between">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                                    <Clock className="w-4 h-4" /> Gestão de Tempo
                                                </label>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleTimeLog('START')}
                                                        disabled={isTimerRunning || isReadOnly}
                                                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${isTimerRunning || isReadOnly
                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                            : 'bg-emerald-600 text-white hover:scale-105 active:scale-95 shadow-emerald-200 dark:shadow-black/20'
                                                            }`}
                                                    >
                                                        Iniciar
                                                    </button>
                                                    <button
                                                        onClick={() => handleTimeLog('STOP')}
                                                        disabled={!isTimerRunning || isReadOnly}
                                                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${!isTimerRunning || isReadOnly
                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                            : 'bg-rose-600 text-white hover:scale-105 active:scale-95 shadow-rose-200 dark:shadow-black/20'
                                                            }`}
                                                    >
                                                        Parar
                                                    </button>
                                                </div>
                                                {isTimerRunning && (
                                                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-500">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Cronômetro em Execução</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                                <BrainCircuit className="w-40 h-40 text-purple-600" />
                                            </div>
                                            <div className="flex-1 space-y-4 relative z-10">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assistente Inteligente</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">Use nossa inteligência artificial para analisar o problema descrito e sugerir diagnósticos técnicos baseados em modelos semelhantes.</p>
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={runAiDiagnosis}
                                                        disabled={isAnalyzing}
                                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-purple-200 dark:shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                                    >
                                                        <BrainCircuit className="w-5 h-5" />
                                                        {isAnalyzing ? 'Processando...' : 'Gerar Diagnóstico IA'}
                                                    </button>
                                                )}
                                            </div>
                                            {aiAnalysis && (
                                                <div className="w-full lg:w-1/2 p-6 bg-purple-50 dark:bg-purple-400/5 rounded-3xl border border-purple-100 dark:border-purple-400/20 text-sm text-slate-700 dark:text-slate-300 relative z-10 leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin italic" dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'checklist' && (
                                    <div className="max-w-4xl animate-fade-in space-y-10">
                                        {!isReadOnly && (
                                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Modelos Pré-definidos</h3>
                                                <div className="flex flex-wrap gap-4">
                                                    <button onClick={() => loadChecklistTemplate('REVISAO_100')} className="px-6 py-4 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all">Revisão Periódica 100h</button>
                                                    <button onClick={() => loadChecklistTemplate('ENTREGA_TECNICA')} className="px-6 py-4 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all">Protocolo Entrega Técnica</button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid gap-4">
                                            {!selectedOrder.checklist || selectedOrder.checklist.length === 0 ? (
                                                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 opacity-50">
                                                    <CheckSquare className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-600" />
                                                    <p className="text-[11px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Nenhum checklist ativo para esta OS</p>
                                                </div>
                                            ) : (
                                                selectedOrder.checklist.map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleChecklistItem(item.id)}
                                                        className={`flex items-center gap-5 p-6 border-2 rounded-3xl transition-all cursor-pointer group ${item.checked
                                                            ? 'bg-emerald-50/50 dark:bg-emerald-400/5 border-emerald-100 dark:border-emerald-400/20 shadow-sm'
                                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/30 shadow-md'
                                                            } ${isReadOnly ? 'opacity-70 grayscale pointer-events-none' : ''}`}
                                                    >
                                                        <div className={`w-10 h-10 flex-shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all ${item.checked
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-black/20'
                                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 group-hover:border-primary'
                                                            }`}>
                                                            {item.checked ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 transition-all" />}
                                                        </div>
                                                        <span className={`text-[15px] font-bold tracking-tight transition-all ${item.checked ? 'text-emerald-700 dark:text-emerald-400/70 line-through' : 'text-slate-800 dark:text-slate-100'
                                                            }`}>{item.label}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'parts' && (
                                    <div className="space-y-10 animate-fade-in">
                                        {!isReadOnly && !isTechnician && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Add Part Section */}
                                                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 group hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-3 mb-8">
                                                        <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-xl text-primary">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Adicionar Peças</h4>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Item do Estoque</label>
                                                            <div className="flex gap-3">
                                                                <input
                                                                    readOnly
                                                                    className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                                                                    placeholder="Nenhum item selecionado..."
                                                                    value={partSearch}
                                                                />
                                                                <button
                                                                    onClick={() => setIsItemSearchOpen(true)}
                                                                    className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                                >
                                                                    <Search className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Quantidade</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-black text-center focus:ring-4 focus:ring-primary/10 transition-all"
                                                                    value={partQty}
                                                                    onChange={e => setPartQty(Number(e.target.value))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Preço Unitário</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-black focus:ring-4 focus:ring-primary/10 transition-all"
                                                                    value={partPrice}
                                                                    onChange={e => setPartPrice(Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handleAddPart}
                                                            disabled={!selectedPartId}
                                                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
                                                        >
                                                            Adicionar ao Orçamento
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Add Service Section */}
                                                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 group hover:border-primary/30 transition-all flex flex-col">
                                                    <div className="flex items-center gap-3 mb-8">
                                                        <div className="p-2 bg-blue/5 dark:bg-blue/10 rounded-xl text-blue-500">
                                                            <Wrench className="w-6 h-6" />
                                                        </div>
                                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Mão de Obra</h4>
                                                    </div>
                                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Tipo de Serviço</label>
                                                            <select
                                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                                                value={selectedServiceId}
                                                                onChange={handleServiceSelect}
                                                            >
                                                                <option value="">Selecione do Catálogo...</option>
                                                                {servicesCatalog.map(s => (
                                                                    <option key={s.id} value={s.id}>[{s.category}] {s.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Preço do Serviço</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-black focus:ring-4 focus:ring-primary/10 transition-all"
                                                                value={servicePrice}
                                                                onChange={e => setServicePrice(Number(e.target.value))}
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={handleAddService}
                                                            disabled={!selectedServiceId}
                                                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
                                                        >
                                                            Lançar Mão de Obra
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
                                            <div className="overflow-x-auto scrollbar-thin">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Item / Descrição</th>
                                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Qtd</th>
                                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Unitário</th>
                                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Total</th>
                                                            {!isReadOnly && <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Ações</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                        {selectedOrder.items.length === 0 && (
                                                            <tr>
                                                                <td colSpan={5} className="px-8 py-20 text-center opacity-30">
                                                                    <Clipboard className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-600" />
                                                                    <p className="text-[11px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.3em]">Nenhum item adicionado à ordem</p>
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {selectedOrder.items.map(item => (
                                                            <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`p-2 rounded-xl border ${item.type === ItemType.PART ? 'bg-primary/5 border-primary/10 text-primary' : 'bg-blue-50/50 border-blue-100 text-blue-500 dark:bg-blue-400/5 dark:border-blue-400/10 dark:text-blue-400'}`}>
                                                                            {item.type === ItemType.PART ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">{item.description}</p>
                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{item.type === ItemType.PART ? 'Peça de Reposição' : 'Serviço Técnico'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    {editingItemId === item.id ? (
                                                                        <input
                                                                            type="number"
                                                                            className="w-20 px-3 py-2 bg-white dark:bg-slate-900 border border-primary rounded-xl text-center font-black focus:ring-4 focus:ring-primary/10"
                                                                            value={editQty}
                                                                            onChange={e => setEditQty(Number(e.target.value))}
                                                                        />
                                                                    ) : (
                                                                        <span className="font-black text-slate-600 dark:text-slate-400">{item.quantity}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    {editingItemId === item.id ? (
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="w-28 px-3 py-2 bg-white dark:bg-slate-900 border border-primary rounded-xl text-right font-black focus:ring-4 focus:ring-primary/10"
                                                                            value={editPrice}
                                                                            onChange={e => setEditPrice(Number(e.target.value))}
                                                                        />
                                                                    ) : (
                                                                        <span className="font-bold text-slate-500 dark:text-slate-400">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white text-lg tracking-tight">
                                                                    R$ {(editingItemId === item.id ? (editQty * editPrice) : item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    {!isReadOnly && (
                                                                        <div className="flex justify-center gap-2">
                                                                            {editingItemId === item.id ? (
                                                                                <>
                                                                                    <button onClick={handleSaveItem} className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm hover:scale-110 active:scale-95 transition-all">
                                                                                        <CheckCircle className="w-4 h-4" />
                                                                                    </button>
                                                                                    <button onClick={handleCancelEdit} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:scale-110 active:scale-95 transition-all">
                                                                                        <X className="w-4 h-4" />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button onClick={() => handleEditItem(item)} className="p-2.5 text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                                                        <Pencil className="w-5 h-5" />
                                                                                    </button>
                                                                                    <button onClick={() => removeItemFromOrder(item.id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                                                                                        <Trash2 className="w-5 h-5" />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="bg-slate-900 dark:bg-white p-12 flex flex-col md:flex-row justify-between items-center gap-8 transition-colors">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2 text-center md:text-left">Investimento Total na OS</p>
                                                    <p className="text-5xl font-black text-white dark:text-primary tracking-tighter text-center md:text-left">R$ {selectedOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="text-center md:text-right space-y-3">
                                                    <div className="flex gap-4 justify-center md:justify-end">
                                                        <div className="bg-white/5 dark:bg-slate-100 p-4 rounded-2xl border border-white/10 dark:border-slate-200">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Peças</p>
                                                            <p className="text-xl font-black text-white dark:text-slate-900 leading-none">R$ {(selectedOrder.items.filter(i => i.type === ItemType.PART).reduce((acc, current) => acc + current.total, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                        <div className="bg-white/5 dark:bg-slate-100 p-4 rounded-2xl border border-white/10 dark:border-slate-200">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Serviços</p>
                                                            <p className="text-xl font-black text-white dark:text-slate-900 leading-none">R$ {(selectedOrder.items.filter(i => i.type === ItemType.LABOR).reduce((acc, current) => acc + current.total, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'media' && (
                                    <div className="space-y-10 animate-fade-in group">
                                        {!isReadOnly && (
                                            <div className="bg-white dark:bg-slate-800 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all flex flex-col items-center justify-center group/upload relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                                <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 text-primary group-hover/upload:scale-110 transition-transform relative z-10">
                                                    <Camera className="w-10 h-10" />
                                                </div>
                                                <div className="text-center relative z-10">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Central de Anexos</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">Selecione fotos do diagnóstico, peças desgastadas e pós-serviço</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleMediaUpload}
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {selectedOrder.attachments && selectedOrder.attachments.map((att, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden group/item shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700">
                                                    <img
                                                        src={att.url}
                                                        alt={att.description || `Anexo ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white transition-all opacity-100 lg:opacity-0 group-hover/item:opacity-100">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">{att.type}</p>
                                                    </div>
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/item:opacity-100 backdrop-blur-[2px] transition-all flex items-center justify-center gap-3">
                                                        <button onClick={() => window.open(att.url, '_blank')} className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform scale-90 group-hover/item:scale-100 shadow-xl">
                                                            <Search className="w-5 h-5" />
                                                        </button>
                                                        {!isReadOnly && (
                                                            <button onClick={() => deleteAttachment(idx)} className="p-3 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform scale-90 delay-75 group-hover/item:scale-100 shadow-xl">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedOrder.attachments || selectedOrder.attachments.length === 0) && (
                                                <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 opacity-50 flex flex-col items-center">
                                                    <ImagePlus className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-600" />
                                                    <p className="text-[11px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Nenhuma foto ou vídeo anexado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'report' && (
                                    <div className="max-w-4xl animate-fade-in space-y-10">
                                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Relatório Técnico de Execução</h3>
                                            </div>
                                            <textarea
                                                readOnly={isReadOnly}
                                                className="w-full p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-slate-800 dark:text-slate-200 h-96 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium leading-relaxed resize-none shadow-inner"
                                                placeholder="Descreva detalhadamente o serviço realizado, problemas encontrados e recomendações futuras..."
                                                value={selectedOrder.technicianNotes || ''}
                                                onChange={(e) => saveOrderUpdate({ ...selectedOrder, technicianNotes: e.target.value })}
                                            />
                                            <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-5">
                                                <div className="p-3 bg-primary text-white rounded-xl">
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <p className="text-[11px] font-bold text-primary uppercase tracking-widest leading-relaxed">Este relatório será enviado ao proprietário e fará parte do prontuário histórico da embarcação.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'delivery' && (
                                    <div className="animate-fade-in">
                                        <div className="max-w-4xl mx-auto py-12 text-center bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/20">
                                            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary scale-110 shadow-lg shadow-primary/20">
                                                <ClipboardCheck className="w-12 h-12" />
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Protocolo de Entrega Técnica</h2>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto mb-12 italic">Formalize a entrega da embarcação ao proprietário com todos os checks de segurança e conformidade.</p>
                                            <button
                                                onClick={() => onNavigate?.('delivery-form', { orderId: selectedOrder.id })}
                                                className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Iniciar Processo de Entrega
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'profit' && role === UserRole.ADMIN && (
                                    <div className="space-y-10 animate-fade-in max-w-5xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">Análise de Lucratividade</h3>
                                        </div>

                                        {(() => {
                                            const { totalRevenue, totalPartCost, estimatedLaborCost, profit, margin } = calculateProfit(selectedOrder);
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-30" />
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Faturamento Bruto</p>
                                                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                        <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                                            <ArrowUpRight className="w-4 h-4" />
                                                            <span>Entrada de Receita</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-rose-500 opacity-30" />
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Custo Operacional Est.</p>
                                                        <p className="text-4xl font-black text-rose-500 tracking-tighter">R$ {(totalPartCost + estimatedLaborCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                        <div className="mt-6 space-y-2">
                                                            <div className="flex justify-between text-[11px] font-bold">
                                                                <span className="text-slate-400">Materiais:</span>
                                                                <span className="text-slate-700 dark:text-slate-300">R$ {totalPartCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[11px] font-bold">
                                                                <span className="text-slate-400">Encargos (30%):</span>
                                                                <span className="text-slate-700 dark:text-slate-300">R$ {estimatedLaborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-all ${profit > 0 ? 'bg-emerald-50 dark:bg-emerald-400/5 border-emerald-100 dark:border-emerald-400/20 shadow-emerald-200/50 dark:shadow-black/20' : 'bg-red-50 dark:bg-red-400/5 border-red-100 dark:border-red-400/20 shadow-red-200/50 dark:shadow-black/20'}`}>
                                                        <div className={`absolute top-0 left-0 w-2 h-full ${profit > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Margem Líquida</p>
                                                        <p className={`text-5xl font-black tracking-tighter ${profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                        <div className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-2xl font-black text-xs ${profit > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-200'} shadow-xl`}>
                                                            {margin.toFixed(1)}% de Margem
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="bg-slate-900 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-800 dark:border-slate-700 flex items-center gap-8">
                                            <div className="p-4 bg-white/5 rounded-2xl text-primary">
                                                <Target className="w-10 h-10" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-white uppercase tracking-tight mb-1">Cálculo Baseado em Eficiência</h4>
                                                <p className="text-sm text-slate-400 font-medium italic">A margem é calculada após a dedução de 30% do valor de mão de obra para cobertura de impostos, comissões e custos fixos da marina.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in zoom-in duration-300">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCreating(false)} />
                        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[3rem] p-10 lg:p-14 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-[6px] bg-primary/20" />
                            <CreateOrderModal />
                            <button onClick={() => setIsCreating(false)} className="absolute top-10 right-10 p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}

                {isItemSearchOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 lg:p-12 animate-in fade-in zoom-in duration-300">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsItemSearchOpen(false)} />
                        <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-[3rem] p-10 lg:p-14 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[6px] bg-emerald-500/20" />
                            <ItemSearchModal />
                            <button onClick={() => setIsItemSearchOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};