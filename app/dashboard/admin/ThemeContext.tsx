"use client";
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');

  const themes = {
    light: { bg: "bg-gray-50", sidebar: "bg-white", text: "text-gray-900", textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", card: "bg-white" },
    dark: { bg: "bg-gray-950", sidebar: "bg-gray-900", text: "text-gray-100", textMuted: "text-gray-400", border: "border-gray-800", hover: "hover:bg-gray-800", card: "bg-gray-900" },
    read: { bg: "bg-[#F4ECD8]", sidebar: "bg-[#EFE5CD]", text: "text-[#5B4636]", textMuted: "text-[#8C7662]", border: "border-[#E2D1B3]", hover: "hover:bg-[#E8D9B5]", card: "bg-[#F9F3E5]" }
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, cur: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);