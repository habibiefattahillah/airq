"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "id";

type LanguageContextType = {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>("en");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language | null;
        setLanguageState(savedLang || "en");
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
        localStorage.setItem("language", language);
        }
    }, [language, isInitialized]);

    const toggleLanguage = () => {
        setLanguageState((prev) => (prev === "en" ? "id" : "en"));
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
        {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
