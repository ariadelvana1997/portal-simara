"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataEkskul() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [ekskuls, setEkskuls] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form Ekskul
  const [formData, setFormData] = useState<any>({
    id: null, name: '', coach_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Ambil Data Ekskul + Nama Pembina
    const { data: ekskulData } = await supabase
      .from('extracurriculars')
      .select(`
        *,
        coach:profiles!coach_id(full_name)
      `)
      .order('name', { ascending: true });

    // 2. Ambil List Guru untuk Pembina
    const { data: teacherData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .contains('roles', ['Guru']);

    setEkskuls(ekskulData || []);
    setTeachers(teacherData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Pisahkan data join agar tidak error saat upsert
    const { coach, ...payload } = formData; 
    
    // Logic ID untuk insert/update
    const { id, ...rest } = payload;
    const finalPayload = id ? payload : rest;

    const { error } = await supabase.from('extracurriculars').upsert(finalPayload);

    if (!error) {
      alert("Data Ekstrakurikuler Berhasil Disimpan! 🏆");
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus ekstrakurikuler ini?")) {
      await supabase.from('extracurriculars').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading && !isModalOpen) return <div className="p-10 opacity-20 font-black  text-center">MENYIAPKAN DAFTAR EKSKUL...</div>;

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Ekstrakurikuler</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola kegiatan pengembangan diri siswa.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, name: '', coach_id: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          Tambah Ekskul
        </button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">No</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Ekstrakurikuler</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Pembina (Guru)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ekskuls.map((e, i) => (
                <tr key={e.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5 font-black opacity-20 text-xs">{i + 1}</td>
                  <td className="px-8 py-5">
                    <p className="font-black text-lg  tracking-tight uppercase">{e.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-bold text-xs uppercase opacity-70">
                            {e.coach?.full_name || 'Tanpa Pembina'}
                        </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right space-x-3">
                    <button onClick={() => { setFormData(e); setIsModalOpen(true); }} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-[10px] font-black uppercase text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
              {ekskuls.length === 0 && (
                <tr><td colSpan={4} className="p-20 text-center opacity-20 font-black ">Belum ada ekskul yang ditambahkan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-3xl font-black tracking-tighter  mb-8">{formData.id ? 'Edit' : 'Tambah'} Ekskul</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Nama Ekstrakurikuler</label>
                <input 
                  required
                  placeholder="Contoh: Pramuka / Futsal"
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`}
                  value={formData.name}
                  onChange={(val) => setFormData({...formData, name: val.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Guru Pembina</label>
                <select 
                  required
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold appearance-none focus:outline-none focus:border-blue-500 transition-all`}
                  value={formData.coach_id || ''}
                  onChange={(val) => setFormData({...formData, coach_id: val.target.value})}
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
                <p className="text-[8px] font-bold opacity-20 uppercase mt-2 ml-2">*Hanya user dengan role GURU yang muncul di sini.</p>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Ekskul</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}