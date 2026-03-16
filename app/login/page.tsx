"use client";
import React, { useState } from 'react';

export default function LoginPage() {
  // State untuk mengontrol mode warna
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');

  // Konfigurasi skema warna berdasarkan mode
  const themes = {
    light: {
      container: "bg-white text-slate-900",
      leftSide: "bg-slate-50 border-slate-100",
      inputBorder: "border-slate-200",
      description: "text-slate-600",
      card: "bg-blue-100"
    },
    dark: {
      container: "bg-[#121212] text-slate-100",
      leftSide: "bg-[#1a1a1a] border-slate-800",
      inputBorder: "border-slate-800",
      description: "text-slate-400",
      card: "bg-slate-800"
    },
    read: {
      container: "bg-[#F4ECD8] text-[#5B4636]",
      leftSide: "bg-[#EFE5CD] border-[#E2D1B3]",
      inputBorder: "border-[#DBC9A7]",
      description: "text-[#705A4A]",
      card: "bg-[#E8D9B5]"
    }
  };

  const currentTheme = themes[mode];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-500 ${currentTheme.container}`}>
      
      {/* Sisi Kiri: Ilustrasi & Penjelasan */}
      <div className={`hidden md:flex md:w-1/2 items-center justify-center p-12 border-r transition-colors duration-500 ${currentTheme.leftSide}`}>
        <div className="max-w-md">
          {/* Tombol Pengatur Mode (Ramah Mata) */}
          <div className="mb-10 flex gap-2">
            <button onClick={() => setMode('light')} title="Light Mode" className={`w-8 h-8 rounded-full border-2 ${mode === 'light' ? 'border-blue-500 bg-white' : 'border-transparent bg-slate-200'}`}></button>
            <button onClick={() => setMode('dark')} title="Dark Mode" className={`w-8 h-8 rounded-full border-2 ${mode === 'dark' ? 'border-blue-500 bg-slate-900' : 'border-transparent bg-slate-800'}`}></button>
            <button onClick={() => setMode('read')} title="Read Mode" className={`w-8 h-8 rounded-full border-2 ${mode === 'read' ? 'border-blue-500 bg-[#5B4636]' : 'border-transparent bg-[#F4ECD8]'}`}></button>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest self-center opacity-50">Set Warna</span>
          </div>

          <div className={`mb-8 w-full aspect-video rounded-2xl flex items-center justify-center overflow-hidden shadow-inner transition-colors ${currentTheme.card}`}>
             <span className="text-6xl">🏫</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Portal SIMARA</h2>
          <p className={`${currentTheme.description} leading-relaxed`}>
            Platform manajemen rapor berbasis <span className="font-semibold text-blue-600">Kurikulum Merdeka</span> yang dirancang khusus untuk memudahkan Bapak/Ibu Guru dalam mengolah nilai formatif, sumatif, hingga deskripsi capaian pembelajaran secara otomatis dan efisien.
          </p>
          
          <div className="mt-8 flex gap-4 opacity-70">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
            </div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Secure
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Ranan: Form Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Header untuk Mobile (Muncul saat layar kecil) */}
          <div className="md:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-600 tracking-tight">Portal SIMARA</h1>
            <p className="opacity-60 text-sm mt-2">Manajemen Rapor Kurikulum Merdeka</p>
            {/* Mode Switcher Mobile */}
            <div className="mt-4 flex justify-center gap-4">
               <button onClick={() => setMode('light')} className="text-[10px] font-bold uppercase tracking-widest">Light</button>
               <button onClick={() => setMode('dark')} className="text-[10px] font-bold uppercase tracking-widest">Dark</button>
               <button onClick={() => setMode('read')} className="text-[10px] font-bold uppercase tracking-widest">Read</button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="hidden md:block">
              <h3 className="text-xl font-semibold">Selamat Datang</h3>
              <p className="opacity-60 text-sm">Gunakan akun Anda untuk mengakses sistem.</p>
            </div>

            <form className="space-y-6">
              <div className="relative group">
                <input 
                  type="text" 
                  className={`w-full py-3 bg-transparent border-b-2 outline-none transition-all placeholder:text-slate-400 ${currentTheme.inputBorder} focus:border-blue-600`}
                  placeholder="NIP / Username"
                />
              </div>

              <div className="relative group">
                <input 
                  type="password" 
                  className={`w-full py-3 bg-transparent border-b-2 outline-none transition-all placeholder:text-slate-400 ${currentTheme.inputBorder} focus:border-blue-600`}
                  placeholder="Password"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200/20 active:scale-95"
              >
                Masuk ke Aplikasi
              </button>
            </form>

            {/* Kredit */}
            <div className="pt-10 text-center">
              <p className="text-[11px] opacity-60 uppercase tracking-widest leading-loose">
                Dibuat oleh <span className="font-bold">DELVANA</span>
                <br />
                bersama <span className="font-bold text-blue-500 underline decoration-2 underline-offset-4">Ceu Ai</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}