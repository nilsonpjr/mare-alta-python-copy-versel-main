import React, { useState, useEffect, useRef } from 'react';
import { Part, Invoice, InvoiceItem, StockMovement } from '../types';
// import { StorageService } from '../services/storage';
import {
    Plus, Search, AlertTriangle, ShoppingCart, UploadCloud, FileText,
    Barcode, CheckCircle, Package, History, ArrowRight, Printer, Camera, X, RefreshCw, Trash2, Edit2
} from 'lucide-react';
import { ApiService } from '../services/api';
import { SystemTour } from './SystemTour';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../utils/formatters';

// Declaration for the external library loaded via script tag/importmap
declare const Html5QrcodeScanner: any;

export const InventoryView: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // Tabs: 'overview', 'entry', 'count', 'kardex'
    const [activeTab, setActiveTab] = useState('overview');

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);

    // Forms Data
    const [newPart, setNewPart] = useState<Partial<Part>>({});
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [bulkMarkup, setBulkMarkup] = useState<number>(60); // Default 60%

    // Invoice Entry State
    const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({ items: [] });

    // Inventory Count State
    const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});

    // Mercury Search State
    const [isMercuryModalOpen, setIsMercuryModalOpen] = useState(false);
    const [mercurySearchTerm, setMercurySearchTerm] = useState('');
    const [mercuryResults, setMercuryResults] = useState<any[]>([]);
    const [isLoadingMercury, setIsLoadingMercury] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<Record<number, 'idle' | 'loading' | 'success' | 'error'>>({});

    // Selection for Batch Operations
    const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);

    // Auto-link after create from Invoice
    const [pendingLinkIndex, setPendingLinkIndex] = useState<number | null>(null);

    const toggleSelectPart = (id: number) => {
        if (selectedPartIds.includes(id)) {
            setSelectedPartIds(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPartIds(prev => [...prev, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedPartIds.length === filteredParts.length) {
            setSelectedPartIds([]);
        } else {
            setSelectedPartIds(filteredParts.map(p => p.id));
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Initialize Scanner when modal opens
    useEffect(() => {
        let scanner: any = null;

        if (isCameraOpen && typeof Html5QrcodeScanner !== 'undefined') {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
            );

            scanner.render(
                (decodedText: string) => {
                    setSearchTerm(decodedText);
                    setIsCameraOpen(false);
                    scanner.clear();
                },
                (error: any) => {
                    // Ignore errors during scanning
                }
            );
        }

        return () => {
            if (scanner) {
                try { scanner.clear(); } catch (e) { /* ignore cleanup errors */ }
            }
        };
    }, [isCameraOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [partsData, movementsData] = await Promise.all([
                ApiService.getParts(),
                ApiService.getMovements()
            ]);
            setParts(partsData);
            setMovements(movementsData);
            setInvoices([]); // Backend Invoice entity not yet implemented
        } catch (error) {
            console.error("Erro ao carregar dados do estoque:", error);
        } finally {
            setLoading(false);
        }
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse border-b border-slate-50 dark:border-slate-700/50">
            <td className="px-6 py-4"><div className="h-4 w-4 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" /></td>
            <td className="px-6 py-4 flex justify-center gap-2">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
            </td>
        </tr>
    );

    // --- XML PARSER LOGIC ---
    const handleXmlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");

                // Extract NFe Data (Basic extraction based on standard NFe layout)
                const number = xmlDoc.getElementsByTagName('nNF')[0]?.textContent || '';
                const supplier = xmlDoc.getElementsByTagName('xNome')[0]?.textContent || '';
                const date = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent?.split('T')[0] || new Date().toISOString().split('T')[0];

                // Extract Items
                const detNodes = xmlDoc.getElementsByTagName('det');
                const items: InvoiceItem[] = [];

                for (let i = 0; i < detNodes.length; i++) {
                    const prod = detNodes[i].getElementsByTagName('prod')[0];
                    const sku = prod.getElementsByTagName('cProd')[0]?.textContent || '';
                    const name = prod.getElementsByTagName('xProd')[0]?.textContent || '';
                    const qCom = parseFloat(prod.getElementsByTagName('qCom')[0]?.textContent || '0');
                    const vUnCom = parseFloat(prod.getElementsByTagName('vUnCom')[0]?.textContent || '0');

                    // Try to find matching part in system
                    const existingPart = parts.find(p => p.sku === sku || p.barcode === sku);

                    items.push({
                        sku,
                        name,
                        quantity: qCom,
                        unitCost: vUnCom,
                        total: qCom * vUnCom,
                        partId: existingPart ? existingPart.id : undefined // Link if found
                    });
                }

                const totalValue = items.reduce((acc, curr) => acc + curr.total, 0);

                setInvoiceForm({
                    number,
                    supplier,
                    date,
                    items,
                    totalValue,
                    xmlKey: 'IMPORTED_FROM_XML'
                });

                alert(`XML Importado com sucesso! ${items.length} itens encontrados. Verifique a associação dos produtos.`);

            } catch (error) {
                alert("Erro ao ler XML. Verifique se é uma NFe válida.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const handleInvoiceSubmit = async () => {
        if (!invoiceForm.number || !invoiceForm.supplier || !invoiceForm.items?.length) {
            alert("Preencha os dados obrigatórios da nota.");
            return;
        }

        const itemsToProcess = invoiceForm.items.filter(i => i.partId);

        if (itemsToProcess.length === 0) {
            if (!window.confirm("Nenhum item vinculado. Deseja limpar o formulário?")) return;
            setInvoiceForm({ items: [] });
            return;
        }

        try {
            for (const item of itemsToProcess) {
                if (item.partId) {
                    await ApiService.createMovement({
                        partId: Number(item.partId),
                        type: 'IN_INVOICE',
                        quantity: item.quantity,
                        description: `Entrada NF ${invoiceForm.number} - ${invoiceForm.supplier}`
                    });
                }
            }
            alert("Entrada de estoque processada com sucesso!");
            setInvoiceForm({ items: [] });
            await loadData();
            setActiveTab('overview');
        } catch (error) {
            console.error("Erro ao processar nota:", error);
            alert("Erro ao processar entrada de estoque.");
        }
    };

    const linkItemToPart = async (index: number, partId: string) => {
        if (!invoiceForm.items) return;

        if (partId === 'NEW_ITEM') {
            const item = invoiceForm.items[index];
            // Initial data from XML
            setNewPart({
                name: item.name,
                sku: item.sku,
                cost: item.unitCost,
                price: item.unitCost * 2, // Default markup fallback
                quantity: 0,
                minStock: 5,
                location: '',
                manufacturer: invoiceForm.supplier || ''
            });
            setPendingLinkIndex(index);
            setIsPartModalOpen(true);

            // Try to enhance with Mercury Data
            // Only if it looks like a Mercury Part (simple heuristic or always try)
            // Let's rely on backend efficiency or just try it.
            try {
                // Async fetch - don't block modal opening, but update state if results come in.
                // We show a toast or just update fields if user hasn't edited them yet?
                // For simplicity, we stick to updating the state if modal is still open.

                // Note: ApiService.searchMercuryProduct returns { status: "success", results: [] }
                // We use the first result if available.
                ApiService.searchMercuryProduct(item.sku).then((response: any) => {
                    if (response.status === 'success' && response.results && response.results.length > 0) {
                        const hit = response.results[0];

                        // Parse values
                        const cleanPrice = (val: string) => {
                            if (!val) return 0;
                            return parseFloat(val.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
                        };

                        const suggestedPrice = cleanPrice(hit.valorVenda);
                        const suggestedCost = cleanPrice(hit.valorCusto); // Or use XML cost?

                        if (suggestedPrice > 0) {
                            setNewPart(prev => ({
                                ...prev,
                                price: suggestedPrice,
                                cost: suggestedCost || prev.cost, // Prefer Mercury cost or keep XML
                                description: hit.descricao || prev.name // Maybe update name too
                            }));
                            // Optional: Notification that data was auto-filled
                            console.log("Mercury Data Auto-filled for", item.sku);
                        }
                    }
                }).catch(err => console.error("Auto-Mercury search failed", err));

            } catch (e) {
                console.error(e);
            }
            return;
        }

        const newItems = [...invoiceForm.items];
        newItems[index].partId = Number(partId);
        setInvoiceForm({ ...invoiceForm, items: newItems });
    };

    // --- PART CRUD ---
    const handleSavePart = async () => {
        if (!newPart.name || !newPart.sku || !newPart.price) return;

        try {
            const createdPart = await ApiService.createPart({
                name: newPart.name,
                sku: newPart.sku,
                barcode: newPart.barcode,
                quantity: newPart.quantity || 0,
                cost: newPart.cost || 0,
                price: newPart.price,
                minStock: newPart.minStock || 0,
                location: newPart.location,
                manufacturer: newPart.manufacturer
            });
            await loadData();

            // Auto-link logic
            if (pendingLinkIndex !== null && invoiceForm.items) {
                const newItems = [...invoiceForm.items];
                // Since loadData reloads parts, we can use the ID from response
                // Assuming createPart returns the object with ID
                if (createdPart && createdPart.id) {
                    newItems[pendingLinkIndex].partId = createdPart.id;
                    setInvoiceForm(prev => ({ ...prev, items: newItems }));
                    alert(`Item criado e vinculado: ${createdPart.name}`);
                }
                setPendingLinkIndex(null);
            }

            setIsPartModalOpen(false);
            setNewPart({});
        } catch (error) {
            console.error("Erro ao criar peça:", error);
            alert("Erro ao salvar peça.");
        }
    };

    // --- INVENTORY COUNT LOGIC ---
    const handleInventoryFinish = async () => {
        const adjustments: any[] = [];
        const updatedParts = [...parts];

        updatedParts.forEach(part => {
            const counted = inventoryCounts[part.id];
            if (counted !== undefined && counted !== part.quantity) {
                const diff = counted - part.quantity;
                adjustments.push({
                    partId: part.id,
                    type: diff > 0 ? 'ADJUSTMENT_PLUS' : 'ADJUSTMENT_MINUS',
                    quantity: Math.abs(diff),
                    description: 'Ajuste de Inventário Físico'
                });
            }
        });

        if (adjustments.length > 0) {
            try {
                // Execute sequentially to avoid overload
                for (const adj of adjustments) {
                    await ApiService.createMovement(adj);
                }
                alert(`${adjustments.length} ajustes realizados.`);
                await loadData();
                setInventoryCounts({});
                setActiveTab('overview');
            } catch (error) {
                console.error("Erro ao processar ajustes:", error);
                alert("Erro ao salvar ajustes de estoque.");
            }
        } else {
            alert("Nenhuma divergência encontrada.");
        }
    };

    // --- MERCURY INTEGRATION ---
    const parseCurrency = (value: string) => {
        if (!value) return 0;
        // Remove "R$", remove dots (thousands), replace comma with dot (decimal)
        return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    };

    const handleMercurySearch = async (term: string) => {
        if (!term) return;
        setIsLoadingMercury(true);
        try {
            const response = await ApiService.searchMercuryProduct(term);
            if (response.status === 'success') {
                setMercuryResults(response.results);
            } else {
                setMercuryResults([]);
                alert('Nenhum resultado encontrado no portal Mercury.');
            }
        } catch (error) {
            console.error("Erro na busca Mercury:", error);
            alert("Erro ao buscar no portal Mercury. Verifique as credenciais ou a conexão.");
        } finally {
            setIsLoadingMercury(false);
        }
    };

    const handleUpdateFromMercury = async (mercuryItem: any) => {
        // Find part by SKU/Code
        const existingPart = parts.find(p => p.sku === mercuryItem.codigo);

        if (existingPart) {
            if (window.confirm(`Deseja atualizar o preço da peça ${existingPart.name}?\nNovo Custo: ${mercuryItem.valorCusto}\nNova Venda: ${mercuryItem.valorVenda}`)) {
                try {
                    await ApiService.updatePart(existingPart.id, {
                        name: existingPart.name,
                        sku: existingPart.sku,
                        barcode: existingPart.barcode,
                        minStock: existingPart.minStock,
                        location: existingPart.location,
                        manufacturer: existingPart.manufacturer,
                        cost: parseCurrency(mercuryItem.valorCusto),
                        price: parseCurrency(mercuryItem.valorVenda)
                    });
                    alert("Preços atualizados com sucesso!");
                    loadData();
                } catch (error) {
                    console.error("Erro ao atualizar (Mercury):", error);
                    alert("Erro ao atualizar estoque.");
                }
            }
        } else {
            // Open New Part Modal pre-filled
            setNewPart({
                sku: mercuryItem.codigo,
                name: mercuryItem.descricao,
                cost: parseCurrency(mercuryItem.valorCusto),
                price: parseCurrency(mercuryItem.valorVenda),
                quantity: 0,
                minStock: 1,
                barcode: '',
                location: ''
            });
            setIsMercuryModalOpen(false);
            setIsPartModalOpen(true);
        }
    };

    const autoFillFromMercury = async () => {
        if (!newPart.sku) {
            alert("Digite um SKU para pesquisar.");
            return;
        }
        setIsLoadingMercury(true);
        try {
            const response = await ApiService.searchMercuryProduct(newPart.sku);
            if (response.status === 'success' && response.results.length > 0) {
                // Take the first match or exact match
                const item = response.results[0];
                setNewPart({
                    ...newPart,
                    name: item.descricao,
                    cost: parseCurrency(item.valorCusto),
                    price: parseCurrency(item.valorVenda)
                });
                alert("Dados encontrados e preenchidos!");
            } else {
                alert("Peça não encontrada no portal Mercury.");
            }
        } catch (error) {
            alert("Erro ao buscar no portal Mercury.");
        } finally {
            setIsLoadingMercury(false);
        }
    };

    // --- EDIT PART ---
    const handleEditPart = (part: Part) => {
        setEditingPart({ ...part });
        setIsEditModalOpen(true);
    };

    const handleSaveEditedPart = async () => {
        if (!editingPart) return;

        let updatedPart = { ...editingPart };
        if (updatedPart.cost === updatedPart.price && updatedPart.cost > 0) {
            updatedPart.price = updatedPart.cost * 1.60; // 60% markup
        }

        try {
            await ApiService.updatePart(editingPart.id, {
                name: updatedPart.name,
                sku: updatedPart.sku,
                barcode: updatedPart.barcode,
                cost: updatedPart.cost,
                price: updatedPart.price,
                minStock: updatedPart.minStock,
                location: updatedPart.location,
                manufacturer: updatedPart.manufacturer
            });
            await loadData();
            setIsEditModalOpen(false);
            setEditingPart(null);
            alert("Peça atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao editar peça:", error);
            alert("Erro ao salvar alterações.");
        }
    };

    const handleDeletePart = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta peça? O histórico de movimentações será mantido.')) {
            try {
                await ApiService.deletePart(id);
                await loadData();
            } catch (error) {
                console.error("Erro ao excluir peça:", error);
                alert("Erro ao excluir peça.");
            }
        }
    };

    // --- UPDATE PRICES FROM MERCURY API ---
    const handleUpdatePricesFromMercury = async () => {
        const targetLabel = selectedPartIds.length > 0 ? `${selectedPartIds.length} itens selecionados` : 'TODOS os itens Mercury';

        if (!window.confirm(`Atualizar preços consultando a API Mercury?\n\nAlvo: ${targetLabel}\n\nO sistema fará login único e buscará os itens em sequência.`)) {
            return;
        }

        setIsBulkPriceModalOpen(false);

        // Determina quais peças atualizar: Selecionadas OU Todas Mercury
        let partsToUpdate: Part[] = [];

        if (selectedPartIds.length > 0) {
            partsToUpdate = parts.filter(p => selectedPartIds.includes(p.id));
        } else {
            partsToUpdate = parts.filter(p =>
                !p.manufacturer ||
                p.manufacturer.toUpperCase().includes('MERCURY')
            );
        }

        if (partsToUpdate.length === 0) {
            alert("Nenhuma peça selecionada ou identificada como Mercury para atualização.");
            return;
        }

        // Feedback inicial
        const newStatus: Record<number, 'loading' | 'success' | 'error' | 'idle'> = {};
        partsToUpdate.forEach(p => newStatus[p.id] = 'loading');
        setUpdateStatus(prev => ({ ...prev, ...newStatus }));

        try {
            const partIds = partsToUpdate.map(p => p.id);
            const response = await ApiService.batchSyncMercuryPrices(partIds);

            if (response.status === 'success') {
                const results = response.results;
                let successCount = 0;
                let errorCount = 0;

                const finalStatus: Record<number, 'loading' | 'success' | 'error' | 'idle'> = {};

                results.forEach((res: any) => {
                    if (res.status === 'updated') {
                        finalStatus[res.id] = 'success';
                        successCount++;
                    } else {
                        finalStatus[res.id] = 'error';
                        errorCount++;
                    }
                });

                setUpdateStatus(prev => ({ ...prev, ...finalStatus }));
                await loadData(); // Recarrega para mostrar novos preços
                alert(`Atualização concluída!\n\n✅ ${successCount} peças atualizadas\n⚠️ ${errorCount} não encontradas ou com erro`);
            }
        } catch (error) {
            console.error("Erro na atualização em lote:", error);
            setUpdateStatus({});
            alert("Erro durante a atualização em massa. Verifique o console.");
        }
    };

    // Filters Advanced
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedSubgroup, setSelectedSubgroup] = useState<string>('');
    const [compatibilitySearch, setCompatibilitySearch] = useState<string>('');

    // --- SEARCH HELPERS ---
    const availableGroups = Array.from(new Set(parts.map(p => p.group).filter(Boolean))) as string[];
    const availableSubgroups = selectedGroup
        ? Array.from(new Set(parts.filter(p => p.group === selectedGroup).map(p => p.subgroup).filter(Boolean))) as string[]
        : [];

    const totalInventoryValue = parts.reduce((acc, p) => acc + (p.quantity * p.cost), 0);
    const criticalItems = parts.filter(p => p.quantity <= (p.minStock || 0));
    const lowStockItems = parts.filter(p => p.quantity <= p.minStock);

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm))
    );

    // Helper for tabs
    const TabButton = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === id
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
        >
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, {
                className: `w-4 h-4 ${activeTab === id ? 'text-white dark:text-slate-900' : 'text-slate-400'}`
            })} {label}
        </button>
    );

    return (
        <div className="p-8 h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Header & Main Stats */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <Package className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> Gestão de Estoque
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Monitoramento, Entradas e Auditoria de Peças</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPartModalOpen(true)}
                        className="px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Cadastrar Peça
                    </button>
                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="px-6 py-3 bg-cyan-600 dark:bg-cyan-500 text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
                    >
                        <UploadCloud className="w-5 h-5" /> Lançar Nota Fiscal
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase mb-2 tracking-widest">Total em Peças</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100 italic">R$ {totalInventoryValue.toLocaleString()}</div>
                    <div className="mt-2 text-[10px] text-green-500 font-bold bg-green-50 dark:bg-green-900/20 w-fit px-2 py-0.5 rounded-full">ATIVO CIRCULANTE</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase mb-2 tracking-widest">Itens Cadastrados</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100 italic">{parts.length} <span className="text-sm font-medium text-slate-400">SKUs</span></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase mb-2 tracking-widest">Estoque Crítico</div>
                    <div className="text-2xl font-black text-red-500 italic flex items-center gap-2">
                        {criticalItems.length}
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase mb-2 tracking-widest">Giro Mensal</div>
                    <div className="text-2xl font-black text-cyan-500 italic">85%</div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 w-fit gap-1">
                <TabButton id="overview" label="Panorama" icon={<Package />} />
                <TabButton id="entry" label="Notas Fiscais" icon={<FileText />} />
                <TabButton id="kardex" label="Movimentações" icon={<History />} />
                <TabButton id="count" label="Auditoria / Inventário" icon={<Barcode />} />
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                {activeTab === 'overview' && (
                    <>
                        {/* Table Controls */}
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                            <div className="relative w-96 group">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, SKU ou código de barras..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl group-focus-within:border-cyan-500 group-focus-within:ring-4 group-focus-within:ring-cyan-50 transition-all font-medium text-slate-800 dark:text-slate-100"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors w-5 h-5" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsBulkPriceModalOpen(true)}
                                    className="p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-200 dark:hover:border-cyan-800 flex items-center gap-2 text-xs font-black uppercase transition-all"
                                >
                                    Atualizar Preços
                                </button>
                                <button
                                    onClick={() => setIsMercuryModalOpen(true)}
                                    className="p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 flex items-center gap-2 text-xs font-black uppercase transition-all"
                                >
                                    Sincronizar Mercury
                                </button>
                                <button
                                    onClick={() => setIsCameraOpen(!isCameraOpen)}
                                    className={`p-3 rounded-xl border transition-all ${isCameraOpen ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
                                    <tr className="border-b border-slate-50 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-6 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-600 text-cyan-600 dark:text-cyan-400"
                                                checked={selectedPartIds.length === filteredParts.length && filteredParts.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4">SKU</th>
                                        <th className="px-6 py-4">Nome da Peça</th>
                                        <th className="px-6 py-4">Estoque</th>
                                        <th className="px-6 py-4">Unidade</th>
                                        <th className="px-6 py-4 text-right">Custo Bruto</th>
                                        <th className="px-6 py-4 text-right">Venda (PVP)</th>
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {loading && parts.length === 0 ? (
                                        <>
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                        </>
                                    ) : filteredParts.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-8 py-20 text-center">
                                                <Package className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                                                <p className="text-slate-400 dark:text-slate-500 font-medium italic">Nenhum item encontrado nesta categoria ou busca.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredParts.map((part) => (
                                            <tr key={part.id} className={`hover:bg-slate-50/50 dark:hover:bg-primary/5 transition-colors group ${selectedPartIds.includes(part.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                                <td className="px-8 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded-lg border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer w-5 h-5 bg-white dark:bg-slate-900 transition-all"
                                                        checked={selectedPartIds.includes(part.id)}
                                                        onChange={() => toggleSelectPart(part.id)}
                                                    />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {part.sku}
                                                            {updateStatus[part.id] === 'loading' && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
                                                            {updateStatus[part.id] === 'success' && <span title="Preço atualizado com sucesso!"><CheckCircle className="w-3 h-3 text-emerald-500" /></span>}
                                                            {updateStatus[part.id] === 'error' && <span title="Falha ao atualizar preço"><X className="w-3 h-3 text-red-500" /></span>}
                                                        </div>
                                                        {part.barcode && <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Barcode className="w-3 h-3" /> {part.barcode}</div>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{part.name}</span>
                                                    {part.manufacturer && <div className="text-[10px] text-primary font-black uppercase tracking-tighter mt-0.5">{part.manufacturer}</div>}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        {part.location || '--'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`text-sm font-black ${part.quantity <= part.minStock ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                                        {part.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-medium text-slate-500 dark:text-slate-400 italic">R$ {part.cost.toFixed(2)}</td>
                                                <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-slate-100">R$ {part.price.toFixed(2)}</td>
                                                <td className="px-8 py-5 text-center">
                                                    {part.quantity <= part.minStock ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-800 shadow-sm shadow-red-200/20">
                                                            <AlertTriangle className="w-3 h-3" /> Reposição
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 shadow-sm shadow-emerald-200/20">
                                                            <CheckCircle className="w-3 h-3" /> Adequado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditPart(part)}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                            title="Editar Item"
                                                        >
                                                            <Edit2 className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePart(part.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                            title="Apagar permanentemente"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* --- TAB: INVOICE ENTRY --- */}
                {
                    activeTab === 'entry' && (
                        <div className="flex flex-col h-full p-8 overflow-y-auto no-scrollbar gap-8">
                            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-12 text-center transition-all hover:border-primary/50 group">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl w-fit mx-auto mb-4 shadow-xl shadow-slate-200/50 dark:shadow-black/20 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-10 h-10 text-primary" />
                                </div>
                                <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">IMPORTAR XML DA NOTA FISCAL</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic mb-6">Arraste o arquivo ou utilize o seletor abaixo</p>
                                <input
                                    type="file"
                                    accept=".xml"
                                    className="hidden"
                                    id="xmlUpload"
                                    onChange={handleXmlUpload}
                                />
                                <label
                                    htmlFor="xmlUpload"
                                    className="bg-primary text-white px-8 py-3.5 rounded-2xl cursor-pointer hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 inline-flex items-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Escolher Arquivo XML
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Número da Nota</label>
                                    <input
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={invoiceForm.number || ''}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fornecedor / Emitente</label>
                                    <input
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={invoiceForm.supplier || ''}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, supplier: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Data de Emissão</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={invoiceForm.date || ''}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-widest uppercase flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    ITENS DETALHADOS DA NOTA
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {invoiceForm.items?.length || 0} Itens encontrados
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-50/30 dark:bg-slate-900/10">
                                <table className="w-full text-left text-sm min-w-[900px]">
                                    <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Código (NF)</th>
                                            <th className="px-6 py-4">Descrição do Produto</th>
                                            <th className="px-6 py-4 text-center">Qtd</th>
                                            <th className="px-6 py-4 text-right">V. Unit</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                            <th className="px-6 py-4">Vinculação de Sistema</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {invoiceForm.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{item.sku}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{item.name}</td>
                                                <td className="px-6 py-4 text-center font-black text-primary">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 italic">R$ {item.unitCost.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">R$ {item.total.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className={`w-full px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none transition-all cursor-pointer appearance-none ${!item.partId
                                                            ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600'
                                                            : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}
                                                        value={item.partId || ''}
                                                        onChange={(e) => linkItemToPart(idx, e.target.value)}
                                                    >
                                                        <option value="">NÃO VINCULADO</option>
                                                        <option value="NEW_ITEM" className="font-black text-primary">✚ CADASTRAR NOVO</option>
                                                        {parts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!invoiceForm.items || invoiceForm.items.length === 0) && (
                                            <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic uppercase text-[10px] font-black tracking-[0.2em]">Nenhum item carregado. Importe um arquivo XML acima.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-4 pb-8">
                                <button
                                    onClick={() => setInvoiceForm({ items: [] })}
                                    className="px-8 py-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Limpar Tudo
                                </button>
                                <button
                                    onClick={handleInvoiceSubmit}
                                    className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-black/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Processar e Atualizar Estoque
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* --- TAB: INVENTORY COUNT --- */}
                {
                    activeTab === 'count' && (
                        <div className="flex flex-col h-full bg-white dark:bg-slate-800">
                            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 flex justify-between items-center transition-colors">
                                <div className="flex items-center gap-4 text-amber-800 dark:text-amber-400">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest">Modo Balanço Ativo</p>
                                        <p className="text-[11px] font-medium opacity-80 italic">As alterações salvas aqui ajustarão o saldo físico imediatamente no sistema.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleInventoryFinish}
                                    className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-200 dark:shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Finalizar e Ajustar Tudo
                                </button>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[800px]">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-8 py-5">Identificação do Item</th>
                                            <th className="px-8 py-5">Localização</th>
                                            <th className="px-8 py-5 text-center">Saldo Atual</th>
                                            <th className="px-8 py-5 text-center">Contagem Real</th>
                                            <th className="px-8 py-5 text-center">Divergência</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50 font-medium">
                                        {parts.map(part => {
                                            const counted = inventoryCounts[part.id] ?? part.quantity;
                                            const diff = counted - part.quantity;
                                            return (
                                                <tr key={part.id} className={`transition-colors ${diff !== 0 ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'}`}>
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{part.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono font-bold">{part.sku}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{part.location || '--'}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center font-black text-slate-400">{part.quantity}</td>
                                                    <td className="px-8 py-5 text-center">
                                                        <input
                                                            type="number"
                                                            className="w-24 px-4 py-2 border rounded-xl text-center font-black bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border-slate-200 dark:border-slate-700"
                                                            value={counted}
                                                            onChange={(e) => setInventoryCounts({ ...inventoryCounts, [part.id]: Number(e.target.value) })}
                                                        />
                                                    </td>
                                                    <td className={`px-8 py-5 text-center font-black text-sm tracking-tighter ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-indigo-500' : 'text-slate-200 dark:text-slate-700'}`}>
                                                        {diff > 0 ? '+' : ''}{diff}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* --- TAB: KARDEX --- */}
                {
                    activeTab === 'kardex' && (
                        <div className="flex flex-col h-full bg-white dark:bg-slate-800">
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[900px]">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-8 py-5">Data e Horário</th>
                                            <th className="px-8 py-5">Item / Descrição</th>
                                            <th className="px-8 py-5">Tipo de Movimentação</th>
                                            <th className="px-8 py-5">Histórico / Observação</th>
                                            <th className="px-8 py-5 text-right">Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {movements.length === 0 && <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-300 dark:text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhuma movimentação registrada no sistema.</td></tr>}
                                        {[...movements].reverse().map(mov => { // Show newest first
                                            const part = parts.find(p => p.id === mov.partId);
                                            const isPositive = mov.type.includes('IN') || mov.type === 'ADJUSTMENT_PLUS';
                                            return (
                                                <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-400 dark:text-slate-500 italic">
                                                        {new Date(mov.date).toLocaleString('pt-BR')}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{part?.name || 'Item Removido'}</div>
                                                        <div className="text-[10px] text-primary font-black uppercase tracking-tighter">{part?.sku || '---'}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPositive
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800'
                                                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800'
                                                            }`}>
                                                            {mov.type === 'IN_INVOICE' ? 'ENTRADA (NF)' :
                                                                mov.type === 'OUT_OS' ? 'SAÍDA (OS)' :
                                                                    mov.type === 'ADJUSTMENT_PLUS' ? 'AJUSTE (+)' : 'AJUSTE (-)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic mb-0.5 line-clamp-1">"{mov.description}"</p>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">RESPONSÁVEL: {mov.user}</div>
                                                    </td>
                                                    <td className={`px-8 py-5 text-right font-black text-base tracking-tighter ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {isPositive ? '+' : '-'}{mov.quantity}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

            </div >

            {/* --- MODALS --- */}

            {/* Camera/Barcode Modal */}
            {
                isCameraOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl border border-slate-100 dark:border-slate-700">
                            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6">
                                <Camera className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white text-xl mb-2 uppercase tracking-tight">SCANNER ATIVO</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 italic">Posicione o código de barras no centro da área de leitura.</p>

                            <div id="reader" className="w-full mb-8 bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border-2 border-primary/20"></div>

                            <div className="relative mb-8">
                                <input
                                    type="text"
                                    placeholder="Ou digite o SKU manualmente..."
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-center placeholder:text-slate-300"
                                    autoFocus
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={() => setIsCameraOpen(false)}
                                className="w-full py-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                            >
                                Interromper Leitura
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Purchase Order Modal */}
            {
                isPurchaseModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <ShoppingCart className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">ORDEM DE REPOSIÇÃO</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Sugestão automática baseada no estoque mínimo configurado.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsPurchaseModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto no-scrollbar rounded-3xl border border-slate-100 dark:border-slate-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4">SKU / Identificação</th>
                                            <th className="px-6 py-4">Nome do Produto</th>
                                            <th className="px-6 py-4 text-center">Físico</th>
                                            <th className="px-6 py-4 text-center">Mínimo</th>
                                            <th className="px-6 py-4 text-right">Necessário</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {lowStockItems.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-primary/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{p.sku}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                                                <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black text-xs">{p.quantity}</span></td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-400">{p.minStock}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-primary font-black text-sm">
                                                        {Math.max(10, p.minStock * 2) - p.quantity} <small className="text-[10px] uppercase opacity-50">UN</small>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {lowStockItems.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-20 text-center text-emerald-500 font-black uppercase text-[10px] tracking-widest">Estoque saudável! Nada a comprar.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-10 flex justify-end gap-4">
                                <button
                                    onClick={() => setIsPurchaseModalOpen(false)}
                                    className="px-8 py-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Printer className="w-5 h-5" />
                                    Imprimir Ordem de Compra
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* New / Edit Part Modal */}
            {
                (isPartModalOpen || (isEditModalOpen && editingPart)) && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                                            {isEditModalOpen ? 'EDITAR INFORMAÇÕES' : 'NOVO ITEM DE ESTOQUE'}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">
                                            Preencha as informações detalhadas da peça abaixo.
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsPartModalOpen(false); setIsEditModalOpen(false); setEditingPart(null); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nome Completo da Peça</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.name : newPart.name || ''}
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, name: e.target.value }) : setNewPart({ ...newPart, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fabricante (Brand)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.manufacturer || '' : newPart.manufacturer || ''}
                                        placeholder="Ex: Mercury"
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, manufacturer: e.target.value }) : setNewPart({ ...newPart, manufacturer: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">SKU / Part Number</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                            value={isEditModalOpen ? editingPart?.sku : newPart.sku || ''}
                                            onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, sku: e.target.value }) : setNewPart({ ...newPart, sku: e.target.value })}
                                        />
                                        {!isEditModalOpen && (
                                            <button
                                                onClick={autoFillFromMercury}
                                                disabled={isLoadingMercury || !newPart.sku}
                                                className="p-4 bg-white dark:bg-slate-900 text-primary border border-slate-100 dark:border-slate-700 rounded-2xl hover:shadow-lg transition-all disabled:opacity-30"
                                                title="Sincronizar com Mercury"
                                            >
                                                {isLoadingMercury ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Família / Grupo</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.group || '' : newPart.group || ''}
                                        placeholder="Ex: Filtragem"
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, group: e.target.value }) : setNewPart({ ...newPart, group: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Subgrupo</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.subgroup || '' : newPart.subgroup || ''}
                                        placeholder="Ex: Filtro Óleo"
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, subgroup: e.target.value }) : setNewPart({ ...newPart, subgroup: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Modelos Compatíveis (Separar por vírgula)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-[11px] placeholder:font-normal"
                                        value={isEditModalOpen ? editingPart?.compatibility?.join(', ') : newPart.compatibility ? newPart.compatibility.join(', ') : ''}
                                        placeholder="Verado V8, ProXS, SeaPro, Mercruiser 4.5L..."
                                        onChange={e => {
                                            const values = e.target.value.split(',').map(s => s.trim());
                                            isEditModalOpen ? setEditingPart({ ...editingPart!, compatibility: values }) : setNewPart({ ...newPart, compatibility: values });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Código de Barras (EAN)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.barcode || '' : newPart.barcode || ''}
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, barcode: e.target.value }) : setNewPart({ ...newPart, barcode: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Localização no Estoque</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.location || '' : newPart.location || ''}
                                        placeholder="Ex: Estante A1 - Nível 2"
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, location: e.target.value }) : setNewPart({ ...newPart, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Custo Atual (R$)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-2xl text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        value={formatCurrencyInput(isEditModalOpen ? editingPart?.cost || 0 : newPart.cost || 0)}
                                        onChange={e => {
                                            const val = parseCurrencyInput(e.target.value);
                                            isEditModalOpen ? setEditingPart({ ...editingPart!, cost: val }) : setNewPart({ ...newPart, cost: val });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Preço de Venda (R$)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-black text-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                                        value={formatCurrencyInput(isEditModalOpen ? editingPart?.price || 0 : newPart.price || 0)}
                                        onChange={e => {
                                            const val = parseCurrencyInput(e.target.value);
                                            isEditModalOpen ? setEditingPart({ ...editingPart!, price: val }) : setNewPart({ ...newPart, price: val });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Saldo Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.quantity : newPart.quantity || ''}
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, quantity: Number(e.target.value) }) : setNewPart({ ...newPart, quantity: Number(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-red-400 dark:text-red-500 uppercase tracking-widest mb-2">Estoque de Alerta (Mínimo)</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={isEditModalOpen ? editingPart?.minStock : newPart.minStock || ''}
                                        onChange={e => isEditModalOpen ? setEditingPart({ ...editingPart!, minStock: Number(e.target.value) }) : setNewPart({ ...newPart, minStock: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex border-t border-slate-100 dark:border-slate-700 pt-8 gap-4">
                                <button
                                    onClick={() => { setIsPartModalOpen(false); setIsEditModalOpen(false); setEditingPart(null); }}
                                    className="flex-1 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Descartar Alterações
                                </button>
                                <button
                                    onClick={isEditModalOpen ? handleSaveEditedPart : handleSavePart}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    {isEditModalOpen ? 'Atualizar Registro' : 'Confirmar Cadastro'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Mercury Search Modal */}
            {
                isMercuryModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 w-full max-w-5xl shadow-2xl border border-slate-100 dark:border-slate-700 h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-2xl shadow-xl">
                                        <RefreshCw className="w-8 h-8 text-white dark:text-slate-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Portal de Preços Mercury</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Consulte tabelas oficiais e disponibilidade em tempo real.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsMercuryModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="flex gap-4 mb-10">
                                <div className="relative flex-1">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                                        placeholder="Digite o código (Ex: 8M0123456)..."
                                        value={mercurySearchTerm}
                                        onChange={(e) => setMercurySearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleMercurySearch(mercurySearchTerm)}
                                    />
                                </div>
                                <button
                                    onClick={() => handleMercurySearch(mercurySearchTerm)}
                                    disabled={isLoadingMercury}
                                    className="bg-primary text-white px-10 rounded-2xl font-black text-[12px] uppercase tracking-[0.1em] shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isLoadingMercury ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                                    Consultar
                                </button>
                            </div>

                            <div className="flex-1 overflow-x-auto no-scrollbar rounded-[2.5rem] border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
                                <table className="w-full text-left text-sm min-w-[1000px]">
                                    <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-8 py-6">Part Number</th>
                                            <th className="px-8 py-6">Descrição Oficial Mercury</th>
                                            <th className="px-8 py-6 text-center">Disp. Portal</th>
                                            <th className="px-8 py-6 text-right">Custo Líquido</th>
                                            <th className="px-8 py-6 text-right">Sugestão Venda</th>
                                            <th className="px-8 py-6 text-center">Ações Rápidas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {mercuryResults.map((item, idx) => {
                                            const inStock = parts.some(p => p.sku === item.codigo);
                                            return (
                                                <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors group">
                                                    <td className="px-8 py-6 font-mono font-black text-slate-800 dark:text-slate-200">{item.codigo}</td>
                                                    <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all">{item.descricao}</td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.qtdaEst.includes('+')
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                                            {item.qtdaEst}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right text-slate-400 dark:text-slate-500 italic font-medium">{item.valorCusto}</td>
                                                    <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white text-base tracking-tighter">{item.valorVenda}</td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleUpdateFromMercury(item)}
                                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border ${inStock
                                                                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                                                                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                                                                }`}
                                                        >
                                                            {inStock ? 'Sincronizar Já' : 'Cadastrar novo'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {mercuryResults.length === 0 && !isLoadingMercury && (
                                            <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-300 dark:text-slate-600 font-black uppercase text-[10px] tracking-widest italic opacity-50">Inicie uma busca por SKU acima para consultar o Portal.</td></tr>
                                        )}
                                        {isLoadingMercury && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-32 text-center">
                                                    <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                                                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Consultando API Mercury Marine...</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Part Modal */}
            {
                isEditModalOpen && editingPart && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                                            EDITAR INFORMAÇÕES
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">
                                            Preencha as informações detalhadas da peça abaixo.
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsPartModalOpen(false); setIsEditModalOpen(false); setEditingPart(null); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nome Completo da Peça</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={editingPart.name}
                                        onChange={e => setEditingPart({ ...editingPart, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fabricante (Brand)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={editingPart.manufacturer || ''}
                                        placeholder="Ex: Mercury"
                                        onChange={e => setEditingPart({ ...editingPart, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">SKU / Part Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={editingPart.sku}
                                        onChange={e => setEditingPart({ ...editingPart, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Código de Barras (EAN)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={editingPart.barcode || ''}
                                        onChange={e => setEditingPart({ ...editingPart, barcode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Localização no Estoque</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={editingPart.location || ''}
                                        onChange={e => setEditingPart({ ...editingPart, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Custo Atual (R$)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-2xl text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        value={formatCurrencyInput(editingPart.cost)}
                                        onChange={e => setEditingPart({ ...editingPart, cost: parseCurrencyInput(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Preço de Venda (R$)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-black text-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                                        value={formatCurrencyInput(editingPart.price)}
                                        onChange={e => setEditingPart({ ...editingPart, price: parseCurrencyInput(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 rounded-3xl text-sm text-primary-900 dark:text-primary-200">
                                    <strong className="font-black text-primary">💡 Dica:</strong> Se custo e preço forem iguais, será aplicado +60% automaticamente no preço.
                                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                        Markup Atual: <strong className="font-black text-slate-800 dark:text-white">{editingPart.cost > 0 ? ((editingPart.price / editingPart.cost - 1) * 100).toFixed(0) : '0'}%</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 flex border-t border-slate-100 dark:border-slate-700 pt-8 gap-4">
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingPart(null);
                                    }}
                                    className="flex-1 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Descartar Alterações
                                </button>
                                <button
                                    onClick={handleSaveEditedPart}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    Atualizar Registro
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Price Update Modal */}
            {
                isBulkPriceModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                                    <RefreshCw className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sincronização em Massa</h3>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                                O sistema irá consultar o <strong>Portal Mercury Marine</strong> para todas as <span className="font-black text-slate-900 dark:text-white">{parts.length} peças</span> do seu estoque e atualizar os preços automaticamente.
                            </p>

                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 rounded-3xl mb-8 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-primary text-white rounded-md mt-1"><CheckCircle className="w-3 h-3" /></div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Atualiza custo base oficial</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-primary text-white rounded-md mt-1"><CheckCircle className="w-3 h-3" /></div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Aplica markup de +60% automaticamente</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-primary text-white rounded-md mt-1"><CheckCircle className="w-3 h-3" /></div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Gera logs de movimentação financeira</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleUpdatePricesFromMercury}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-black/20 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    Iniciar Sincronização Agora
                                </button>
                                <button
                                    onClick={() => setIsBulkPriceModalOpen(false)}
                                    className="w-full py-4 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancelar e Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* System Tour */}
            {/* System Tour - TEMPORARILY DISABLED FOR DEBUGGING */}
            {/* {parts.length > 0 && (
                <SystemTour
                    tourKey="inventory_intro"
                    steps={[
                        {
                            target: 'body',
                            title: 'Bem-vindo ao Estoque',
                            content: 'Aqui você gerencia todas as peças, motores e materiais da sua marina. Acompanhe quantidades, valores e movimentações.',
                            placement: 'center'
                        },
                        {
                            target: '#btn-add-part',
                            title: 'Adicionar Nova Peça',
                            content: 'Clique aqui para cadastrar um novo item manualmente no sistema.',
                            placement: 'bottom'
                        },
                        {
                            target: '#inventory-tabs',
                            title: 'Navegação',
                            content: 'Alterne entre Visão Geral, Entrada de Notas (XML) e Histórico (Kardex) por aqui.',
                            placement: 'bottom'
                        },
                        {
                            target: '#btn-add-part',
                            title: 'Dica de Organização',
                            content: 'Ao criar novas peças, não esqueça de definir o GRUPO (Família) e a COMPATIBILIDADE (ex: "Verado V8") para facilitar a busca por aplicação.',
                            placement: 'bottom'
                        }
                    ]}
                />
            )} */}
        </div >
    );
};