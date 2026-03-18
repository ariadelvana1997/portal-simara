"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function MenuPengaturan() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Pengaturan
  const [settings, setSettings] = useState({
    id: 1,
    app_name: 'SIMARA',
    is_maintenance: false,
    maintenance_message: 'Sistem sedang dalam pemeliharaan rutin.',
    academic_year: '2025/2026',
    semester: 'Ganjil',
    primary_color: '#2563eb',
    allow_teacher_input: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();
    
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('app_settings')
      .upsert(settings);

    if (!error) {
      alert("✅ Pengaturan Berhasil Disimpan!");
    } else {
      alert("❌ Gagal Menyimpan: " + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse opacity-20 uppercase ">Memuat Konfigurasi...</div>;

  return (
    <div className={`max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b pb-8 border-gray-500/10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase  leading-none">Pengaturan Sistem</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-2`}>Konfigurasi Global & Otoritas Aplikasi</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`${saving ? 'bg-gray-400' : 'bg-blue-600'} text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl shadow-blue-600/20 active:scale-95 transition-all`}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KARTU 1: BRANDING */}
        <div className={`${cur.card} border ${cur.border} p-10 rounded-[3.5rem] space-y-6 shadow-sm`}>
            <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest">I. Branding & Identitas</h3>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Nama Aplikasi</label>
                    <input 
                        className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all`} 
                        value={settings.app_name}
                        onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Warna Tema Utama</label>
                    <div className="flex gap-4 items-center">
                        <input 
                            type="color"
                            className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                            value={settings.primary_color}
                            onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                        />
                        <p className="font-mono text-xs font-bold opacity-60 uppercase">{settings.primary_color}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* KARTU 2: STATUS SISTEM */}
        <div className={`${cur.card} border ${cur.border} p-10 rounded-[3.5rem] space-y-6 shadow-sm`}>
            <h3 className="text-xs font-black uppercase text-red-600 tracking-widest">II. Keamanan & Status</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-red-600/5 rounded-2xl border border-red-600/10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Mode Maintenance</p>
                        <p className="text-[9px] opacity-50 uppercase font-bold">Hanya Admin yang bisa login</p>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, is_maintenance: !settings.is_maintenance})}
                        className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.is_maintenance ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.is_maintenance ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Pesan Pemeliharaan</label>
                    <textarea 
                        className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold h-24 focus:outline-none`} 
                        value={settings.maintenance_message}
                        onChange={(e) => setSettings({...settings, maintenance_message: e.target.value})}
                    />
                </div>
            </div>
        </div>

        {/* KARTU 3: AKADEMIK */}
        <div className={`${cur.card} border ${cur.border} p-10 rounded-[3.5rem] space-y-6 shadow-sm`}>
            <h3 className="text-xs font-black uppercase text-orange-600 tracking-widest">III. Kalender Akademik</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Tahun Ajaran</label>
                    <input 
                        className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none`} 
                        value={settings.academic_year}
                        onChange={(e) => setSettings({...settings, academic_year: e.target.value})}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-40 ml-2">Semester</label>
                    <select 
                        className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none`}
                        value={settings.semester}
                        onChange={(e) => setSettings({...settings, semester: e.target.value})}
                    >
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-600/5 rounded-2xl border border-orange-600/10">
                <p className="text-[10px] font-black uppercase tracking-tight">Buka Input Nilai Guru</p>
                <button 
                    onClick={() => setSettings({...settings, allow_teacher_input: !settings.allow_teacher_input})}
                    className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.allow_teacher_input ? 'bg-orange-600' : 'bg-gray-300'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.allow_teacher_input ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}