
import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check } from 'lucide-react';

interface SignatureModalProps {
    role: 'TECHNICIAN' | 'CUSTOMER';
    onClose: () => void;
    onSave: (signatureDataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ role, onClose, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Ajustar resolução para telas de alta densidade (Retina)
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
        }
    }, []);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasSignature(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa considerando a escala
            setHasSignature(false);
        }
    };

    const handleConfirm = () => {
        if (!hasSignature) return;
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL("image/png"));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">
                        Assinatura: {role === 'TECHNICIAN' ? 'Técnico Responsável' : 'Cliente / Proprietário'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 bg-slate-100 flex justify-center">
                    <div className="bg-white shadow-sm border rounded-lg overflow-hidden touch-none relative">
                        {/* Touch-action: none é crucial para evitar scroll enquanto desenha no mobile */}
                        <canvas
                            ref={canvasRef}
                            style={{ width: '100%', height: '200px', touchAction: 'none' }}
                            className="w-full h-[200px] cursor-crosshair block"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 pointer-events-none select-none">
                            Assine no espaço acima
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-white">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 border rounded-lg transition-colors font-medium text-sm"
                    >
                        <Eraser className="w-4 h-4" /> Limpar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!hasSignature}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm transition-all"
                    >
                        <Check className="w-4 h-4" /> Confirmar Assinatura
                    </button>
                </div>
            </div>
        </div>
    );
};
