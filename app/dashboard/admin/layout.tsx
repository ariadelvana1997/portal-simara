"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations'; 
import { themes } from '@/lib/themes'; 

// --- BACKUP WARNA ---
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

// --- ICONS ---
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const IconRef = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconCoKuler = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPrinter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconChevron = ({ open }: { open: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-500 ease-out ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const SubIcon = ({ d }: { d: string }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

// --- ICON MODE ANAK (Teddy Bear / Toy Style) ---
const IconKids = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4" />
    <path d="M9 14s1 1 3 1 3-1 3-1" />
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const [isLocked, setIsLocked] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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

  const activeTheme = themes?.[appConfig?.app_theme] || themes?.default || { primary: "#3C50E0" };
  const cur = activeTheme?.modes?.[mode] || themes?.default?.modes?.[mode] || SAFE_FALLBACK;

  const handleStopAutopilot = () => {
    sessionStorage.removeItem('simara_autopilot_user');
    sessionStorage.removeItem('simara_admin_backup');
    window.location.href = '/dashboard/admin/pengguna';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ghostUser = sessionStorage.getItem('simara_autopilot_user');
        if (ghostUser) {
          const parsedGhost = JSON.parse(ghostUser);
          setProfile({ ...parsedGhost, is_autopilot: true });
          const { data: configData } = await supabase.from('app_settings').select('*').single();
          if (configData) {
            setAppConfig(configData);
          }
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const [profRes, confRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('app_settings').select('*').single()
        ]);
        if (profRes.data) setProfile(profRes.data);
        if (confRes.data) {
          setAppConfig(confRes.data);
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

        {isLocked && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-700">
              <div className="w-full max-w-sm text-center space-y-8 text-white">
                <div className="space-y-3">
                   <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl rotate-12">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter uppercase ">{t('verifying')}</h2>
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); setIsVerifying(true); const { data: { user } } = await supabase.auth.getUser(); if (user?.email) { const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: unlockPass }); if (!error) { setIsLocked(false); setUnlockPass(''); } else { alert("Akses Ditolak!"); } } setIsVerifying(false); }} className="space-y-4">
                   <input type="password" autoFocus value={unlockPass} onChange={(e) => setUnlockPass(e.target.value)} placeholder="PIN Admin" className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-white text-center font-bold focus:outline-none focus:border-blue-600" />
                   <button className="w-full bg-white text-black font-black py-4 rounded-2xl active:scale-95">{isVerifying ? '...' : t('unlock')}</button>
                </form>
              </div>
          </div>
        )}

        {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)}></div>}

        <aside className={`fixed inset-y-0 left-0 z-[70] border-r transition-[width,transform] duration-500 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-72'} ${cur.sidebar} ${cur.border} flex flex-col shadow-2xl md:shadow-none`}>
          <div className={`h-16 flex items-center border-b shrink-0 ${cur.border} ${isCollapsed && !isSidebarOpen ? 'justify-center' : 'px-6'}`}>
            <span className="font-black text-xl tracking-tighter " style={{ color: activeTheme.primary }}>{isCollapsed && !isSidebarOpen ? 'S' : 'SIMARA v1.0'}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <NavItem href="/dashboard/admin" icon={<IconDashboard />} label={t('dashboard')} active={pathname === '/dashboard/admin'} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
            <NavItem href="/dashboard/admin/pengguna" icon={<IconUsers />} label={t('master_user')} active={pathname === '/dashboard/admin/pengguna'} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
            
            <hr className={`mx-2 my-4 border-t ${cur.border} opacity-50`} />

            <NavGroup icon={<IconRef />} label={t('master_ref')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} isOpen={openGroup === 'ref'} onClick={() => setOpenGroup(openGroup === 'ref' ? null : 'ref')} setSidebarOpen={setSidebarOpen}
              submenus={[
                { label: t('school_data'), href: "/dashboard/admin/referensi/sekolah", icon: <SubIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> },
                { label: t('academic_year'), href: "/dashboard/admin/referensi/tahun", icon: <SubIcon d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"/> },
                { label: t('teacher_data'), href: "/dashboard/admin/referensi/guru", icon: <SubIcon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> },
                { label: t('student_data'), href: "/dashboard/admin/referensi/siswa", icon: <SubIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> },
                { label: t('class_data'), href: "/dashboard/admin/referensi/kelas", icon: <SubIcon d="M3 3h18v18H3z M3 9h18 M9 21V9"/> },
                { label: t('subject_data'), href: "/dashboard/admin/referensi/mapel", icon: <SubIcon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/> },
                { label: t('ekskul_data'), href: "/dashboard/admin/referensi/ekskul", icon: <SubIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/> },
                { label: t('mapel_group'), href: "/dashboard/admin/referensi/kelompok", icon: <SubIcon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"/> },
                { label: t('mapping_rapor'), href: "/dashboard/admin/referensi/mapping-rapor", icon: <SubIcon d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-1-5 5 5 0 0 1 5-5h3m-1 5h8"/> },
                { label: t('logo_ttd'), href: "/dashboard/admin/referensi/logo", icon: <SubIcon d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/> },
                { label: t('rapor_date'), href: "/dashboard/admin/referensi/tanggal", icon: <SubIcon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/> },
                { label: t('student_photo'), href: "/dashboard/admin/referensi/foto", icon: <SubIcon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> }
              ]}
            />

            <NavGroup icon={<IconCoKuler />} label={t('master_kokul')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} isOpen={openGroup === 'kokul'} onClick={() => setOpenGroup(openGroup === 'kokul' ? null : 'kokul')} setSidebarOpen={setSidebarOpen}
              submenus={[
                { label: t('theme_list'), href: "/dashboard/admin/kokurikuler/tema", icon: <SubIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/> },
                { label: t('activity'), href: "/dashboard/admin/kokurikuler/kegiatan", icon: <SubIcon d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"/> },
                { label: t('kokul_group'), href: "/dashboard/admin/kokurikuler/kelompok", icon: <SubIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> }
              ]}
            />

            <NavItem href="/dashboard/admin/p5" icon={<IconStar />} label={t('p5')} active={pathname.includes('/p5')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
            <NavItem href="/dashboard/admin/pkl" icon={<IconBriefcase />} label={t('pkl')} active={pathname.includes('/pkl')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />

            <NavGroup icon={<IconEdit />} label={t('master_nilai')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} isOpen={openGroup === 'nilai'} onClick={() => setOpenGroup(openGroup === 'nilai' ? null : 'nilai')} setSidebarOpen={setSidebarOpen}
              submenus={[
                { label: t('penilaian'), href: "/dashboard/admin/nilai", icon: <SubIcon d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> },
                { label: t('ekskul_nilai'), href: "/dashboard/admin/ekskul-nilai", icon: <SubIcon d="M13 10V3L4 14h7v7l9-11h-7z"/> },
                { label: t('absensi_catatan'), href: "/dashboard/admin/absensi", icon: <SubIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/> },
                { label: t('legger'), href: "/dashboard/admin/legger", icon: <SubIcon d="M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18"/> }
              ]}
            />

            <NavGroup icon={<IconPrinter />} label={t('master_cetak')} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} isOpen={openGroup === 'cetak'} onClick={() => setOpenGroup(openGroup === 'cetak' ? null : 'cetak')} setSidebarOpen={setSidebarOpen}
              submenus={[
                { label: t('rapor_biasa'), href: "/dashboard/admin/rapor", icon: <SubIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8"/> }
              ]}
            />

            <hr className={`mx-2 my-4 border-t ${cur.border} opacity-50`} />
            <NavItem href="/dashboard/admin/pengaturan" icon={<IconSettings />} label={t('setting')} active={pathname === '/dashboard/admin/pengaturan'} isCollapsed={isCollapsed} isSidebarOpen={isSidebarOpen} cur={cur} primary={activeTheme.primary} setSidebarOpen={setSidebarOpen} />
          </div>

          <div className={`p-3 border-t shrink-0 ${cur.border}`}>
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-2.5 ${cur.radius} text-red-500 font-bold ${cur.hover} transition-all ${isCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}>
              <IconLogout /> {(!isCollapsed || isSidebarOpen) && <span className="text-sm">{t('logout')}</span>}
            </button>
          </div>
        </aside>

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
              <h2 className="font-black text-[10px] uppercase tracking-[0.3em] hidden sm:block opacity-40">Admin Panel</h2>
            </div>

            <div className="flex items-center gap-4">
               <div className={`flex items-center ${cur.bg} p-1 ${cur.radius} border ${cur.border} gap-0.5 shadow-sm`}>
                  {['light', 'dark', 'read'].map((m: any) => (
                    <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 ${cur.radius} text-[10px] font-black uppercase transition-all duration-300 ${mode === m ? 'text-white shadow-lg scale-105' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: mode === m ? activeTheme.primary : 'transparent' }}>{m[0]}</button>
                  ))}
                  
                  <div className={`w-[1px] h-4 ${cur.border} mx-1 opacity-50`}></div>
                  
                  {/* --- TOMBOL MODE ANAK (MENGGANTIKAN X ON) --- */}
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

                  {/* Tombol LOCK (Mandiri) */}
                  <button onClick={() => setIsLocked(true)} className={`px-3 py-1.5 ${cur.radius} text-[10px] font-black transition-all bg-red-500 text-white shadow-lg active:rotate-12`}>
                    LOCK
                  </button>
               </div>

               <div className={`w-9 h-9 ${cur.radius} flex items-center justify-center text-white text-xs font-black shadow-lg`} style={{ backgroundColor: activeTheme.primary }}>
                {profile?.full_name?.charAt(0) || 'D'}
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
    <Link 
      href={href} 
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center transition-all duration-300 group ${active ? 'text-white shadow-lg shadow-blue-500/20' : `hover:translate-x-1 active:scale-95`} ${isCollapsed && !isSidebarOpen ? 'w-12 h-12 justify-center mx-auto' : 'gap-3 p-3'} ${cur.radius}`} 
      style={{ backgroundColor: active ? primary : 'transparent', color: active ? 'white' : 'inherit' }}
    >
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>{icon}</span> 
      {(!isCollapsed || isSidebarOpen) && <span className={`font-bold text-sm tracking-tight truncate ${!active ? 'opacity-70' : ''}`}>{label}</span>}
    </Link>
  );
}

function NavGroup({ icon, label, isCollapsed, isSidebarOpen, cur, primary, isOpen, onClick, submenus, setSidebarOpen }: any) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      <button onClick={onClick} className={`flex items-center transition-all duration-300 group ${isOpen ? `shadow-sm` : `hover:translate-x-1 active:scale-95`} ${isCollapsed && !isSidebarOpen ? 'w-12 h-12 justify-center mx-auto' : 'w-full justify-between p-3'} ${cur.radius}`} style={{ backgroundColor: isOpen ? `${primary}15` : 'transparent', color: isOpen ? primary : 'inherit' }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`${isOpen ? 'opacity-100' : 'opacity-70'}`}>{icon}</span> 
          {(!isCollapsed || isSidebarOpen) && <span className={`font-bold text-sm tracking-tight truncate ${!isOpen ? 'opacity-70' : ''}`}>{label}</span>}
        </div>
        {(!isCollapsed || isSidebarOpen) && <IconChevron open={isOpen} />}
      </button>
      {(!isCollapsed || isSidebarOpen) && isOpen && (
        <div className={`ml-4 pl-4 border-l-2 space-y-1 py-1 animate-in slide-in-from-top-2 fade-in duration-300 origin-top`} style={{ borderColor: `${primary}20` }}>
          {submenus.map((sub: any, i: number) => (
            <Link 
              key={i} 
              href={sub.href} 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${pathname === sub.href ? `bg-blue-600/5` : `hover:bg-gray-500/5 opacity-70 hover:opacity-100`}`} 
              style={{ color: pathname === sub.href ? primary : 'inherit' }}
            >
              <span className={`transition-transform duration-200 ${pathname === sub.href ? 'scale-125' : ''}`}>{sub.icon}</span>
              <span className="truncate">{sub.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}