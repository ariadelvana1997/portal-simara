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
const IconPrinter = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
);
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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

  // --- STATE STATISTIK & ROLE ---
  const [stats, setStats] = useState({
    mapel_diampu: 0,
    kelas_aktif: 0,
    total_siswa: 0,
    tp_selesai: 0 
  });
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [namaKelasWali, setNamaKelasWali] = useState("");

  // --- FETCH DATA STATISTIK & ROLE CHECK ---
  const fetchData = async (teacherId: string) => {
    try {
      // 1. Cek Role Wali Kelas
      const { data: waliCls } = await supabase
        .from('classes')
        .select('nama_kelas')
        .eq('walikelas_id', teacherId)
        .maybeSingle();
      
      if (waliCls) {
        setIsWaliKelas(true);
        setNamaKelasWali(waliCls.nama_kelas);
      }

      // 2. Ambil data plotting mapel
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, class_id')
        .eq('teacher_id', teacherId);

      if (!subjects) return;

      const uniqueMapelNames = [...new Set(subjects.map(s => s.name.toUpperCase()))];
      const uniqueClassIds = [...new Set(subjects.map(s => s.class_id))];

      // 3. Hitung Total Siswa
      let sCount = 0;
      if (uniqueClassIds.length > 0) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('class_id', uniqueClassIds)
          .contains('roles', ['Siswa']);
        sCount = count || 0;
      }

      // 4. Hitung Tujuan Belajar
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
      console.error("Error fetching guru data:", error);
    }
  };

  useEffect(() => {
    if (!loading && profile) {
      const userRoles = profile.roles || [profile.role];
      const isAuthorized = userRoles.some((r: string) => 
        ['guru', 'walikelas'].includes(r?.toLowerCase())
      );
      
      if (!isAuthorized) {
        router.push('/login');
      } else {
        fetchData(profile.id);
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile) return <div className={`min-h-screen ${cur.bg} flex items-center justify-center font-black  opacity-20 uppercase tracking-widest`}>Sinkronisasi Panel Guru...</div>;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
      {/* Header Greeting */}
      <div className="px-2">
        <h1 className="text-6xl font-black uppercase tracking-tighter  leading-none">
          Malam, <span className="text-blue-600">{profile.full_name.split(' ')[0]}!</span>
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-5">
          <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-blue-600/20">Guru Mata Pelajaran</span>
          {isWaliKelas && (
            <span className="px-5 py-2 bg-purple-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-purple-600/20 animate-in slide-in-from-left duration-700">Wali Kelas {namaKelasWali}</span>
          )}
        </div>
      </div>

      {/* 1. WIDGET STATS GURU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mapel Diampu', value: stats.mapel_diampu, icon: <IconMapel />, color: 'text-blue-600', shadow: 'shadow-blue-500/10' },
          { label: 'Kelas Aktif', value: stats.kelas_aktif, icon: <IconKelas />, color: 'text-orange-600', shadow: 'shadow-orange-500/10' },
          { label: 'Total Siswa', value: stats.total_siswa, icon: <IconSiswa />, color: 'text-green-600', shadow: 'shadow-green-500/10' },
          { label: 'Tujuan Belajar', value: stats.tp_selesai, icon: <IconTP />, color: 'text-purple-600', shadow: 'shadow-purple-500/10' },
        ].map((item, i) => (
          <div key={i} className={`${cur.card} p-8 rounded-[2.5rem] border ${cur.border} shadow-sm ${item.shadow} transition-all duration-500 group hover:-translate-y-1`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. AREA TUGAS GURU (PENILAIAN & KOKURIKULER) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Kartu Utama Penilaian */}
            <div className={`${cur.card} rounded-[3rem] border ${cur.border} shadow-sm overflow-hidden flex flex-col`}>
              <div className={`px-8 py-6 border-b ${cur.border} flex items-center gap-3 bg-gray-500/5`}>
                <span className="text-amber-500"><IconTrophy /></span>
                <h4 className="font-black text-sm uppercase tracking-widest ">Tugas Pengajaran & Proyek</h4>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => router.push('/dashboard/guru/nilai')}
                    className={`group flex items-center gap-6 p-6 rounded-[2rem] border ${cur.border} ${cur.hover} transition-all duration-500 active:scale-95`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><IconMapel /></div>
                    <div className="text-left">
                        <span className="block font-black text-sm uppercase tracking-tight">Penilaian Mapel</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Input Nilai & TP</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => router.push('/dashboard/guru/kokurikuler/input')}
                    className={`group flex items-center gap-6 p-6 rounded-[2rem] border ${cur.border} ${cur.hover} transition-all duration-500 active:scale-95`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg"><IconStar /></div>
                    <div className="text-left">
                        <span className="block font-black text-sm uppercase tracking-tight">Proyek Kokurikuler</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Capaian Profil P5</span>
                    </div>
                  </button>
              </div>

             {/* KHUSUS PANEL WALI KELAS (DYNAMIS) */}
{isWaliKelas && (
  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex items-center gap-3 mb-5 px-2">
          <div className="h-px flex-1 bg-purple-600/10"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-600">Manajemen Kelas {namaKelasWali}</span>
          <div className="h-px flex-1 bg-purple-600/10"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
              { name: 'Absensi', link: '/dashboard/guru/absensi', color: 'bg-purple-50 text-purple-600' },
              { name: 'Ekskul', link: '/dashboard/guru/ekskul', color: 'bg-purple-50 text-purple-600' },
              { name: 'Leger', link: '/dashboard/guru/legger', color: 'bg-purple-50 text-purple-600' }, // UPDATE: Diubah dari 'Catatan' menjadi 'Leger'
              { name: 'Cetak Rapor', link: '/dashboard/guru/rapor', color: 'bg-pink-50 text-pink-600' },
          ].map((m, idx) => (
              <button 
                  key={idx} 
                  onClick={() => router.push(m.link)}
                  className={`p-4 rounded-2xl ${m.color} font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border border-black/5 shadow-sm`}
              >
                  {m.name}
              </button>
          ))}
      </div>
  </div>
)}
              
              <div className={`mt-auto p-5 bg-gray-500/5 text-center border-t ${cur.border}`}>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Sistem Informasi Manajemen Rapor Akademik</p>
              </div>
            </div>
        </div>

        {/* 3. IDENTITAS GURU */}
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} shadow-sm flex flex-col`}>
          <div className={`px-8 py-6 border-b ${cur.border} flex justify-between items-center bg-gray-500/5`}>
            <h4 className="font-black text-sm uppercase tracking-widest ">Profil Pengajar</h4>
          </div>
          <div className="p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-28 h-28 rounded-[3rem] bg-blue-600 text-white flex items-center justify-center text-5xl font-black shadow-2xl shadow-blue-600/30 rotate-3 transition-transform hover:rotate-0 duration-500">
                {profile.full_name[0]}
            </div>
            <div className="space-y-1">
                <h3 className="font-black text-2xl tracking-tighter uppercase">{profile.full_name}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-blue-600`}>
                    {isWaliKelas ? `Wali Kelas ${namaKelasWali}` : 'Guru Mata Pelajaran'}
                </p>
            </div>
            <div className={`w-full p-5 rounded-[2rem] bg-gray-500/5 border ${cur.border} text-left space-y-3`}>
                <div>
                    <p className="text-[8px] font-black uppercase opacity-30 tracking-widest mb-1">Email Terdaftar</p>
                    <p className="text-xs font-bold truncate tracking-tight">{profile.email}</p>
                </div>
                {profile.nuptk && (
                  <div>
                      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest mb-1">NUPTK</p>
                      <p className="text-xs font-bold tracking-tight">{profile.nuptk}</p>
                  </div>
                )}
            </div>
          </div>
          <div className="mt-auto p-6 border-t ${cur.border} text-center">
             <button onClick={() => router.push('/dashboard/guru/pengaturan')} className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] hover:scale-110 transition-all active:scale-95">Pengaturan Akun</button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className={`text-center pt-10`}>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-20 ">SIMARA V1.0 • Built with Passion by DELVANA</p>
      </div>
    </div>
  );
}