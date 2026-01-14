import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { User } from '../types';

interface ThemePreferences {
    darkMode: boolean;
    primaryColor: string;
    fontFamily: string;
}

interface ThemeContextType {
    preferences: ThemePreferences;
    toggleDarkMode: () => void;
    setPrimaryColor: (color: string) => void;
    setFontFamily: (font: string) => void;
    savePreferences: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FONT_OPTIONS = [
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Outfit', value: "'Outfit', sans-serif" },
    { name: 'System', value: "system-ui, -apple-system, sans-serif" }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
    const [preferences, setPreferences] = useState<ThemePreferences>({
        darkMode: false,
        primaryColor: '#0891b2',
        fontFamily: 'Inter'
    });

    useEffect(() => {
        if (user?.preferences?.theme) {
            setPreferences(user.preferences.theme);
        } else {
            // Check local storage for guest/unsaved preferences
            const saved = localStorage.getItem('theme_pref');
            if (saved) {
                try {
                    setPreferences(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse local theme pref");
                }
            }
        }
    }, [user]);

    useEffect(() => {
        // Apply preferences to document
        const root = document.documentElement;
        if (preferences.darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        root.style.setProperty('--primary-color', preferences.primaryColor);
        // Rough hover color calculation (darker)
        const hoverColor = adjustColor(preferences.primaryColor, -20);
        root.style.setProperty('--primary-hover', hoverColor);

        root.style.setProperty('--font-family', preferences.fontFamily);

        localStorage.setItem('theme_pref', JSON.stringify(preferences));
    }, [preferences]);

    const toggleDarkMode = () => {
        setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
    };

    const setPrimaryColor = (color: string) => {
        setPreferences(prev => ({ ...prev, primaryColor: color }));
    };

    const setFontFamily = (font: string) => {
        setPreferences(prev => ({ ...prev, fontFamily: font }));
    };

    const savePreferences = async () => {
        if (user) {
            try {
                const newPrefs = { ...user.preferences, theme: preferences };
                await ApiService.updateUser(user.id, { preferences: newPrefs });
            } catch (error) {
                console.error("Failed to save theme preferences:", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ preferences, toggleDarkMode, setPrimaryColor, setFontFamily, savePreferences }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Helper to darken/lighten color
function adjustColor(col: string, amt: number) {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
