import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Building, Crown, Edit, Save, Trash, Search, ShieldCheck } from 'lucide-react';

interface Tenant {
    id: number;
    name: string;
    subdomain: string;
    plan: string;
    is_active: boolean;
}

export const SuperAdminView: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Tenant>>({});

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            const data = await ApiService.getTenants();
            setTenants(data);
        } catch (error) {
            console.error("Erro ao carregar tenants", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (tenant: Tenant) => {
        setEditingId(tenant.id);
        setEditForm(tenant);
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await ApiService.updateTenant(editingId, editForm);
            setEditingId(null);
            loadTenants();
        } catch (error) {
            console.error("Erro ao atualizar", error);
            alert("Erro ao atualizar tenant");
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.plan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Super Admin
                    </h1>
                    <p className="text-slate-500">Gestão Global de Assinantes SaaS</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar empresa..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500">#{tenant.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-900">{tenant.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === tenant.id ? (
                                        <select
                                            value={editForm.plan}
                                            onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                            className="px-2 py-1 border rounded"
                                        >
                                            <option value="START">Mecânico PRO</option>
                                            <option value="PRO">Oficina Team</option>
                                            <option value="MARINA">Marina Full</option>
                                            <option value="ENTERPRISE">Enterprise</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${tenant.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                                                tenant.plan === 'MARINA' ? 'bg-blue-100 text-blue-700' :
                                                    tenant.plan === 'PRO' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-700'
                                            }`}>
                                            {tenant.plan === 'MARINA' ? 'Marina Full' :
                                                tenant.plan === 'PRO' ? 'Oficina Team' :
                                                    tenant.plan === 'START' ? 'Mecânico PRO' : tenant.plan}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex w-3 h-3 rounded-full ${tenant.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === tenant.id ? (
                                        <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-700 font-medium">
                                            <Save className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEdit(tenant)} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-auto">
                                            <Edit className="w-4 h-4" /> Alterar Plano
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
