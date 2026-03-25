"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout'; // Mengambil context dari GuruLayout
import { supabase } from '@/lib/supabase';

export default function PengaturanGuru() {
  const { cur, profile, t, appConfig, setAppConfig, mode, setMode } = useTheme();
  
  // State Form Profil
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  
  // State Form Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LOGIKA UPDATE PROFIL ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);

    if (!error) {
      alert("✅ Profil Berhasil Diperbarui!");
    } else {
      alert("🚨 Gagal: " + error.message);
    }
    setIsUpdating(false);
  };

  // --- LOGIKA GANTI PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Password tidak cocok!");
    if (password.length < 6) return alert("Password minimal 6 karakter!");

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: password });

    if (!error) {
      alert("✅ Password Berhasil Diganti!");
      setPassword('');
      setConfirmPassword('');
    } else {
      alert("🚨 Gagal: " + error.message);
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Pengaturan Akun</h1>
        <p className={`${cur.textMuted} text-sm font-medium italic`}>Personalisasi identitas dan keamanan akses Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. KARTU PROFIL LENGKAP */}
        <div className="space-y-6">
          <section className={`${cur.card} border ${cur.border} rounded-[2.5rem] p-8 shadow-sm space-y-6`}>
            <div className="flex items-center gap-4 border-b ${cur.border} pb-6">
               <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20 rotate-3">
                  {fullName[0] || 'G'}
               </div>
               <div>
                  <h4 className="font-black uppercase text-xs tracking-widest opacity-30">Informasi Publik</h4>
                  <p className="font-bold text-lg leading-tight uppercase">{fullName}</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} 
                />
              </div>
              <div className="space-y-1 opacity-50">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Email (ID Login)</label>
                <input 
                  type="email" 
                  value={email} 
                  readOnly
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl font-bold text-sm cursor-not-allowed`} 
                />
              </div>
              <button disabled={isUpdating} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </section>

          {/* PREFERENSI TAMPILAN */}
          <section className={`${cur.card} border ${cur.border} rounded-[2.5rem] p-8 shadow-sm space-y-6`}>
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-30">Preferensi Antarmuka</h4>
             <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'read'].map((m) => (
                  <button key={m} onClick={() => setMode(m as any)} className={`py-3 rounded-2xl border ${cur.border} font-black text-[10px] uppercase tracking-widest transition-all ${mode === m ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-500/5'}`}>
                    {m}
                  </button>
                ))}
             </div>
          </section>
        </div>

        {/* 2. KEAMANAN & PASSWORD */}
        <div className="space-y-6">
          <section className={`${cur.card} border ${cur.border} rounded-[2.5rem] p-8 shadow-sm space-y-6`}>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               </div>
               <h4 className="font-black uppercase text-xs tracking-widest opacity-40">Keamanan Akun</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Password Baru</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} 
                />
              </div>
              <button disabled={isUpdating} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-600/30 active:scale-95 transition-all">
                Ganti Password
              </button>
            </form>
          </section>

          {/* INFO SISTEM */}
          <div className={`p-8 rounded-[2.5rem] border ${cur.border} bg-gray-500/5 opacity-50`}>
             <h5 className="text-[9px] font-black uppercase tracking-widest mb-2">Informasi Sistem</h5>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold"><span>Versi Aplikasi</span><span>SIMARA v1.0</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span>Lisensi</span><span>Sekolah Menengah</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span>Server Status</span><span className="text-green-600 italic">Online</span></div>
             </div>
          </div>
        </div>

      </div>

      <div className="text-center opacity-20 py-8">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">SIMARA V1.0 By Delvana with Ceui Ai</p>
      </div>
    </div>
  );
}