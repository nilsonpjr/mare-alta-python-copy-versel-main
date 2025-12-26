import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { CompanyInfo, Manufacturer } from '../types';
import { Plus, Trash, Settings as SettingsIcon, Save, ChevronRight, Globe, Lock, Loader2, Factory, Layers, Anchor, Ship, CreditCard, CheckCircle } from 'lucide-react';

export const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'boat' | 'engine' | 'integration' | 'subscription'>('boat');
    const [subscription, setSubscription] = useState<any>(null); // State for subscription data

    // Data State
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Inputs
    const [newBrandName, setNewBrandName] = useState('');
    const [newModelName, setNewModelName] = useState('');

    useEffect(() => {
        loadManufacturers();
        loadCompanyInfo();
        loadSubscription(); // Carrega assinatura
    }, []);

    const loadSubscription = async () => {
        try {
            const data = await ApiService.getSubscription();
            setSubscription(data);
        } catch (error) {
            console.error("Erro ao carregar assinatura:", error);
        }
    };

    const loadManufacturers = async () => {
        setLoadingData(true);
        try {
            const data = await ApiService.getManufacturers();
            setManufacturers(data);
        } catch (error) {
            console.error("Erro ao carregar fabricantes:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const loadCompanyInfo = async () => {
        try {
            const info = await ApiService.getCompanyInfo();
            if (info) setCompanyInfo(info);
        } catch (error) {
            console.error("Erro ao carregar informações da empresa:", error);
        }
    };

    const handleSaveCompanyInfo = async () => {
        setLoading(true);
        try {
            await ApiService.updateCompanyInfo(companyInfo);
            // Feedback sutil em vez de alert
        } catch (error: any) {
            console.error("Erro ao salvar configurações:", error);
            alert("Erro ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) return;

        const type = activeTab === 'boat' ? 'BOAT' : 'ENGINE';

        if (manufacturers.some(m => m.name.toLowerCase() === newBrandName.trim().toLowerCase() && m.type === type)) {
            alert("Esta marca já existe!");
            return;
        }

        try {
            const newManuf = await ApiService.createManufacturer({
                name: newBrandName.trim(),
                type: type,
                models: []
            } as any);

            setManufacturers([...manufacturers, { ...newManuf, models: [] }]);
            setNewBrandName('');
            setSelectedManufacturer(newManuf);
        } catch (error) {
            console.error("Erro ao criar marca:", error);
            alert("Erro ao criar marca.");
        }
    };

    const handleDeleteBrand = async (manuf: Manufacturer) => {
        if (!window.confirm(`Tem certeza que deseja remover a marca ${manuf.name} e todos os seus modelos?`)) return;

        try {
            await ApiService.deleteManufacturer(manuf.id);
            setManufacturers(manufacturers.filter(m => m.id !== manuf.id));
            if (selectedManufacturer?.id === manuf.id) {
                setSelectedManufacturer(null);
            }
        } catch (error) {
            console.error("Erro ao deletar marca:", error);
            alert("Erro ao deletar marca.");
        }
    };

    const handleAddModel = async () => {
        if (!selectedManufacturer || !newModelName.trim()) return;

        try {
            const newModel = await ApiService.createModel(selectedManufacturer.id, newModelName.trim());

            const updatedManuf = {
                ...selectedManufacturer,
                models: [...selectedManufacturer.models, newModel].sort((a, b) => a.name.localeCompare(b.name))
            };

            setManufacturers(manufacturers.map(m => m.id === selectedManufacturer.id ? updatedManuf : m));
            setSelectedManufacturer(updatedManuf);
            setNewModelName('');
        } catch (error) {
            console.error("Erro ao adicionar modelo:", error);
            alert("Erro ao adicionar modelo.");
        }
    };

    const handleDeleteModel = async (modelId: number) => {
        if (!selectedManufacturer) return;
        if (!window.confirm(`Remover modelo?`)) return;

        try {
            await ApiService.deleteModel(modelId);

            const updatedManuf = {
                ...selectedManufacturer,
                models: selectedManufacturer.models.filter(m => m.id !== modelId)
            };

            setManufacturers(manufacturers.map(m => m.id === selectedManufacturer.id ? updatedManuf : m));
            setSelectedManufacturer(updatedManuf);
        } catch (error) {
            console.error("Erro ao deletar modelo:", error);
            alert("Erro ao deletar modelo.");
        }
    };

    const currentType = activeTab === 'boat' ? 'BOAT' : 'ENGINE';
    const filteredManufacturers = manufacturers.filter(m => m.type === currentType).sort((a, b) => a.name.localeCompare(b.name));

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(id); setSelectedManufacturer(null); }}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shrink-0
                ${activeTab === id
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/10 translate-y-[-1px]'
                    : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-200'}
            `}
        >
            <Icon className={`w-4 h-4 ${activeTab === id ? 'text-cyan-400' : ''}`} />
            {label}
        </button>
    );

    return (
        <div className="p-8 h-full flex flex-col bg-slate-50/50">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-sm">
                        <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Ajustes do Sistema</h2>
                </div>
                <p className="text-slate-500 ml-12">Gerencie marcas, modelos e integrações externas para padronizar sua operação.</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mb-8 pb-4 border-b border-slate-200/60 overflow-x-auto">
                <TabButton id="boat" label="Embarcações (Cascos)" icon={Anchor} />
                <TabButton id="engine" label="Motorização" icon={Ship} />
                <TabButton id="integration" label="Integrações" icon={Globe} />
                <TabButton id="subscription" label="Minha Assinatura" icon={CreditCard} />
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {activeTab === 'subscription' && subscription ? (
                    <div className="w-full max-w-3xl mx-auto anime-fade-in h-full overflow-y-auto custom-scrollbar">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                                    <CreditCard className="w-64 h-64" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Plano Atual</h3>
                                <h1 className="text-4xl font-bold mb-4">{subscription.plan_name}</h1>
                                <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    {subscription.status}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Valor Mensal</p>
                                        <p className="text-3xl font-bold text-slate-800">
                                            {subscription.price === 0 ? "Personalizado" : `R$ ${subscription.price.toFixed(2)}`}
                                            <span className="text-sm font-normal text-slate-400 ml-1">/mês</span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Próxima fatura: {subscription.next_billing_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-3">Recursos Incluídos</p>
                                        <ul className="space-y-2">
                                            {subscription.features.map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                                    <h4 className="font-bold text-slate-800 mb-2">Precisa de mais recursos?</h4>
                                    <p className="text-slate-500 text-sm mb-4">Faça um upgrade para ter acesso a funcionalidades exclusivas.</p>
                                    <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                                        Falar com Consultor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'integration' ? (
                    <div className="w-full max-w-4xl mx-auto anime-fade-in h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mercury_Marine_logo.svg/2560px-Mercury_Marine_logo.svg.png"
                                            alt="Mercury" className="h-6 w-auto" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Mercury Marine Integration</h3>
                                        <p className="text-slate-400 text-sm">Portal EPDV & Warranty System</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                                    Conecte sua conta do portal Mercury para habilitar funcionalidades exclusivas como
                                    busca automática de peças, consulta de garantia em tempo real e sincronização de preços.
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário (Login)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all group-hover:bg-white"
                                                placeholder="Usuário do Portal"
                                                value={companyInfo.mercuryUsername || ''}
                                                onChange={e => setCompanyInfo({ ...companyInfo, mercuryUsername: e.target.value })}
                                            />
                                            <Globe className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-hover:text-cyan-600 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all group-hover:bg-white"
                                                placeholder="••••••••••••"
                                                value={companyInfo.mercuryPassword || ''}
                                                onChange={e => setCompanyInfo({ ...companyInfo, mercuryPassword: e.target.value })}
                                            />
                                            <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-hover:text-cyan-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleSaveCompanyInfo}
                                        disabled={loading}
                                        className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-2 font-medium transition-all transform active:scale-95"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                                        ) : (
                                            <><Save className="w-5 h-5" /> Salvar Credenciais</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- NOVA SEÇÃO: EMISSÃO FISCAL PRÓPRIA --- */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-8">
                            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        <div className="w-8 h-8 flex items-center justify-center text-emerald-800 font-bold bg-emerald-100 rounded">
                                            NF
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Emissor Fiscal Próprio</h3>
                                        <p className="text-emerald-200 text-sm">Emissão direta SEFAZ/Prefeituras (Sem custo por nota)</p>
                                    </div>
                                </div>
                                <p className="text-emerald-100 text-sm leading-relaxed max-w-xl">
                                    Configure seu Certificado Digital A1 para emitir NFe (Peças) e NFSe (Serviços)
                                    diretamente pelos webservices governamentais. Suporte nativo para Paranaguá e Curitiba.
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Cidade / Driver */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Município de Emissão</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all group-hover:bg-white appearance-none"
                                                value={companyInfo.cityCode || '4118204'}
                                                onChange={e => setCompanyInfo({ ...companyInfo, cityCode: e.target.value })}
                                            >
                                                <option value="4118204">Paranaguá - PR (Fly e-Nota)</option>
                                                <option value="4106902">Curitiba - PR (ISS Curitiba)</option>
                                            </select>
                                            <div className="absolute left-3 top-3.5 text-slate-400 w-5 h-5">🏢</div>
                                        </div>
                                    </div>

                                    {/* Ambiente */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ambiente</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all group-hover:bg-white appearance-none"
                                                value={companyInfo.fiscalEnvironment || 'homologation'}
                                                onChange={e => setCompanyInfo({ ...companyInfo, fiscalEnvironment: e.target.value })}
                                            >
                                                <option value="homologation">Homologação (Testes)</option>
                                                <option value="production">Produção (Validade Jurídica)</option>
                                            </select>
                                            <div className="absolute left-3 top-3.5 text-slate-400 w-5 h-5">🧪</div>
                                        </div>
                                    </div>

                                    {/* Certificado (Simulado Upload) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Arquivo do Certificado (.pfx)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all group-hover:bg-white"
                                                placeholder="ex: certs/certificado.pfx (Caminho relativo)"
                                                value={companyInfo.certFilePath || ''}
                                                onChange={e => setCompanyInfo({ ...companyInfo, certFilePath: e.target.value })}
                                            />
                                            <div className="absolute left-3 top-3.5 text-slate-400 w-5 h-5">🔐</div>
                                        </div>
                                        <p className="text-xs text-slate-400">O arquivo deve estar na pasta <code>backend/certs</code> do servidor.</p>
                                    </div>

                                    {/* Senha Certificado */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha do Certificado</label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all group-hover:bg-white"
                                                placeholder="••••••"
                                                value={companyInfo.certPassword || ''}
                                                onChange={e => setCompanyInfo({ ...companyInfo, certPassword: e.target.value })}
                                            />
                                            <div className="absolute left-3 top-3.5 text-slate-400 w-5 h-5">🔑</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleSaveCompanyInfo}
                                        disabled={loading}
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 font-medium transition-all transform active:scale-95"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                                        ) : (
                                            <><Save className="w-5 h-5" /> Salvar Configuração Fiscal</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Manufacturers List (Left) */}
                        <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Factory className="w-4 h-4 text-slate-400" />
                                    Marcas Registradas
                                </h3>
                            </div>

                            <div className="p-3 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nova Marca..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        value={newBrandName}
                                        onChange={(e) => setNewBrandName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                                    />
                                    <button
                                        onClick={handleAddBrand}
                                        className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {loadingData ? (
                                    <div className="flex justify-center p-8 text-slate-300">
                                        <Loader2 className="animate-spin w-6 h-6" />
                                    </div>
                                ) : (
                                    filteredManufacturers.map(manuf => (
                                        <div
                                            key={manuf.id}
                                            onClick={() => setSelectedManufacturer(manuf)}
                                            className={`
                                                group flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border
                                                ${selectedManufacturer?.id === manuf.id
                                                    ? 'bg-cyan-50 border-cyan-200 shadow-sm'
                                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}
                                            `}
                                        >
                                            <span className={`font-medium text-sm ${selectedManufacturer?.id === manuf.id ? 'text-cyan-900' : 'text-slate-600'}`}>
                                                {manuf.name}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteBrand(manuf); }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash className="w-3.5 h-3.5" />
                                                </button>
                                                {selectedManufacturer?.id === manuf.id && (
                                                    <ChevronRight className="w-4 h-4 text-cyan-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Models Grid (Right) */}
                        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-cyan-600" />
                                        {selectedManufacturer ? selectedManufacturer.name : 'Selecione uma Marca'}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {selectedManufacturer
                                            ? `Gerenciando modelos para ${selectedManufacturer.name}`
                                            : 'Escolha uma marca à esquerda para ver os modelos'}
                                    </p>
                                </div>

                                {selectedManufacturer && (
                                    <div className="flex gap-2 w-1/2 max-w-sm">
                                        <input
                                            type="text"
                                            placeholder="Adicionar novo modelo..."
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm"
                                            value={newModelName}
                                            onChange={(e) => setNewModelName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddModel()}
                                        />
                                        <button
                                            onClick={handleAddModel}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> <span className="hidden lg:inline">Adicionar</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                {selectedManufacturer ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {selectedManufacturer.models.map(model => (
                                            <div key={model.id} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 flex justify-between items-center">
                                                <span className="text-slate-700 font-medium">{model.name}</span>
                                                <button
                                                    onClick={() => handleDeleteModel(model.id)}
                                                    className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedManufacturer.models.length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                                <Layers className="w-12 h-12 mb-3 opacity-20" />
                                                <p>Nenhum modelo cadastrado.</p>
                                                <p className="text-sm opacity-60">Use o campo acima para adicionar.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Factory className="w-16 h-16 mb-4 opacity-10" />
                                        <p className="text-lg font-medium text-slate-500">Nenhuma Marca Selecionada</p>
                                        <p className="text-sm">Selecione uma marca na lista ao lado para gerenciar seus modelos.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};