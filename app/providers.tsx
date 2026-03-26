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

  // --- STATE USER UNTUK AUTOPILOT ---
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    
    // --- LOGIKA INITIALIZE USER (Sakti) ---
    const initUser = async () => {
      setLoading(true);
      
      // 1. Cek apakah sedang dalam mode Autopilot
      const ghostUser = sessionStorage.getItem('simara_autopilot_user');
      
      if (ghostUser) {
        // Jika ada, paksa aplikasi menggunakan identitas penyamaran ini
        setUser(JSON.parse(ghostUser));
        setLoading(false);
      } else {
        // 2. Jika tidak ada autopilot, ambil session resmi Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(profile);
        }
        setLoading(false);
      }
    };

    fetchConfig();
    initUser();
  }, []);

  // Design tokens (Samsung Style)
  const cur = {
    ...user, // Sebarkan data user (id, full_name, roles) ke dalam objek cur
    bg: "bg-white dark:bg-[#0a0a0a]",
    card: "bg-white dark:bg-[#161616]",
    text: "text-black dark:text-white",
    textMuted: "opacity-40",
    border: "border-gray-200 dark:border-[#262626]",
    primary: "text-[var(--primary-color)]", 
    btnPrimary: "bg-[var(--primary-color)]" 
  };

  // Fungsi Logout / Stop Autopilot
  const logout = async () => {
    sessionStorage.removeItem('simara_autopilot_user');
    sessionStorage.removeItem('simara_admin_backup');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <ThemeContext.Provider value={{ cur, appConfig, user, setUser, loading, logout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);