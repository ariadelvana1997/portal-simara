"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './layout'; // Mengambil context dari layout
import { supabase } from '@/lib/supabase';

// --- PREMIUM SVG ICONS ---
const IconSiswa = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconKelas = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);
const IconMapel = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const IconTP = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
);

export default function GuruPage() {
  const router = useRouter();
  const themeContext = useTheme();
  
  // Ambil data dari context layout
  const cur = themeContext?.cur || { 
    card: "bg-white", text: "text-gray-900", border: "border-gray-200", textMuted: "text-gray-500", bg: "bg-gray-50", hover: "hover:bg-gray-100" 
  };
  const profile = themeContext?.profile;
  const loading = themeContext?.loading;

  // --- STATE STATISTIK SPESIFIK GURU ---
  const [stats, setStats] = useState({
    mapel_diampu: 0,
    kelas_aktif: 0,
    total_siswa: 0,
    tp_selesai: 0 
  });

  // --- FETCH DATA STATISTIK SINKRON (REVISI) ---
  const fetchStats = async (teacherId: string) => {
    try {
      // 1. Ambil data plotting mapel untuk guru ini
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, class_id')
        .eq('teacher_id', teacherId);

      if (!subjects) return;

      // Logika Mapel Diampu: Dihitung berdasarkan keunikan Nama Mapel
      const uniqueMapelNames = [...new Set(subjects.map(s => s.name.toUpperCase()))];
      
      // Logika Kelas Aktif: Dihitung berdasarkan keunikan ID Kelas
      const uniqueClassIds = [...new Set(subjects.map(s => s.class_id))];

      // 2. Hitung Total Siswa: Berdasarkan jumlah siswa di kelas-kelas unik tersebut
      let sCount = 0;
      if (uniqueClassIds.length > 0) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('class_id', uniqueClassIds)
          .contains('roles', ['Siswa']);
        sCount = count || 0;
      }

      // 3. Hitung Tujuan Belajar: Total TP yang terhubung ke mapel-mapel guru ini
      const subjectIds = subjects.map(s => s.id);
      let tpCount = 0;
      if (subjectIds.length > 0) {
        const { count } = await supabase
          .from('learning_objectives')
          .select('*', { count: 'exact', head: true })
          .in('subject_id', subjectIds);
        tpCount = count || 0;
      }

      setStats({
        mapel_diampu: uniqueMapelNames.length,
        kelas_aktif: uniqueClassIds.length,
        total_siswa: sCount,
        tp_selesai: tpCount
      });
    } catch (error) {
      console.error("Error fetching guru stats:", error);
    }
  };

  // --- SECURITY CHECK & INITIAL FETCH ---
  useEffect(() => {
    if (!loading && profile) {
      const userRoles = profile.roles || [profile.role];
      const isAuthorized = userRoles.some((r: string) => 
        ['guru', 'walikelas'].includes(r?.toLowerCase())
      );
      
      if (!isAuthorized) {
        router.push('/login');
      } else {
        fetchStats(profile.id);
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile) return <div className={`min-h-screen ${cur.bg} flex items-center justify-center font-black italic opacity-20 uppercase tracking-widest`}>Sinkronisasi Panel Guru...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter ">Dashboard Akademik</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Selamat datang, Bapak/Ibu {profile.full_name.split(' ')[0]}. Siap mengolah nilai hari ini?</p>
        </div>
      </div>

      {/* 1. WIDGET STATS GURU (Data Sinkron) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mapel Diampu', value: stats.mapel_diampu, icon: <IconMapel />, color: 'text-blue-600', shadow: 'shadow-blue-500/10' },
          { label: 'Kelas Aktif', value: stats.kelas_aktif, icon: <IconKelas />, color: 'text-orange-600', shadow: 'shadow-orange-500/10' },
          { label: 'Total Siswa', value: stats.total_siswa, icon: <IconSiswa />, color: 'text-green-600', shadow: 'shadow-green-500/10' },
          { label: 'Tujuan Belajar', value: stats.tp_selesai, icon: <IconTP />, color: 'text-purple-600', shadow: 'shadow-purple-500/10' },
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
        
        {/* 2. DAFTAR MATA PELAJARAN AKTIF */}
        <div className={`lg:col-span-2 ${cur.card} rounded-[2.5rem] border ${cur.border} shadow-sm overflow-hidden flex flex-col`}>
          <div className={`px-8 py-6 border-b ${cur.border} flex items-center gap-3 bg-gray-500/5`}>
            <span className="text-amber-500 animate-pulse"><IconTrophy /></span>
            <h4 className="font-black text-sm uppercase tracking-widest ">Monitoring Nilai Kelas</h4>
          </div>
          <div className="p-8 space-y-4">
            <p className={`${cur.textMuted} text-xs font-bold uppercase tracking-widest opacity-40 mb-2`}>Akses Cepat Penilaian:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Mulai Input Nilai Formatif', 'Rekap Nilai Sumatif', 'Cek Deskripsi CP', 'Analisis Hasil Belajar'].map((task, i) => (
                <button 
                    key={i} 
                    onClick={() => router.push('/dashboard/guru/nilai')}
                    className={`group flex items-center justify-between p-5 rounded-[1.5rem] border ${cur.border} ${cur.hover} transition-all duration-300 active:scale-95 hover:border-blue-600/30`}
                >
                    <span className="font-black text-sm tracking-tight">{task}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"></path></svg>
                    </div>
                </button>
                ))}
            </div>
          </div>
          <div className={`mt-auto p-5 bg-gray-500/5 text-center border-t ${cur.border}`}>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Sistem Penilaian Kurikulum Merdeka</p>
          </div>
        </div>

        {/* 3. INFO STATUS LOGIN */}
        <div className={`${cur.card} rounded-[2.5rem] border ${cur.border} shadow-sm flex flex-col`}>
          <div className={`px-8 py-6 border-b ${cur.border} flex justify-between items-center bg-gray-500/5`}>
            <h4 className="font-black text-sm uppercase tracking-widest ">Identitas Guru</h4>
          </div>
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-600/30 rotate-3">
                {profile.full_name[0]}
            </div>
            <div className="space-y-1">
                <h3 className="font-black text-xl tracking-tighter uppercase">{profile.full_name}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-blue-600`}>
                    {profile.roles?.includes('Walikelas') ? 'Wali Kelas & Pengajar' : 'Guru Mata Pelajaran'}
                </p>
            </div>
            <div className={`w-full p-4 rounded-2xl bg-gray-500/5 border ${cur.border} text-left`}>
                <p className="text-[9px] font-black uppercase opacity-30 mb-1">Email SIMARA</p>
                <p className="text-xs font-bold truncate">{profile.email}</p>
            </div>
          </div>
          <div className="mt-auto p-6 border-t ${cur.border} text-center">
             <button onClick={() => router.push('/dashboard/guru/pengaturan')} className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] hover:scale-110 transition-all active:scale-95">Edit Profil</button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className={`text-center pt-12`}>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-20">SIMARA V1.0 • by DELVANA bersama Ceu Ai</p>
      </div>
    </div>
  );
}