"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export const LanguageToggleButton: React.FC = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
        onClick={toggleLanguage}
        className="px-2 py-1 text-sm font-medium border rounded-md dark:border-gray-600 dark:text-white"
        >
        {language === "en" ? "🇬🇧 EN" : "🇮🇩 ID"}
        </button>
    );
};
