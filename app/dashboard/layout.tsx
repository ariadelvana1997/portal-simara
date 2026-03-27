"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ThemeContext = createContext<any>(null);

export const useTheme = () => useContext(ThemeContext);

// --- KOMPONEN DEKORASI TEMA (Mood Booster) ---
function ThemeOverlay({ theme }: { theme: string }) {
  if (!theme || theme === 'normal') return null;

  return (
    // Z-Index dinaikkan ke 9999 agar tidak tertutup konten utama
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden opacity-60">
      {/* TEMA HUT RI */}
      {theme === 'hut_ri' && (
        <>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-red-600 shadow-md"></div>
          <div className="absolute top-10 right-10 text-5xl animate-bounce drop-shadow-lg">🇮🇩</div>
          <div className="absolute bottom-10 left-10 text-4xl animate-pulse drop-shadow-lg">🇮🇩</div>
        </>
      )}

      {/* TEMA RAMADHAN */}
      {theme === 'ramadhan' && (
        <>
          <div className="absolute top-6 right-10 text-6xl opacity-40 drop-shadow-2xl">🌙</div>
          <div className="absolute top-20 right-14 text-2xl opacity-30 animate-pulse">✨</div>
          <div className="absolute top-10 left-10 text-3xl opacity-20">🕌</div>
          <div className="absolute inset-0 bg-emerald-900/5"></div>
        </>
      )}

      {/* TEMA PREMIUM GOLD */}
      {theme === 'premium_gold' && (
        <>
           <div className="absolute inset-0 border-[16px] border-yellow-600/10"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-yellow-600/[0.02]"></div>
        </>
      )}

      {/* TEMA OCEAN */}
      {theme === 'ocean' && (
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>({
    app_name: 'SIMARA',
    primary_color: '#2563eb',
    app_font: 'Inter',
    ui_theme: 'normal',
    is_maintenance: false
  });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const router = useRouter();

  // --- 1. SINKRONISASI TEMA (FIX WARNA MOBILE VS DESKTOP) ---
  useEffect(() => {
    const savedMode = localStorage.getItem('simara_theme_mode') as any;
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('simara_theme_mode', mode);
  }, [mode]);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      // --- 2. LOGIKA BYPASS AUTOPILOT ---
      const ghostUser = sessionStorage.getItem('simara_autopilot_user');
      if (ghostUser) {
        const parsedGhost = JSON.parse(ghostUser);
        setProfile({ ...parsedGhost, is_autopilot: true });
        const { data: configData } = await supabase.from('app_settings').select('*').single();
        if (configData) {
          setAppConfig(configData);
          document.documentElement.style.setProperty('--primary-color', configData.primary_color);
        }
        setLoading(false);
        return; 
      }

      // 3. AMBIL DATA USER & PROFILE (NORMAL)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // 4. AMBIL PENGATURAN APLIKASI
      const { data: configData } = await supabase.from('app_settings').select('*').single();
      
      if (configData) {
        setAppConfig(configData);
        
        // TERAPKAN WARNA KE CSS
        document.documentElement.style.setProperty('--primary-color', configData.primary_color);

        // --- LOGIKA FONT DINAMIS ---
        if (configData.app_font) {
          document.body.style.fontFamily = `'${configData.app_font}', sans-serif`;
        }

        // 5. LOGIKA MAINTENANCE
        const isAdmin = profileData?.roles?.includes('Admin');
        if (configData.is_maintenance && !isAdmin) {
          router.push('/maintenance');
          return;
        }
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [router]);

  // Memantau perubahan appConfig secara reaktif
  useEffect(() => {
    if (appConfig.app_font) {
      document.documentElement.style.setProperty('font-family', `'${appConfig.app_font}', sans-serif`, 'important');
      document.body.style.fontFamily = `'${appConfig.app_font}', sans-serif`;
    }
    if (appConfig.app_name) {
      document.title = appConfig.app_name;
    }
  }, [appConfig]);

  // Design Tokens dengan Warna Dinamis
  const cur = {
    light: { 
      bg: "bg-gray-50", 
      card: "bg-white", 
      text: "text-gray-900", 
      border: "border-gray-200", 
      textMuted: "text-gray-500", 
      hover: "hover:bg-gray-50",
      primary: "text-[var(--primary-color)]",
      bgPrimary: "bg-[var(--primary-color)]"
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
    <ThemeContext.Provider value={{ profile, appConfig, setAppConfig, loading, cur, mode, setMode }}>
      {/* OVERLAY TEMA DINAMIS */}
      <ThemeOverlay theme={appConfig.ui_theme} />
      
      {children}
    </ThemeContext.Provider>
  );
}