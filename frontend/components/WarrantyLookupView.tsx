import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { MercuryWarrantyData } from '../types';
import { MercuryWarrantyCard } from './MercuryWarrantyCard';

export const WarrantyLookupView: React.FC = () => {
    const [serial, setSerial] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MercuryWarrantyData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serial) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response: any = await ApiService.getMercuryWarranty(serial);
            if (response.status === 'success' && response.data) {
                setData(response.data);
            } else {
                throw new Error("Resposta inválida da API");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Erro ao consultar garantia. Verifique o serial e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Consulta de Garantia Mercury</h1>
                <p className="text-gray-500">
                    Consulte o status, modelo e histórico de qualquer motor Mercury em tempo real.
                </p>
            </div>

            {/* Search Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Digite o Número de Série do Motor (ex: 2B123456)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={serial}
                            onChange={(e) => setSerial(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !serial}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Consultar"}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            <div className="min-h-[200px]">
                <MercuryWarrantyCard data={data} loading={loading} error={error} />

                {!data && !loading && !error && (
                    <div className="text-center py-12 text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aguardando pesquisa...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
