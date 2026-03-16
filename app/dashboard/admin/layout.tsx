"use client";
import React, { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- BAGIAN CONTEXT UNTUK FIX BUG CLONE ELEMENT ---
const ThemeContext = createContext<any>(null);

// Hook useTheme untuk digunakan di page.tsx
export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Fallback agar tidak error saat proses build/prerender
  if (!context) {
    return {
      cur: { bg: "bg-gray-50", sidebar: "bg-white", text: "text-gray-900", textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", card: "bg-white" }
    };
  }
  return context;
};

// Icons
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const router = useRouter();

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

  return (
    <ThemeContext.Provider value={{ cur, mode, setMode }}>
      <div className={`min-h-screen flex transition-colors duration-500 ${cur.bg} ${cur.text}`}>
        
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 border-r 
          transition-[width,transform] duration-300 ease-in-out 
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          ${cur.sidebar} ${cur.border}
          will-change-[width,transform]
        `}>
          <div className={`h-16 flex items-center px-6 border-b ${cur.border} overflow-hidden`}>
            <span className="font-black text-blue-600 tracking-tighter text-xl">
              {isCollapsed ? 'S' : 'SIMARA e-Rapor v1.0'}
            </span>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <NavItem icon={<IconDashboard />} label="Dashboard" active isCollapsed={isCollapsed} cur={cur} />
            <NavItem icon={<IconUsers />} label="Pengguna" isCollapsed={isCollapsed} cur={cur} />
          </nav>

          <div className={`p-3 border-t ${cur.border}`}>
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-red-500 ${cur.hover} transition-all font-semibold ${isCollapsed ? 'justify-center' : ''}`}>
              <IconLogout />
              {!isCollapsed && <span className="text-sm">Keluar Sistem</span>}
            </button>
          </div>
        </aside>

        {/* MAIN (DITAMBAHKAN TRANSISI DI SINI AGAR SINKRON DENGAN SIDEBAR) */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b ${cur.border} ${cur.sidebar} transition-colors duration-500`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(true);
                  else setIsCollapsed(!isCollapsed);
                }}
                className={`p-2 ${cur.hover} rounded-lg transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
                </svg>
              </button>
              <h2 className="font-bold tracking-tight hidden sm:block">Panel Admin</h2>
            </div>

            <div className="flex items-center gap-4">
               <div className={`flex ${cur.bg} p-1 rounded-xl border ${cur.border}`}>
                  <button onClick={() => setMode('light')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'light' ? 'bg-blue-600 text-white shadow-md' : cur.textMuted}`}>L</button>
                  <button onClick={() => setMode('dark')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'dark' ? 'bg-blue-600 text-white shadow-md' : cur.textMuted}`}>D</button>
                  <button onClick={() => setMode('read')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'read' ? 'bg-blue-600 text-white shadow-md' : cur.textMuted}`}>R</button>
               </div>
               
               <div className={`w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/30`}>
                  D
               </div>
            </div>
          </header>

          <main className="p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
               {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

function NavItem({ icon, label, active = false, isCollapsed = false, cur }: any) {
  return (
    <a href="#" className={`
      flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200
      ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : `${cur.textMuted} ${cur.hover}`}
      ${isCollapsed ? 'justify-center' : ''}
    `}>
      {icon}
      {!isCollapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
    </a>
  );
}