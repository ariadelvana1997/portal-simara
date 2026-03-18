"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ThemeContext = createContext<any>({});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appConfig, setAppConfig] = useState({
    app_name: 'SIMARA',
    primary_color: '#2563eb',
    is_maintenance: false
  });

  useEffect(() => {
    // Ambil Pengaturan dari Database
    const fetchConfig = async () => {
      const { data } = await supabase.from('app_settings').select('*').single();
      if (data) {
        setAppConfig(data);
        // TERAPKAN WARNA KE CSS VARIABLE
        document.documentElement.style.setProperty('--primary-color', data.primary_color);
      }
    };
    fetchConfig();
  }, []);

  // Design tokens (Samsung Style)
  const cur = {
    bg: "bg-white dark:bg-[#0a0a0a]",
    card: "bg-white dark:bg-[#161616]",
    text: "text-black dark:text-white",
    textMuted: "opacity-40",
    border: "border-gray-200 dark:border-[#262626]",
    primary: "text-[var(--primary-color)]", // Pakai variable
    btnPrimary: "bg-[var(--primary-color)]" // Pakai variable
  };

  return (
    <ThemeContext.Provider value={{ cur, appConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);