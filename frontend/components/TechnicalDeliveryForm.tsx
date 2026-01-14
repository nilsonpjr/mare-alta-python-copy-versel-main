import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { TechnicalDelivery } from '../types';
import { Save, CheckSquare, Ship, Anchor, Gauge, Battery, Wrench, AlertTriangle, UserCheck, Droplet, Thermometer, Wind } from 'lucide-react';
import { SignatureModal } from './SignatureModal';

interface Props {
    orderId: number;
    onClose?: () => void;
}

type DeliverySection = {
    title: string;
    icon: React.ElementType;
    fields?: { key: string; label: string; type: string; options?: string[] }[];
    checklist?: string[];
    table?: { headers: string[]; rows: string[] };
    custom?: string;
};

// --- CHECKLIST DATA ---

const STERNDRIVE_SECTIONS: DeliverySection[] = [
    {
        title: "Dados da Embarcação",
        icon: Ship,
        fields: [
            { key: "hull_type", label: "Tipo do Casco", type: "select", options: ["Catamarã", "Monocasco"] },
            { key: "nav_type", label: "Navegação", type: "select", options: ["Deslocamento", "Semi-Planeio", "Planeio"] },
            { key: "length_total", label: "Comprimento Total (m)", type: "text" },
            { key: "length_water", label: "Comprimento Linha Dágua (m)", type: "text" },
            { key: "beam_total", label: "Boca Total (m)", type: "text" },
            { key: "beam_water", label: "Boca Linha Dágua (m)", type: "text" },
            { key: "fuel_tank", label: "Tanque Combustível (Material/Cap)", type: "text" },
            { key: "water_tank", label: "Tanque Água (Tipo/Cap)", type: "text" },
            { key: "max_people", label: "Capacidade Pessoas", type: "text" },
            { key: "racor_filter", label: "Filtro Racor?", type: "select", options: ["Sim", "Não"] },
            { key: "application", label: "Aplicação", type: "select", options: ["Lazer", "Serviço", "Pesca", "Cruiser", "Carga"] }
        ]
    },
    {
        title: "Motorização",
        icon: Gauge,
        fields: [
            { key: "engine_model", label: "Modelo Motor", type: "text" },
            { key: "engine_qty", label: "Qtd Motores", type: "number" },
            { key: "drive_model", label: "Modelo Rabeta", type: "text" },
            { key: "prop_model", label: "Modelo Hélice", type: "text" },
            { key: "prop_pitch", label: "Passo Hélice", type: "text" },
            { key: "prop_blades", label: "Nº Pás", type: "text" }
        ],
        table: {
            headers: ["Posição", "Serial Motor", "Serial Transom", "Serial Rabeta", "Horas"],
            rows: ["Bombordo", "Boreste"]
        }
    },
    {
        title: "Sistema Elétrico",
        icon: Battery,
        checklist: [
            "Divisor de carga instalado?",
            "Cabo negativo conectado ao bloco?",
            "Acessórios ligados à bateria?",
            "Conectores protegidos?",
            "Chave Geral instalada?"
        ],
        fields: [
            { key: "battery_cap", label: "Capacidade Baterias", type: "text" },
            { key: "cable_len_bb", label: "Comp. Cabo Positivo BB", type: "text" },
            { key: "cable_len_be", label: "Comp. Cabo Positivo BE", type: "text" },
            { key: "main_switch_type", label: "Tipo Chave Geral", type: "select", options: ["2 pos", "4 pos", "Magnética", "Outros"] }
        ]
    },
    {
        title: "Instalação e Comandos",
        icon: Wrench,
        checklist: [
            "Engraxar eixo hélice", "Verificar aperto porca hélice", "Lubrificação graxeiras espelho",
            "Aperto porcas espelho de popa (34 N.m)", "Travas parafusos motor", "Fixação coifa cardan",
            "Aperto parafusos rabeta", "Fixação anodos", "Altura motor vs linha d'água", "Placa cavitação vs V casco",
            "Plugues dreno fechados", "Alinhamento motor/rabeta", "Mangueiras combustível", "Chicotes elétricos fixados",
            "Nível óleo motor/rabeta", "Nível óleo bomba trim/direção", "Sistema refrigeração abastecido",
            "Tensão correias", "Torneiras combustivel / sangria", "Sensor detonação", "Abraçadeiras motor",
            "Curso direção", "Curso TPS", "Calibrar SmartCraft", "Alarme sonoro", "Limitador Trim", "Calibrar DTS",
            "Corta-circuito neutro", "E-Stop"
        ]
    },
    {
        title: "Teste de Funcionamento (Start)",
        icon: AlertTriangle,
        checklist: [
            "Pressão Óleo normal", "Sem vazamentos (óleo, comb, água, gases)", "Cmd Aceleração/Marcha operam bem",
            "Instrumentos funcionam", "Marcha-lenta correta", "Funcionamento Trim correto"
        ]
    },
    {
        title: "Prova de Mar (Performance)",
        icon: Wind,
        custom: "sea_trial_table" // Helper to render the complex table
    },
    {
        title: "Assinaturas & Validação",
        icon: UserCheck,
        custom: "signatures"
    }
];

const OUTBOARD_SECTIONS: DeliverySection[] = [
    {
        title: "Dados Gerais",
        icon: Ship,
        fields: [
            { key: "boat_model", label: "Modelo Embarcação", type: "text" },
            { key: "builder", label: "Estaleiro", type: "text" },
            { key: "boat_length", label: "Comprimento", type: "text" },
            { key: "prop_info", label: "Hélice (Modelo/Passo)", type: "text" }
        ]
    },
    {
        title: "Antes de Ligar",
        icon: CheckSquare,
        checklist: [
            "Nível de Óleo Rabeta", "Fixação motor (aperto/altura)", "Linha combustível/tanque",
            "Mistura Óleo (Reset Break-in)", "Entradas água rabeta", "Giro completo direção",
            "Instalação/Fixação tanque", "Instalação elétrica", "Carga/Fixação Bateria",
            "Aperto/Capa cabos bateria", "Conexões elétricas", "Filtro separador",
            "Válvula alívio Trim", "Nível óleo Power Trim", "Funcionamento Trim/Tilt",
            "Sangria Direção", "Reservatório óleo motor chieo", "Retirar ar linha óleo (Pump Prime)",
            "Alarmes baixo óleo/temp", "Ajuste cabo engate/aceleração", "Modelo hélice/Torque (75Nm)",
            "Nível óleo cárter", "Calibração DTS", "Calibração SC-1000", "Leitura relógios vs CDS"
        ]
    },
    {
        title: "Motor Funcionando",
        icon: Gauge,
        checklist: [
            "Botão partida", "Corta-circuito", "Ponto ignição/mistura", "Marcação instrumentos",
            "Leitura CDS", "RPM Neutro", "Carga comando", "Giro direção (carga)", "Ventilação hélice curvas",
            "Bomba d'água (monitorar)", "Ajuste Power Trim", "Anodo leme", "Angulo Tilt", "Máxima RPM (WOT)",
            "Códigos falha CDS"
        ]
    },
    {
        title: "Pós Funcionamento",
        icon: Droplet,
        checklist: [
            "Vazamentos (óleo/comb/água)", "Passagem água capô", "Torque Porca Hélice",
            "Nível óleo trim", "Nível óleo cárter", "Nível óleo rabeta", "Manual entregue"
        ]
    },
    {
        title: "Assinaturas & Validação",
        icon: UserCheck,
        custom: "signatures"
    }
];

export const TechnicalDeliveryForm: React.FC<Props> = ({ orderId, onClose }) => {
    const [delivery, setDelivery] = useState<TechnicalDelivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<'OUTBOARD' | 'STERNDRIVE' | null>(null);
    const [activeSection, setActiveSection] = useState(0);

    // Signature State
    const [modalOpen, setModalOpen] = useState(false);
    const [signatureRole, setSignatureRole] = useState<'TECHNICIAN' | 'CUSTOMER'>('TECHNICIAN');
    const [signatures, setSignatures] = useState<{ technician: string | null, customer: string | null }>({
        technician: null,
        customer: null
    });

    // Data Dump
    const [formData, setFormData] = useState<any>({});

    const openSignatureModal = (role: 'TECHNICIAN' | 'CUSTOMER') => {
        setSignatureRole(role);
        setModalOpen(true);
    };

    const handleSignatureSave = (dataUrl: string) => {
        setSignatures(prev => ({
            ...prev,
            [signatureRole === 'TECHNICIAN' ? 'technician' : 'customer']: dataUrl
        }));
    };

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
            setSignatures({
                technician: data.technicianSignatureUrl || null, // Assuming backend maps snake_case to camelCase
                customer: data.customerSignatureUrl || null
            });
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
                data: formData,
                technicianSignatureUrl: signatures.technician,
                customerSignatureUrl: signatures.customer
            });
            alert("Salvo com sucesso!");
        } catch (err) {
            alert("Erro ao salvar");
        }
    };

    const updateField = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const currentSections = selectedType === 'OUTBOARD' ? OUTBOARD_SECTIONS : STERNDRIVE_SECTIONS;

    if (loading) return <div className="p-8 text-center animate-pulse dark:text-slate-400">Carregando formulário...</div>;

    if (!delivery && !selectedType) {
        return (
            <div className="p-12 text-center space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Iniciar Entrega Técnica</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Selecione o tipo de embarcação para gerar o checklist oficial Mercury.</p>
                </div>

                <div className="flex gap-6 justify-center">
                    <button
                        onClick={() => handleCreate('OUTBOARD')}
                        className="group flex flex-col items-center p-8 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all w-64"
                    >
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Anchor className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">Motor de Popa</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">Outboard</span>
                    </button>

                    <button
                        onClick={() => handleCreate('STERNDRIVE')}
                        className="group flex flex-col items-center p-8 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all w-64"
                    >
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Ship className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">Centro-Rabeta</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sterndrive / Inboard</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 min-h-[600px] flex flex-col transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {selectedType === 'OUTBOARD' ? <Anchor className="w-5 h-5 text-primary" /> : <Ship className="w-5 h-5 text-primary" />}
                        Entrega Técnica Mercury {selectedType === 'OUTBOARD' ? '(Popa)' : '(Centro-Rabeta)'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">OS #{orderId} • {new Date().toLocaleDateString()}</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-sm font-bold text-sm transition-all"
                >
                    <Save className="w-4 h-4" /> Salvar Progresso
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-slate-50 dark:bg-slate-900/30 border-r dark:border-slate-700 flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        {currentSections.map((section, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSection(idx)}
                                className={`w-full p-3 text-left text-sm font-bold flex items-center gap-3 rounded-lg transition-all ${activeSection === idx
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <section.icon className={`w-4 h-4 ${activeSection === idx ? 'text-primary' : 'text-slate-400'}`} />
                                {section.title}
                            </button>
                        ))}
                    </div>


                    <div className="mt-auto p-4 border-t dark:border-slate-700 space-y-4">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Assinaturas</div>

                        {/* Assinatura Técnico */}
                        <div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">Técnico</div>
                            {signatures.technician ? (
                                <div className="group relative border dark:border-slate-600 rounded bg-white dark:bg-slate-700 p-1">
                                    <img src={signatures.technician} alt="Assinatura Técnico" className="h-16 w-full object-contain invert dark:invert-0" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                        <button onClick={() => openSignatureModal('TECHNICIAN')} className="text-white text-[10px] font-bold uppercase">Alterar</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => openSignatureModal('TECHNICIAN')}
                                    className="h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-[10px] text-slate-400 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span>Assinar</span>
                                </div>
                            )}
                        </div>

                        {/* Assinatura Cliente */}
                        <div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">Cliente</div>
                            {signatures.customer ? (
                                <div className="group relative border dark:border-slate-600 rounded bg-white dark:bg-slate-700 p-1">
                                    <img src={signatures.customer} alt="Assinatura Cliente" className="h-16 w-full object-contain invert dark:invert-0" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                        <button onClick={() => openSignatureModal('CUSTOMER')} className="text-white text-[10px] font-bold uppercase">Alterar</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => openSignatureModal('CUSTOMER')}
                                    className="h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-[10px] text-slate-400 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span>Assinar</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-800 transition-colors">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        {React.createElement(currentSections[activeSection].icon, { className: "w-6 h-6 text-primary" })}
                    </div>
                    {currentSections[activeSection].title}
                </h3>
                {/* ... */}

                {/* Fields/Tables/Checklists rendering (Mantido original) */}
                <div className="space-y-6 max-w-4xl">
                    {/* Render Fields */}
                    {currentSections[activeSection].fields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentSections[activeSection].fields?.map((field: any) => (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData[field.key] || ''}
                                            onChange={e => updateField(field.key, e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData[field.key] || ''}
                                            onChange={e => updateField(field.key, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render Main Table (Serials) */}
                    {currentSections[activeSection].table && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                                    <tr>
                                        {currentSections[activeSection].table?.headers.map((h: string) => <th key={h} className="p-4 text-left border-b border-slate-200 dark:border-slate-700">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {currentSections[activeSection].table?.rows.map((row: string, rIdx: number) => (
                                        <tr key={row}>
                                            <td className="p-4 font-bold bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300">{row}</td>
                                            {[1, 2, 3, 4].map((c) => (
                                                <td key={c} className="p-0 border-l border-slate-100 dark:border-slate-700">
                                                    <input
                                                        className="w-full h-full p-4 outline-none bg-transparent text-slate-900 dark:text-slate-100 focus:bg-primary/5 transition-colors"
                                                        value={formData[`table_${activeSection}_${rIdx}_${c}`] || ''}
                                                        onChange={e => updateField(`table_${activeSection}_${rIdx}_${c}`, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Render Checklists */}
                    {currentSections[activeSection].checklist && (
                        <div className="grid grid-cols-1 gap-2">
                            {currentSections[activeSection].checklist?.map((item: string, idx: number) => (
                                <label key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-primary rounded-md border-slate-300 dark:border-slate-600 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                        checked={formData[`chk_${activeSection}_${idx}`] || false}
                                        onChange={e => updateField(`chk_${activeSection}_${idx}`, e.target.checked)}
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{item}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Render Sea Trial */}
                    {currentSections[activeSection].custom === 'sea_trial_table' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Combustível no Tanque</label>
                                    <input className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={formData.sea_fuel || ''} onChange={e => updateField('sea_fuel', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Água no Tanque</label>
                                    <input className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={formData.sea_water || ''} onChange={e => updateField('sea_water', e.target.value)} />
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-8 border border-slate-100 dark:border-slate-700 rounded-xl text-center text-slate-500 dark:text-slate-400 text-sm italic">
                                (Tabela de Prova de Mar Dinâmica)
                            </div>
                        </div>
                    )}

                    {currentSections[activeSection].custom === 'signatures' && (
                        <div className="space-y-8">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div className="font-medium">
                                    <strong>Atenção legal:</strong> Ao assinar, o cliente confirma que recebeu a embarcação em perfeitas condições e foi instruído sobre seu funcionamento básico.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Técnico Helper */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center bg-white dark:bg-slate-900/50 shadow-sm">
                                    <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Assinatura do Técnico</h3>
                                    {signatures.technician ? (
                                        <div className="relative group w-full">
                                            <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 flex items-center justify-center">
                                                <img src={signatures.technician} alt="Assinatura Técnico" className="max-h-32 object-contain invert dark:invert-0" />
                                            </div>
                                            <div className="text-center mt-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                                                <UserCheck className="w-3 h-3" /> Assinado Digitalmente
                                            </div>
                                            <button
                                                onClick={() => { setSignatureRole('TECHNICIAN'); setModalOpen(true); }}
                                                className="mt-4 text-[10px] font-bold uppercase text-slate-400 hover:text-primary w-full text-center transition-colors"
                                            >
                                                Refazer Assinatura
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setSignatureRole('TECHNICIAN'); setModalOpen(true); }}
                                            className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center gap-3"
                                        >
                                            <Wrench className="w-10 h-10 opacity-50" />
                                            <span className="font-bold text-sm uppercase">Coletar Assinatura Técnico</span>
                                        </button>
                                    )}
                                </div>

                                {/* Cliente Helper */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center bg-white dark:bg-slate-900/50 shadow-sm">
                                    <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Assinatura do Cliente</h3>
                                    {signatures.customer ? (
                                        <div className="relative group w-full">
                                            <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 flex items-center justify-center">
                                                <img src={signatures.customer} alt="Assinatura Cliente" className="max-h-32 object-contain invert dark:invert-0" />
                                            </div>
                                            <div className="text-center mt-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                                                <UserCheck className="w-3 h-3" /> Assinado Digitalmente
                                            </div>
                                            <button
                                                onClick={() => { setSignatureRole('CUSTOMER'); setModalOpen(true); }}
                                                className="mt-4 text-[10px] font-bold uppercase text-slate-400 hover:text-primary w-full text-center transition-colors"
                                            >
                                                Refazer Assinatura
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setSignatureRole('CUSTOMER'); setModalOpen(true); }}
                                            className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center gap-3"
                                        >
                                            <UserCheck className="w-10 h-10 opacity-50" />
                                            <span className="font-bold text-sm uppercase">Coletar Assinatura Cliente</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500">
                                As assinaturas são coletadas via Canvas HTML5 e armazenadas como Base64.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Signature Modal */}
            {modalOpen && (
                <SignatureModal
                    role={signatureRole}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSignatureSave}
                />
            )}
        </div>
    );
};
