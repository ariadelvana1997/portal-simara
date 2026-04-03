"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/dashboard/guru/layout'; // Mengambil style Samsung dari layout guru
import { supabase } from '@/lib/supabase';

// --- ICONS (KONSISTEN SAMSUNG STYLE) ---
const IconChart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const IconEdit = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPrinter = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function WalikelasDashboard() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    className: '',
    attendanceRate: 0,
    gradesCompletion: 0
  });

  useEffect(() => {
    if (profile) fetchWalikelasData();
  }, [profile]);

  const fetchWalikelasData = async () => {
    setLoading(true);
    try {
      // 1. Cari kelas di mana Guru ini adalah Walikelasnya
      const { data: classInfo } = await supabase
        .from('classes')
        .select('*')
        .eq('walikelas_id', profile.id)
        .single();

      if (classInfo) {
        // 2. Hitung jumlah siswa di kelas tersebut
        const { count } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classInfo.id);

        setStats({
          totalStudents: count || 0,
          className: classInfo.nama_kelas,
          attendanceRate: 98, // Mock data atau tarik dari attendance_records
          gradesCompletion: 85 // Mock data
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-4 md:p-8 animate-in fade-in duration-700">
      {/* HEADER GREETING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Halo, <span className="text-blue-600">{profile?.full_name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">
            Dashboard Wali Kelas • {stats.className || 'Memuat Kelas...'}
          </p>
        </div>
        <div className="bg-gray-500/5 px-6 py-3 rounded-2xl border border-gray-500/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tahun Ajaran</p>
            <p className="text-sm font-black uppercase">2025/2026</p>
        </div>
      </div>

      {/* STATS OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Siswa" value={stats.totalStudents} sub="Aktif di Kelas" icon={<IconUsers />} color="blue" />
        <StatCard label="Kehadiran" value={`${stats.attendanceRate}%`} sub="Rata-rata Pekan Ini" icon={<IconChart />} color="green" />
        <StatCard label="Progres Nilai" value={`${stats.gradesCompletion}%`} sub="Selesai Diinput" icon={<IconEdit />} color="purple" />
        <StatCard label="Status Rapor" value="Siap" sub="Cetak Rapor Biasa" icon={<IconPrinter />} color="orange" />
      </div>

      {/* QUICK ACCESS MENU GRID (Sesuai Permintaan) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="h-px flex-1 bg-gray-500/10"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Navigasi Utama</span>
           <div className="h-px flex-1 bg-gray-500/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MENU PENILAIAN */}
          <MenuCard 
            title="Penilaian Kelas" 
            desc="Kelola Nilai, Ekskul, Absensi, dan Catatan"
            icon={<IconEdit />}
            color="blue"
            submenus={[
              { name: "Penilaian", link: "/dashboard/walikelas/penilaian" },
              { name: "Ekstrakulikuler", link: "/dashboard/walikelas/ekskul" },
              { name: "Absensi", link: "/dashboard/walikelas/absensi" },
              { name: "Catatan Wali Kelas", link: "/dashboard/walikelas/catatan" }
            ]}
          />

          {/* MENU CETAK RAPOR */}
          <MenuCard 
            title="Master Cetak Rapor" 
            desc="Unduh dan Cetak Laporan Hasil Belajar Siswa"
            icon={<IconPrinter />}
            color="purple"
            submenus={[
              { name: "Rapor Biasa", link: "/dashboard/walikelas/rapor" }
            ]}
          />

          {/* MENU PENGATURAN */}
          <MenuCard 
            title="Pengaturan" 
            desc="Kelola Profil dan Preferensi Dashboard"
            icon={<IconSettings />}
            color="gray"
            submenus={[
              { name: "Profil Saya", link: "/dashboard/walikelas/pengaturan/profil" },
              { name: "Keamanan", link: "/dashboard/walikelas/pengaturan/keamanan" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (SAMSUNG STYLE) ---

function StatCard({ label, value, sub, icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-600/10',
        green: 'text-green-600 bg-green-600/10',
        purple: 'text-purple-600 bg-purple-600/10',
        orange: 'text-orange-600 bg-orange-600/10',
    };
    return (
        <div className={`bg-white border border-gray-100 p-8 rounded-[3rem] shadow-xl shadow-black/5 flex flex-col justify-between min-h-[200px] hover:-translate-y-2 transition-all duration-500`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-4xl font-black tracking-tighter text-gray-900">{value}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-1">{sub}</p>
            </div>
        </div>
    );
}

function MenuCard({ title, desc, icon, color, submenus }: any) {
    const colors: any = {
        blue: 'bg-blue-600 shadow-blue-600/20',
        purple: 'bg-purple-600 shadow-purple-600/20',
        gray: 'bg-slate-900 shadow-slate-900/20',
    };
    return (
        <div className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-2xl space-y-8 flex flex-col">
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl ${colors[color]}`}>{icon}</div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
                    <p className="text-[9px] font-bold text-gray-400 leading-tight mt-1">{desc}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {submenus.map((m: any, i: number) => (
                    <a key={i} href={m.link} className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-blue-600 hover:text-white transition-all duration-300 flex justify-between items-center group">
                        <span className="text-[11px] font-black uppercase tracking-wider">{m.name}</span>
                        <svg className="opacity-0 group-hover:opacity-100 transition-all" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                ))}
            </div>
        </div>
    );
}