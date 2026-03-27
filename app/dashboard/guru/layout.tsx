"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations'; 
import { themes } from '@/lib/themes'; 

// --- BACKUP WARNA (Emergency Fallback jika themes.ts belum terbaca) ---
const SAFE_FALLBACK = {
  bg: "bg-gray-50", sidebar: "bg-white", header: "bg-white", text: "text-gray-900", 
  textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", 
  card: "bg-white", input: "bg-gray-500/5", radius: "rounded-xl", primary: "#3C50E0"
};

const ThemeContext = createContext<any>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) return { cur: SAFE_FALLBACK, t: (key: string) => key };
  return context;
};

// --- ICONS (KONSISTEN) ---
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconPenilaian = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

// --- ICON MODE ANAK (Teddy Bear / Toy Style) ---
const IconKids = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4" />
    <path d="M9 14s1 1 3 1 3-1 3-1" />
  </svg>
);

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPass, setUnlockPass] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>({ app_language: 'id', app_theme: 'default' });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const t = (key: string) => {
    const lang = appConfig?.app_language || 'id';
    return translations[lang]?.[key] || key;
  };

  // --- LOGIKA TEMA + MODE ---
  const activeTheme = themes?.[appConfig?.app_theme] || themes?.default || { primary: "#3C50E0" };
  const cur = activeTheme?.modes?.[mode] || themes?.default?.modes?.[mode] || SAFE_FALLBACK;

  // --- LOGIKA BERHENTI AUTOPILOT ---
  const handleStopAutopilot = () => {
    sessionStorage.removeItem('simara_autopilot_user');
    sessionStorage.removeItem('simara_admin_backup');
    window.location.href = '/dashboard/admin/pengguna';
  };

  // --- 1. SINKRONISASI MODE GELAP (LOCALSTORAGE) ---
  useEffect(() => {
    const savedMode = localStorage.getItem('simara_theme_mode') as any;
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.add('light');
    localStorage.setItem('simara_theme_mode', mode);
  }, [mode]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ghostUser = sessionStorage.getItem('simara_autopilot_user');
        
        // PRIORITAS: CEK MODE AUTOPILOT
        if (ghostUser) {
          const parsedGhost = JSON.parse(ghostUser);
          setProfile({ ...parsedGhost, is_autopilot: true });
          
          const { data: configData } = await supabase.from('app_settings').select('*').single();
          if (configData) {
            setAppConfig(configData);
            // SINKRONKAN WARNA KE CSS VARIABLE (PENTING UNTUK HP)
            document.documentElement.style.setProperty('--primary-color', configData.primary_color);
          }
          setLoading(false);
          return;
        }

        // LOGIKA NORMAL
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const [profRes, confRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('app_settings').select('*').single()
        ]);
        
        if (profRes.data) setProfile(profRes.data);
        if (confRes.data) {
          setAppConfig(confRes.data);
          // SINKRONKAN WARNA KE CSS VARIABLE JUGA DI SINI (PENTING UNTUK HP)
          document.documentElement.style.setProperty('--primary-color', confRes.data.primary_color);
        }
      } catch (err) { console.error("Sync Error", err); }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black opacity-20 uppercase tracking-[0.3em]">Syncing...</div>;

  return (
    <ThemeContext.Provider value={{ cur, mode, setMode, setIsLocked, profile, appConfig, setAppConfig, t }}>
      <div className={`min-h-screen flex transition-colors duration-700 ease-in-out ${cur.bg} ${cur.text} font-sans`}>
        
        {/* --- FLOATING STOP AUTOPILOT BUTTON --- */}
        {profile?.is_autopilot && (
            <div className="fixed bottom-8 right-8 z-[10000] animate-bounce-slow">
                <button 
                onClick={handleStopAutopilot}
                className="group flex items-center gap-3 bg-red-600 text-white pl-4 pr-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-red-600/40 hover:bg-red-700 transition-all active:scale-95"
                >
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span>Stop Autopilot</span>
                </button>
            </div>
        )}

        {/* SECURITY LOCK OVERLAY */}
        {isLocked && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-700">
              <div className="w-full max-sm text-center space-y-8 text-white">
                <div className="space-y-3">
                   <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl rotate-12">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter uppercase ">{t('verifying')}</h2>
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); setIsVerifying(true); const { data: { user } } = await supabase.auth.getUser(); if (user?.email) { const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: unlockPass }); if (!error) { setIsLocked(false); setUnlockPass(''); } else { alert("PIN Salah!"); } } setIsVerifying(false); }} className="space-y-4">
                   <input type="password" autoFocus value={unlockPass} onChange={(e) => setUnlockPass(e.target.value)} placeholder="PIN Guru" className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-white text-center font-bold focus:outline-none focus:border-blue-600" />
                   <button className="w-full bg-white text-black font-black py-4 rounded-2xl active:scale-95">{isVerifying ? '...' : t('unlock')}</button>
                </form>
              </div>
          </div>
        )}

        {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)}></div>}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-[70] border-r transition-[width,transform] duration-500 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-72'} ${cur.sidebar} ${cur.border} flex flex-col shadow-2xl md:shadow-none`}>
          <div className={`h-16 flex items-center border-b shrink-0 ${cur.border} ${isCollapsed && !isSidebarOpen ? 'justify-center' : 'px-6'}`}>
            <span className="font-black text-xl tracking-tighter " style={{ color: activeTheme.primary }}>{isCollapsed && !isSidebarOpen ? 'G' : 'SIMARA GURU'}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <NavItem href="/dashboard/guru" icon={<IconDashboard />} label={t('dashboard')} active={pathname === '/dashboard/guru'} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
            <NavItem href="/dashboard/guru/nilai" icon={<IconPenilaian />} label={t('penilaian')} active={pathname.includes('/guru/nilai')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
            
            <hr className={`mx-2 my-4 border-t ${cur.border} opacity-50`} />
            
            <NavItem href="/dashboard/guru/pengaturan" icon={<IconSettings />} label={t('setting')} active={pathname === '/dashboard/guru/pengaturan'} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
          </div>

          <div className={`p-3 border-t shrink-0 ${cur.border}`}>
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-2.5 ${cur.radius} text-red-500 font-bold ${cur.hover} transition-all ${isCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}>
              <IconLogout /> {(!isCollapsed || isSidebarOpen) && <span className="text-sm">{t('logout')}</span>}
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
          <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b ${cur.border} ${cur.header} sticky top-0 z-[55] backdrop-blur-md`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarOpen(true);
                  } else {
                    setIsCollapsed(!isCollapsed);
                  }
                }} 
                className={`p-2 ${cur.hover} ${cur.radius} active:scale-75 transition-all group`}
              >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10m-10 6h16" /></svg>
              </button>
              <h2 className="font-black text-[10px] uppercase tracking-[0.3em] hidden sm:block opacity-40">Teacher Panel</h2>
            </div>

            <div className="flex items-center gap-4">
               <div className={`flex items-center ${cur.bg} p-1 ${cur.radius} border ${cur.border} gap-0.5 shadow-sm`}>
                  {['light', 'dark', 'read'].map((m: any) => (
                    <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 ${cur.radius} text-[10px] font-black uppercase transition-all duration-300 ${mode === m ? 'text-white shadow-lg scale-105' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: mode === m ? activeTheme.primary : 'transparent' }}>{m[0]}</button>
                  ))}
                  
                  <div className={`w-[1px] h-4 ${cur.border} mx-1 opacity-50`}></div>
                  
                  {/* --- TOMBOL MODE ANAK (Teddy Bear) --- */}
                  <button 
                    onClick={() => alert("🍭 Fitur Mode Anak sedang dalam tahap pengembangan!")}
                    title="Mode Anak"
                    className={`px-3 py-1.5 ${cur.radius} text-[10px] font-black transition-all bg-pink-500/10 text-pink-600 hover:bg-pink-500 hover:text-white active:scale-90`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconKids />
                      <span className="hidden lg:inline">MODE ANAK</span>
                    </div>
                  </button>

                  <button onClick={() => setIsLocked(true)} className={`px-3 py-1.5 ${cur.radius} text-[10px] font-black transition-all bg-red-500 text-white shadow-lg active:rotate-12`}>
                    LOCK
                  </button>
               </div>

               <div className={`w-9 h-9 ${cur.radius} flex items-center justify-center text-white text-xs font-black shadow-lg`} style={{ backgroundColor: activeTheme.primary }}>
                {profile?.full_name?.charAt(0) || 'G'}
               </div>
            </div>
          </header>
          
          <main className="p-4 md:p-8 overflow-y-auto bg-inherit">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">{children}</div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// --- SUB-COMPONENTS FIXED ---
function NavItem({ href, icon, label, active, isCollapsed, isSidebarOpen, cur, primary, setSidebarOpen }: any) {
  return (
    <Link href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center transition-all duration-300 group ${active ? 'text-white shadow-lg shadow-blue-500/20' : `hover:translate-x-1 active:scale-95`} ${isCollapsed && !isSidebarOpen ? 'w-12 h-12 justify-center mx-auto' : 'gap-3 p-3'} ${cur.radius}`} style={{ backgroundColor: active ? primary : 'transparent', color: active ? 'white' : 'inherit' }} >
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>{icon}</span> 
      {(!isCollapsed || isSidebarOpen) && <span className={`font-bold text-sm tracking-tight truncate ${!active ? 'opacity-70' : ''}`}>{label}</span>}
    </Link>
  );
}