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
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className="ml-2 text-sm text-slate-400">
                    {rating.toFixed(1)} ({partners.find(p => p.rating === rating)?.totalJobs || 0} jobs)
                </span>
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                        <Users className="w-8 h-8" />
                        Rede de Parceiros
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Gerencie sua rede de prestadores de serviços especializados
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Parceiro
                </button>
            </div>

            {/* Form Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-200 mb-4">
                            {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.partnerType}
                                        onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    >
                                        {partnerTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        CPF/CNPJ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.document}
                                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                                >
                                    {editingPartner ? 'Atualizar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-200">{partner.name}</h3>
                                <span className="text-sm text-cyan-400">{partner.partnerType}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(partner)}
                                    className="text-slate-400 hover:text-cyan-500 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(partner.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            {renderStars(partner.rating)}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Phone className="w-4 h-4 text-slate-500" />
                                {partner.phone}
                            </div>
                            {partner.email && (
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    {partner.email}
                                </div>
                            )}
                            {partner.address && (
                                <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span className="truncate">{partner.address}</span>
                                </div>
                            )}
                        </div>

                        {partner.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-xs text-slate-400 italic">{partner.notes}</p>
                            </div>
                        )}

                        <div className={`mt-3 inline-block px-2 py-1 text-xs rounded ${partner.active
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {partner.active ? 'Ativo' : 'Inativo'}
                        </div>
                    </div>
                ))}
            </div>

            {partners.length === 0 && !isCreating && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Nenhum parceiro cadastrado</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Cadastrar Primeiro Parceiro
                    </button>
                </div>
            )}
        </div>
    );
};
