import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { SystemConfig, CompanyInfo } from '../types';
import { Plus, Trash, Settings as SettingsIcon, Save, ChevronRight, Globe, Lock } from 'lucide-react';

export const SettingsView: React.FC = () => {
    const [config, setConfig] = useState<SystemConfig | null>(null);
    const [activeTab, setActiveTab] = useState<'boat' | 'engine' | 'integration'>('boat');
    const [selectedBrand, setSelectedBrand] = useState<string>('');

    // Company Info State
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
    const [loading, setLoading] = useState(false);

    // Inputs
    const [newBrandName, setNewBrandName] = useState('');
    const [newModelName, setNewModelName] = useState('');

    useEffect(() => {
        setConfig(StorageService.getConfig());
        loadCompanyInfo();
    }, []);

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
            console.log("Salvando informações da empresa (Debug):", companyInfo);
            await ApiService.updateCompanyInfo(companyInfo);
            alert("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error("Erro ao salvar configurações:", error);
            if (error.response?.status === 401) {
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                localStorage.removeItem('token');
                window.location.reload(); // Vai redirecionar para o login
                return;
            }
            const msg = error.response?.data?.detail || error.message || "Erro desconhecido";
            alert(`Erro ao salvar configurações: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (updatedConfig: SystemConfig) => {
        setConfig(updatedConfig);
        StorageService.saveConfig(updatedConfig);
    };

    const handleAddBrand = () => {
        if (!config || !newBrandName.trim()) return;

        const target = activeTab === 'boat' ? 'boatManufacturers' : 'engineManufacturers';
        if (config[target][newBrandName]) {
            alert("Esta marca já existe!");
            return;
        }

        const updated = {
            ...config,
            [target]: {
                ...config[target],
                [newBrandName]: []
            }
        };

        handleSave(updated);
        setNewBrandName('');
        setSelectedBrand(newBrandName); // Select the new brand
    };

    const handleDeleteBrand = (brand: string) => {
        if (!config) return;
        if (!window.confirm(`Tem certeza que deseja remover a marca ${brand} e todos os seus modelos?`)) return;

        const target = activeTab === 'boat' ? 'boatManufacturers' : 'engineManufacturers';
        const updatedDict = { ...config[target] };
        delete updatedDict[brand];

        const updated = {
            ...config,
            [target]: updatedDict
        };

        handleSave(updated);
        if (selectedBrand === brand) setSelectedBrand('');
    };

    const handleAddModel = () => {
        if (!config || !selectedBrand || !newModelName.trim()) return;

        const target = activeTab === 'boat' ? 'boatManufacturers' : 'engineManufacturers';
        const currentModels = config[target][selectedBrand];

        if (currentModels.includes(newModelName)) {
            alert("Este modelo já existe nesta marca!");
            return;
        }

        const updated = {
            ...config,
            [target]: {
                ...config[target],
                [selectedBrand]: [...currentModels, newModelName].sort()
            }
        };

        handleSave(updated);
        setNewModelName('');
    };

    const handleDeleteModel = (model: string) => {
        if (!config || !selectedBrand) return;
        if (!window.confirm(`Remover modelo ${model}?`)) return;

        const target = activeTab === 'boat' ? 'boatManufacturers' : 'engineManufacturers';
        const updated = {
            ...config,
            [target]: {
                ...config[target],
                [selectedBrand]: config[target][selectedBrand].filter(m => m !== model)
            }
        };

        handleSave(updated);
    };

    if (!config) return <div>Carregando configurações...</div>;

    const currentBrands = activeTab === 'boat' ? config.boatManufacturers : config.engineManufacturers;
    const currentModels = selectedBrand && currentBrands[selectedBrand] ? currentBrands[selectedBrand] : [];

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-slate-600" />
                    Ajustes do Sistema
                </h2>
                <p className="text-sm text-slate-500">Cadastre novas Marcas e Modelos para padronizar o sistema.</p>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => { setActiveTab('boat'); setSelectedBrand(''); }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'boat' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    Embarcações (Cascos)
                </button>
                <button
                    onClick={() => { setActiveTab('engine'); setSelectedBrand(''); }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'engine' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    Motorização
                </button>
                <button
                    onClick={() => { setActiveTab('integration'); setSelectedBrand(''); }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'integration' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    <Globe className="w-4 h-4" /> Integrações
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">

                {activeTab === 'integration' ? (
                    <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mercury_Marine_logo.svg/2560px-Mercury_Marine_logo.svg.png" alt="Mercury" className="h-6" />
                                Integração Mercury Marine
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Configure suas credenciais do Portal Mercury para habilitar a busca automática de peças e garantias.
                                Essas informações são armazenadas de forma segura no banco de dados.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Usuário / Login (sUsuar)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-10 p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-cyan-500 outline-none"
                                            placeholder="Ex: 12345"
                                            value={companyInfo.mercuryUsername || ''}
                                            onChange={e => setCompanyInfo({ ...companyInfo, mercuryUsername: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-2.5 text-slate-400">
                                            <SettingsIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Senha (sSenha)</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="w-full pl-10 p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-cyan-500 outline-none"
                                            placeholder="Sua senha do portal..."
                                            value={companyInfo.mercuryPassword || ''}
                                            onChange={e => setCompanyInfo({ ...companyInfo, mercuryPassword: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-2.5 text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveCompanyInfo}
                                disabled={loading}
                                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Configurações</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Left Column: Brands */}
                        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Marcas / Fabricantes</h3>
                            </div>

                            <div className="p-4 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nova Marca..."
                                        className="flex-1 border rounded px-3 py-2 text-sm bg-white text-slate-900"
                                        value={newBrandName}
                                        onChange={(e) => setNewBrandName(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddBrand}
                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {Object.keys(currentBrands).sort().map(brand => (
                                    <div
                                        key={brand}
                                        onClick={() => setSelectedBrand(brand)}
                                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer mb-1 ${selectedBrand === brand ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <span className="font-medium">{brand}</span>
                                        <div className="flex items-center gap-2">
                                            {selectedBrand === brand && <ChevronRight className="w-4 h-4 text-cyan-500" />}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand); }}
                                                className="text-slate-300 hover:text-red-500"
                                            >
                                                <Trash className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Models */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-700">
                                    {selectedBrand ? `Modelos: ${selectedBrand}` : 'Selecione uma marca ao lado'}
                                </h3>
                            </div>

                            {selectedBrand ? (
                                <>
                                    <div className="p-4 border-b border-slate-100">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Novo Modelo para ${selectedBrand}...`}
                                                className="flex-1 border rounded px-3 py-2 text-sm bg-white text-slate-900"
                                                value={newModelName}
                                                onChange={(e) => setNewModelName(e.target.value)}
                                            />
                                            <button
                                                onClick={handleAddModel}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4" /> Adicionar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {currentModels.map(model => (
                                                <div key={model} className="flex justify-between items-center p-3 border border-slate-100 rounded bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                                                    <span className="text-sm text-slate-700">{model}</span>
                                                    <button
                                                        onClick={() => handleDeleteModel(model)}
                                                        className="text-slate-300 hover:text-red-500"
                                                    >
                                                        <Trash className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {currentModels.length === 0 && (
                                                <div className="col-span-2 text-center text-slate-400 py-10">
                                                    Nenhum modelo cadastrado para esta marca.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400">
                                    <p>Selecione uma marca à esquerda para gerenciar seus modelos.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};