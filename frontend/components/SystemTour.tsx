import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { X, ChevronRight, Check } from 'lucide-react';

interface Step {
    target: string; // CSS selector or ID
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface SystemTourProps {
    tourKey: string; // Unique ID for this tour (e.g., "inventory_intro")
    steps: Step[];
    shouldRun?: boolean; // Condition to start (e.g., if data is loaded)
}

export const SystemTour: React.FC<SystemTourProps> = ({ tourKey, steps, shouldRun = true }) => {
    const { hasCompletedTutorial, completeTutorial } = useOnboarding();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Initial check
    useEffect(() => {
        if (shouldRun && !hasCompletedTutorial(tourKey) && steps.length > 0) {
            // Delay start slightly to allow UI to render
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [shouldRun, tourKey, steps.length, hasCompletedTutorial]);

    // Track position
    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const step = steps[currentStepIndex];
            const element = document.querySelector(step.target);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight class
                element.classList.add('ring-4', 'ring-cyan-400', 'ring-opacity-50', 'transition-all', 'duration-500');
            } else {
                // If element not found, maybe skip or wait?
                // For simplicity, just stay visible but centered if desired, or null
                setTargetRect(null);
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
            // Cleanup previous highlight
            const step = steps[currentStepIndex];
            const element = document.querySelector(step?.target);
            if (element) {
                element.classList.remove('ring-4', 'ring-cyan-400', 'ring-opacity-50', 'transition-all', 'duration-500');
            }
        };
    }, [isVisible, currentStepIndex, steps]);

    const handleNext = () => {
        const step = steps[currentStepIndex];
        const element = document.querySelector(step.target);
        if (element) {
            element.classList.remove('ring-4', 'ring-cyan-400', 'ring-opacity-50', 'transition-all', 'duration-500');
        }

        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        completeTutorial(tourKey);
    };

    const handleSkip = () => {
        setIsVisible(false);
        completeTutorial(tourKey); // Mark as complete so it doesn't show again
    };

    if (!isVisible) return null;

    const step = steps[currentStepIndex];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === steps.length - 1;

    // Calculate Popover Position
    let style: React.CSSProperties = {};
    if (targetRect) {
        // Simple positioning logic
        const offset = 10;
        style = {
            position: 'fixed',
            zIndex: 9999,
        };

        // Posição absoluta baseada no rect
        // top/left calculados. 
        // fallback to center if no target

        const popoverWidth = 320;
        // ... Logica simples de posicionamento
        // Left align by default
        let top = targetRect.bottom + offset;
        let left = targetRect.left;

        if (step.placement === 'top') {
            top = targetRect.top - offset - 200; // estimated height
        } else if (step.placement === 'right') {
            left = targetRect.right + offset;
            top = targetRect.top;
        }

        // Boundaries check (very basic)
        if (left + popoverWidth > window.innerWidth) {
            left = window.innerWidth - popoverWidth - 20;
        }
        if (top < 0) top = 20;

        style.top = top;
        style.left = left;
    } else {
        // Center screen fallback
        style = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
        };
    }

    return (
        <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-500" />

            {/* Popover */}
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-fade-in-up border border-slate-200"
                style={style}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                    <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {step.content}
                </p>

                <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStepIndex ? 'bg-cyan-500 w-4' : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        {isLast ? 'Concluir' : 'Próximo'}
                        {isLast ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Arrow indicator (optional, omitted for simplicity) */}
            </div>
        </>
    );
};
