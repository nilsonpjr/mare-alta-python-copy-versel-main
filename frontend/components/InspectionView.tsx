import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle, AlertCircle, XCircle, Calendar, Ship, ChevronRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { PartnerQuoteManager } from './PartnerQuoteManager';
import { TechnicalInspection as Inspection, InspectionChecklistItem as ChecklistItem } from '../types';

interface Boat {
    id: number;
    name: string;
    hullId: string;
}

const categories = [
    'Motor',
    'Elétrica',
    'Casco',
    'Convés',
    'Sistema Hidráulico',
    'Refrigeração',
    'Eletrônica',
    'Segurança',
    'Estofamento',
    'Outros'
];

const partnerTypes = [
    'Eletricista',
    'Capoteiro',
    'Pintor',
    'Mecânico',
    'Refrigeração',
    'Eletrônica',
    'Fibra de Vidro',
    'Outro'
];

export const InspectionView: React.FC = () => {
    // Navigation State
    const [viewMode, setViewMode] = useState<'list' | 'new' | 'manager'>('list');
    const [selectedInspectionId, setSelectedInspectionId] = useState<number | null>(null);

    // Data State
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State (New Inspection)
    const [newInspection, setNewInspection] = useState<Partial<Inspection>>({
        boatId: 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        generalNotes: '',
        checklistItems: []
    });

    // Checklist Item Form State
    const [currentItem, setCurrentItem] = useState<Partial<ChecklistItem>>({
        category: 'Motor',
        itemDescription: '',
        severity: 'OK',
        notes: '',
        estimatedCost: 0
    });
    const [showItemForm, setShowItemForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inspectionsData, boatsData] = await Promise.all([
                ApiService.getInspections(),
                ApiService.getBoats()
            ]);
            setInspections(inspectionsData);
            setBoats(boatsData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'OK': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Atenção': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'Urgente': return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'Crítico': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'OK': return 'bg-green-500/10 border-green-500/30 text-green-400';
            case 'Atenção': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
            case 'Urgente': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
            case 'Crítico': return 'bg-red-500/10 border-red-500/30 text-red-400';
            default: return 'bg-slate-700 border-slate-600 text-slate-300';
        }
    };

    const addChecklistItem = () => {
        if (!currentItem.itemDescription?.trim()) {
            alert('Descreva o item verificado');
            return;
        }

        setNewInspection({
            ...newInspection,
            checklistItems: [...(newInspection.checklistItems || []), { ...currentItem } as ChecklistItem]
        });

        setCurrentItem({
            category: 'Motor',
            itemDescription: '',
            severity: 'OK',
            notes: '',
            estimatedCost: 0
        });
        setShowItemForm(false);
    };

    const removeChecklistItem = (index: number) => {
        const items = [...(newInspection.checklistItems || [])];
        items.splice(index, 1);
        setNewInspection({ ...newInspection, checklistItems: items });
    };

    const saveInspection = async () => {
        if (!newInspection.boatId) {
            alert('Selecione uma embarcação');
            return;
        }

        if (!newInspection.checklistItems || newInspection.checklistItems.length === 0) {
            alert('Adicione pelo menos 1 item ao checklist');
            return;
        }

        setLoading(true);
        try {
            const createdInspection = await ApiService.createInspection({
                boatId: newInspection.boatId,
                inspectorUserId: 1,
                scheduledDate: newInspection.scheduledDate,
                generalNotes: newInspection.generalNotes
            });

            for (const item of newInspection.checklistItems || []) {
                await ApiService.addChecklistItem(createdInspection.id, item);
            }

            alert('✅ Inspeção salva com sucesso!');

            // Go to Manager View directly
            await loadData(); // Reload list
            setSelectedInspectionId(createdInspection.id);
            setViewMode('manager');

            // Reset Form (for future)
            setNewInspection({
                boatId: 0,
                scheduledDate: new Date().toISOString().split('T')[0],
                generalNotes: '',
                checklistItems: []
            });

        } catch (error) {
            console.error('Erro ao salvar inspeção:', error);
            alert('❌ Erro ao salvar inspeção');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER VIEWS ---

    if (viewMode === 'manager' && selectedInspectionId) {
        return (
            <PartnerQuoteManager
                inspectionId={selectedInspectionId}
                onBack={() => {
                    setViewMode('list');
                    setSelectedInspectionId(null);
                    loadData(); // Reload to see updates
                }}
            />
        );
    }

    if (viewMode === 'new') {
        return (
            <div className="min-h-screen bg-slate-900 p-4 md:p-6 text-slate-100 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-white">
                        ← Voltar
                    </button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 text-cyan-400" />
                        Nova Inspeção Técnica
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form Info */}
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Embarcação *</label>
                            <select
                                value={newInspection.boatId}
                                onChange={(e) => setNewInspection({ ...newInspection, boatId: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                            >
                                <option value={0}>Selecione...</option>
                                {boats.map((boat) => (
                                    <option key={boat.id} value={boat.id}>
                                        {boat.name} - {boat.hullId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                            <input
                                type="date"
                                value={newInspection.scheduledDate}
                                onChange={(e) => setNewInspection({ ...newInspection, scheduledDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                            />
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Observações Gerais</label>
                            <textarea
                                value={newInspection.generalNotes}
                                onChange={(e) => setNewInspection({ ...newInspection, generalNotes: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Right Column: Checklist */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 min-h-[500px]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Itens do Checklist</h2>
                                <button
                                    onClick={() => setShowItemForm(true)}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Adicionar Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {newInspection.checklistItems?.map((item, index) => (
                                    <div key={index} className={`p-4 rounded-lg border-l-4 bg-slate-700/50 flex justify-between items-start ${item.severity === 'OK' ? 'border-green-500' :
                                            item.severity === 'Atenção' ? 'border-yellow-500' :
                                                item.severity === 'Urgente' ? 'border-orange-500' : 'border-red-500'
                                        }`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-200">{item.category}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.severity === 'OK' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-orange-500/20 text-orange-400'
                                                    }`}>{item.severity}</span>
                                            </div>
                                            <p className="text-slate-300">{item.itemDescription}</p>
                                            {item.estimatedCost && item.estimatedCost > 0 && (
                                                <p className="text-sm text-green-400 font-mono mt-1">Estimado: R$ {item.estimatedCost.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <button onClick={() => removeChecklistItem(index)} className="text-slate-500 hover:text-red-500">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {(!newInspection.checklistItems || newInspection.checklistItems.length === 0) && (
                                    <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                        Nenhum item adicionado ainda.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 md:pl-64 flex justify-end">
                    <button
                        onClick={saveInspection}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-white shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Finalizar Inspeção'}
                    </button>
                </div>

                {/* Modal Item Form */}
                {showItemForm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
                            <h3 className="text-lg font-bold text-slate-200 mb-4">Novo Item</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                                    <select
                                        value={currentItem.category}
                                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                    >
                                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                                    <textarea
                                        value={currentItem.itemDescription}
                                        onChange={(e) => setCurrentItem({ ...currentItem, itemDescription: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Severidade</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['OK', 'Atenção', 'Urgente', 'Crítico'].map((sev) => (
                                            <button
                                                key={sev}
                                                onClick={() => setCurrentItem({ ...currentItem, severity: sev as any })}
                                                className={`px-3 py-2 rounded border transition-colors ${currentItem.severity === sev
                                                    ? 'bg-cyan-600 border-cyan-500 text-white'
                                                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                                    }`}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Custo Estimado (R$)</label>
                                    <input
                                        type="number"
                                        value={currentItem.estimatedCost || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                    />
                                </div>
                                {currentItem.severity !== 'OK' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Recomendar Parceiro</label>
                                        <select
                                            value={currentItem.recommendedPartnerType || ''}
                                            onChange={(e) => setCurrentItem({ ...currentItem, recommendedPartnerType: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                        >
                                            <option value="">Nenhum</option>
                                            {partnerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowItemForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded">Cancelar</button>
                                    <button onClick={addChecklistItem} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Adicionar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default View: List
    return (
        <div className="min-h-screen bg-slate-900 p-4 md:p-6 text-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 text-cyan-400" />
                        Inspeções Técnicas
                    </h1>
                    <p className="text-slate-400 mt-1">Gerencie checklists, manutenções e orçamentos de parceiros.</p>
                </div>
                <button
                    onClick={() => setViewMode('new')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-cyan-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Nova Inspeção
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Pending / Active Inspections */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-700/30 font-bold flex justify-between">
                        <span>Histórico de Inspeções</span>
                        <span className="text-slate-400 text-sm font-normal">{inspections.length} registros</span>
                    </div>

                    {inspections.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            Nenhuma inspeção realizada ainda.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {inspections.map((insp) => {
                                const boat = boats.find(b => b.id === insp.boatId);
                                const problems = insp.checklistItems?.filter(i => i.severity !== 'OK').length || 0;

                                return (
                                    <div key={insp.id} className="p-4 hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${problems > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                                <ClipboardCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{boat?.name || `Embarcação #${insp.boatId}`}</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(insp.scheduledDate || '').toLocaleDateString('pt-BR')}</span>
                                                    <span className="flex items-center gap-1"><Ship className="w-3 h-3" /> {boat?.hullId || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${problems > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                                    {problems} problemas
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {insp.checklistItems?.length || 0} itens verificados
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedInspectionId(insp.id);
                                                    setViewMode('manager');
                                                }}
                                                className="px-4 py-2 bg-slate-700 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 group-hover:bg-cyan-600 transition-all font-medium"
                                            >
                                                Ver Detalhes <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
