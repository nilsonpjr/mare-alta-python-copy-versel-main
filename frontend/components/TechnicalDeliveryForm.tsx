
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { TechnicalDelivery } from '../types';
import { Save, CheckSquare, Ship, Anchor } from 'lucide-react';

interface Props {
    orderId: string;
    onClose?: () => void;
}

const OUTBOARD_CHECKLIST = [
    "Nível de Óleo da Rabeta", "Fixação do motor", "Linha de combustível", "Instalação elétrica",
    "Funcionamento do botão de partida", "Corta-Circuito", "Marcação instrumentos",
    "RPM Neutro", "RPM Máxima (WOT)", "Verificar vazamentos", "Teste de Mar"
];

const STERNDRIVE_CHECKLIST = [
    "Nível de óleo (motor/rabeta/trim)", "Tensão correias", "Alinhamento motor/rabeta", "Filtro separador",
    "Aperto abraçadeiras", "Instrumentos SmartCraft", "Alarmes", "Teste de Mar (Tabela Completa)"
];

export const TechnicalDeliveryForm: React.FC<Props> = ({ orderId, onClose }) => {
    const [delivery, setDelivery] = useState<TechnicalDelivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<'OUTBOARD' | 'STERNDRIVE' | null>(null);

    // Data Dump
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        loadDelivery();
    }, [orderId]);

    const loadDelivery = async () => {
        setLoading(true);
        const data = await ApiService.getTechnicalDelivery(orderId);
        if (data) {
            setDelivery(data);
            setSelectedType(data.type);
            setFormData(data.data || {});
        }
        setLoading(false);
    };

    const handleCreate = async (type: 'OUTBOARD' | 'STERNDRIVE') => {
        try {
            const newDelivery = await ApiService.createTechnicalDelivery(orderId, {
                serviceOrderId: Number(orderId),
                type,
                status: 'DRAFT',
                data: {}
            });
            setDelivery(newDelivery);
            setSelectedType(type);
            setFormData({});
        } catch (err) {
            alert("Erro ao iniciar entrega técnica");
        }
    };

    const handleSave = async () => {
        if (!delivery) return;
        try {
            await ApiService.updateTechnicalDelivery(orderId, {
                data: formData
            });
            alert("Salvo com sucesso!");
        } catch (err) {
            alert("Erro ao salvar");
        }
    };

    const updateField = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    if (!delivery && !selectedType) {
        return (
            <div className="p-8 text-center space-y-6">
                <h2 className="text-xl font-bold">Iniciar Entrega Técnica</h2>
                <p className="text-slate-500">Selecione o tipo de motorização para gerar o formulário adequado.</p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => handleCreate('OUTBOARD')}
                        className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all w-48"
                    >
                        <Anchor className="w-12 h-12 mb-4 text-blue-600" />
                        <span className="font-bold">Motor de Popa</span>
                        <span className="text-xs text-slate-500 mt-2">Outboard</span>
                    </button>

                    <button
                        onClick={() => handleCreate('STERNDRIVE')}
                        className="flex flex-col items-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all w-48"
                    >
                        <Ship className="w-12 h-12 mb-4 text-blue-600" />
                        <span className="font-bold">Centro-Rabeta</span>
                        <span className="text-xs text-slate-500 mt-2">Sterndrive / Inboard</span>
                    </button>
                </div>
            </div>
        );
    }

    const checklist = selectedType === 'OUTBOARD' ? OUTBOARD_CHECKLIST : STERNDRIVE_CHECKLIST;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Entrega Técnica: {selectedType === 'OUTBOARD' ? 'Motor de Popa' : 'Centro-Rabeta'}</h2>
                    <p className="text-sm text-slate-500">Ordem #{orderId}</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <Save className="w-4 h-4" /> Salvar
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <div className='space-y-4'>
                    <h3 className="font-bold border-b pb-2">Informações Gerais</h3>
                    <div>
                        <label className="block text-sm text-slate-600">Local da Entrega</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={formData.location || ''}
                            onChange={e => updateField('location', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600">Responsável (Cliente)</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={formData.customerName || ''}
                            onChange={e => updateField('customerName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Specific Fields based on Type */}
                {selectedType === 'STERNDRIVE' && (
                    <div className='space-y-4'>
                        <h3 className="font-bold border-b pb-2">Dados da Embarcação</h3>
                        <div className='grid grid-cols-2 gap-2'>
                            <input placeholder="Comp. Total" className="border p-2 rounded" onChange={e => updateField('hull_length', e.target.value)} value={formData.hull_length || ''} />
                            <input placeholder="Boca" className="border p-2 rounded" onChange={e => updateField('hull_beam', e.target.value)} value={formData.hull_beam || ''} />
                            <input placeholder="Hélice" className="border p-2 rounded" onChange={e => updateField('propeller', e.target.value)} value={formData.propeller || ''} />
                            <input placeholder="Passo" className="border p-2 rounded" onChange={e => updateField('pitch', e.target.value)} value={formData.pitch || ''} />
                        </div>
                    </div>
                )}
            </div>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Checklist de Verificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 bg-slate-50 p-6 rounded-xl">
                {checklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded"
                            checked={formData[`check_${idx}`] || false}
                            onChange={e => updateField(`check_${idx}`, e.target.checked)}
                        />
                        <span>{item}</span>
                    </label>
                ))}
            </div>

            {selectedType === 'STERNDRIVE' && (
                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Teste de Mar (Performance)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center border">
                            <thead className="bg-slate-100 font-bold">
                                <tr>
                                    <th className="p-2 border">RPM</th>
                                    <th className="p-2 border">Velocidade (Knots)</th>
                                    <th className="p-2 border">Consumo (L/h)</th>
                                    <th className="p-2 border">Pressão Óleo</th>
                                    <th className="p-2 border">Temp. Motor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[600, 1000, 2000, 3000, 4000, 5000].map(rpm => (
                                    <tr key={rpm}>
                                        <td className="border p-2 font-bold">{rpm}</td>
                                        <td className="border p-0"><input className="w-full h-full p-2 text-center outline-none" placeholder="-"
                                            value={formData[`perf_${rpm}_speed`] || ''} onChange={e => updateField(`perf_${rpm}_speed`, e.target.value)} /></td>
                                        <td className="border p-0"><input className="w-full h-full p-2 text-center outline-none" placeholder="-"
                                            value={formData[`perf_${rpm}_fuel`] || ''} onChange={e => updateField(`perf_${rpm}_fuel`, e.target.value)} /></td>
                                        <td className="border p-0"><input className="w-full h-full p-2 text-center outline-none" placeholder="-"
                                            value={formData[`perf_${rpm}_oil`] || ''} onChange={e => updateField(`perf_${rpm}_oil`, e.target.value)} /></td>
                                        <td className="border p-0"><input className="w-full h-full p-2 text-center outline-none" placeholder="-"
                                            value={formData[`perf_${rpm}_temp`] || ''} onChange={e => updateField(`perf_${rpm}_temp`, e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='border p-4 rounded-xl min-h-[150px] flex flex-col justify-end'>
                    <div className='border-b border-slate-400 mb-2'></div>
                    <p className="text-center text-sm font-bold">Assinatura do Técnico Responsável</p>
                </div>
                <div className='border p-4 rounded-xl min-h-[150px] flex flex-col justify-end'>
                    <div className='border-b border-slate-400 mb-2'></div>
                    <p className="text-center text-sm font-bold">Assinatura do Cliente / Responsável</p>
                </div>
            </div>

        </div>
    );
};
