import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { CompanyInfo, Manufacturer } from '../types';
import { Plus, Trash, Settings as SettingsIcon, Save, ChevronRight, Globe, Lock, Loader2, Factory, Layers, Anchor, Ship, CreditCard, CheckCircle, RotateCcw, Palette, Moon, Sun, Type } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'boat' | 'engine' | 'integration' | 'subscription' | 'system' | 'appearance'>('boat');
    const { resetOnboarding } = useOnboarding();
    const { preferences, toggleDarkMode, setPrimaryColor, setFontFamily, savePreferences } = useTheme();
    const [subscription, setSubscription] = useState<any>(null);

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
        loadSubscription();
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
                <TabButton id="appearance" label="Personalização" icon={Palette} />
                <TabButton id="subscription" label="Minha Assinatura" icon={CreditCard} />
                <TabButton id="system" label="Sistema & Reset" icon={RotateCcw} />
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
                ) : activeTab === 'appearance' ? (
                    <div className="w-full max-w-4xl mx-auto anime-fade-in h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-white relative">
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                                    <Palette className="w-32 h-32" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Personalização Visual</h3>
                                <p className="text-cyan-100 text-sm">Ajuste as cores, fontes e o tema do aplicativo para sua marca.</p>
                            </div>

                            <div className="p-8 space-y-10">
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${preferences.darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-800 shadow-sm'}`}>
                                            {preferences.darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Modo Noturno</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Alternar entre o visual claro e escuro</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleDarkMode}
                                        className={`w-14 h-8 rounded-full transition-colors relative ${preferences.darkMode ? 'bg-cyan-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${preferences.darkMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Palette className="w-4 h-4" /> Cor Identidade (Primária)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { name: 'Ciano', color: '#0891b2' },
                                            { name: 'Azul', color: '#1d4ed8' },
                                            { name: 'Esmeralda', color: '#059669' },
                                            { name: 'Indigo', color: '#4f46e5' },
                                            { name: 'Laranja', color: '#ea580c' },
                                            { name: 'Rosa', color: '#db2777' },
                                            { name: 'Slate', color: '#334155' },
                                            { name: 'Custom', color: preferences.primaryColor }
                                        ].map((c, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPrimaryColor(c.color)}
                                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${preferences.primaryColor === c.color ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: c.color }} />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-2 flex items-center gap-4">
                                        <label className="text-xs font-medium text-slate-500 italic">Personalizar código HEX:</label>
                                        <input
                                            type="color"
                                            value={preferences.primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-12 h-10 p-1 bg-white rounded cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase">{preferences.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-4 h-4" /> Tipografia (Fontes)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { name: 'Inter (Padrão)', value: 'Inter' },
                                            { name: 'Source Sans Pro', value: 'Source Sans Pro' },
                                            { name: 'Outfit', value: 'Outfit' },
                                            { name: 'Roboto', value: 'Roboto' }
                                        ].map((f, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setFontFamily(f.value)}
                                                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${preferences.fontFamily === f.value ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'}`}
                                            >
                                                <span className="font-medium text-slate-700 dark:text-slate-200" style={{ fontFamily: f.value }}>{f.name}</span>
                                                {preferences.fontFamily === f.value && <CheckCircle className="w-5 h-5 text-cyan-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-8 flex justify-end">
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            await savePreferences();
                                            setLoading(false);
                                            alert("Preferências salvas com sucesso!");
                                        }}
                                        disabled={loading}
                                        className="bg-slate-800 dark:bg-cyan-600 text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 font-bold shadow-lg shadow-slate-800/20"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Salvar Alterações
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
                                    Conecte sua conta do portal Mercury para habilitar funcionalidades exclusivas.
                                </p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            value={companyInfo.mercuryUsername || ''}
                                            onChange={e => setCompanyInfo({ ...companyInfo, mercuryUsername: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            value={companyInfo.mercuryPassword || ''}
                                            onChange={e => setCompanyInfo({ ...companyInfo, mercuryPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 flex justify-end">
                                    <button onClick={handleSaveCompanyInfo} className="bg-cyan-600 text-white px-8 py-3 rounded-lg flex items-center gap-2">
                                        <Save className="w-5 h-5" /> Salvar Credenciais
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'system' ? (
                    <div className="w-full max-w-3xl mx-auto anime-fade-in h-full overflow-y-auto custom-scrollbar">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-8 text-white">
                                <h3 className="text-xl font-bold mb-2">Preferências e Sistema</h3>
                            </div>
                            <div className="p-8">
                                <button
                                    onClick={async () => {
                                        await resetOnboarding();
                                        alert("Tutoriais Reiniciados!");
                                        window.location.reload();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg"
                                >
                                    <RotateCcw className="w-4 h-4" /> Reiniciar Tutoriais
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">Marcas</h3>
                            </div>
                            <div className="p-2 overflow-y-auto space-y-1">
                                {filteredManufacturers.map(manuf => (
                                    <div
                                        key={manuf.id}
                                        onClick={() => setSelectedManufacturer(manuf)}
                                        className={`p-3 rounded-xl cursor-pointer ${selectedManufacturer?.id === manuf.id ? 'bg-cyan-50' : ''}`}
                                    >
                                        {manuf.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg">{selectedManufacturer?.name || 'Selecione uma Marca'}</h3>
                            </div>
                            <div className="p-6">
                                {selectedManufacturer?.models.map(model => (
                                    <div key={model.id} className="p-4 border-b">{model.name}</div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default SettingsView;