"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function DataMapel() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Modal State Mapel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75
  });

  // Modal State TP
  const [isTPModalOpen, setIsTPModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [tpList, setTpList] = useState<any[]>([]);
  const [newTP, setNewTP] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: subjectData } = await supabase
      .from('subjects')
      .select(`*, teacher:profiles!teacher_id(full_name), class:classes!class_id(nama_kelas), tp_count:learning_objectives(count)`)
      .order('name', { ascending: true });

    const { data: teacherData } = await supabase.from('profiles').select('id, full_name').contains('roles', ['Guru']);
    const { data: classData } = await supabase.from('classes').select('id, nama_kelas').order('nama_kelas');

    setSubjects(subjectData || []);
    setTeachers(teacherData || []);
    setClasses(classData || []);
    setLoading(false);
  };

  // --- LOGIKA TP ---
  const openTPManager = async (sub: any) => {
    setSelectedSubject(sub);
    setIsTPModalOpen(true);
    const { data } = await supabase.from('learning_objectives').select('*').eq('subject_id', sub.id).order('created_at', { ascending: true });
    setTpList(data || []);
  };

  const addTP = async () => {
    if (!newTP) return;
    const { error } = await supabase.from('learning_objectives').insert({ subject_id: selectedSubject.id, description: newTP });
    if (!error) { 
      setNewTP(''); 
      const { data } = await supabase.from('learning_objectives').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: true });
      setTpList(data || []);
    }
  };

  // --- CRUD MAPEL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { teacher, class: classObj, tp_count, ...payload } = formData;
    const { id, ...rest } = payload;
    const finalPayload = id ? payload : rest;
    const { error } = await supabase.from('subjects').upsert(finalPayload);
    if (!error) { setIsModalOpen(false); fetchData(); }
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Mata Pelajaran</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen Kurikulum, KKTP, dan Tujuan Pembelajaran.</p>
        </div>
        <button onClick={() => { setFormData({ id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75 }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Tambah Mapel</button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Kelas</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">KKTP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">TP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5">
                    <p className="font-black text-lg  tracking-tight">{s.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{s.teacher?.full_name || 'GURU KOSONG'}</p>
                </td>
                <td className="px-8 py-5 text-center">
                    <span className="bg-gray-500/10 px-3 py-1 rounded-lg font-black text-[10px] opacity-60">{s.class?.nama_kelas || '-'}</span>
                </td>
                <td className="px-8 py-5 text-center">
                    <span className="font-black text-lg text-orange-600">{s.kktp || 75}</span>
                </td>
                <td className="px-8 py-5 text-center">
                    <button onClick={() => openTPManager(s)} className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full font-black text-[9px] uppercase hover:bg-blue-600 hover:text-white transition-all">
                        {s.tp_count?.[0]?.count || 0} TP
                    </button>
                </td>
                <td className="px-8 py-5 text-right space-x-3">
                  <button onClick={() => { setFormData(s); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100">Edit</button>
                  <button onClick={() => { if(confirm('Hapus?')) supabase.from('subjects').delete().eq('id', s.id).then(()=>fetchData()) }} className="text-[10px] font-black uppercase text-red-600 opacity-40 hover:opacity-100">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL KELOLA TP - Sama seperti sebelumnya */}
      {isTPModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className={`${cur.card} w-full max-w-2xl rounded-[3rem] border ${cur.border} p-10 shadow-2xl flex flex-col max-h-[85vh]`}>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter ">Tujuan Pembelajaran</h2>
                    <p className="text-blue-600 font-black uppercase text-xs tracking-widest">{selectedSubject?.name}</p>
                </div>
                <button onClick={() => { setIsTPModalOpen(false); fetchData(); }} className="text-2xl font-black opacity-20 hover:opacity-100">×</button>
            </div>
            <div className="flex gap-2 mb-6">
                <input placeholder="Ketik TP baru..." className={`flex-1 bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold outline-none`} value={newTP} onChange={(e)=>setNewTP(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTP()} />
                <button onClick={addTP} className="bg-blue-600 text-white px-8 rounded-2xl font-black uppercase text-[10px]">Tambah</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {tpList.map((tp, idx) => (
                    <div key={tp.id} className={`flex justify-between items-start p-5 rounded-2xl border ${cur.border} bg-gray-500/5 group`}>
                        <div className="flex gap-4">
                            <span className="font-black text-blue-600  opacity-40">#{idx + 1}</span>
                            <p className="font-bold text-sm leading-relaxed">{tp.description}</p>
                        </div>
                        <button onClick={async () => { await supabase.from('learning_objectives').delete().eq('id', tp.id); const { data } = await supabase.from('learning_objectives').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: true }); setTpList(data || []); }} className="text-[9px] font-black text-red-500 uppercase opacity-0 group-hover:opacity-100 transition-all">Hapus</button>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT MAPEL (DENGAN INPUT KKTP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
           <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl`}>
             <h2 className="text-3xl font-black tracking-tighter  mb-8">Plotting Mapel</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase opacity-30 ml-2">Nama Mapel</label>
                        <input required className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase opacity-30 ml-2 text-orange-600">KKTP</label>
                        <input type="number" required className={`w-full bg-orange-600/10 border border-orange-600/20 text-orange-600 px-4 py-4 rounded-2xl font-black text-center`} value={formData.kktp} onChange={(e)=>setFormData({...formData, kktp: parseInt(e.target.value)})} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <select className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.grade_level} onChange={(e)=>setFormData({...formData, grade_level:e.target.value})}>
                        {['X', 'XI', 'XII'].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                    </select>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.class_id || ''} onChange={(e)=>setFormData({...formData, class_id:e.target.value})}>
                        <option value="">-- Kelas --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}
                    </select>
                </div>

                <select className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.teacher_id || ''} onChange={(e)=>setFormData({...formData, teacher_id:e.target.value})}>
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>

                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl mt-4">Simpan Data</button>
                <button type="button" onClick={()=>setIsModalOpen(false)} className="w-full text-[10px] font-black uppercase opacity-40 mt-2">Batal</button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}