"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const [msg, setMsg] = useState("Sistem sedang dalam pemeliharaan rutin.");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMaintenanceMsg = async () => {
      const { data } = await supabase.from('app_settings').select('maintenance_message, is_maintenance').single();
      if (data) {
        setMsg(data.maintenance_message);
        
        // Logika: Kalau admin tiba-tiba mematikan mode maintenance, 
        // user yang lagi di halaman ini otomatis balik ke login
        if (!data.is_maintenance) {
          router.push('/login');
        }
      }
      setLoading(false);
    };

    fetchMaintenanceMsg();
    
    // Refresh status setiap 10 detik (Real-time semu)
    const interval = setInterval(fetchMaintenanceMsg, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* ANIMASI BACKGROUND ORB */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>

      {/* ICON ANIMASI */}
      <div className="relative mb-10">
        <div className="w-32 h-32 border-4 border-blue-600/20 rounded-[3rem] flex items-center justify-center animate-spin [animation-duration:5s]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl animate-bounce">🛠️</span>
        </div>
      </div>

      {/* TEKS PESAN */}
      <div className="relative z-10 space-y-4 max-w-lg">
        <h1 className="text-5xl font-black tracking-tighter uppercase  ">
          MOHON<span className="text-blue-600">BERSABRAR</span>
        </h1>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl">
          <p className="text-sm font-bold leading-relaxed opacity-80 uppercase tracking-widest leading-loose">
            {loading ? "Menghubungkan ke Server..." : msg}
          </p>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 pt-4">
          Silakan hubungi Administrator untuk info lebih lanjut
        </p>
      </div>

      {/* TOMBOL LOGOUT (Agar Admin bisa balik login) */}
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
        className="mt-12 px-8 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
      >
        Kembali ke Login
      </button>

      {/* FOOTER */}
      <footer className="absolute bottom-10 opacity-20 text-[9px] font-black uppercase tracking-widest">
        Portal SIMARA V1.0 By DELVANA dan Ceu Ai
      </footer>
    </div>
  );
}