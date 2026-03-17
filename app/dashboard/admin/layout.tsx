"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// --- BAGIAN CONTEXT ---
const ThemeContext = createContext<any>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      cur: { bg: "bg-gray-50", sidebar: "bg-white", text: "text-gray-900", textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", card: "bg-white" }
    };
  }
  return context;
};

// --- ICONS (Main) ---
const IconDashboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconRef = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IconCoKuler = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconBriefcase = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconEdit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPrinter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconChevron = ({ open }: { open: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-500 ease-out ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>;

const SubIcon = ({ d }: { d: string }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const [isLocked, setIsLocked] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [unlockPass, setUnlockPass] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // --- STATE DETEKSI PROFIL ---
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // --- LOGIKA PENGECEKAN PROFIL (SOLUSI ERROR) ---
  useEffect(() => {
    const checkProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Kita cari profil berdasarkan ID (Paling Akurat!)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    checkProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const themes = {
    light: { bg: "bg-gray-50", sidebar: "bg-white", text: "text-gray-900", textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", card: "bg-white" },
    dark: { bg: "bg-gray-950", sidebar: "bg-gray-900", text: "text-gray-100", textMuted: "text-gray-400", border: "border-gray-800", hover: "hover:bg-gray-800", card: "bg-gray-900" },
    read: { bg: "bg-[#F4ECD8]", sidebar: "bg-[#EFE5CD]", text: "text-[#5B4636]", textMuted: "text-[#8C7662]", border: "border-[#E2D1B3]", hover: "hover:bg-[#E8D9B5]", card: "bg-[#F9F3E5]" }
  };

  const cur = themes[mode];

  const toggleGroup = (name: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenGroup(openGroup === name ? null : name);
  };

  // --- TAMPILAN JIKA PROFIL TIDAK DITEMUKAN ---
  if (!loading && !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${cur.bg} ${cur.text}`}>
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-[2rem] mx-auto flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Profil Tidak Ditemukan</h1>
          <p className="text-sm opacity-60 font-medium">Akun Anda terdaftar di sistem login, tapi data profil Anda di database belum sinkron. Hubungi Admin atau cek SQL Editor.</p>
          <button onClick={handleLogout} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">KELUAR & COBA LAGI</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className={`min-h-screen ${cur.bg} flex items-center justify-center font-black italic opacity-20`}>SINKRONISASI SISTEM...</div>;

  return (
    <ThemeContext.Provider value={{ cur, mode, setMode, setIsLocked, profile }}>
      <div className={`min-h-screen flex transition-colors duration-700 ease-in-out ${cur.bg} ${cur.text} font-sans`}>
        
        {/* XPRIVASI OVERLAY */}
        {isLocked && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 backdrop-blur-md">
              <div className="w-full max-w-sm text-center space-y-8 text-white">
                <div className="space-y-3">
                   <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-12 transition-transform hover:rotate-0 duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter animate-in zoom-in-90 duration-500">Xprivasi Active</h2>
                   <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Locked by Samsung S26 Ultra Tech</p>
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); setIsVerifying(true); const { data: { user } } = await supabase.auth.getUser(); if (user?.email) { const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: unlockPass }); if (!error) { setIsLocked(false); setUnlockPass(''); } else { alert("Akses Ditolak!"); } } setIsVerifying(false); }} className="space-y-4">
                   <input type="password" autoFocus value={unlockPass} onChange={(e) => setUnlockPass(e.target.value)} placeholder="Password Admin" className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-white text-center text-lg focus:outline-none focus:border-blue-600 transition-all font-bold placeholder:opacity-30" />
                   <button className="w-full bg-white text-black font-black py-4 rounded-2xl active:scale-95 hover:bg-gray-100 transition-all duration-200">{isVerifying ? 'VERIFIKASI...' : 'BUKA AKSES'}</button>
                </form>
                <button onClick={handleLogout} className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-500 transition-colors duration-300">Emergency Logout</button>
              </div>
          </div>
        )}

        {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)}></div>}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 border-r transition-[width,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-72'} ${cur.sidebar} ${cur.border} flex flex-col will-change-[width]`}>
          <div className={`h-16 flex items-center border-b shrink-0 ${cur.border} overflow-hidden relative ${isCollapsed ? 'justify-center' : 'px-6'}`}>
            <span className={`font-black text-blue-600 tracking-tighter text-xl whitespace-nowrap transition-all duration-500 ${isCollapsed ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
              {isCollapsed ? 'S' : 'SIMARA v1.0'}
            </span>
            {isCollapsed && <span className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-xl animate-in zoom-in duration-300">S</span>}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            <NavItem href="/dashboard/admin" icon={<IconDashboard />} label="Dashboard" active={pathname === '/dashboard/admin'} isCollapsed={isCollapsed} cur={cur} />
            <NavItem href="/dashboard/admin/pengguna" icon={<IconUsers />} label="Master Pengguna" active={pathname === '/dashboard/admin/pengguna'} isCollapsed={isCollapsed} cur={cur} />
            
            <hr className={`my-2 ${cur.border} opacity-50`} />

            <NavGroup icon={<IconRef />} label="Master Referensi" isCollapsed={isCollapsed} cur={cur} isOpen={openGroup === 'ref'} onClick={() => toggleGroup('ref')}
              submenus={[
                { label: "Data Sekolah", href: "/dashboard/admin/referensi/sekolah", icon: <SubIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> },
                { label: "Data Tahun Ajaran", href: "/dashboard/admin/referensi/tahun", icon: <SubIcon d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"/> },
                { label: "Data Guru", href: "/dashboard/admin/referensi/guru", icon: <SubIcon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> },
                { label: "Data Siswa", href: "/dashboard/admin/referensi/siswa", icon: <SubIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> },
                { label: "Data Kelas", href: "/dashboard/admin/referensi/kelas", icon: <SubIcon d="M3 3h18v18H3z M3 9h18 M9 21V9"/> },
                { label: "Data Mata Pelajaran", href: "/dashboard/admin/referensi/mapel", icon: <SubIcon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/> },
                { label: "Data Ekstrakurikuler", href: "/dashboard/admin/referensi/ekskul", icon: <SubIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/> },
                { label: "Data Kelompok Mapel", href: "/dashboard/admin/referensi/kelompok", icon: <SubIcon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"/> },
                { label: "Data Mapping Rapor", href: "/dashboard/admin/referensi/mapping", icon: <SubIcon d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3m-1 5h8"/> },
                { label: "Data Logo & TTD", href: "/dashboard/admin/referensi/logo", icon: <SubIcon d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/> },
                { label: "Data Tanggal Rapor", href: "/dashboard/admin/referensi/tanggal", icon: <SubIcon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/> },
                { label: "Foto Siswa", href: "/dashboard/admin/referensi/foto", icon: <SubIcon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> }
              ]}
            />

            <NavGroup icon={<IconCoKuler />} label="Master Kokurikuler" isCollapsed={isCollapsed} cur={cur} isOpen={openGroup === 'kokul'} onClick={() => toggleGroup('kokul')}
              submenus={[
                { label: "Daftar Tema", href: "/dashboard/admin/kokurikuler/tema", icon: <SubIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/> },
                { label: "Kegiatan", href: "/dashboard/admin/kokurikuler/kegiatan", icon: <SubIcon d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7 M16 2v4 M8 2v4 M3 10h18"/> },
                { label: "Kelompok Ko-kulikuler", href: "/dashboard/admin/kokurikuler/kelompok", icon: <SubIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/> }
              ]}
            />

            <NavItem href="/dashboard/admin/p5" icon={<IconStar />} label="Master P5" active={pathname.includes('/p5')} isCollapsed={isCollapsed} cur={cur} />
            <NavItem href="/dashboard/admin/pkl" icon={<IconBriefcase />} label="Master PKL" active={pathname.includes('/pkl')} isCollapsed={isCollapsed} cur={cur} />

            <NavGroup icon={<IconEdit />} label="Master Penilaian" isCollapsed={isCollapsed} cur={cur} isOpen={openGroup === 'nilai'} onClick={() => toggleGroup('nilai')}
              submenus={[
                { label: "Penilaian", href: "/dashboard/admin/nilai/input", icon: <SubIcon d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> },
                { label: "Ekstrakurikuler", href: "/dashboard/admin/nilai/ekskul", icon: <SubIcon d="M13 10V3L4 14h7v7l9-11h-7z"/> },
                { label: "Absensi Catatan", href: "/dashboard/admin/nilai/absensi", icon: <SubIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/> },
                { label: "Leger", href: "/dashboard/admin/nilai/leger", icon: <SubIcon d="M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18"/> }
              ]}
            />

            <NavGroup icon={<IconPrinter />} label="Master Cetak Rapor" isCollapsed={isCollapsed} cur={cur} isOpen={openGroup === 'cetak'} onClick={() => toggleGroup('cetak')}
              submenus={[
                { label: "Rapor Biasa", href: "/dashboard/admin/cetak/biasa", icon: <SubIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/> },
                { label: "Rapor P5", href: "/dashboard/admin/cetak/p5", icon: <SubIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/> },
                { label: "Rapor Kokulikuler", href: "/dashboard/admin/cetak/kokul", icon: <SubIcon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/> }
              ]}
            />

            <hr className={`my-2 ${cur.border} opacity-50`} />
            <NavItem href="/dashboard/admin/pengaturan" icon={<IconSettings />} label="Pengaturan" active={pathname === '/dashboard/admin/pengaturan'} isCollapsed={isCollapsed} cur={cur} />
          </div>

          <div className={`p-3 border-t shrink-0 ${cur.border}`}>
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-red-500 ${cur.hover} font-bold ${isCollapsed ? 'justify-center' : ''} active:scale-95 transition-all duration-300`}>
              <IconLogout /> {!isCollapsed && <span className="text-sm">Keluar Sistem</span>}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
          <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b ${cur.border} ${cur.sidebar} transition-all duration-500`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.innerWidth < 768 ? setSidebarOpen(true) : setIsCollapsed(!isCollapsed)} 
                className={`p-2 ${cur.hover} rounded-lg active:scale-75 transition-all duration-200 group`}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-blue-600 transition-colors"><path d="M4 6h16M4 12h8m-8 6h16" /></svg>
              </button>
              <h2 className="font-bold tracking-tight hidden sm:block">Panel Admin</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className={`flex items-center ${cur.bg} p-1 rounded-xl border ${cur.border} gap-0.5 shadow-sm`}>
                  {['light', 'dark', 'read'].map((m: any) => (
                    <button 
                      key={m} 
                      onClick={() => setMode(m)} 
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${mode === m ? 'bg-blue-600 text-white shadow-lg scale-105' : 'opacity-40 hover:opacity-100 hover:bg-gray-200/50'}`}
                    >
                      {m[0]}
                    </button>
                  ))}
                  <div className="w-[1px] h-4 bg-gray-300 mx-1 opacity-50"></div>
                  <button onClick={() => setIsLocked(true)} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 active:rotate-12">X</button>
               </div>
               {/* USER AVATAR */}
               <div className={`w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer`}>
                {profile?.full_name?.charAt(0) || 'D'}
               </div>
            </div>
          </header>
          <main className="p-4 md:p-8 overflow-y-auto bg-inherit">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ href, icon, label, active = false, isCollapsed = false, cur }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group
        ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : `${cur.textMuted} ${cur.hover} hover:translate-x-1 active:scale-95`} 
        ${isCollapsed ? 'justify-center' : ''}`}
    >
      <span className={`transition-transform duration-300 ${!active && 'group-hover:scale-110 group-active:scale-90'}`}>{icon}</span> 
      {!isCollapsed && <span className="font-bold text-sm tracking-tight truncate">{label}</span>}
    </Link>
  );
}

function NavGroup({ icon, label, isCollapsed, cur, isOpen, onClick, submenus }: any) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      <button 
        onClick={onClick} 
        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 group
          ${isOpen ? 'bg-blue-600/5 text-blue-600 shadow-sm' : `${cur.textMuted} ${cur.hover} hover:translate-x-1 active:scale-95`} 
          ${isCollapsed ? 'justify-center' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`transition-transform duration-300 ${!isOpen && 'group-hover:scale-110'}`}>{icon}</span> 
          {!isCollapsed && <span className="font-bold text-sm tracking-tight truncate">{label}</span>}
        </div>
        {!isCollapsed && <IconChevron open={isOpen} />}
      </button>
      
      {!isCollapsed && isOpen && (
        <div className="ml-4 pl-4 border-l-2 border-blue-600/10 space-y-1 py-1 animate-in slide-in-from-top-2 fade-in duration-300 origin-top">
          {submenus.map((sub: any, i: number) => (
            <Link 
              key={i} 
              href={sub.href} 
              className={`flex items-center gap-3 p-2 rounded-lg text-[11px] font-bold transition-all duration-200
                ${pathname === sub.href ? 'text-blue-600 bg-blue-600/5' : `${cur.textMuted} hover:text-blue-600 hover:bg-blue-600/5 hover:translate-x-1 active:scale-95 group/sub`}`}
            >
              <span className={`transition-transform duration-200 ${pathname === sub.href ? 'scale-125' : 'opacity-70 group-hover/sub:scale-125'}`}>{sub.icon}</span>
              <span className="truncate">{sub.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}