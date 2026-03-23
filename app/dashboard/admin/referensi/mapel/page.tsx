"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
    id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75,
    selectedClasses: [] // State tambahan untuk menampung multi-select
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

  // --- LOGIKA DISATUIN (GROUPING) ---
  const groupedSubjects = useMemo(() => {
    const groups: any = {};
    
    subjects.forEach((s) => {
      // Kunci pengelompokan: Nama Mapel + ID Guru
      const key = `${s.name}-${s.teacher_id}`;
      
      if (!groups[key]) {
        groups[key] = { 
          ...s, 
          display_classes: s.class?.nama_kelas ? [s.class.nama_kelas] : [],
          ids_to_delete: [s.id] // Simpan semua ID untuk fitur hapus masal
        };
      } else {
        if (s.class?.nama_kelas) {
          // Tambahkan nama kelas jika belum ada di list (mencegah duplikat visual)
          if (!groups[key].display_classes.includes(s.class.nama_kelas)) {
            groups[key].display_classes.push(s.class.nama_kelas);
          }
        }
        groups[key].ids_to_delete.push(s.id);
      }
    });

    return Object.values(groups);
  }, [subjects]);

  // --- LOGIKA MULTI-SELECT KELAS ---
  const toggleClassSelection = (classId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter((id: string) => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
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

  // --- CRUD MAPEL (REVISI LOGIKA MULTI-INSERT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { teacher, class: classObj, tp_count, selectedClasses, ...payload } = formData;
    
    if (payload.id) {
      // MODE EDIT: Tetap simpan satu record
      const { error } = await supabase.from('subjects').upsert(payload);
      if (!error) { setIsModalOpen(false); fetchData(); }
    } else {
      // MODE TAMBAH BARU: Mendukung multi-select kelas
      if (selectedClasses.length === 0) return alert("Pilih minimal satu kelas!");
      
      const bulkPayload = selectedClasses.map((clsId: string) => ({
        name: payload.name,
        grade_level: payload.grade_level,
        teacher_id: payload.teacher_id,
        class_id: clsId,
        kktp: payload.kktp
      }));

      const { error } = await supabase.from('subjects').insert(bulkPayload);
      if (!error) { setIsModalOpen(false); fetchData(); } else { alert(error.message); }
    }
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Mata Pelajaran</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen Kurikulum, KKTP, dan Tujuan Pembelajaran.</p>
        </div>
        <button onClick={() => { setFormData({ id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75, selectedClasses: [] }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Tambah Mapel</button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Daftar Kelas</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">KKTP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">TP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {groupedSubjects.map((s: any, idx: number) => (
              <tr key={idx} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5">
                    <p className="font-black text-lg tracking-tight uppercase">{s.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{s.teacher?.full_name || 'GURU KOSONG'}</p>
                </td>
                <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5 max-w-[350px]">
                        {s.display_classes.map((clsName: string, i: number) => (
                            <span key={i} className="bg-gray-500/10 px-3 py-1 rounded-lg font-black text-[9px] opacity-60 uppercase whitespace-nowrap">
                                {clsName}
                            </span>
                        ))}
                        {s.display_classes.length === 0 && <span className="opacity-20 text-[9px] font-black italic">BELUM ADA KELAS</span>}
                    </div>
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
                  <button onClick={() => { setFormData({...s, selectedClasses: [s.class_id]}); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100">Edit</button>
                  <button 
                    onClick={async () => { 
                      if(confirm(`🚨 Hapus plotting ini untuk seluruh ${s.display_classes.length} kelas?`)) {
                        await supabase.from('subjects').delete().in('id', s.ids_to_delete);
                        fetchData();
                      }
                    }} 
                    className="text-[10px] font-black uppercase text-red-600 opacity-40 hover:opacity-100"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {groupedSubjects.length === 0 && !loading && (
                <tr><td colSpan={5} className="p-20 text-center font-black opacity-10 uppercase tracking-widest">Belum ada plotting mapel</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL KELOLA TP */}
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

      {/* MODAL PLOTTING MAPEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className={`${cur.card} w-full max-w-lg rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300`}>
             <h2 className="text-3xl font-black tracking-tighter  mb-8">Plotting Mapel</h2>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-30 ml-2">Nama Mapel</label>
                        <input required className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all`} value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-30 ml-2 text-orange-600">KKTP</label>
                        <input type="number" required className={`w-full bg-orange-600/10 border border-orange-600/20 text-orange-600 px-4 py-4 rounded-2xl font-black text-center outline-none`} value={formData.kktp} onChange={(e)=>setFormData({...formData, kktp: parseInt(e.target.value)})} />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2">Guru Pengampu</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none appearance-none`} value={formData.teacher_id || ''} onChange={(e)=>setFormData({...formData, teacher_id:e.target.value})}>
                        <option value="">-- Pilih Guru --</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2">Tingkat</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none appearance-none`} value={formData.grade_level} onChange={(e)=>setFormData({...formData, grade_level:e.target.value})}>
                        {['X', 'XI', 'XII'].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-30 ml-2">Pilih Kelas ({formData.selectedClasses?.length || 0})</label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-500/5 rounded-2xl custom-scrollbar">
                        {classes.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleClassSelection(c.id)}
                                className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                    formData.selectedClasses.includes(c.id) 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-95' 
                                    : `bg-gray-500/5 border-transparent ${cur.text} opacity-60 hover:opacity-100`
                                }`}
                            >
                                {c.nama_kelas}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Data Plotting</button>
                    <button type="button" onClick={()=>setIsModalOpen(false)} className="w-full text-[10px] font-black uppercase opacity-40 mt-4 hover:opacity-100 transition-all">Batalkan</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}