"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataMapel() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form Mapel
  const [formData, setFormData] = useState<any>({
    id: null, name: '', grade_level: 'X', teacher_id: '', class_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Ambil Data Mapel + Nama Guru + Nama Kelas
    const { data: subjectData } = await supabase
      .from('subjects')
      .select(`
        *,
        teacher:profiles!teacher_id(full_name),
        class:classes!class_id(nama_kelas)
      `)
      .order('name', { ascending: true });

    // 2. Ambil List Guru (Sync Master Pengguna)
    const { data: teacherData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .contains('roles', ['Guru']);

    // 3. Ambil List Kelas
    const { data: classData } = await supabase
      .from('classes')
      .select('id, nama_kelas, tingkat')
      .order('nama_kelas');

    setSubjects(subjectData || []);
    setTeachers(teacherData || []);
    setClasses(classData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { teacher, class: classObj, ...payload } = formData; 
    
    // Logic ID: Jika ID null jangan disertakan agar Postgres buat otomatis
    const { id, ...rest } = payload;
    const finalPayload = id ? payload : rest;

    const { error } = await supabase.from('subjects').upsert(finalPayload);

    if (!error) {
      alert("Pembagian Tugas Guru Berhasil Disimpan! 📚");
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus pembagian tugas mapel ini?")) {
      await supabase.from('subjects').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading && !isModalOpen) return <div className="p-10 opacity-20 font-black  text-center">MENYIAPKAN JADWAL MENGAJAR...</div>;

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Mata Pelajaran & Kelas</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Tentukan guru pengampu untuk setiap mata pelajaran di kelas tertentu.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Plotting Guru
        </button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Kelas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Guru Pengampu</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5">
                    <p className="font-black text-lg  tracking-tight">{s.name}</p>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Tingkat {s.grade_level}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-md shadow-blue-500/20">
                        {s.class?.nama_kelas || '-'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-xs uppercase text-blue-600">
                    {s.teacher?.full_name || 'BELUM ADA GURU'}
                  </td>
                  <td className="px-8 py-5 text-right space-x-3">
                    <button onClick={() => { setFormData(s); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-blue-600 transition-all">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-red-600 transition-all">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-3xl font-black tracking-tighter  mb-8">Plotting Mapel</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Nama Mata Pelajaran</label>
                <input required placeholder="Contoh: Bahasa Indonesia" className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Tingkat</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold appearance-none`} value={formData.grade_level} onChange={(e) => setFormData({...formData, grade_level: e.target.value})}>
                        {['X', 'XI', 'XII'].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Target Kelas</label>
                    <select required className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold appearance-none`} value={formData.class_id || ''} onChange={(e) => setFormData({...formData, class_id: e.target.value})}>
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Guru Pengampu</label>
                <select required className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold appearance-none`} value={formData.teacher_id || ''} onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}>
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Plotting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}