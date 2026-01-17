import React, { useState } from 'react';
import { Client, ClientCreate } from '../types';
import { ApiService } from '../services/api';
import { User, Search, Save, X } from 'lucide-react';

interface QuickClientModalProps {
    onSuccess: (client: Client) => void;
    onCancel: () => void;
    isOpen: boolean;
}

export const QuickClientModal: React.FC<QuickClientModalProps> = ({ onSuccess, onCancel, isOpen }) => {
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<'PARTICULAR' | 'EMPRESA' | 'GOVERNO'>('PARTICULAR');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !document) {
            alert("Nome e Documento são obrigatórios.");
            return;
        }

        setIsLoading(true);
        try {
            const createData: ClientCreate = {
                name,
                document,
                phone,
                email,
                type,
                address: '' // Simplified for quick create
            };
            const newClient = await ApiService.createClient(createData);
            onSuccess(newClient);
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            alert("Erro ao criar cliente.");
        } finally {
            setIsLoading(false);
        }
    };

    const lookupCNPJ = async () => {
        const doc = document.replace(/\D/g, '');
        if (doc.length !== 14) return;

        setIsLoading(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`);
            const data = await response.json();
            if (data.razao_social) {
                setName(data.nome_fantasia || data.razao_social);
                setType('EMPRESA');
                setEmail(data.email || email);
                setPhone(data.ddd_telefone_1 || phone);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Novo Cliente (Rápido)
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo / Razão Social</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">CPF / CNPJ</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={document}
                                    onChange={e => setDocument(e.target.value)}
                                    onBlur={lookupCNPJ}
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                            >
                                <option value="PARTICULAR">Particular</option>
                                <option value="EMPRESA">Empresa</option>
                                <option value="GOVERNO">Governo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                type="email"
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                        {isLoading ? 'Salvando...' : <><Save className="w-4 h-4" /> Cadastrar Cliente</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
