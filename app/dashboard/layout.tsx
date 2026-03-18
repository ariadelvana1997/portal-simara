"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ThemeContext = createContext<any>(null);

export const useTheme = () => useContext(ThemeContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>({
    app_name: 'SIMARA',
    primary_color: '#2563eb',
    is_maintenance: false
  });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      // 1. AMBIL DATA USER & PROFILE
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // 2. AMBIL PENGATURAN APLIKASI (Nyawa Sistem)
      const { data: configData } = await supabase.from('app_settings').select('*').single();
      
      if (configData) {
        setAppConfig(configData);
        
        // TERAPKAN WARNA KE CSS (Agar warna tema berfungsi nyata)
        document.documentElement.style.setProperty('--primary-color', configData.primary_color);

        // 3. LOGIKA MAINTENANCE (Satpam Gerbang)
        const isAdmin = profileData?.roles?.includes('Admin');
        if (configData.is_maintenance && !isAdmin) {
          router.push('/maintenance'); // Tendang jika bukan admin saat maintenance
          return;
        }
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [router]);

  // Design Tokens dengan Warna Dinamis
  const cur = {
    light: { 
      bg: "bg-gray-50", 
      card: "bg-white", 
      text: "text-gray-900", 
      border: "border-gray-200", 
      textMuted: "text-gray-500", 
      hover: "hover:bg-gray-50",
      primary: "text-[var(--primary-color)]", // Warna dari database
      bgPrimary: "bg-[var(--primary-color)]" // Warna dari database
    },
    dark: { 
      bg: "bg-gray-950", 
      card: "bg-gray-900", 
      text: "text-gray-100", 
      border: "border-gray-800", 
      textMuted: "text-gray-400", 
      hover: "hover:bg-gray-800",
      primary: "text-[var(--primary-color)]",
      bgPrimary: "bg-[var(--primary-color)]"
    }
  }[mode === 'read' ? 'light' : mode];

  return (
    <ThemeContext.Provider value={{ profile, appConfig, loading, cur, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}