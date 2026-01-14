import React, { useEffect } from 'react';
import { ServiceOrder, Client, Boat } from '../types';
import { Printer, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

interface PrintOrderViewProps {
    order: ServiceOrder;
    client?: Client;
    boat?: Boat;
    onBack: () => void;
}

const PrintOrderView: React.FC<PrintOrderViewProps> = ({ order, client, boat, onBack }) => {
    useEffect(() => {
        // Auto-print when loaded
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const totalParts = order.items
        .filter(i => i.type === 'PART')
        .reduce((sum, i) => sum + i.total, 0);

    const totalLabor = order.items
        .filter(i => i.type === 'LABOR')
        .reduce((sum, i) => sum + i.total, 0);

    return (
        <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0">
            {/* Print Controls (Hidden on print) */}
            <div className="mb-8 flex justify-between items-center print:hidden border-b pb-4">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                    Voltar
                </button>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" /> Re-imprimir
                </button>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase mb-1">MARE ALTA</h1>
                    <p className="text-sm font-bold">ASSISTÊNCIA TÉCNICA NÁUTICA</p>
                    <div className="mt-4 space-y-1 text-xs">
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Guarapari, ES - Brasil</p>
                        <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> (27) 99999-9999</p>
                        <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> contato@marealta.com.br</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black bg-black text-white px-4 py-2 inline-block">
                        OS #{order.id}
                    </div>
                    <p className="mt-2 text-sm font-bold">DATA: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs uppercase text-slate-500">Documento Geral de Serviço</p>
                </div>
            </div>

            {/* Customer & Boat Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border border-black p-4 rounded-lg">
                    <h3 className="font-bold uppercase text-xs border-b border-black mb-2 pb-1 bg-slate-50">Cliente</h3>
                    <p className="font-bold text-lg">{client?.name || 'Cliente Geral'}</p>
                    <p className="text-sm">{client?.email || ''}</p>
                    <p className="text-sm">{client?.phone || ''}</p>
                    {client?.document && <p className="text-xs text-slate-500 mt-1">Doc: {client.document}</p>}
                </div>
                <div className="border border-black p-4 rounded-lg">
                    <h3 className="font-bold uppercase text-xs border-b border-black mb-2 pb-1 bg-slate-50">Embarcação</h3>
                    <p className="font-bold text-lg">{boat?.name || 'Não Informada'}</p>
                    <p className="text-sm">Modelo: {boat?.model || '-'}</p>
                    <p className="text-sm">Ano: {boat?.year || '-'}</p>
                </div>
            </div>

            {/* Description / Diagnosis */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-xs border-b border-black mb-2 pb-1 bg-slate-50">Descrição do Problema</h3>
                <div className="p-4 bg-slate-50/50 rounded-lg min-h-[60px] italic">
                    {order.description}
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-xs border-b border-black mb-2 pb-1 bg-slate-50">Serviços e Peças</h3>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black font-bold text-left bg-slate-100">
                            <th className="py-2 px-1">TIPO</th>
                            <th className="py-2 px-1">DESCRIÇÃO</th>
                            <th className="py-2 px-1 text-center">QTD</th>
                            <th className="py-2 px-1 text-right">UNIT.</th>
                            <th className="py-2 px-1 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {order.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 px-1 font-bold text-[10px]">{item.type === 'PART' ? 'PEÇA' : 'MÃO DE OBRA'}</td>
                                <td className="py-2 px-1 uppercase">{item.description}</td>
                                <td className="py-2 px-1 text-center">{item.quantity}</td>
                                <td className="py-2 px-1 text-right font-mono">R$ {item.unitPrice.toFixed(2)}</td>
                                <td className="py-2 px-1 text-right font-bold font-mono">R$ {item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-200">
                        <span className="font-bold uppercase text-xs text-slate-500">Mão de Obra:</span>
                        <span className="font-bold">R$ {totalLabor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-200">
                        <span className="font-bold uppercase text-xs text-slate-500">Total Peças:</span>
                        <span className="font-bold">R$ {totalParts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black pt-2 bg-black text-white px-2">
                        <span>TOTAL:</span>
                        <span>R$ {order.totalValue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-16 mt-20">
                <div className="text-center pt-8 border-t border-black">
                    <p className="text-xs font-bold uppercase mb-1">MARE ALTA - TÉCNICO RESPONSÁVEL</p>
                    <p className="text-[10px] text-slate-500">{order.technicianName || '_______________________'}</p>
                </div>
                <div className="text-center pt-8 border-t border-black">
                    <p className="text-xs font-bold uppercase mb-1">CLIENTE / RESPONSÁVEL</p>
                    <p className="text-[10px] text-slate-500">{client?.name || '_______________________'}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-[10px] text-slate-500 uppercase border-t border-slate-100 pt-4 font-bold">
                <p>Este documento é apenas informativo e serve como registro de serviço técnico.</p>
                <p>Obrigado por confiar na Mare Alta!</p>
            </div>
        </div>
    );
};

export default PrintOrderView;
