import React, { useState, useEffect } from 'react';
import { Boat, Client, Marina, BoatCreate, SystemConfig } from '../types';
import { ApiService } from '../services/api';
import { Anchor, Save, X, Plus, MapPin, Settings } from 'lucide-react';

interface QuickBoatModalProps {
    onSuccess: (boat: Boat) => void;
    onCancel: () => void;
    isOpen: boolean;
    clients: Client[];
    marinas: Marina[];
    onNewClient: () => void;
    onNewMarina: () => void;
    preSelectedClientId?: number;
}

export const QuickBoatModal: React.FC<QuickBoatModalProps> = ({
    onSuccess, onCancel, isOpen, clients, marinas, onNewClient, onNewMarina, preSelectedClientId
}) => {
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [hullId, setHullId] = useState('');
    const [usageType, setUsageType] = useState<any>('LAZER');
    const [clientId, setClientId] = useState<string>(preSelectedClientId ? String(preSelectedClientId) : '');
    const [marinaId, setMarinaId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Update if preSelectedClientId changes (e.g. returning from create client)
    useEffect(() => {
        if (preSelectedClientId) setClientId(String(preSelectedClientId));
    }, [preSelectedClientId]);

    const handleSave = async () => {
        if (!name || !model || !clientId) {
            alert("Nome, Modelo e Proprietário são obrigatórios.");
            return;
        }

        setIsLoading(true);
        try {
            const createData: BoatCreate = {
                name,
                model,
                hullId: hullId || 'N/A', // Opcional no rápido
                usageType,
                clientId: Number(clientId),
                marinaId: marinaId ? Number(marinaId) : undefined,
                engines: [] // Rápido não pede motor obrigatório
            };
            const newBoat = await ApiService.createBoat(createData);
            onSuccess(newBoat);
        } catch (error) {
            console.error("Erro ao criar barco:", error);
            alert("Erro ao criar embarcação.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Anchor className="w-5 h-5 text-primary" />
                        Nova Embarcação (Rápido)
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Nome da Embarcação</label>
                            <input
                                autoFocus
                                type="text"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Modelo / Tamanho</label>
                            <input
                                type="text"
                                placeholder="Ex: Phantom 303, Focker 240..."
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={model}
                                onChange={e => setModel(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Inscrição (HIN/TIE)</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={hullId}
                                onChange={e => setHullId(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Relations */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                                Proprietário
                                <button onClick={onNewClient} className="text-primary hover:underline text-[10px] flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Novo
                                </button>
                            </label>
                            <select
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={clientId}
                                onChange={e => setClientId(e.target.value)}
                            >
                                <option value="">Selecione o Cliente...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                                Marina / Local
                                <button onClick={onNewMarina} className="text-primary hover:underline text-[10px] flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Novo
                                </button>
                            </label>
                            <select
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={marinaId}
                                onChange={e => setMarinaId(e.target.value)}
                            >
                                <option value="">Oficina / Próprio</option>
                                {marinas.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
                    >
                        {isLoading ? 'Salvando...' : <><Save className="w-4 h-4" /> Cadastrar Barco</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
