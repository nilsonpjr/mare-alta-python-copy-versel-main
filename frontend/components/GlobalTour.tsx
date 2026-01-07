import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import { useOnboarding } from '../context/OnboardingContext';
import { getTourForRole } from '../tours';
import { User } from '../types';

export const GlobalTour: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const { isOnboardingCompleted, markOnboardingAsCompleted } = useOnboarding();
    const [run, setRun] = useState(false);
    const steps = getTourForRole(currentUser.role);

    useEffect(() => {
        // Run only if not completed and valid steps exist
        if (!isOnboardingCompleted && steps.length > 0) {
            // Delay start to allow rendering
            const timer = setTimeout(() => setRun(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [isOnboardingCompleted, steps.length]);

    const handleJoyrideCallback = (data: any) => {
        const { status } = data;
        const finishedStatuses: string[] = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            markOnboardingAsCompleted();
        }
    };

    if (isOnboardingCompleted || steps.length === 0) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            disableOverlayClose
            spotlightPadding={10}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#0891b2', // Cyan-600
                    zIndex: 99999, // Super high z-index
                }
            }}
            locale={{
                back: 'Voltar',
                close: 'Fechar',
                last: 'Entendi, Vamos lá!',
                next: 'Próximo',
                skip: 'Pular Tour',
            }}
        />
    );
};
