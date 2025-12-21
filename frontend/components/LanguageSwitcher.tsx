import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language || 'pt';

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <select
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
            </select>
        </div>
    );
};
