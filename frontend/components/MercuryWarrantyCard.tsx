import React from 'react';
import { CheckCircle, AlertTriangle, Calendar, User, UserCheck, ShieldCheck, Ship, Box } from 'lucide-react';
import { MercuryWarrantyData } from '../types';

interface MercuryWarrantyCardProps {
    data: MercuryWarrantyData | null;
    loading: boolean;
    error: string | null;
}

export const MercuryWarrantyCard: React.FC<MercuryWarrantyCardProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-red-700">Erro na Consulta</h4>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-left">
            {/* Header com Status */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-lg">Consulta Mercury</span>
                </div>
                <div className="text-xs font-mono bg-slate-600 px-2 py-1 rounded">
                    Serial: {data.nro_motor}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Coluna 1: Produto */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Ship className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Modelo do Motor</p>
                            <p className="text-gray-800 font-medium">{data.modelo}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Série Fabricante</p>
                            <p className="text-gray-800 font-medium">{data.nro_serie || data.nro_motor}</p>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Dados Venda */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Data da Venda</p>
                            <p className="text-gray-800 font-medium">{data.dt_venda || "Não informada"}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Cliente Registrado</p>
                            <p className="text-gray-800 font-medium break-all">{data.nome_cli || "Não informado"}</p>
                        </div>
                    </div>
                </div>

                {/* Garantia Status (Full Width) */}
                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-600">
                            Status: <span className="font-semibold text-gray-800">{data.status_garantia}</span>
                        </span>
                        {data.vld_garantia && (
                            <span className="text-sm text-gray-500 ml-4">
                                Validade: {data.vld_garantia}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
