import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Edit2, Trash2, Star, Phone, Mail, MapPin } from 'lucide-react';
import { ApiService } from '../services/api';

interface Partner {
    id: number;
    name: string;
    partnerType: string;
    phone: string;
    email?: string;
    companyName?: string;
    document?: string;
    address?: string;
    rating: number;
    totalJobs: number;
    active: boolean;
    notes?: string;
    createdAt: string;
}

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

export const PartnersView: React.FC = () => {
    const { t } = useTranslation();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        partnerType: 'Eletricista',
        phone: '',
        email: '',
        companyName: '',
        document: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const data = await ApiService.getPartners();
            setPartners(data);
        } catch (error) {
            console.error('Erro ao carregar parceiros:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPartner) {
                await ApiService.updatePartner(editingPartner.id, formData);
            } else {
                await ApiService.createPartner(formData);
            }
            loadPartners();
            resetForm();
        } catch (error) {
            console.error('Erro ao salvar parceiro:', error);
            alert('Erro ao salvar parceiro');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este parceiro?')) {
            try {
                await ApiService.deletePartner(id);
                loadPartners();
            } catch (error) {
                console.error('Erro ao deletar parceiro:', error);
                alert('Erro ao deletar parceiro');
            }
        }
    };

    const openEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name,
            partnerType: partner.partnerType,
            phone: partner.phone,
            email: partner.email || '',
            companyName: partner.companyName || '',
            document: partner.document || '',
            address: partner.address || '',
            notes: partner.notes || ''
        });
        setIsCreating(true);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingPartner(null);
        setFormData({
            name: '',
            partnerType: 'Eletricista',
            phone: '',
            email: '',
            companyName: '',
            document: '',
            address: '',
            notes: ''
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                            }`}
                    />
                ))}
                <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <UsersViewIcon className="w-8 h-8 text-primary" />
                        </div>
                        REDE DE PARCEIROS
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                        Prestadores de serviços especializados e terceirizados.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-primary hover:opacity-90 text-white rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/25 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Novo Parceiro
                </button>
            </div>

            {/* Form Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 max-w-3xl w-full shadow-2xl border border-slate-100 dark:border-slate-700 transition-all">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                            <Plus className="w-6 h-6 text-primary" />
                            {editingPartner ? 'EDITAR PARCEIRO' : 'NOVO PARCEIRO'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        Especialidade / Tipo *
                                    </label>
                                    <select
                                        value={formData.partnerType}
                                        onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                                    >
                                        {partnerTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        WhatsApp / Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        Email de Contato
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        Razão Social / Loja
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                        CPF ou CNPJ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.document}
                                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    Local de Atendimento / Endereço
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    Notas Internas / Qualificações
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-8 border-t dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    {editingPartner ? 'Confirmar Alterações' : 'Cadastrar Parceiro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-black/20 hover:border-primary/30 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-primary transition-colors">{partner.name}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{partner.partnerType}</span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(partner)}
                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(partner.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 flex justify-between items-center">
                            {renderStars(partner.rating)}
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {partner.totalJobs} serviços
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="font-medium">{partner.phone}</span>
                            </div>
                            {partner.email && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="truncate">{partner.email}</span>
                                </div>
                            )}
                            {partner.address && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="truncate italic">{partner.address}</span>
                                </div>
                            )}
                        </div>

                        {partner.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 mb-4">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">"{partner.notes}"</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <div className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 ${partner.active
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${partner.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {partner.active ? 'Operacional' : 'Indisponível'}
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">ID: #{partner.id}</span>
                        </div>
                    </div>
                ))}
            </div>

            {partners.length === 0 && !isCreating && (
                <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-inner">
                    <Users className="w-20 h-20 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-400 dark:text-slate-500 font-medium italic mb-8 uppercase tracking-widest text-xs">Nenhum parceiro ou prestador cadastrado na sua rede.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-8 py-3.5 bg-primary text-white rounded-2xl inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Cadastrar Primeiro Parceiro
                    </button>
                </div>
            )}
        </div>
    );
};

const UsersViewIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
