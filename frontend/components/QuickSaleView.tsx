import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Part, User, UserRole } from '../types';
import { ShoppingCart, Plus, Trash2, Search, DollarSign, Package, CheckCircle, Smartphone } from 'lucide-react';

interface CartItem extends Part {
    cartQuantity: number;
    discountPercent: number;
}

interface QuickSaleProps {
    currentUser: User;
}

export const QuickSaleView: React.FC<QuickSaleProps> = ({ currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [parts, setParts] = useState<Part[]>([]);
    const [filteredParts, setFilteredParts] = useState<Part[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadParts();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredParts([]);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const results = parts.filter(p =>
            (p.name.toLowerCase().includes(lower) ||
                p.sku.toLowerCase().includes(lower) ||
                (p.barcode && p.barcode.includes(lower)))
            && p.quantity > 0 // Only show available items
        );
        setFilteredParts(results.slice(0, 10)); // Limit results
    }, [searchTerm, parts]);

    const loadParts = async () => {
        try {
            const data = await ApiService.getParts();
            setParts(data);
        } catch (error) {
            console.error("Erro ao carregar peças:", error);
        }
    };

    const addToCart = (part: Part) => {
        const existing = cart.find(i => i.id === part.id);
        if (existing) {
            if (existing.cartQuantity + 1 > part.quantity) {
                alert("Estoque insuficiente!");
                return;
            }
            setCart(cart.map(i => i.id === part.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i));
        } else {
            setCart([...cart, { ...part, cartQuantity: 1, discountPercent: 0 }]);
        }
        setSearchTerm(''); // Clear search to continue scanning/typing
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, qty: number) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        if (qty > item.quantity) {
            alert(`Apenas ${item.quantity} unidades disponíveis.`);
            return;
        }
        if (qty < 1) return;
        setCart(cart.map(i => i.id === id ? { ...i, cartQuantity: qty } : i));
    };

    const updateDiscount = (id: number, discount: number) => {
        if (discount < 0 || discount > 100) return;

        // Security Check for Technicians
        if (currentUser.role === UserRole.TECHNICIAN && discount > 10) {
            alert("Limite de desconto para técnicos é 10%. Solicite autorização.");
            discount = 10;
        }

        setCart(cart.map(i => i.id === id ? { ...i, discountPercent: discount } : i));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const unitPrice = item.price * (1 - item.discountPercent / 100);
            return acc + (unitPrice * item.cartQuantity);
        }, 0);
    };

    const handleFinalize = async () => {
        if (cart.length === 0) return;
        if (!window.confirm(`Confirmar venda no valor de R$ ${calculateTotal().toFixed(2)}?`)) return;

        setLoading(true);
        try {
            const saleData = {
                items: cart.map(i => ({
                    part_id: i.id,
                    quantity: i.cartQuantity,
                    discount_percent: i.discountPercent
                })),
                payment_method: paymentMethod,
                notes: notes
            };

            await ApiService.quickSale(saleData);
            alert("Venda realizada com sucesso!");
            setCart([]);
            setNotes('');
            loadParts(); // Refresh stock
        } catch (error: any) {
            console.error("Erro na venda:", error);
            alert("Falha ao finalizar venda: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Left Column: Product Search & List */}
            <div className="w-1/2 p-6 flex flex-col border-r border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Search className="w-6 h-6 text-cyan-600" />
                    Buscar Produtos
                </h2>

                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Digite SKU, Nome ou Código de Barras..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 text-lg border-2 border-slate-300 rounded-xl focus:border-cyan-500 focus:outline-none shadow-sm"
                        autoFocus
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {filteredParts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredParts.map(part => (
                                <button
                                    key={part.id}
                                    onClick={() => addToCart(part)}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-cyan-400 hover:shadow-md transition-all text-left group"
                                >
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-cyan-700">{part.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">SKU: {part.sku}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">R$ {part.price.toFixed(2)}</div>
                                        <div className="text-xs text-slate-400">Estoque: {part.quantity}</div>
                                    </div>
                                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-cyan-500" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <Package className="w-16 h-16 mb-4" />
                            <p>Digite para buscar produtos...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Carrinho / Checkout */}
            <div className="w-1/2 bg-white flex flex-col shadow-xl z-10">
                <div className="p-6 bg-slate-800 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-cyan-400" />
                        <div>
                            <h2 className="text-xl font-bold">Carrinho de Vendas</h2>
                            <p className="text-xs text-slate-400">PDV - Venda Direta</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Total a Pagar</div>
                        <div className="text-3xl font-bold text-green-400">R$ {calculateTotal().toFixed(2)}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                            <p>O carrinho está vazio.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => {
                                const unitPrice = item.price * (1 - item.discountPercent / 100);
                                const totalItem = unitPrice * item.cartQuantity;
                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800">{item.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{item.sku}</div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Qtd</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.quantity}
                                                    value={item.cartQuantity}
                                                    onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                                                    className="w-16 p-1 text-center border rounded text-sm font-bold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Desc %</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.discountPercent}
                                                    onChange={e => updateDiscount(item.id, parseFloat(e.target.value))}
                                                    className="w-16 p-1 text-center border rounded text-sm text-red-500 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[80px]">
                                            <div className="font-bold text-slate-800">R$ {totalItem.toFixed(2)}</div>
                                            {item.discountPercent > 0 && <div className="text-[10px] text-red-500">-{item.discountPercent}%</div>}
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Forma de Pagamento</label>
                            <select
                                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            >
                                <option value="DINHEIRO">💵 Dinheiro</option>
                                <option value="CARTAO_CREDITO">💳 Cartão Crédito</option>
                                <option value="CARTAO_DEBITO">💳 Cartão Débito</option>
                                <option value="PIX">💠 PIX</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Observações</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
                                placeholder="Recibo, Cliente, etc."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleFinalize}
                        disabled={cart.length === 0 || loading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                Finalizar Venda (R$ {calculateTotal().toFixed(2)})
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
