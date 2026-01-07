import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { User } from '../types';

interface OnboardingContextType {
    completedSteps: Record<string, boolean>;
    completeStep: (stepId: string) => Promise<void>;
    resetOnboarding: () => Promise<void>;
    isStepCompleted: (stepId: string) => boolean;
    hasCompletedTutorial: (tutorialKey: string) => boolean;
    completeTutorial: (tutorialKey: string) => Promise<void>;
    markOnboardingAsCompleted: () => Promise<void>;
    isOnboardingCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextType>({
    completedSteps: {},
    completeStep: async () => { },
    resetOnboarding: async () => { },
    isStepCompleted: () => false,
    hasCompletedTutorial: () => false,
    completeTutorial: async () => { },
    markOnboardingAsCompleted: async () => { },
    isOnboardingCompleted: false,
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode, currentUser: User | null }> = ({ children, currentUser }) => {
    // Estado local para UI imediata
    const [preferences, setPreferences] = useState<Record<string, any>>({});

    useEffect(() => {
        if (currentUser?.preferences) {
            setPreferences(currentUser.preferences);
        }
    }, [currentUser]);

    const updatePreferences = async (newPrefs: any) => {
        setPreferences(newPrefs);
        if (currentUser) {
            try {
                // Atualiza via API para persistência
                await ApiService.updateUser(currentUser.id, { preferences: newPrefs });
            } catch (error) {
                console.error("Failed to sync preferences", error);
            }
        }
    };

    const completeStep = async (stepId: string) => {
        const newPrefs = {
            ...preferences,
            onboarding_steps: {
                ...(preferences.onboarding_steps || {}),
                [stepId]: true
            }
        };
        await updatePreferences(newPrefs);
    };

    const completeTutorial = async (tutorialKey: string) => {
        const newPrefs = {
            ...preferences,
            tutorials_completed: {
                ...(preferences.tutorials_completed || {}),
                [tutorialKey]: true
            }
        };
        await updatePreferences(newPrefs);
    };

    const markOnboardingAsCompleted = async () => {
        setPreferences(prev => ({ ...prev, onboarding_completed: true }));
        if (currentUser) {
            try {
                await ApiService.completeOnboarding();
            } catch (error) {
                console.error("Failed to complete onboarding", error);
            }
        }
    };

    const resetOnboarding = async () => {
        const newPrefs = {
            ...preferences,
            onboarding_steps: {},
            tutorials_completed: {},
            onboarding_completed: false
        };
        await updatePreferences(newPrefs);
    };

    const isStepCompleted = (stepId: string) => {
        return !!(preferences.onboarding_steps?.[stepId]);
    };

    const hasCompletedTutorial = (tutorialKey: string) => {
        // Se já completou, retorna true
        if (preferences.tutorials_completed?.[tutorialKey]) return true;
        // Fallback localstorage para migração ou segurança ou se usuario nao logado (raro)
        return false;
    };

    const isOnboardingCompleted = !!preferences.onboarding_completed;

    return (
        <OnboardingContext.Provider value={{
            completedSteps: preferences.onboarding_steps || {},
            completeStep,
            resetOnboarding,
            isStepCompleted,
            hasCompletedTutorial,
            completeTutorial,
            markOnboardingAsCompleted,
            isOnboardingCompleted
        }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => useContext(OnboardingContext);
