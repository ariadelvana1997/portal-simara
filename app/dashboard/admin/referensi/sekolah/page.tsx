"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataSekolah() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [school, setSchool] = useState<any>({
    id: 1, // Kita kunci di ID 1 untuk identitas sekolah tunggal
    nama: '', jenjang: '', nss: '', npsn: '',
    alamat_jalan: '', desa_kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '', kode_pos: '',
    telp_fax: '', email: '', website: '',
    nama_ks: '', nuptk_ks: ''
  });

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    setLoading(true);
    // Kita ambil record pertama (biasanya ID 1)
    const { data, error } = await supabase.from('school_info').select('*').limit(1).maybeSingle();
    
    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else if (data) {
      setSchool(data);
    }
    setLoading(false);
  };

  // --- FUNGSI SIMPAN / UPDATE ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Gunakan upsert: Jika ID ada dia Update, jika tidak ada dia Insert
    const { error } = await supabase
      .from('school_info')
      .upsert(school);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert("Sempurna! Identitas Sekolah berhasil diperbarui. 🚀");
      setIsEditing(false);
      fetchSchoolData();
    }
    setLoading(false);
  };

  // --- FUNGSI HAPUS (RESET DATA) ---
  const handleDelete = async () => {
    const yakin = confirm("PERINGATAN: Apakah Anda yakin ingin MENGHAPUS semua identitas sekolah? Data ini sangat penting untuk cetak rapor.");
    
    if (yakin) {
      setLoading(true);
      const { error } = await supabase
        .from('school_info')
        .delete()
        .eq('id', school.id);

      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        alert("Data sekolah telah dibersihkan.");
        setSchool({ id: 1 }); // Reset state lokal
        setIsEditing(false);
      }
      setLoading(false);
    }
  };

  if (loading && !isEditing) return (
    <div className={`min-h-[400px] flex items-center justify-center font-black opacity-20 ${cur.text}`}>
      MENYIAPKAN IDENTITAS SISTEM...
    </div>
  );

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Identitas Sekolah</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Pastikan NUPTK dan NPSN sudah benar untuk validasi rapor.</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button 
              onClick={handleDelete}
              className="bg-red-600/10 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
              Hapus/Reset
            </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`${isEditing ? 'bg-gray-500' : 'bg-blue-600'} text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all`}
          >
            {isEditing ? 'Batal' : 'Edit Identitas'}
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- SECTION 1: IDENTITAS --- */}
        <Section title="Identitas Utama" color="text-blue-500" cur={cur}>
          <InputField label="Nama Sekolah" value={school.nama} onChange={(v:any) => setSchool({...school, nama: v})} edit={isEditing} cur={cur} />
          <InputField label="Jenjang" value={school.jenjang} onChange={(v:any) => setSchool({...school, jenjang: v})} edit={isEditing} cur={cur} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="NSS" value={school.nss} onChange={(v:any) => setSchool({...school, nss: v})} edit={isEditing} cur={cur} />
            <InputField label="NPSN" value={school.npsn} onChange={(v:any) => setSchool({...school, npsn: v})} edit={isEditing} cur={cur} />
          </div>
        </Section>

        {/* --- SECTION 2: ALAMAT --- */}
        <Section title="Lokasi & Alamat" color="text-green-500" cur={cur}>
          <InputField label="Jalan" value={school.alamat_jalan} onChange={(v:any) => setSchool({...school, alamat_jalan: v})} edit={isEditing} cur={cur} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Desa/Kelurahan" value={school.desa_kelurahan} onChange={(v:any) => setSchool({...school, desa_kelurahan: v})} edit={isEditing} cur={cur} />
            <InputField label="Kecamatan" value={school.kecamatan} onChange={(v:any) => setSchool({...school, kecamatan: v})} edit={isEditing} cur={cur} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Kabupaten" value={school.kabupaten} onChange={(v:any) => setSchool({...school, kabupaten: v})} edit={isEditing} cur={cur} />
            <InputField label="Provinsi" value={school.provinsi} onChange={(v:any) => setSchool({...school, provinsi: v})} edit={isEditing} cur={cur} />
            <InputField label="Kode Pos" value={school.kode_pos} onChange={(v:any) => setSchool({...school, kode_pos: v})} edit={isEditing} cur={cur} />
          </div>
        </Section>

        {/* --- SECTION 3: KONTAK --- */}
        <Section title="Kontak & Website" color="text-orange-500" cur={cur}>
          <InputField label="Telp./Fax" value={school.telp_fax} onChange={(v:any) => setSchool({...school, telp_fax: v})} edit={isEditing} cur={cur} />
          <InputField label="Email Sekolah" value={school.email} onChange={(v:any) => setSchool({...school, email: v})} edit={isEditing} cur={cur} />
          <InputField label="Website" value={school.website} onChange={(v:any) => setSchool({...school, website: v})} edit={isEditing} cur={cur} />
        </Section>

        {/* --- SECTION 4: PIMPINAN --- */}
        <Section title="Kepala Sekolah" color="text-purple-500" cur={cur}>
          <InputField label="Nama Kepala Sekolah" value={school.nama_ks} onChange={(v:any) => setSchool({...school, nama_ks: v})} edit={isEditing} cur={cur} />
          <InputField label="NUPTK Kepala Sekolah" value={school.nuptk_ks} onChange={(v:any) => setSchool({...school, nuptk_ks: v})} edit={isEditing} cur={cur} />
        </Section>

        {isEditing && (
          <div className="lg:col-span-2 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-blue-600/40 active:scale-[0.98] transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'MENYIAPKAN...' : 'SIMPAN PERUBAHAN IDENTITAS'}
            </button>
          </div>
        )}
      </form>

      <div className="text-center pt-8">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-20 ">Portal SIMARA V1.0 By DELVANA dan Ceu Ai</p>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS BIAR KODE BERSIH ---

function Section({ title, color, children, cur }: any) {
  return (
    <div className={`${cur.card} p-8 rounded-[3rem] border ${cur.border} space-y-6 shadow-sm transition-all hover:shadow-md`}>
      <h4 className={`font-black text-[10px] uppercase tracking-[0.3em] ${color} opacity-90`}>{title}</h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, edit, cur }: any) {
  return (
    <div className="group space-y-1">
      <label className={`text-[9px] font-black uppercase tracking-wider ${cur.textMuted} opacity-60 group-hover:opacity-100 transition-opacity `}>{label}</label>
      {edit ? (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Input ${label}...`}
          className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500 font-bold text-sm transition-all placeholder:opacity-20`}
        />
      ) : (
        <p className={`text-sm font-black tracking-tight ${!value ? 'opacity-20' : 'opacity-100'}`}>
          {value || `Belum diisi`}
        </p>
      )}
    </div>
  );
}