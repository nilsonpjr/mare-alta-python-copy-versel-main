import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, Camera, CheckCircle, AlertTriangle, AlertCircle, XCircle, Send } from 'lucide-react';
import { ApiService } from '../services/api';

interface Boat {
    id: number;
    name: string;
    hullId: string;
}

interface ChecklistItem {
    category: string;
    itemDescription: string;
    severity: 'OK' | 'Atenção' | 'Urgente' | 'Crítico';
    notes?: string;
    photoUrl?: string;
    estimatedCost?: number;
    recommendedPartnerType?: string;
}

interface Inspection {
    id?: number;
    boatId: number;
    scheduledDate?: string;
    generalNotes?: string;
    status?: string;
    checklistItems?: ChecklistItem[];
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
    const [boats, setBoats] = useState<Boat[]>([]);
    const [inspection, setInspection] = useState<Inspection>({
        boatId: 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        generalNotes: '',
        checklistItems: []
    });
    const [currentItem, setCurrentItem] = useState<ChecklistItem>({
        category: 'Motor',
        itemDescription: '',
        severity: 'OK',
        notes: '',
        estimatedCost: 0
    });
    const [showItemForm, setShowItemForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBoats();
    }, []);

    const loadBoats = async () => {
        try {
            const data = await ApiService.getBoats();
            setBoats(data);
        } catch (error) {
            console.error('Erro ao carregar embarcações:', error);
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
            case 'OK': return 'bg-green-50 border-green-200 text-green-800';
            case 'Atenção': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'Urgente': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'Crítico': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const addChecklistItem = () => {
        if (!currentItem.itemDescription.trim()) {
            alert('Descreva o item verificado');
            return;
        }

        setInspection({
            ...inspection,
            checklistItems: [...(inspection.checklistItems || []), { ...currentItem }]
        });

        // Reset form
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
        const items = [...(inspection.checklistItems || [])];
        items.splice(index, 1);
        setInspection({ ...inspection, checklistItems: items });
    };

    const saveInspection = async () => {
        if (!inspection.boatId) {
            alert('Selecione uma embarcação');
            return;
        }

        if (!inspection.checklistItems || inspection.checklistItems.length === 0) {
            alert('Adicione pelo menos 1 item ao checklist');
            return;
        }

        setLoading(true);
        try {
            // Criar inspeção
            const createdInspection = await ApiService.createInspection({
                boatId: inspection.boatId,
                inspectorUserId: 1, // Será o usuário atual
                scheduledDate: inspection.scheduledDate,
                generalNotes: inspection.generalNotes
            });

            // Adicionar itens do checklist
            for (const item of inspection.checklistItems || []) {
                await ApiService.addChecklistItem(createdInspection.id, item);
            }

            alert('✅ Inspeção salva com sucesso!');

            // Reset
            setInspection({
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

    const getTotalEstimatedCost = () => {
        return (inspection.checklistItems || [])
            .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    };

    const getProblemsCount = () => {
        return (inspection.checklistItems || [])
            .filter(item => item.severity !== 'OK').length;
    };

    return (
        <div className="min-h-screen bg-slate-900 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <ClipboardCheck className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-slate-100">Inspeção Técnica</h1>
                </div>
                <p className="text-slate-400 text-sm">
                    Checklist completo para análise de embarcações
                </p>
            </div>

            {/* Seleção de Embarcação */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Embarcação *
                </label>
                <select
                    value={inspection.boatId}
                    onChange={(e) => setInspection({ ...inspection, boatId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                    <option value={0}>Selecione...</option>
                    {boats.map((boat) => (
                        <option key={boat.id} value={boat.id}>
                            {boat.name} - {boat.hullId}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data da Inspeção
                </label>
                <input
                    type="date"
                    value={inspection.scheduledDate}
                    onChange={(e) => setInspection({ ...inspection, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
            </div>

            {/* Checklist Items */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-slate-200">
                        Checklist ({inspection.checklistItems?.length || 0} itens)
                    </h2>
                    <button
                        onClick={() => setShowItemForm(true)}
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-3">
                    {(inspection.checklistItems || []).map((item, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-4 border-2 ${getSeverityColor(item.severity)}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {getSeverityIcon(item.severity)}
                                    <span className="font-bold text-sm">{item.category}</span>
                                </div>
                                <button
                                    onClick={() => removeChecklistItem(index)}
                                    className="text-slate-500 hover:text-red-500"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm font-medium mb-2">{item.itemDescription}</p>

                            {item.notes && (
                                <p className="text-xs italic mb-2">💬 {item.notes}</p>
                            )}

                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold px-2 py-1 rounded bg-white/50">
                                    {item.severity}
                                </span>
                                {item.estimatedCost && item.estimatedCost > 0 && (
                                    <span className="font-mono font-bold">
                                        R$ {item.estimatedCost.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {item.recommendedPartnerType && (
                                <div className="mt-2 pt-2 border-t border-white/20">
                                    <span className="text-xs">👷 Recomendado: {item.recommendedPartnerType}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form de Novo Item */}
            {showItemForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-200 mb-4">Novo Item do Checklist</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Categoria *</label>
                                <select
                                    value={currentItem.category}
                                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição *</label>
                                <textarea
                                    value={currentItem.itemDescription}
                                    onChange={(e) => setCurrentItem({ ...currentItem, itemDescription: e.target.value })}
                                    rows={3}
                                    placeholder="Ex: Fiação exposta no painel de controle"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Severidade *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['OK', 'Atenção', 'Urgente', 'Crítico'].map((sev) => (
                                        <button
                                            key={sev}
                                            onClick={() => setCurrentItem({ ...currentItem, severity: sev as any })}
                                            className={`px-3 py-2 rounded border-2 text-sm font-medium ${currentItem.severity === sev
                                                    ? getSeverityColor(sev) + ' border-current'
                                                    : 'bg-slate-700 border-slate-600 text-slate-300'
                                                }`}
                                        >
                                            {getSeverityIcon(sev)}
                                            <span className="ml-2">{sev}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
                                <textarea
                                    value={currentItem.notes}
                                    onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                                    rows={2}
                                    placeholder="Detalhes adicionais..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Custo Estimado (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
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
                                        {partnerTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowItemForm(false)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={addChecklistItem}
                                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Observações Gerais */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Observações Gerais
                </label>
                <textarea
                    value={inspection.generalNotes}
                    onChange={(e) => setInspection({ ...inspection, generalNotes: e.target.value })}
                    rows={3}
                    placeholder="Notas adicionais sobre a inspeção..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                />
            </div>

            {/* Summary */}
            {inspection.checklistItems && inspection.checklistItems.length > 0 && (
                <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-lg p-4 mb-4 border border-cyan-700/50">
                    <h3 className="text-sm font-bold text-cyan-300 mb-2">Resumo</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-400">Total de Itens:</span>
                            <span className="ml-2 font-bold text-white">{inspection.checklistItems.length}</span>
                        </div>
                        <div>
                            <span className="text-slate-400">Problemas:</span>
                            <span className="ml-2 font-bold text-orange-400">{getProblemsCount()}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-400">Custo Total Estimado:</span>
                            <span className="ml-2 font-bold text-green-400 text-lg">
                                R$ {getTotalEstimatedCost().toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Botão Salvar */}
            <button
                onClick={saveInspection}
                disabled={loading || !inspection.boatId || !inspection.checklistItems?.length}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                <Send className="w-6 h-6" />
                {loading ? 'Salvando...' : 'Salvar Inspeção'}
            </button>
        </div>
    );
};
