import React, { useState } from 'react';
import { Marina, MarinaCreate } from '../types';
import { ApiService } from '../services/api';
import { MapPin, Save, X } from 'lucide-react';

interface QuickMarinaModalProps {
    onSuccess: (marina: Marina) => void;
    onCancel: () => void;
    isOpen: boolean;
}

export const QuickMarinaModal: React.FC<QuickMarinaModalProps> = ({ onSuccess, onCancel, isOpen }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [managerName, setManagerName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name) {
            alert("Nome da Marina é obrigatório.");
            return;
        }

        setIsLoading(true);
        try {
            const createData: MarinaCreate = {
                name,
                address,
                managerName,
                contactPhone
            };
            const newMarina = await ApiService.createMarina(createData);
            onSuccess(newMarina);
        } catch (error) {
            console.error("Erro ao criar marina:", error);
            alert("Erro ao criar marina.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Nova Marina (Rápido)
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Nome da Marina / Local</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ex: Marina Itajaí"
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Endereço (Cidade/Bairro)</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Gerente/Responsável</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={managerName}
                                onChange={e => setManagerName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Telefone</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={contactPhone}
                                onChange={e => setContactPhone(e.target.value)}
                            />
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
                        {isLoading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Marina</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
