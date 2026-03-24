"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/dashboard/admin/layout'; // Pastikan path context benar
import { supabase } from '@/lib/supabase';
import { themes } from '@/lib/themes'; // Import Gudang Tema

export default function MenuPengaturan() {
  // Perbaikan: Tambahkan fallback agar t tidak undefined saat proses render awal
  const { cur, setAppConfig, t = (key: string) => key } = useTheme(); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- KAMUS TRANSLASI LOKAL HALAMAN ---
  const pageTranslations: any = {
    id: {
      title: "Konfigurasi Global & Otoritas Aplikasi",
      save_btn: "Simpan Perubahan",
      branding_header: "I. Branding & Identitas",
      app_name_lbl: "Nama Aplikasi",
      lang_lbl: "Bahasa Sistem",
      font_lbl: "Varian Font",
      color_lbl: "Warna Utama",
      db_header: "II. Manajemen Database",
      backup_lbl: "Backup Modul",
      restore_lbl: "Restore Data",
      reset_lbl: "Factory Reset",
      security_header: "III. Keamanan & Status",
      maintenance_lbl: "Maintenance",
      xprivacy_lbl: "Aktifkan Xprivasi",
      academic_header: "IV. Kalender Akademik",
      year_lbl: "Tahun Ajaran",
      semester_lbl: "Semester",
      process: "Proses..."
    },
    en: {
      title: "Global Configuration & Authority",
      save_btn: "Save Changes",
      branding_header: "I. Branding & Identity",
      app_name_lbl: "Application Name",
      lang_lbl: "System Language",
      font_lbl: "Font Variant",
      color_lbl: "Primary Color",
      db_header: "II. Database Management",
      backup_lbl: "Backup Module",
      restore_lbl: "Restore Data",
      reset_lbl: "Factory Reset",
      security_header: "III. Security & Status",
      maintenance_lbl: "Maintenance",
      xprivacy_lbl: "Enable Xprivacy",
      academic_header: "IV. Academic Calendar",
      year_lbl: "Academic Year",
      semester_lbl: "Semester",
      process: "Processing..."
    },
    su: {
      title: "Konfigurasi Global & Otoritas Aplikasi",
      save_btn: "Simpen Parobahan",
      branding_header: "I. Branding & Idéntitas",
      app_name_lbl: "Nami Aplikasi",
      lang_lbl: "Basa Sistem",
      font_lbl: "Varian Font",
      color_lbl: "Warna Utama",
      db_header: "II. Manajémén Database",
      backup_lbl: "Backup Modul",
      restore_lbl: "Puleurkeun Data",
      reset_lbl: "Factory Reset",
      security_header: "III. Kaamanan & Status",
      maintenance_lbl: "Pamiaraan",
      xprivacy_lbl: "Aktifkeun Xprivasi",
      academic_header: "IV. Kalénder Akadémik",
      year_lbl: "Taun Ajaran",
      semester_lbl: "Seméster",
      process: "Nuju Ngolah..."
    },
    alay: {
      title: "K0nf16ur451 6L0b4L",
      save_btn: "51mp3n Ch4y4nk",
      branding_header: "I. Br4nd1n6 n 1d3n71745",
      app_name_lbl: "N4m4 4pL1k451",
      lang_lbl: "B4h454 51573m",
      font_lbl: "V4r14n F0n7",
      color_lbl: "W4rn4 UnYu",
      db_header: "II. M4n4j3m3n D474b453",
      backup_lbl: "B4ckup M0duL",
      restore_lbl: "R3570r3 D474",
      reset_lbl: "R3537 P4br1k",
      security_header: "III. K34m4n4n n 5747u5",
      maintenance_lbl: "M0d3 P3m3L1h4r44n",
      xprivacy_lbl: "4k71fk3n Xpr1v451",
      academic_header: "IV. K4L3nd3r 4k4d3m1k",
      year_lbl: "74hun 4j4r4n",
      semester_lbl: "53m3573r",
      process: "NuJu Pr0535..."
    },
    jaksel: {
      title: "Global Config & Authority",
      save_btn: "Commit Changes",
      branding_header: "I. Identity & Branding",
      app_name_lbl: "App Name",
      lang_lbl: "System Language",
      font_lbl: "Typography Variant",
      color_lbl: "Primary Palette",
      db_header: "II. Database Control",
      backup_lbl: "Backup Module",
      restore_lbl: "Pull Data back",
      reset_lbl: "Destructive Reset",
      security_header: "III. Security & Status",
      maintenance_lbl: "Under Maintenance",
      xprivacy_lbl: "Xprivacy Vibe",
      academic_header: "IV. Academic Event",
      year_lbl: "Academic Year",
      semester_lbl: "Current Semester",
      process: "Basically processing..."
    }
  };

  // Helper untuk translasi lokal halaman
  const tp = (key: string) => {
    const lang = settings.app_language || 'id';
    return (pageTranslations[lang] && pageTranslations[lang][key]) ? pageTranslations[lang][key] : (pageTranslations['id'][key] || key);
  };

  const LANG_OPTIONS = [
    { label: 'Indonesia (ID)', value: 'id' },
    { label: 'English (EN)', value: 'en' },
    { label: 'Sunda (SU)', value: 'su' },
    { label: 'Alay (4L4Y)', value: 'alay' },
    { label: 'Jaksel (Vibes)', value: 'jaksel' }
  ];

  // --- DAFTAR 20 FONT VARIAN ---
  const FONT_OPTIONS = [
    { label: 'Inter (Default Modern)', value: 'Inter' },
    { label: 'Poppins (Samsung Style)', value: 'Poppins' },
    { label: 'Lexend (Highly Readable)', value: 'Lexend' },
    { label: 'Montserrat (Elegant)', value: 'Montserrat' },
    { label: 'Roboto (Android Style)', value: 'Roboto' },
    { label: 'Open Sans (Clean)', value: 'Open Sans' },
    { label: 'Lato (Professional)', value: 'Lato' },
    { label: 'Nunito (Friendly)', value: 'Nunito' },
    { label: 'Ubuntu (Techy)', value: 'Ubuntu' },
    { label: 'Raleway (Stylish)', value: 'Raleway' },
    { label: 'Playfair Display (Formal)', value: 'Playfair Display' },
    { label: 'Oswald (Bold Impact)', value: 'Oswald' },
    { label: 'Merriweather (Classic)', value: 'Merriweather' },
    { label: 'Quicksand (Rounded)', value: 'Quicksand' },
    { label: 'Kanit (Thai Modern)', value: 'Kanit' },
    { label: 'Lora (Serif)', value: 'Lora' },
    { label: 'Work Sans (Neutral)', value: 'Work Sans' },
    { label: 'Fira Sans (Sharp)', value: 'Fira Sans' },
    { label: 'Josefin Sans (Vintage)', value: 'Josefin Sans' },
    { label: 'Anton (Extra Bold)', value: 'Anton' }
  ];

  const MANAGED_TABLES = [
    { name: 'profiles', label: 'Master Pengguna' },
    { name: 'referensi', label: 'Master Referensi' },
    { name: 'kokurikuler', label: 'Master Kokurikuler' },
    { name: 'p5_data', label: 'Master P5' },
    { name: 'pkl_data', label: 'Master PKL' },
    { name: 'penilaian', label: 'Master Penilaian' },
    { name: 'rapor_records', label: 'Master Cetak Rapor' }
  ];

  const [settings, setSettings] = useState<any>({
    id: 1,
    app_name: 'SIMARA',
    app_font: 'Inter',
    app_language: 'id', 
    app_theme: 'default',
    is_xprivacy_enabled: true,
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

  useEffect(() => {
    document.title = settings.app_name;
    if (settings.app_font) {
      document.body.style.fontFamily = `'${settings.app_font}', sans-serif`;
    }
  }, [settings.app_name, settings.app_font]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
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
      if (setAppConfig) setAppConfig(settings);
    } else {
      alert("❌ Gagal Menyimpan: " + error.message);
    }
    setSaving(false);
  };

  const handleBackup = async () => {
    if(!confirm("Mulai backup seluruh database?")) return;
    setSaving(true);
    try {
      const backupBundle: any = { timestamp: new Date().toISOString(), app_settings: settings, data: {} };
      for (const table of MANAGED_TABLES) {
        const { data } = await supabase.from(table.name).select('*');
        backupBundle.data[table.name] = data || [];
      }
      const blob = new Blob([JSON.stringify(backupBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FULL_BACKUP_${settings.app_name}.json`;
      a.click();
    } catch (err: any) { alert("Gagal Backup"); }
    setSaving(false);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bundle = JSON.parse(evt.target?.result as string);
        setSaving(true);
        await supabase.from('app_settings').upsert(bundle.app_settings);
        for (const table of MANAGED_TABLES) {
          if (bundle.data[table.name]) await supabase.from(table.name).upsert(bundle.data[table.name]);
        }
        alert("✅ Pulih!"); window.location.reload();
      } catch (err: any) { alert("Gagal Restore"); }
      finally { setSaving(false); }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    const confirmText = "HAPUS SEMUA DATA";
    if (prompt(`Ketik "${confirmText}" untuk konfirmasi:`) === confirmText) {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      for (const table of MANAGED_TABLES) {
        await supabase.from(table.name).delete().neq('id', table.name === 'profiles' ? user?.id : '00000000-0000-0000-0000-000000000000');
      }
      alert("🔥 Reset!"); window.location.reload();
    }
  };

  if (loading) return <div className={`p-20 text-center font-black animate-pulse opacity-20 uppercase tracking-widest ${cur.text}`}>{t('loading')}</div>;

  return (
    <div className={`max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className={`flex justify-between items-end border-b pb-8 ${cur.border}`}>
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{settings.app_name}</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-2`}>{tp('title')}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`text-white px-10 py-4 ${cur.radius} font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all`}
          style={{ backgroundColor: (themes[settings.app_theme] || themes.default).primary }}
        >
          {saving ? tp('process') : tp('save_btn')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KARTU 1: BRANDING & IDENTITAS */}
        <div className={`${cur.card} border ${cur.border} p-10 ${cur.radius} space-y-6 ${cur.shadow}`}>
            <h3 className="text-xs font-black uppercase tracking-widest border-b pb-2" style={{ color: (themes[settings.app_theme] || themes.default).primary }}>{tp('branding_header')}</h3>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>{tp('app_name_lbl')}</label>
                    <input className={`w-full ${cur.input} border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all ${cur.text}`} value={settings.app_name} onChange={(e) => setSettings({...settings, app_name: e.target.value})} />
                </div>

                {/* PILIHAN TEMA DASHBOARD */}
                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>Tema Dashboard</label>
                    <select className={`w-full ${cur.input} border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none ${cur.text}`} value={settings.app_theme} onChange={(e) => setSettings({...settings, app_theme: e.target.value})}>
                        {Object.keys(themes).map(key => <option key={key} value={key} className="text-black">{themes[key].name}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>{tp('lang_lbl')}</label>
                    <select 
                      className={`w-full ${cur.input} border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none ${cur.text}`} 
                      value={settings.app_language} 
                      onChange={(e) => setSettings({...settings, app_language: e.target.value})}
                    >
                        {LANG_OPTIONS.map(lang => (
                          <option key={lang.value} value={lang.value} className="text-black">{lang.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>{tp('font_lbl')}</label>
                    <select 
                      className={`w-full ${cur.input} border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none ${cur.text}`} 
                      value={settings.app_font} 
                      onChange={(e) => setSettings({...settings, app_font: e.target.value})}
                    >
                        {FONT_OPTIONS.map(font => (
                          <option key={font.value} value={font.value} className="text-black">{font.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* KARTU 3: KEAMANAN & XPRIVASI */}
        <div className={`${cur.card} border ${cur.border} p-10 ${cur.radius} space-y-6 ${cur.shadow}`}>
            <h3 className="text-xs font-black uppercase text-red-600 tracking-widest border-b border-red-600/10 pb-2">{tp('security_header')}</h3>
            <div className="space-y-6">
                {/* MAINTENANCE TOGGLE */}
                <div className={`flex items-center justify-between p-4 bg-red-600/5 rounded-2xl border border-red-600/10`}>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${cur.text}`}>{tp('maintenance_lbl')}</p>
                        <p className="text-[9px] opacity-50 uppercase font-bold">Admin Only Access</p>
                    </div>
                    <button onClick={() => setSettings({...settings, is_maintenance: !settings.is_maintenance})} className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.is_maintenance ? 'bg-red-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.is_maintenance ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* XPRIVASI TOGGLE */}
                <div className={`flex items-center justify-between p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10`}>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-tight ${cur.text}`}>{tp('xprivacy_lbl')}</p>
                        <p className="text-[9px] opacity-50 uppercase font-bold">Master Lock Feature</p>
                    </div>
                    <button onClick={() => setSettings({...settings, is_xprivacy_enabled: !settings.is_xprivacy_enabled})} className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.is_xprivacy_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.is_xprivacy_enabled ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <textarea className={`w-full ${cur.input} border ${cur.border} px-6 py-4 rounded-2xl font-bold h-20 text-xs focus:outline-none ${cur.text}`} value={settings.maintenance_message} onChange={(e) => setSettings({...settings, maintenance_message: e.target.value})} />
            </div>
        </div>

        {/* KARTU 2: MANAJEMEN DATABASE */}
        <div className={`${cur.card} border ${cur.border} p-10 ${cur.radius} space-y-6 ${cur.shadow}`}>
            <h3 className="text-xs font-black uppercase text-green-600 tracking-widest border-b border-green-600/10 pb-2">{tp('db_header')}</h3>
            <div className="grid grid-cols-1 gap-3">
                <button onClick={handleBackup} className={`w-full flex justify-between items-center p-5 bg-green-600/5 hover:bg-green-600/10 border border-green-600/10 ${cur.radius} transition-all ${cur.text}`}>
                    <span className="text-[10px] font-black uppercase">{tp('backup_lbl')}</span>
                    <span className="text-xl">📥</span>
                </button>
                <label className={`w-full flex justify-between items-center p-5 bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/10 ${cur.radius} transition-all cursor-pointer ${cur.text}`}>
                    <span className="text-[10px] font-black uppercase">{tp('restore_lbl')}</span>
                    <span className="text-xl">📤</span>
                    <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                </label>
                <button onClick={handleFactoryReset} className={`w-full flex justify-between items-center p-5 bg-red-600/5 hover:bg-red-600/10 border border-red-600/10 ${cur.radius} transition-all ${cur.text}`}>
                    <span className="text-[10px] font-black uppercase text-red-600">{tp('reset_lbl')}</span>
                    <span className="text-xl">🔥</span>
                </button>
            </div>
        </div>

        {/* KARTU 4: KALENDER AKADEMIK */}
        <div className={`${cur.card} border ${cur.border} p-10 ${cur.radius} space-y-6 ${cur.shadow}`}>
            <h3 className="text-xs font-black uppercase text-orange-600 tracking-widest border-b border-orange-600/10 pb-2">{tp('academic_header')}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>{tp('year_lbl')}</label>
                    <input className={`w-full ${cur.input} border ${cur.border} px-6 py-4 ${cur.radius} font-bold focus:outline-none ${cur.text}`} value={settings.academic_year} onChange={(e) => setSettings({...settings, academic_year: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className={`text-[9px] font-black uppercase ${cur.textMuted} ml-2`}>{tp('semester_lbl')}</label>
                    <select className={`w-full ${cur.input} border ${cur.border} px-6 py-4 ${cur.radius} font-bold focus:outline-none ${cur.text}`} value={settings.semester} onChange={(e) => setSettings({...settings, semester: e.target.value})}>
                        <option value="Ganjil" className="text-black">Ganjil</option>
                        <option value="Genap" className="text-black">Genap</option>
                    </select>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}