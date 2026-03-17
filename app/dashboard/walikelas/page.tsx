"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../layout';

// --- ICONS KHUSUS WALIKELAS ---
const IconAbsen = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" y1="8" x2="23" y2="8"></line><line x1="17" y1="12" x2="23" y2="12"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
const IconSiswa = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const IconRapor = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

export default function WalikelasPage() {
  const router = useRouter();
  const { cur, profile, loading } = useTheme();

  // --- SECURITY GATE: HANYA WALIKELAS/ADMIN ---
  useEffect(() => {
    if (!loading && profile) {
      const userRoles = profile.roles || [profile.role];
      const isWalikelas = userRoles.some((r: string) => r?.toLowerCase() === 'walikelas' || r?.toLowerCase() === 'admin');
      
      if (!isWalikelas) {
        const target = userRoles[0]?.toLowerCase() || 'siswa';
        router.push(`/dashboard/${target}`);
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile) return <div className={`min-h-screen ${cur.bg} flex items-center justify-center font-black italic opacity-20 uppercase tracking-widest`}>Memuat Data Kelas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Profile Walikelas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic">Dashboard Walikelas</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Halo, {profile.full_name}. Selamat memantau perkembangan anak didik Anda.</p>
        </div>
        <div className={`px-6 py-2 rounded-2xl border ${cur.border} ${cur.card} flex items-center gap-3`}>
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Kelas XI RPL 1</span>
        </div>
      </div>

      {/* Widget Utama Walikelas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Jumlah Siswa', value: '36', sub: '20 Laki-laki / 16 Perempuan', icon: <IconSiswa />, color: 'bg-blue-600' },
          { label: 'Kehadiran Hari Ini', value: '98%', sub: '1 Siswa Sakit (Budi)', icon: <IconAbsen />, color: 'bg-green-600' },
          { label: 'Status Rapor', value: '12/36', sub: 'Siswa Selesai Dinilai', icon: <IconRapor />, color: 'bg-purple-600' },
        ].map((item, i) => (
          <div key={i} className={`${cur.card} p-8 rounded-[2.5rem] border ${cur.border} shadow-sm group hover:-translate-y-1 transition-all duration-500`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cur.textMuted}`}>{item.label}</span>
              <div className={`w-10 h-10 ${item.color} text-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}>
                {item.icon}
              </div>
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-1 italic">{item.value}</h4>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tugas Walikelas Quick Links */}
        <div className={`${cur.card} rounded-[2.5rem] border ${cur.border} p-8 space-y-4`}>
          <h4 className="font-black text-sm uppercase tracking-widest italic mb-2">Manajemen Kelas</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className={`p-4 rounded-2xl border ${cur.border} ${cur.hover} text-left transition-all`}>
              <p className="text-[10px] font-black opacity-30 uppercase mb-1">Daftar</p>
              <p className="text-xs font-black">Data Siswa</p>
            </button>
            <button className={`p-4 rounded-2xl border ${cur.border} ${cur.hover} text-left transition-all`}>
              <p className="text-[10px] font-black opacity-30 uppercase mb-1">Laporan</p>
              <p className="text-xs font-black">Absensi Bulanan</p>
            </button>
            <button className={`p-4 rounded-2xl border ${cur.border} ${cur.hover} text-left transition-all`}>
              <p className="text-[10px] font-black opacity-30 uppercase mb-1">Input</p>
              <p className="text-xs font-black">Catatan Wali</p>
            </button>
            <button className={`p-4 rounded-2xl border ${cur.border} ${cur.hover} text-left transition-all`}>
              <p className="text-[10px] font-black opacity-30 uppercase mb-1">Cetak</p>
              <p className="text-xs font-black">Leger Nilai</p>
            </button>
          </div>
        </div>

        {/* Notifikasi / Warning */}
        <div className={`bg-orange-500/10 border border-orange-500/20 rounded-[2.5rem] p-8`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest italic">Perhatian Wali</h4>
            </div>
            <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></span>
                    <p className="text-sm font-medium opacity-80 leading-tight">3 Siswa belum melunasi iuran Tabungan PKL.</p>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></span>
                    <p className="text-sm font-medium opacity-80 leading-tight">Siswa atas nama **Rendi** sudah 3 hari tidak masuk tanpa keterangan.</p>
                </li>
            </ul>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-20 italic">Dashboard Walikelas • Portal SIMARA</p>
      </div>
    </div>
  );
}