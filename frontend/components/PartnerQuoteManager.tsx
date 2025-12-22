import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { TechnicalInspection, Partner, PartnerQuote, PartnerQuoteCreate, ItemType } from '../types';
import { FileText, DollarSign, Clock, Send, CheckCircle, XCircle, AlertTriangle, Printer, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PartnerQuoteManagerProps {
    inspectionId: number;
    onBack: () => void;
}

export const PartnerQuoteManager: React.FC<PartnerQuoteManagerProps> = ({ inspectionId, onBack }) => {
    const [inspection, setInspection] = useState<TechnicalInspection | null>(null);
    const [quotes, setQuotes] = useState<PartnerQuote[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal Request Quote
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]); // Items descriptions to bundle
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const [requestDescription, setRequestDescription] = useState('');

    // Modal Update Quote
    const [editingQuote, setEditingQuote] = useState<PartnerQuote | null>(null);
    const [quoteValue, setQuoteValue] = useState<number>(0);
    const [quoteDays, setQuoteDays] = useState<number>(0);

    useEffect(() => {
        loadData();
    }, [inspectionId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Inspection
            // Note: We need endpoints for this. Assuming getInspections filters correctly or we create getInspectionById
            const allInspections = await ApiService.getInspections();
            const insp = allInspections.find((i: any) => i.id === inspectionId);
            setInspection(insp);

            // Load Quotes for this inspection
            // Need endpoint adjustment or filter in frontend
            // Ideally: ApiService.getPartnerQuotes(inspectionId)
            // For now assuming we have a method or filtered list
            // Let's assume ApiService.getPartnerQuotes takes inspectionId
            // If strictly typed API doesn't have it, we might need to fetch all and filter, causing performance issues later.
            // But checking api.ts, getPartnerQuotes DOES take inspection_id.
            // Wait, api.ts says getPartnerQuotes(inspectionId, partnerId). Wait, arguments order.
            // api.ts: getPartnerQuotes: async (inspection_id, partner_id) -> wait, parameters are named arguments in python but positional in calls?
            // Checking api.ts implementation:
            // getPartnerQuotes: async (inspection_id?, partner_id?) => ...
            // Yes, it supports.
            // Wait, the ApiService definition in my thought history was:
            // getPartnerQuotes: async (tenant_id, inspection_id, partner_id) in python
            // API Service TS: getPartnerQuotes: async (inspectionId?, partnerId?)
            // It uses params.
            const qs = await ApiService.getPartnerQuotes(inspectionId);
            setQuotes(qs);

            // Load Partners
            const ps = await ApiService.getPartners(true);
            setPartners(ps);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuote = async () => {
        if (!selectedPartnerId || !requestDescription) return;

        try {
            const newQuote = await ApiService.createPartnerQuote({
                inspectionId: inspectionId,
                partnerId: selectedPartnerId,
                serviceDescription: requestDescription
            });
            setQuotes([...quotes, newQuote]);
            setShowRequestModal(false);
            resetRequestForm();
        } catch (error) {
            console.error("Erro ao criar solicitação:", error);
            alert("Erro ao criar solicitação.");
        }
    };

    const resetRequestForm = () => {
        setSelectedItems([]);
        setSelectedPartnerId(null);
        setRequestDescription('');
    };

    const handleUpdateQuote = async () => {
        if (!editingQuote) return;

        try {
            const updated = await ApiService.updatePartnerQuote(editingQuote.id, {
                quotedValue: quoteValue,
                estimatedDays: quoteDays,
                status: 'Recebido'
            });

            setQuotes(quotes.map(q => q.id === updated.id ? updated : q));
            setEditingQuote(null);
        } catch (error) {
            console.error("Erro ao atualizar orçamento:", error);
            alert("Erro ao atualizar orçamento.");
        }
    };

    const handleApproveQuote = async (quote: PartnerQuote) => {
        if (!confirm(`Aprovar orçamento de R$ ${quote.quotedValue}? Isso incluirá este valor na Proposta Final.`)) return;

        try {
            const updated = await ApiService.updatePartnerQuote(quote.id, {
                status: 'Aprovado'
            });
            setQuotes(quotes.map(q => q.id === updated.id ? updated : q));
        } catch (error) {
            console.error(error);
        }
    };

    const generateMasterProposal = () => {
        if (!inspection) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('PROPOSTA TÉCNICA DE REPARO', 15, 20);

        doc.setFontSize(10);
        doc.text(`Inspeção #${inspection.id} | Data: ${new Date().toLocaleDateString()}`, 15, 30);

        let yPos = 50;

        // 1. Approved Partner Quotes
        const approvedQuotes = quotes.filter(q => q.status === 'Aprovado');

        if (approvedQuotes.length > 0) {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('1. SERVIÇOS TERCEIRIZADOS (PARCEIROS)', 15, yPos);
            yPos += 10;

            const quoteData = approvedQuotes.map(q => [
                q.partner.name + ` (${q.partner.partnerType})`,
                q.serviceDescription,
                `${q.estimatedDays} dias`,
                `R$ ${q.quotedValue?.toFixed(2)}`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Parceiro', 'Serviço', 'Prazo', 'Valor']],
                body: quoteData,
                theme: 'striped',
                headStyles: { fillColor: [6, 182, 212] }
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // 2. Internal Labor & Parts (Placeholder for now, assumes user adds them in OS)
        // Ideally we would select internal items here too.

        // Total
        const totalPartners = approvedQuotes.reduce((acc, q) => acc + (q.quotedValue || 0), 0);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL SERVIÇOS TERCEIRIZADOS: R$ ${totalPartners.toFixed(2)}`, 15, yPos);

        doc.save(`Proposta_Reparo_Insp_${inspection.id}.pdf`);
    };

    if (!inspection) return <div className="p-8 text-center text-white">Carregando inspeção...</div>;

    // Filter checklist items that are NOT OK
    const problems = inspection.checklistItems?.filter(i => i.severity !== 'OK') || [];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Voltar para Inspeções
            </button>

            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-8 h-8 text-cyan-400" />
                        Gerenciador de Orçamentos (Parceiros)
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Embarcação: {inspection.boatId} (ID) | Inspeção #{inspection.id}
                    </p>
                </div>
                <button
                    onClick={generateMasterProposal}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                >
                    <Printer className="w-5 h-5" />
                    Gerar Proposta Master PDF
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Problems Identified */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                        Problemas Identificados
                    </h2>

                    <div className="space-y-3">
                        {problems.map((item, idx) => (
                            <div key={idx} className="bg-slate-700/50 p-3 rounded border border-slate-600 flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-sm">{item.category}</div>
                                    <div className="text-slate-300">{item.itemDescription}</div>
                                    <div className="text-xs text-orange-400 font-mono mt-1">{item.severity} - Rec: {item.recommendedPartnerType || 'N/A'}</div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-500 bg-slate-600 checked:bg-cyan-500"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems([...selectedItems, item.itemDescription]);
                                            if (!requestDescription) setRequestDescription(item.itemDescription);
                                            else setRequestDescription(prev => prev + ' + ' + item.itemDescription);
                                        } else {
                                            setSelectedItems(selectedItems.filter(i => i !== item.itemDescription));
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <button
                            disabled={selectedItems.length === 0}
                            onClick={() => setShowRequestModal(true)}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Solicitar Orçamento ({selectedItems.length} itens)
                        </button>
                    </div>
                </div>

                {/* RIGHT: Active Quotes */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                        <DollarSign className="w-5 h-5" />
                        Orçamentos Ativos
                    </h2>

                    <div className="space-y-4">
                        {quotes.map(quote => (
                            <div key={quote.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600 relative overflow-hidden">
                                {/* Status Badge */}
                                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg
                                    ${quote.status === 'Aprovado' ? 'bg-green-500 text-white' :
                                        quote.status === 'Recebido' ? 'bg-blue-500 text-white' :
                                            'bg-yellow-500 text-slate-900'}
                                `}>
                                    {quote.status}
                                </div>

                                <h3 className="font-bold text-lg">{quote.partner.name}</h3>
                                <p className="text-xs text-slate-400 mb-2">{quote.partner.partnerType}</p>

                                <p className="text-sm text-slate-300 italic mb-3">
                                    "{quote.serviceDescription}"
                                </p>

                                {quote.quotedValue && (
                                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded mb-3">
                                        <div>
                                            <span className="text-xs text-slate-400 block">Valor</span>
                                            <span className="font-bold text-green-400">R$ {quote.quotedValue.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 block">Prazo</span>
                                            <span className="font-bold text-white">{quote.estimatedDays} dias</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end mt-2">
                                    {quote.status === 'Solicitado' && (
                                        <button
                                            onClick={() => {
                                                setEditingQuote(quote);
                                                setQuoteValue(quote.quotedValue || 0);
                                                setQuoteDays(quote.estimatedDays || 0);
                                            }}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1"
                                        >
                                            <DollarSign className="w-3 h-3" /> Registrar Valor
                                        </button>
                                    )}
                                    {quote.status === 'Recebido' && (
                                        <button
                                            onClick={() => handleApproveQuote(quote)}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-3 h-3" /> Aprovar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {quotes.length === 0 && (
                            <p className="text-slate-500 text-center py-8">Nenhum orçamento solicitado ainda.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: Request Quote */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Solicitar Orçamento a Parceiro</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Descrição do Serviço</label>
                                <textarea
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                                    rows={3}
                                    value={requestDescription}
                                    onChange={e => setRequestDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Selecione o Parceiro</label>
                                <select
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                                    onChange={e => setSelectedPartnerId(Number(e.target.value))}
                                    value={selectedPartnerId || ''}
                                >
                                    <option value="">Selecione...</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} - {p.partnerType} (Rate: {p.rating.toFixed(1)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancelar</button>
                                <button
                                    onClick={handleCreateQuote}
                                    disabled={!selectedPartnerId || !requestDescription}
                                    className="flex-1 py-2 bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
                                >
                                    Confirmar Solicitação
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Register/Update Quote Value */}
            {editingQuote && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 rounded-xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Registrar Resposta</h3>
                        <p className="text-sm text-slate-400 mb-4">{editingQuote.partner.name}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Valor Orçado (R$)</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white font-mono text-lg"
                                    value={quoteValue}
                                    onChange={e => setQuoteValue(parseFloat(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Prazo Estimado (Dias)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                                    value={quoteDays}
                                    onChange={e => setQuoteDays(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setEditingQuote(null)} className="flex-1 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancelar</button>
                                <button
                                    onClick={handleUpdateQuote}
                                    className="flex-1 py-2 bg-green-600 rounded hover:bg-green-700"
                                >
                                    Salvar Resposta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
