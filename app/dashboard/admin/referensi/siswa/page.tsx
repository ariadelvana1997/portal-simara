"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataSiswa() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form Lengkap
  const [formData, setFormData] = useState<any>({
    id: '', full_name: '', nis: '', nisn: '', jk: 'L',
    tempat_lahir: '', tanggal_lahir: '', agama: '', alamat: '', no_hp: '',
    asal_sekolah: '', diterima_kelas: '', tgl_diterima: '',
    nama_ayah: '', nama_ibu: '', kerja_ayah: '', kerja_ibu: '',
    nama_wali: '', kerja_wali: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, full_name, roles, students (*)`)
      .contains('roles', ['Siswa']);

    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        full_name: item.full_name,
        ...(item.students || {}) 
      }));
      setStudents(formatted);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { full_name, ...payload } = formData; 

    // --- JURUS PEMBERSIH (Fix Error Date "") ---
    // Mengubah semua string kosong menjadi null agar PostgreSQL senang
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key, 
        value === "" ? null : value
      ])
    );

    const { error } = await supabase.from('students').upsert(cleanedPayload);

    if (!error) {
      alert("Biodata Siswa Berhasil Disinkronkan! ✨");
      setIsModalOpen(false);
      fetchStudents();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteBiodata = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus/reset biodata tambahan siswa ini? (Data di Master Pengguna tetap ada)")) {
      setLoading(true);
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) {
        alert("Biodata berhasil direset.");
        fetchStudents();
        setIsModalOpen(false);
      }
      setLoading(false);
    }
  };

  if (loading && !isModalOpen) return (
    <div className={`min-h-[400px] flex items-center justify-center font-black opacity-20 ${cur.text}`}>
      MENYIAPKAN DATABASE SISWA...
    </div>
  );

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Data Siswa</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen database induk dan biodata lengkap siswa.</p>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">No</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Siswa</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">NIS/NISN</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">JK</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">TTL</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map((s, i) => (
                <tr key={s.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5 font-black opacity-20 text-xs">{i + 1}</td>
                  <td className="px-8 py-5 font-black tracking-tight">{s.full_name}</td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-xs font-black">{s.nis || '-'}</p>
                    <p className="text-[9px] font-bold opacity-30">{s.nisn || '-'}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${s.jk === 'L' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                      {s.jk || '-'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-tighter">{s.tempat_lahir || '-'}</p>
                    <p className="text-[9px] font-black opacity-40 ">{s.tanggal_lahir || '-'}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => { setFormData({...formData, ...s}); setIsModalOpen(true); }}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                    >
                      Biodata
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-20 text-center opacity-20 font-black ">Belum ada user dengan role Siswa.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BIODATA LENGKAP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border ${cur.border} p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-500 custom-scrollbar`}>
            
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter ">Lengkapi Biodata</h2>
                    <p className="text-blue-600 font-black uppercase text-xs tracking-[0.2em]">{formData.full_name}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleDeleteBiodata(formData.id)} className="text-red-600 font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Hapus/Reset</button>
                  <button onClick={() => setIsModalOpen(false)} className="opacity-20 hover:opacity-100 transition-opacity font-black text-2xl">×</button>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <SectionTitle title="Data Identitas & Kontak" />
                <InputItem label="NIS" value={formData.nis} onChange={(v:any) => setFormData({...formData, nis: v})} cur={cur} />
                <InputItem label="NISN" value={formData.nisn} onChange={(v:any) => setFormData({...formData, nisn: v})} cur={cur} />
                <InputItem label="Tempat Lahir" value={formData.tempat_lahir} onChange={(v:any) => setFormData({...formData, tempat_lahir: v})} cur={cur} />
                <InputItem label="Tanggal Lahir" type="date" value={formData.tanggal_lahir} onChange={(v:any) => setFormData({...formData, tanggal_lahir: v})} cur={cur} />
                <InputItem label="Agama" value={formData.agama} onChange={(v:any) => setFormData({...formData, agama: v})} cur={cur} />
                <InputItem label="No HP Siswa" value={formData.no_hp} onChange={(v:any) => setFormData({...formData, no_hp: v})} cur={cur} />
                <div className="md:col-span-2">
                    <InputItem label="Alamat Lengkap" value={formData.alamat} onChange={(v:any) => setFormData({...formData, alamat: v})} cur={cur} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <SectionTitle title="Informasi Masuk Sekolah" />
                <InputItem label="Asal Sekolah (SMP/MTs)" value={formData.asal_sekolah} onChange={(v:any) => setFormData({...formData, asal_sekolah: v})} cur={cur} />
                <InputItem label="Diterima di Kelas" value={formData.diterima_kelas} onChange={(v:any) => setFormData({...formData, diterima_kelas: v})} cur={cur} />
                <InputItem label="Tanggal Diterima" type="date" value={formData.tgl_diterima} onChange={(v:any) => setFormData({...formData, tgl_diterima: v})} cur={cur} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <SectionTitle title="Data Orang Tua & Wali" />
                <InputItem label="Nama Ayah" value={formData.nama_ayah} onChange={(v:any) => setFormData({...formData, nama_ayah: v})} cur={cur} />
                <InputItem label="Pekerjaan Ayah" value={formData.kerja_ayah} onChange={(v:any) => setFormData({...formData, kerja_ayah: v})} cur={cur} />
                <InputItem label="Nama Ibu" value={formData.nama_ibu} onChange={(v:any) => setFormData({...formData, nama_ibu: v})} cur={cur} />
                <InputItem label="Pekerjaan Ibu" value={formData.kerja_ibu} onChange={(v:any) => setFormData({...formData, kerja_ibu: v})} cur={cur} />
                <InputItem label="Nama Wali (Opsional)" value={formData.nama_wali} onChange={(v:any) => setFormData({...formData, nama_wali: v})} cur={cur} />
                <InputItem label="Pekerjaan Wali" value={formData.kerja_wali} onChange={(v:any) => setFormData({...formData, kerja_wali: v})} cur={cur} />
              </div>

              <div className="flex gap-4 pt-10 border-t border-gray-500/10">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? 'MENYIMPAN...' : 'Simpan Biodata Induk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
    return <div className="md:col-span-2 border-b-2 border-blue-600/10 pb-2 mb-2"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ">{title}</h3></div>;
}

function InputItem({ label, value, onChange, type = "text", cur }: any) {
  return (
    <div className="space-y-1 group">
      <label className="text-[9px] font-black uppercase tracking-widest opacity-30  ml-1 group-hover:opacity-100 transition-opacity">{label}</label>
      <input 
        type={type}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 font-bold text-sm transition-all placeholder:opacity-20`}
      />
    </div>
  );
}