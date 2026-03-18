"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function PengaturanLogo() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [walikelas, setWalikelas] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Ambil Setting Global (Hanya 1 Baris)
    const { data: s, error: sErr } = await supabase
      .from('school_settings')
      .select('*')
      .maybeSingle(); // Menggunakan maybeSingle agar tidak error jika tabel kosong
    
    if (s) setSettings(s);

    // 2. Ambil List Walikelas + TTD-nya dari tabel teachers
    const { data: w } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        teachers (signature_url)
      `)
      .contains('roles', ['Walikelas']);

    if (w) setWalikelas(w);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, teacherId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDASI FILE
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png'];
    
    if (!fileExt || !allowed.includes(fileExt)) {
      alert("⚠️ Format file tidak didukung! Gunakan JPG, JPEG, atau PNG.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("⚠️ File terlalu besar! Maksimal ukuran adalah 1 MB.");
      return;
    }

    setLoading(true);

    try {
      // Buat nama file unik agar tidak bentrok di storage
      const fileName = `${type}-${teacherId || 'global'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // 1. Upload ke Storage Bucket 'school_assets'
      const { error: uploadError } = await supabase.storage
        .from('school_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Dapatkan URL Publik
      const { data: { publicUrl } } = supabase.storage
        .from('school_assets')
        .getPublicUrl(filePath);

      // 3. Update Link URL ke Database
      if (teacherId) {
        // Jika ini TTD Walikelas
        const { error: dbErr } = await supabase
          .from('teachers')
          .update({ signature_url: publicUrl })
          .eq('id', teacherId);
        if (dbErr) throw dbErr;
      } else {
        // Jika ini Logo/Kop/Stempel Sekolah
        const updateData: any = {};
        updateData[type] = publicUrl;
        const { error: dbErr } = await supabase
          .from('school_settings')
          .update(updateData)
          .eq('id', 1);
        if (dbErr) throw dbErr;
      }

      alert("✨ Berhasil! Gambar telah diperbarui.");
      fetchData();
    } catch (error: any) {
      alert("❌ Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 ${cur.text}`}>
      <div className="flex flex-col gap-1">
        <h1 className="text-5xl font-black tracking-tighter  ">Identitas Visual</h1>
        <p className={`${cur.textMuted} text-xs font-bold uppercase tracking-[0.3em]`}>Manajemen Aset Digital & Legalitas Dokumen Rapor</p>
      </div>

      {/* GRID LOGO GLOBAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <UploadCard title="Logo Provinsi" url={settings?.province_logo_url} onUpload={(e:any) => handleUpload(e, 'province_logo_url')} cur={cur} />
        <UploadCard title="Logo Sekolah" url={settings?.school_logo_url} onUpload={(e:any) => handleUpload(e, 'school_logo_url')} cur={cur} />
        <UploadCard title="Stempel Sekolah" url={settings?.school_stamp_url} onUpload={(e:any) => handleUpload(e, 'school_stamp_url')} cur={cur} />
        <div className="md:col-span-2">
            <UploadCard title="Kop Surat Sekolah" url={settings?.school_letterhead_url} onUpload={(e:any) => handleUpload(e, 'school_letterhead_url')} cur={cur} isWide />
        </div>
        <UploadCard title="TTD Kepala Sekolah" url={settings?.principal_signature_url} onUpload={(e:any) => handleUpload(e, 'principal_signature_url')} cur={cur} />
      </div>

      {/* SECTION TTD WALIKELAS */}
      <div className="space-y-6 pt-10 border-t border-gray-500/10">
        <h2 className="text-2xl font-black  tracking-tighter">Tanda Tangan Wali Kelas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {walikelas.map((w) => (
                <div key={w.id} className={`${cur.card} border ${cur.border} p-6 rounded-[3rem] flex flex-col items-center gap-5 shadow-sm hover:shadow-xl transition-all duration-500`}>
                    <div className="w-full aspect-square bg-gray-500/5 rounded-[2rem] flex items-center justify-center overflow-hidden border border-dashed border-gray-500/20 p-4">
                        {w.teachers?.[0]?.signature_url ? (
                            <img src={w.teachers[0].signature_url} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="TTD" />
                        ) : (
                            <span className="text-[10px] font-black opacity-10 uppercase tracking-widest">KOSONG</span>
                        )}
                    </div>
                    <div className="text-center w-full">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate mb-2">{w.full_name}</p>
                        <label className="block w-full bg-blue-600 text-white py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 transition-colors">
                            Upload TTD
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'signature_url', w.id)} />
                        </label>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black  text-white tracking-widest text-xs">MENGIRIM FILE KE SERVER...</p>
        </div>
      )}
    </div>
  );
}

function UploadCard({ title, url, onUpload, cur, isWide = false }: any) {
    return (
        <div className={`${cur.card} border ${cur.border} p-10 rounded-[3.5rem] space-y-6 shadow-sm group hover:border-blue-500 transition-all duration-500`}>
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ">{title}</h3>
                <label className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                    Pilih File
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={onUpload} />
                </label>
            </div>
            <div className={`${isWide ? 'h-36' : 'h-48'} bg-gray-500/5 rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-dashed border-gray-500/10 transition-colors group-hover:bg-blue-600/5`}>
                {url ? (
                    <img src={url} className="max-w-full max-h-full object-contain p-6" alt={title} />
                ) : (
                    <div className="text-center space-y-2 opacity-20">
                        <p className="text-[11px] font-black  uppercase">Pratinjau</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest">JPG/PNG • MAX 1MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}