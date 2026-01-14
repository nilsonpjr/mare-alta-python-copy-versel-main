import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { INITIAL_MAINTENANCE_KITS } from '../data/maintenance_kits';
import { MaintenanceKit, calculateKitTotal } from '../types/maintenance';
import { Settings, FileText, CheckCircle, PenTool, Printer, ChevronRight, Calculator, AlertCircle, Plus, Save, Trash2, X, Search } from 'lucide-react';

import { StorageService } from '../services/storage';
import { Boat, ServiceOrder, ServiceItem, OSStatus, ItemType, ApiMaintenanceKit } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MaintenanceBudgetView: React.FC = () => {
    // Selection State
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedInterval, setSelectedInterval] = useState<number | null>(null);

    // Data State
    const [boats, setBoats] = useState<Boat[]>([]);
    const [savedKits, setSavedKits] = useState<MaintenanceKit[]>([]);

    // Modal State
    const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
    const [isSaveKitModalOpen, setIsSaveKitModalOpen] = useState(false);
    const [newKitName, setNewKitName] = useState('');
    const [selectedBoatId, setSelectedBoatId] = useState('');

    // Loading States - Prevent double-click
    const [loadingCreateOS, setLoadingCreateOS] = useState(false);
    const [loadingSaveKit, setLoadingSaveKit] = useState(false);
    const [loadingDeleteKit, setLoadingDeleteKit] = useState(false);

    // State management updated to use real data
    const [partsInventory, setPartsInventory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const transformApiKitToFrontend = (apiKit: ApiMaintenanceKit): MaintenanceKit => {
        return {
            id: apiKit.id.toString(),
            brand: (apiKit.brand as any) || 'Genérico',
            engineModel: apiKit.engineModel || 'Custom',
            intervalHours: apiKit.intervalHours || 0,
            description: apiKit.description || apiKit.name,
            parts: apiKit.items.filter(i => i.type === ItemType.PART).map(i => ({
                partNumber: i.part?.sku || 'N/A',
                name: i.itemDescription,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            })),
            labor: apiKit.items.filter(i => i.type === ItemType.LABOR).map(i => ({
                description: i.itemDescription,
                hours: i.quantity,
                hourlyRate: i.unitPrice
            }))
        };
    };

    const loadData = async () => {
        try {
            const [boatsData, partsData, kitsData] = await Promise.all([
                ApiService.getBoats(),
                ApiService.getParts(),
                ApiService.getMaintenanceKits()
            ]);
            setBoats(boatsData);
            setPartsInventory(partsData);
            setSavedKits(kitsData.map(transformApiKitToFrontend));
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    const allKits = savedKits;

    // Filter Logic
    const availableBrands = Array.from(new Set(allKits.map(k => k.brand)));

    const availableModels = selectedBrand
        ? Array.from(new Set(allKits
            .filter(k => k.brand === selectedBrand)
            .map(k => k.engineModel)))
        : [];

    const availableIntervals = selectedBrand && selectedModel
        ? allKits
            .filter(k => k.brand === selectedBrand && k.engineModel === selectedModel)
            .map(k => k.intervalHours)
            .sort((a, b) => a - b)
        : [];



    const [customItems, setCustomItems] = useState<ServiceItem[]>([]);
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Reset custom items when selection changes
    useEffect(() => {
        if (!isCustomMode) {
            setCustomItems([]);
        }
    }, [selectedBrand, selectedModel, selectedInterval, isCustomMode]);

    const selectedKitBase = isCustomMode
        ? {
            id: 'custom',
            brand: selectedBrand || 'Personalizado',
            engineModel: selectedModel || 'Manual',
            intervalHours: 0,
            description: 'Orçamento Personalizado (Itens avulsos do estoque)',
            parts: [],
            labor: []
        }
        : (selectedBrand && selectedModel && selectedInterval
            ? allKits.find(k =>
                k.brand === selectedBrand &&
                k.engineModel === selectedModel &&
                k.intervalHours === selectedInterval)
            : null);

    // Helper to merge base kit with custom items
    const getFullBudget = () => {
        if (!selectedKitBase) return null;

        // Convert custom items to kit-like structure for display transparency
        // or just manage them separately. For now, let's treat "selectedKit" as the combined view object.
        return {
            ...selectedKitBase,
            parts: [
                ...selectedKitBase.parts.map((p: any) => ({ ...p, isCustom: false })),
                ...customItems.filter(i => i.type === ItemType.PART).map(i => ({
                    partNumber: i.description.split('(PN: ')[1]?.replace(')', '') || 'N/A',
                    name: i.description.split(' (PN:')[0],
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    isCustom: true,
                    originalId: i.id
                }))
            ],
            labor: [
                ...selectedKitBase.labor,
                ...customItems.filter(i => i.type === ItemType.LABOR).map(i => ({
                    description: i.description,
                    hours: i.quantity,
                    hourlyRate: i.unitPrice
                }))
            ]
        };
    };

    const selectedKit = getFullBudget();

    const handleSaveKit = async () => {
        if (!newKitName) return alert("Nome é obrigatório");
        if (!selectedKit) return;

        try {
            const items = [
                ...selectedKit.parts.map(p => ({
                    type: ItemType.PART,
                    itemDescription: p.name,
                    quantity: p.quantity,
                    unitPrice: p.unitPrice
                })),
                ...selectedKit.labor.map(serv => ({
                    type: ItemType.LABOR,
                    itemDescription: serv.description,
                    quantity: serv.hours,
                    unitPrice: serv.hourlyRate
                }))
            ];

            await ApiService.createMaintenanceKit({
                name: newKitName,
                brand: selectedKit.brand,
                engineModel: selectedKit.engineModel,
                intervalHours: Number(selectedKit.intervalHours),
                description: selectedKit.description,
                items: items
            });

            alert("Modelo salvo com sucesso!");
            setIsSaveKitModalOpen(false);
            setNewKitName('');
            loadData(); // Reload to show new kit
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar modelo");
        }
    };

    const handleDeleteKit = async () => {
        if (!selectedKit || !selectedKit.id || selectedKit.id === 'custom') return;

        if (confirm(`Tem certeza que deseja excluir o modelo "${selectedKit.description}"?`)) {
            try {
                // Assuming id is numeric string for API kits
                await ApiService.deleteMaintenanceKit(Number(selectedKit.id));
                alert('Modelo excluído com sucesso!');
                loadData();
                // Reset selection
                setSelectedBrand('');
                setSelectedModel('');
                setSelectedInterval(null);
            } catch (error) {
                console.error("Erro ao excluir modelo:", error);
                alert("Erro ao excluir modelo.");
            }
        }
    };

    const handleRemoveItem = (originalId: number) => {
        setCustomItems(prev => prev.filter(i => i.id !== originalId));
    };

    const handleCreatePreOrder = async () => {
        if (!selectedKit || !selectedBoatId || loadingCreateOS) return;

        const boat = boats.find(b => b.id === Number(selectedBoatId));
        if (!boat) {
            alert("Embarcação não encontrada.");
            return;
        }

        // Convert Kit Items to Order Items
        const orderItems: any[] = []; // Using any for create payload

        // 1. Add Parts
        selectedKit.parts.forEach((part: any) => {
            // Try to find exact match in inventory by SKU/PartNumber
            const inventoryPart = partsInventory.find(p => p.sku === part.partNumber);

            orderItems.push({
                type: ItemType.PART,
                description: `${part.name} (PN: ${part.partNumber})`,
                partId: inventoryPart ? inventoryPart.id : undefined,
                quantity: part.quantity,
                unitPrice: part.unitPrice,
                total: part.quantity * part.unitPrice
            });
        });

        // 2. Add Labor
        selectedKit.labor.forEach(serv => {
            orderItems.push({
                type: ItemType.LABOR,
                description: serv.description,
                quantity: serv.hours, // used as quantity for labor
                unitPrice: serv.hourlyRate,
                total: serv.hours * serv.hourlyRate
            });
        });

        const totalValue = orderItems.reduce((acc, item) => acc + item.total, 0);

        setLoadingCreateOS(true);  // ← PREVENT DOUBLE-CLICK
        try {
            // CORRECT FLOW:
            // 1. Create Order
            const newOrder = await ApiService.createOrder({
                boatId: boat.id,
                description: isCustomMode
                    ? `ORÇAMENTO PERSONALIZADO - ${selectedKitBase?.brand} ${selectedKitBase?.engineModel}`
                    : `REVISÃO ${selectedKitBase?.intervalHours} HORAS - ${selectedKitBase?.brand} ${selectedKitBase?.engineModel}`,
                status: OSStatus.PENDING,
                estimatedDuration: selectedKit.labor.reduce((acc, l) => acc + l.hours, 0)
            });

            // 2. Add Items loop
            for (const item of orderItems) {
                await ApiService.addOrderItem(Number(newOrder.id), item);
            }

            // 3. Add initial note
            await ApiService.addOrderNote(Number(newOrder.id), {
                text: `Orçamento gerado automaticamente via Sistema`
            });

            alert(`Pré-Ordem #${newOrder.id} gerada com sucesso!`);
            setIsPreOrderModalOpen(false);
        } catch (error) {
            console.error("Erro ao criar ordem:", error);
            alert("Erro ao criar ordem de serviço.");
        } finally {
            setLoadingCreateOS(false);  // ← RESET LOADING
        }
    };

    // New Feature: Add Custom Item (Part from Stock)
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [itemSearch, setItemSearch] = useState('');

    const handleAddCustomPart = (part: any) => {
        const newItem: ServiceItem = {
            id: Date.now(),
            type: ItemType.PART,
            description: `${part.name} (PN: ${part.sku})`,
            quantity: 1,
            unitPrice: part.price,
            unitCost: part.cost,
            total: part.price,
            orderId: 0,
        };
        setCustomItems([...customItems, newItem]);
        setIsAddItemModalOpen(false);
        setItemSearch('');
    };

    const filteredParts = partsInventory.filter(p =>
        p.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const generatePDF = () => {
        if (!selectedKit) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header - Company Logo/Name
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MARE ALTA NÁUTICA', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Oficina Náutica Especializada', pageWidth / 2, 23, { align: 'center' });
        doc.text('Orçamento de Revisão Preventiva', pageWidth / 2, 29, { align: 'center' });

        // Document Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 45);
        doc.text(`Validade: 30 dias`, pageWidth - 14, 45, { align: 'right' });

        // Service Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(6, 182, 212); // cyan-500
        doc.text(isCustomMode
            ? `ORÇAMENTO PERSONALIZADO`
            : `REVISÃO ${selectedKit.intervalHours} HORAS`, 14, 58);

        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.setFont('helvetica', 'normal');
        doc.text(`${selectedKit.brand} ${selectedKit.engineModel}`, 14, 65);
        doc.setFontSize(9);
        doc.text(selectedKit.description, 14, 71);

        // Parts Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('PEÇAS E INSUMOS', 14, 83);

        const partsData = selectedKit.parts.map(part => [
            part.partNumber,
            part.name,
            part.quantity.toString(),
            formatCurrency(part.unitPrice),
            formatCurrency(part.quantity * part.unitPrice)
        ]);

        autoTable(doc, {
            startY: 87,
            head: [['Part Number', 'Descrição', 'Qtd', 'Unit.', 'Total']],
            body: partsData,
            theme: 'striped',
            headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 35, fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
            }
        });

        // Labor Table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MÃO DE OBRA', 14, finalY);

        const laborData = selectedKit.labor.map(serv => [
            serv.description,
            `${serv.hours}h`,
            formatCurrency(serv.hourlyRate) + '/h',
            formatCurrency(serv.hours * serv.hourlyRate)
        ]);

        autoTable(doc, {
            startY: finalY + 4,
            head: [['Serviço', 'Tempo', 'Taxa', 'Total']],
            body: laborData,
            theme: 'striped',
            headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            }
        });

        // Total
        const totalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFillColor(6, 182, 212); // cyan-500
        doc.rect(pageWidth - 80, totalY, 66, 12, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('VALOR TOTAL:', pageWidth - 76, totalY + 8);
        doc.setFontSize(14);
        doc.text(formatCurrency(calculateKitTotal(selectedKit as any)), pageWidth - 14, totalY + 8, { align: 'right' });

        // Footer Notes
        const footerY = totalY + 25;
        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('• Este orçamento é válido por 30 dias a partir da data de emissão.', 14, footerY);
        doc.text('• Peças e serviços baseados nas especificações do fabricante.', 14, footerY + 5);
        doc.text('• Valores sujeitos a alteração mediante disponibilidade de estoque.', 14, footerY + 10);

        // Save
        const filename = `Orcamento_Revisao_${selectedKit.brand}_${selectedKit.intervalHours}h_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    };

    // Formatting
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-primary" />
                    Orçador de Revisões Padronizadas
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Gere orçamentos técnicos de revisão em segundos baseados nos kits de fábrica.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: SELECTION */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit transition-colors">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 uppercase text-sm tracking-wide border-b dark:border-slate-700 pb-2">1. Selecione o Motor</h3>

                    <div className="space-y-4">
                        <div>
                            {/* Custom Toggle */}
                            <button
                                onClick={() => {
                                    setIsCustomMode(!isCustomMode);
                                    setSelectedBrand('');
                                    setSelectedModel('');
                                    setSelectedInterval(null);
                                }}
                                className={`w-full mb-4 px-4 py-3 rounded-lg border-2 border-dashed font-bold flex items-center justify-center gap-2 transition-all ${isCustomMode
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:border-primary hover:text-primary bg-slate-50 dark:bg-slate-900/50'}`}
                            >
                                {isCustomMode ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Modo Personalizado Ativo
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Criar Orçamento Manual
                                    </>
                                )}
                            </button>

                            <label className={`block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-2 ${isCustomMode ? 'opacity-50 pointer-events-none' : ''}`}>Fabricante</label>
                            <div className={`grid grid-cols-2 gap-2 ${isCustomMode ? 'opacity-50 pointer-events-none' : ''}`}>
                                {availableBrands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => {
                                            setSelectedBrand(brand);
                                            setSelectedModel('');
                                            setSelectedInterval(null);
                                        }}
                                        className={`p-3 rounded-lg border text-sm font-bold transition-all ${selectedBrand === brand
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedBrand && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-2">Modelo do Motor</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none font-medium"
                                    value={selectedModel}
                                    onChange={(e) => {
                                        setSelectedModel(e.target.value);
                                        setSelectedInterval(null);
                                    }}
                                >
                                    <option value="">Selecione o modelo...</option>
                                    {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        )}

                        {selectedModel && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-2">Revisão de (Horas)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableIntervals.map(hours => (
                                        <button
                                            key={hours}
                                            onClick={() => setSelectedInterval(hours)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedInterval === hours
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                }`}
                                        >
                                            {hours}h
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: BUDGET PREVIEW */}
                <div className="lg:col-span-2">
                    {selectedKit ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-colors">
                            {/* Header */}
                            <div className="bg-slate-800 dark:bg-slate-900 text-white p-6 flex justify-between items-start transition-colors">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Orçamento Revisão {selectedKit.intervalHours} Horas
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-wider">{selectedKit.brand} <span className="mx-2">•</span> {selectedKit.engineModel}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Valor Total Estimado</div>
                                    <div className="text-3xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">{formatCurrency(calculateKitTotal(selectedKit as any))}</div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">

                                {/* Parts Section */}
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between pb-2 border-b dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-primary" />
                                            Peças & Insumos Originais (e Extras)
                                        </div>
                                        <button
                                            onClick={() => setIsAddItemModalOpen(true)}
                                            className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Item Extra
                                        </button>
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-3">PN</th>
                                                    <th className="p-3">Item</th>
                                                    <th className="p-3 text-center">Qtd</th>
                                                    <th className="p-3 text-right">Unitário</th>
                                                    <th className="p-3 text-right">Total</th>
                                                    <th className="p-3 w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {selectedKit.parts.map((part: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                                                        <td className="p-3 font-mono text-xs text-slate-400 dark:text-slate-500">{part.partNumber}</td>
                                                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{part.name}</td>
                                                        <td className="p-3 text-center text-slate-600 dark:text-slate-400 font-medium">{part.quantity}</td>
                                                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">{formatCurrency(part.unitPrice)}</td>
                                                        <td className="p-3 text-right font-bold text-slate-700 dark:text-white">{formatCurrency(part.quantity * part.unitPrice)}</td>
                                                        <td className="p-3 text-center">
                                                            {part.isCustom && (
                                                                <button
                                                                    onClick={() => handleRemoveItem(part.originalId)}
                                                                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    title="Remover Item"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Labor Section */}
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2 pb-2 border-b dark:border-slate-700">
                                        <PenTool className="w-4 h-4 text-primary" />
                                        Mão de Obra Especializada
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedKit.labor.map((serv, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{serv.description}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium italic">Tempo Estimado: {serv.hours}h <span className="mx-2">•</span> taxa: {formatCurrency(serv.hourlyRate)}/h</p>
                                                </div>
                                                <div className="font-bold text-slate-700 dark:text-white">{formatCurrency(serv.hours * serv.hourlyRate)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={generatePDF}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        <Printer className="w-4 h-4" />
                                        PDF Orçamento
                                    </button>
                                    {isCustomMode && (
                                        <button
                                            onClick={() => setIsSaveKitModalOpen(true)}
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 text-primary border border-primary/20 hover:bg-primary/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                                        >
                                            <Save className="w-4 h-4" />
                                            Salvar Modelo
                                        </button>
                                    )}
                                    {!isCustomMode && selectedKit && selectedKit.id !== 'custom' && (
                                        <button
                                            onClick={handleDeleteKit}
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 text-red-500 border border-red-500/20 hover:bg-red-500/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Apagar Modelo
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsPreOrderModalOpen(true)}
                                        className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-black text-sm uppercase"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Gerar Pré-Ordem
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center transition-colors">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-600">
                                <Calculator className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">Pronto para Orçar?</h3>
                            <p className="text-slate-400 dark:text-slate-500 max-w-sm mt-3 font-medium">
                                Selecione a marca, modelo e intervalo de horas ao lado para visualizar os itens da revisão e valores detalhados.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* PRE-ORDER MODAL */}
            {isPreOrderModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-100 dark:border-slate-700">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-3 text-slate-800 dark:text-white">
                            <CheckCircle className="w-7 h-7 text-emerald-500" />
                            Gerar Pré-Ordem
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                            Selecione a embarcação para transformar este orçamento em uma Ordem de Serviço.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Selecione a Embarcação</label>
                                <select
                                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none font-bold transition-all shadow-sm"
                                    value={selectedBoatId}
                                    onChange={(e) => setSelectedBoatId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {boats.map(b => (
                                        <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name} ({b.model})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-inner">
                                <div className="flex justify-between items-center text-xs uppercase font-bold tracking-tight">
                                    <span className="text-slate-400 dark:text-slate-500">Serviço:</span>
                                    <span className="text-slate-700 dark:text-slate-200">Revisão {selectedKit?.intervalHours}h</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs">Total:</span>
                                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
                                        {formatCurrency(calculateKitTotal(selectedKit! as any))}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => setIsPreOrderModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreatePreOrder}
                                    disabled={!selectedBoatId || loadingCreateOS}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black text-sm uppercase shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loadingCreateOS ? 'Criando...' : 'Confirmar e Abrir OS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD ITEM MODAL */}
            {isAddItemModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl h-[650px] flex flex-col border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-white">
                                <Plus className="w-7 h-7 text-primary" />
                                Adicionar do Estoque
                            </h3>
                            <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar peça por nome ou SKU..."
                                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-medium transition-all"
                                    value={itemSearch}
                                    onChange={(e) => setItemSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 sticky top-0 font-bold text-[10px] uppercase tracking-widest z-10 backdrop-blur-md transition-colors">
                                    <tr>
                                        <th className="p-4">SKU</th>
                                        <th className="p-4">Nome</th>
                                        <th className="p-4 text-right">Preço</th>
                                        <th className="p-4 text-center">Estoque</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredParts.length > 0 ? (
                                        filteredParts.map(part => (
                                            <tr key={part.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 group transition-all">
                                                <td className="p-4 font-mono text-xs text-slate-400 dark:text-slate-500">{part.sku}</td>
                                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{part.name}</td>
                                                <td className="p-4 text-right text-emerald-600 dark:text-emerald-500 font-bold">{formatCurrency(part.price)}</td>
                                                <td className="p-4 text-center text-slate-500 font-medium">
                                                    <span className={`px-2 py-1 rounded-md ${part.quantity > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                                                        {part.quantity}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleAddCustomPart(part)}
                                                        className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] uppercase font-black hover:opacity-90 opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-primary/20"
                                                    >
                                                        Adicionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                                Nenhuma peça encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SAVE KIT MODAL */}
            {isSaveKitModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-3 text-slate-800 dark:text-white">
                            <Save className="w-7 h-7 text-primary" />
                            Salvar Modelo
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                            Salve este orçamento como um novo modelo reutilizável no sistema.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nome do Modelo</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Revisão 100h Mercury V8 Custom"
                                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-bold placeholder:font-medium transition-all"
                                    value={newKitName}
                                    onChange={(e) => setNewKitName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => setIsSaveKitModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveKit}
                                    className="px-8 py-3 bg-primary text-white rounded-xl hover:opacity-90 font-black text-sm uppercase shadow-lg shadow-primary/20"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
