"use client";
import React from 'react';
import { useTheme } from '../admin/layout'; // Pastikan path context-nya benar

export default function GuruDashboard() {
  const { cur, profile } = useTheme();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-black tracking-tighter ">Dashboard Guru</h1>
      <p className={`${cur.textMuted} text-sm`}>Selamat mengajar, {profile?.full_name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${cur.card} p-8 rounded-[2.5rem] border ${cur.border}`}>
          <h4 className="font-black text-xs uppercase tracking-widest mb-4">Jadwal Hari Ini</h4>
          <p className="opacity-50 ">Belum ada jadwal mengajar untuk hari ini.</p>
        </div>
        <div className={`${cur.card} p-8 rounded-[2.5rem] border ${cur.border}`}>
          <h4 className="font-black text-xs uppercase tracking-widest mb-4">Input Nilai Cepat</h4>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Buka Daftar Kelas</button>
        </div>
      </div>
    </div>
  );
}