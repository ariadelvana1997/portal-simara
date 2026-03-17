"use client";
import React from 'react';
import { useTheme } from '../admin/layout';

export default function SiswaDashboard() {
  const { cur, profile } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black tracking-tighter italic">Halo, {profile?.full_name?.split(' ')[0]}!</h1>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl font-black mb-2">Lihat Hasil Belajarmu</h2>
        <p className="opacity-80 text-sm mb-6 font-medium text-blue-100">Rapor semester ganjil sudah tersedia untuk diunduh.</p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Cetak Rapor</button>
      </div>
    </div>
  );
}