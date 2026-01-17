
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Manufacturer, Model, ItemType, ApiMaintenanceKit, Part } from '../types';
import { X, Plus, Save, Trash2, Search, Settings, Wrench, Package } from 'lucide-react';

interface MaintenanceKitManagerProps {
    onClose: () => void;
}

export const MaintenanceKitManager: React.FC<MaintenanceKitManagerProps> = ({ onClose }) => {
    // Data States
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [allKits, setAllKits] = useState<ApiMaintenanceKit[]>([]);
    const [partsInventory, setPartsInventory] = useState<Part[]>([]);

    // Selection States
    const [selectedManuf, setSelectedManuf] = useState<Manufacturer | null>(null);
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [selectedKit, setSelectedKit] = useState<ApiMaintenanceKit | null>(null);

    // Form States
    const [isKitFormOpen, setIsKitFormOpen] = useState(false);

    // UI States
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [manufData, kitsData, partsData] = await Promise.all([
                ApiService.getManufacturers('ENGINE'),
                ApiService.getMaintenanceKits(),
                ApiService.getParts()
            ]);
            setManufacturers(manufData);
            setAllKits(kitsData);
            setPartsInventory(partsData);
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- MANUFACTURER & MODEL ACTIONS ---
    const handleAddManufacturer = async () => {
        const name = prompt("Nome do Fabricante (Motor):");
        if (!name) return;
        try {
            // Correct payload: do not send 'models'
            await ApiService.createManufacturer({ name, type: 'ENGINE' } as any);

            // Reload from DB to ensure it was saved
            await loadInitialData();
            alert("Fabricante criado com sucesso!");
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao criar fabricante: ${e.message || 'Erro desconhecido'}`);
        }
    };

    const handleAddModel = async () => {
        if (!selectedManuf) return;
        const name = prompt(`Novo modelo para ${selectedManuf.name}:`);
        if (!name) return;
        try {
            await ApiService.createModel(selectedManuf.id, name);

            // Reload all data to ensure consistency and correct IDs
            await loadInitialData();

            // NOTE: After reload, we need to find the new manufacturer reference to keep it selected
            // We'll do this by finding the manufacturer with the same ID in the NEW data
            // But verify first if loadInitialData updates state synchronously or we need to await the promise
            // which we did await. However, React state updates are scheduled.
            // So we can assume loadInitialData sets state, but we can't read 'manufacturers' state immediately here
            // because it's stale. 
            // Better strategy: fetch specific manufacturer again or just trust the user to re-select if needed,
            // OR reuse the logic from previous fix but correctly.

            const manufData = await ApiService.getManufacturers('ENGINE');
            setManufacturers(manufData);

            const updatedManuf = manufData.find(m => m.id === selectedManuf.id);
            if (updatedManuf) setSelectedManuf(updatedManuf);

            alert("Modelo criado com sucesso!");
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao criar modelo: ${e.message || 'Erro desconhecido'}`);
        }
    };

    // --- KIT ACTIONS ---

    // Filtered Kits for current selection
    const filteredKits = selectedManuf && selectedModel
        ? allKits.filter(k => k.brand === selectedManuf.name && k.engineModel === selectedModel.name)
        : [];

    const handleDeleteKit = async (kitId: number) => {
        if (!confirm("Tem certeza que deseja excluir este kit?")) return;
        try {
            await ApiService.deleteMaintenanceKit(kitId);
            setAllKits(allKits.filter(k => k.id !== kitId));
            if (selectedKit?.id === kitId) setSelectedKit(null);
        } catch (e) {
            alert("Erro ao excluir kit");
        }
    };

    // --- KIT FORM COMPONENT ---
    const KitForm = () => {
        const [formData, setFormData] = useState({
            name: selectedKit?.name || `Revisão ${selectedKit?.intervalHours || '100'} Horas`,
            intervalHours: selectedKit?.intervalHours || 100,
            description: selectedKit?.description || '',
            items: selectedKit?.items.map(i => ({
                type: i.type,
                partId: i.partId,
                description: i.itemDescription,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                tempId: Math.random()
            })) || []
        });

        const [itemSearch, setItemSearch] = useState('');
        const [saving, setSaving] = useState(false);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);


        const handleAddItem = (type: ItemType, part?: Part) => {
            const newItem = {
                type,
                partId: part?.id,
                description: part ? part.name : (type === ItemType.LABOR ? 'Mão de Obra Técnica' : 'Nova Peça'),
                quantity: 1,
                unitPrice: part ? part.price : 0,
                tempId: Math.random()
            };
            setFormData({ ...formData, items: [...formData.items, newItem] });
            setItemSearch('');
        };

        const handleSave = async () => {
            setSaving(true);
            setSuccessMessage(null);
            setErrorMessage(null);

            if (!selectedManuf || !selectedModel) {
                alert("Selecione um fabricante e modelo.");
                setSaving(false);
                return;
            }

            try {
                const payload = {
                    name: formData.name,
                    brand: selectedManuf.name,
                    engineModel: selectedModel.name,
                    intervalHours: Number(formData.intervalHours),
                    description: formData.description,
                    items: formData.items.map(i => ({
                        type: i.type,
                        partId: i.partId, // Can be undefined, which is fine
                        itemDescription: i.description,
                        quantity: Number(i.quantity),
                        unitPrice: Number(i.unitPrice)
                    }))
                };

                await ApiService.createMaintenanceKit(payload);

                alert("Kit salvo com sucesso!");
                await loadInitialData(); // Reload all data
                setIsKitFormOpen(false); // Close modal

            } catch (e: any) {
                console.error("Erro ao salvar kit:", e);
                alert(`Erro ao salvar kit: ${e.response?.data?.detail || e.message || 'Erro desconhecido'}`);
            } finally {
                setSaving(false);
            }
        };

        const filteredParts = partsInventory.filter(p =>
            p.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(itemSearch.toLowerCase())
        ).slice(0, 10);

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col shadow-2xl border border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            {selectedKit ? 'Editar Kit' : 'Novo Kit de Revisão'}
                        </h3>
                        <button onClick={() => setIsKitFormOpen(false)} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-slate-300 transition"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Intervalo (Horas)</label>
                                <input
                                    type="number"
                                    value={formData.intervalHours}
                                    onChange={e => setFormData({ ...formData, intervalHours: Number(e.target.value) })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Kit</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição Detalhada</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 h-20"
                                    placeholder="Detalhes sobre o que está incluso..."
                                />
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <div className="flex justify-between items-end mb-4">
                                <h4 className="font-bold text-lg">Itens do Kit</h4>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar peça..."
                                            value={itemSearch}
                                            onChange={e => setItemSearch(e.target.value)}
                                            className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64 dark:bg-slate-900 dark:border-slate-700"
                                        />
                                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                                        {itemSearch && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 mt-1 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                                                {filteredParts.map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm border-b dark:border-slate-700/50"
                                                        onClick={() => handleAddItem(ItemType.PART, p)}
                                                    >
                                                        <div className="font-bold">{p.sku}</div>
                                                        <div className="text-xs text-slate-500 truncate">{p.name}</div>
                                                    </div>
                                                ))}
                                                {filteredParts.length === 0 && <div className="p-3 text-xs text-slate-400">Nenhuma peça encontrada.</div>}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleAddItem(ItemType.LABOR)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Mão de Obra
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="p-3 text-left">Tipo</th>
                                            <th className="p-3 text-left">Descrição</th>
                                            <th className="p-3 text-center w-24">Qtd</th>
                                            <th className="p-3 text-right w-32">Unit. (R$)</th>
                                            <th className="p-3 text-right w-32">Total</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {formData.items.map((item, idx) => (
                                            <tr key={item.tempId}>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.type === ItemType.PART ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {item.type === ItemType.PART ? 'PEÇA' : 'SERV'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={e => {
                                                            const newItems = [...formData.items];
                                                            newItems[idx].description = e.target.value;
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary outline-none"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={e => {
                                                            const newItems = [...formData.items];
                                                            newItems[idx].quantity = Number(e.target.value);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="w-full bg-transparent text-center border-b border-transparent hover:border-slate-300 focus:border-primary outline-none"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={e => {
                                                            const newItems = [...formData.items];
                                                            newItems[idx].unitPrice = Number(e.target.value);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="w-full bg-transparent text-right border-b border-transparent hover:border-slate-300 focus:border-primary outline-none"
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-bold">
                                                    {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {formData.items.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 italic">Nenhum item adicionado. Use a busca ou o botão acima.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
                        <div className="text-sm text-slate-500">
                            Total Estimado: <span className="font-bold text-slate-800 dark:text-white text-lg ml-2">
                                {formData.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsKitFormOpen(false)} className="px-6 py-2 border rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                <Save className="w-4 h-4" /> Salvar Kit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Settings className="w-6 h-6 text-cyan-400" />
                        Gerenciador de Kits de Revisão
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Configure fabricantes, modelos e revisões padronizadas.</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-8">
                <div className="grid grid-cols-3 gap-8 h-full">

                    {/* Column 1: Manufacturers */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                                <Wrench className="w-4 h-4" /> Fabricantes
                            </h3>
                            <button onClick={handleAddManufacturer} className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary/20 transition">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {manufacturers.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => { setSelectedManuf(m); setSelectedModel(null); }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedManuf?.id === m.id
                                        ? 'bg-white dark:bg-slate-700 border-primary shadow-md'
                                        : 'border-transparent hover:bg-white dark:hover:bg-slate-700/50'}`}
                                >
                                    <div className="font-bold text-slate-800 dark:text-white">{m.name}</div>
                                    <div className="text-[10px] text-slate-500 uppercase mt-1">{m.models.length} modelos</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Models */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                                <Search className="w-4 h-4" /> Modelos
                            </h3>
                            <button
                                onClick={handleAddModel}
                                disabled={!selectedManuf}
                                className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary/20 transition disabled:opacity-30"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {!selectedManuf ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">Selecione um fabricante.</div>
                            ) : selectedManuf.models.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">Nenhum modelo cadastrado.</div>
                            ) : (
                                selectedManuf.models.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => { setSelectedModel(m); }}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedModel?.id === m.id
                                            ? 'bg-white dark:bg-slate-700 border-primary shadow-md'
                                            : 'border-transparent hover:bg-white dark:hover:bg-slate-700/50'}`}
                                    >
                                        <div className="font-bold text-slate-800 dark:text-white">{m.name}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Column 3: Kits */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                                <Package className="w-4 h-4" /> Kits / Revisões
                            </h3>
                            <button
                                onClick={() => { setSelectedKit(null); setIsKitFormOpen(true); }}
                                disabled={!selectedModel}
                                className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary/20 transition disabled:opacity-30"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {!selectedModel ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">Selecione um modelo.</div>
                            ) : filteredKits.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    Nenhum kit cadastrado para este modelo.<br />
                                    <button onClick={() => setIsKitFormOpen(true)} className="text-primary font-bold mt-2 hover:underline">Criar primeiro kit</button>
                                </div>
                            ) : (
                                filteredKits.map(k => (
                                    <div
                                        key={k.id}
                                        className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600/50 hover:shadow-md transition-all group relative"
                                    >
                                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded text-xs">{k.intervalHours}h</span>
                                            {k.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{k.description}</div>
                                        <div className="mt-2 text-xs font-bold text-slate-400">{k.items.length} itens inclusos</div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteKit(k.id); }}
                                            className="absolute top-2 right-2 p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isKitFormOpen && <KitForm />}
        </div>
    );
};
