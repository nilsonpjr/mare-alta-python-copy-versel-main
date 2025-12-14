import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { INITIAL_MAINTENANCE_KITS } from '../data/maintenance_kits';
import { MaintenanceKit, calculateKitTotal } from '../types/maintenance';
import { Settings, FileText, CheckCircle, PenTool, Printer, ChevronRight, Calculator, AlertCircle } from 'lucide-react';

import { StorageService } from '../services/storage';
import { Boat, ServiceOrder, ServiceItem, OSStatus, ItemType } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MaintenanceBudgetView: React.FC = () => {
    // Selection State
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedInterval, setSelectedInterval] = useState<number | null>(null);

    // Data State
    const [boats, setBoats] = useState<Boat[]>([]);

    // Modal State
    const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
    const [selectedBoatId, setSelectedBoatId] = useState('');

    useEffect(() => {
        setBoats(StorageService.getBoats());
    }, []);

    // Filter Logic
    const availableBrands = Array.from(new Set(INITIAL_MAINTENANCE_KITS.map(k => k.brand)));

    const availableModels = selectedBrand
        ? Array.from(new Set(INITIAL_MAINTENANCE_KITS
            .filter(k => k.brand === selectedBrand)
            .map(k => k.engineModel)))
        : [];

    const availableIntervals = selectedBrand && selectedModel
        ? INITIAL_MAINTENANCE_KITS
            .filter(k => k.brand === selectedBrand && k.engineModel === selectedModel)
            .map(k => k.intervalHours)
            .sort((a, b) => a - b)
        : [];

    const selectedKit = selectedBrand && selectedModel && selectedInterval
        ? INITIAL_MAINTENANCE_KITS.find(k =>
            k.brand === selectedBrand &&
            k.engineModel === selectedModel &&
            k.intervalHours === selectedInterval)
        : null;

    // Actions
    const handleCreatePreOrder = () => {
        if (!selectedKit || !selectedBoatId) return;

        const boat = boats.find(b => b.id === selectedBoatId.toString() || b.id === Number(selectedBoatId));
        if (!boat) {
            alert("Embarcação não encontrada.");
            return;
        }

        const existingOrders = StorageService.getOrders();
        const inventory = StorageService.getInventory(); // Get current inventory

        // Convert Kit Items to Order Items
        const orderItems: ServiceItem[] = [];

        // 1. Add Parts (with inventory linking)
        selectedKit.parts.forEach(part => {
            // Try to find the part in inventory by Part Number (SKU)
            const inventoryPart = inventory.find(p => p.sku === part.partNumber);

            orderItems.push({
                id: Date.now() + Math.random(),
                type: ItemType.PART,
                description: `${part.name} (PN: ${part.partNumber})`,
                partId: inventoryPart ? inventoryPart.id : undefined, // Link if found
                quantity: part.quantity,
                unitPrice: part.unitPrice,
                unitCost: inventoryPart ? inventoryPart.cost : part.unitPrice * 0.6, // Use real cost if available
                total: part.quantity * part.unitPrice,
                orderId: '', // Will be set later or ignored by type
            });
        });

        // 2. Add Labor
        selectedKit.labor.forEach(serv => {
            orderItems.push({
                id: Date.now() + Math.random(),
                type: ItemType.LABOR,
                description: serv.description,
                quantity: serv.hours,
                unitPrice: serv.hourlyRate,
                unitCost: 0,
                total: serv.hours * serv.hourlyRate,
                orderId: '',
            });
        });

        const totalValue = orderItems.reduce((acc, item) => acc + item.total, 0);

        const newOrder: ServiceOrder = {
            id: `OS-${new Date().getFullYear()}-${existingOrders.length + 1}`.padStart(6, '0'),
            boatId: boat.id,
            description: `REVISÃO ${selectedKit?.intervalHours} HORAS - ${selectedKit?.brand} ${selectedKit?.engineModel}`,
            status: OSStatus.PENDING,
            items: orderItems,
            totalValue: totalValue,
            createdAt: new Date().toISOString(),
            requester: 'Orçador Automático',
            notes: [{
                id: Date.now(),
                orderId: `OS-${new Date().getFullYear()}-${existingOrders.length + 1}`.padStart(6, '0'), // Re-calculating same ID or using variable
                text: `Gerado automaticamente pelo kit: ${selectedKit?.description}`,
                createdAt: new Date().toISOString()
            }],
            estimatedDuration: selectedKit?.labor.reduce((acc, l) => acc + l.hours, 0) || 4,
            checklist: []
        };

        const updatedOrders = [newOrder, ...existingOrders];
        StorageService.saveOrders(updatedOrders);

        alert(`Pré-Ordem #${newOrder.id} gerada com sucesso!`);
        setIsPreOrderModalOpen(false);
        // Optional: Redirect to orders?
        // window.location.reload(); // Simple way to reset or users navigate manually
    };

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
        doc.text(`REVISÃO ${selectedKit.intervalHours} HORAS`, 14, 58);

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
        doc.text(formatCurrency(calculateKitTotal(selectedKit)), pageWidth - 14, totalY + 8, { align: 'right' });

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
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-cyan-600" />
                    Orçador de Revisões Padronizadas
                </h2>
                <p className="text-slate-500">Gere orçamentos técnicos de revisão em segundos baseados nos kits de fábrica.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: SELECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-700 mb-4 uppercase text-sm tracking-wide border-b pb-2">1. Selecione o Motor</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Fabricante</label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableBrands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => {
                                            setSelectedBrand(brand);
                                            setSelectedModel('');
                                            setSelectedInterval(null);
                                        }}
                                        className={`p-3 rounded border text-sm font-semibold transition-all ${selectedBrand === brand
                                            ? 'bg-slate-800 text-white border-slate-800 shadow-lg'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedBrand && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Modelo do Motor</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none"
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
                                <label className="block text-sm font-medium text-slate-600 mb-1">Revisão de (Horas)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableIntervals.map(hours => (
                                        <button
                                            key={hours}
                                            onClick={() => setSelectedInterval(hours)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedInterval === hours
                                                ? 'bg-cyan-600 text-white border-cyan-600 shadow'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-400'
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
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="bg-slate-800 text-white p-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-cyan-400" />
                                        Orçamento Revisão {selectedKit.intervalHours} Horas
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">{selectedKit.brand} • {selectedKit.engineModel}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase tracking-widest">Valor Total Estimado</div>
                                    <div className="text-3xl font-bold text-cyan-400">{formatCurrency(calculateKitTotal(selectedKit))}</div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">

                                {/* Parts Section */}
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 pb-2 border-b">
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        Peças & Insumos Originais
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-semibold">
                                                <tr>
                                                    <th className="p-2">PN</th>
                                                    <th className="p-2">Item</th>
                                                    <th className="p-2 text-center">Qtd</th>
                                                    <th className="p-2 text-right">Unitário</th>
                                                    <th className="p-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedKit.parts.map((part, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-2 font-mono text-xs text-slate-500">{part.partNumber}</td>
                                                        <td className="p-2 font-medium text-slate-800">{part.name}</td>
                                                        <td className="p-2 text-center text-slate-600">{part.quantity}</td>
                                                        <td className="p-2 text-right text-slate-600">{formatCurrency(part.unitPrice)}</td>
                                                        <td className="p-2 text-right font-bold text-slate-700">{formatCurrency(part.quantity * part.unitPrice)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Labor Section */}
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 pb-2 border-b">
                                        <PenTool className="w-4 h-4 text-slate-400" />
                                        Mão de Obra Especializada
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedKit.labor.map((serv, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{serv.description}</p>
                                                    <p className="text-xs text-slate-500">Tempo Estimado: {serv.hours}h (taxa: {formatCurrency(serv.hourlyRate)}/h)</p>
                                                </div>
                                                <div className="font-bold text-slate-700">{formatCurrency(serv.hours * serv.hourlyRate)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={generatePDF}
                                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Imprimir / PDF
                                    </button>
                                    <button
                                        onClick={() => setIsPreOrderModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg shadow hover:shadow-lg hover:from-cyan-500 hover:to-blue-500 transition-all font-bold"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Gerar Pré-Ordem
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <Calculator className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600">Nenhum Orçamento Gerado</h3>
                            <p className="text-slate-400 max-w-sm mt-2">
                                Selecione a marca, modelo e intervalo de horas ao lado para visualizar os itens da revisão e valores detalhados.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* PRE-ORDER MODAL */}
            {isPreOrderModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            Gerar Pré-Ordem
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Para transformar este orçamento em uma Ordem de Serviço, selecione a embarcação do cliente.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Selecione a Embarcação</label>
                                <select
                                    className="w-full p-3 border rounded-lg bg-slate-50 text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={selectedBoatId}
                                    onChange={(e) => setSelectedBoatId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {boats.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.model})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Serviço:</span>
                                    <span className="font-bold text-slate-700">Revisão {selectedKit?.intervalHours}h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Valor Total:</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(calculateKitTotal(selectedKit!))}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setIsPreOrderModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreatePreOrder}
                                    disabled={!selectedBoatId}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar e Criar OS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
