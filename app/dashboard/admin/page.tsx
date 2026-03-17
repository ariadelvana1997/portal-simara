"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './layout'; // Mengambil context dari layout

// --- PREMIUM SVG ICONS (Gaya Clean & Profesional) ---
const IconSiswa = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconGuru = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
);
const IconKelas = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);
const IconMapel = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
);

export default function AdminPage() {
  const router = useRouter();
  const themeContext = useTheme();
  
  // Ambil data dari context layout
  const cur = themeContext?.cur || { 
    card: "bg-white", text: "text-gray-900", border: "border-gray-200", textMuted: "text-gray-500", bg: "bg-gray-50", hover: "hover:bg-gray-100" 
  };
  const profile = themeContext?.profile;
  const loading = themeContext?.loading;

  // --- SECURITY CHECK: HANYA ADMIN YANG BOLEH DI SINI ---
  useEffect(() => {
    if (!loading && profile) {
      // Cek roles (array) atau role (string cadangan)
      const userRoles = profile.roles || [profile.role];
      const isAdmin = userRoles.some((r: string) => r?.toLowerCase() === 'admin');
      
      if (!isAdmin) {
        // Jika bukan admin, pentalin ke dashboard yang sesuai rolenya
        const target = userRoles[0]?.toLowerCase() || 'siswa';
        router.push(`/dashboard/${target}`);
      }
    }
  }, [profile, loading, router]);

  // Jika sedang loading atau bukan admin, tampilkan layar kosong/loading tipis
  if (loading || !profile) return <div className={`min-h-screen ${cur.bg} flex items-center justify-center font-black italic opacity-20 uppercase tracking-widest`}>Memverifikasi Akses...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter ">Ringkasan Statistik</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Selamat datang kembali, {profile.full_name}. Berikut adalah ikhtisar data hari ini.</p>
        </div>
      </div>

      {/* 1. WIDGET UTAMA (Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Siswa', value: '856', icon: <IconSiswa />, color: 'text-blue-600', shadow: 'shadow-blue-500/10' },
          { label: 'Total Guru', value: '45', icon: <IconGuru />, color: 'text-green-600', shadow: 'shadow-green-500/10' },
          { label: 'Total Kelas', value: '24', icon: <IconKelas />, color: 'text-purple-600', shadow: 'shadow-purple-500/10' },
          { label: 'Total Mapel', value: '18', icon: <IconMapel />, color: 'text-orange-600', shadow: 'shadow-orange-500/10' },
        ].map((item, i) => (
          <div key={i} className={`${cur.card} p-8 rounded-[2rem] border ${cur.border} shadow-sm ${item.shadow} transition-all duration-500 group hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cur.textMuted}`}>{item.label}</span>
              <div className={`${item.color} opacity-80 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                {item.icon}
              </div>
            </div>
            <h4 className="text-5xl font-black tracking-tighter leading-none ">{item.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. WIDGET TOP 10 PERKELAS (Links) */}
        <div className={`lg:col-span-2 ${cur.card} rounded-[2.5rem] border ${cur.border} shadow-sm overflow-hidden flex flex-col`}>
          <div className={`px-8 py-6 border-b ${cur.border} flex items-center gap-3 bg-gray-500/5`}>
            <span className="text-amber-500 animate-bounce"><IconTrophy /></span>
            <h4 className="font-black text-sm uppercase tracking-widest ">Top 10 Siswa Per Kelas</h4>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['X RPL 1', 'X RPL 2', 'XI DKV 1', 'XI DKV 2', 'XII TKJ 1', 'XII TKJ 2'].map((kelas, i) => (
              <a 
                key={i} 
                href={`#`} 
                className={`group flex items-center justify-between p-5 rounded-[1.5rem] border ${cur.border} ${cur.hover} transition-all duration-300 active:scale-95 hover:shadow-md hover:border-blue-600/30`}
              >
                <span className="font-black text-sm tracking-tight">{kelas}</span>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-blue-600 group-hover:translate-x-1 transition-transform">
                    Lihat Rangking 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M9 18l6-6-6-6"></path></svg>
                </div>
              </a>
            ))}
          </div>
          <div className={`mt-auto p-5 bg-gray-500/5 text-center border-t ${cur.border}`}>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] cursor-pointer hover:text-blue-600 hover:underline transition-all">Lihat Semua Kelas</p>
          </div>
        </div>

        {/* 3. WIDGET USER AKTIF (Online Users) */}
        <div className={`${cur.card} rounded-[2.5rem] border ${cur.border} shadow-sm flex flex-col`}>
          <div className={`px-8 py-6 border-b ${cur.border} flex justify-between items-center bg-gray-500/5`}>
            <h4 className="font-black text-sm uppercase tracking-widest ">Sesi Aktif</h4>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">4 Online</span>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {[
              { name: 'Delvana Admin', role: 'Administrator', status: 'Sekarang' },
              { name: 'Iwan Setiawan', role: 'Guru Mapel', status: '2m ago' },
              { name: 'Sari Rahayu', role: 'Walikelas', status: '5m ago' },
              { name: 'Budi Santoso', role: 'Siswa', status: '12m ago' },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl ${i === 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-blue-600/10 text-blue-600'} flex items-center justify-center font-black text-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                    {user.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${i < 3 ? 'bg-green-500' : 'bg-gray-300'} border-4 ${cur.card.includes('white') ? 'border-white' : 'border-gray-900'} rounded-full`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate tracking-tight group-hover:text-blue-600 transition-colors">{user.name}</p>
                  <p className={`text-[9px] font-black uppercase opacity-40 tracking-widest`}>{user.role}</p>
                </div>
                <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">{user.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-6 border-t ${cur.border} text-center">
             <button className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] hover:scale-110 transition-all active:scale-95">Pantau Aktivitas</button>
          </div>
        </div>

      </div>

      {/* Footer Quote / Info */}
      <div className={`text-center pt-12`}>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-20">Portal SIMARA V1.0 By DELVANA dan Ceu Ai</p>
      </div>
    </div>
  );
}