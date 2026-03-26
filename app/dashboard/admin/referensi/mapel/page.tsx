"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/app/dashboard/admin/layout'; 
import { supabase } from '@/lib/supabase';

export default function DataMapel() {
  const { cur, t = (key: string) => key } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // --- STATE FITUR SEARCH, FILTER & SELECT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Menyimpan groupKey

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal State Mapel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75,
    selectedClasses: [] 
  });

  // Modal State TP
  const [isTPModalOpen, setIsTPModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [tpList, setTpList] = useState<any[]>([]);
  const [newTP, setNewTP] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Reset ke halaman 1 saat melakukan pencarian atau filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade]);

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

  // --- LOGIKA FILTER & GROUPING (DISATUKAN) ---
  const filteredAndGroupedSubjects = useMemo(() => {
    const groups: any = {};
    
    // 1. Filter berdasarkan Search dan Grade
    const filteredRaw = subjects.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.teacher?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchGrade = filterGrade === 'ALL' || s.grade_level === filterGrade;
      return matchSearch && matchGrade;
    });

    // 2. Grouping Data (Agar Mapping Kelas Menyatu)
    filteredRaw.forEach((s) => {
      const groupKey = `${s.name}-${s.teacher_id}`;
      if (!groups[groupKey]) {
        groups[groupKey] = { 
          ...s, 
          groupKey,
          display_classes: s.class?.nama_kelas ? [s.class.nama_kelas] : [],
          ids_in_group: [s.id], 
          class_ids_in_group: s.class_id ? [s.class_id] : []
        };
      } else {
        if (s.class?.nama_kelas && !groups[groupKey].display_classes.includes(s.class.nama_kelas)) {
          groups[groupKey].display_classes.push(s.class.nama_kelas);
        }
        groups[groupKey].ids_in_group.push(s.id);
        groups[groupKey].class_ids_in_group.push(s.class_id);
      }
    });

    return Object.values(groups);
  }, [subjects, searchTerm, filterGrade]);

  // --- LOGIKA PAGINATION (SLICING DATA) ---
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndGroupedSubjects.slice(start, start + pageSize);
  }, [filteredAndGroupedSubjects, currentPage]);

  const totalPages = Math.ceil(filteredAndGroupedSubjects.length / pageSize);

  // --- LOGIKA SELECTION ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map((s: any) => s.groupKey));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (groupKey: string) => {
    setSelectedRows(prev => 
      prev.includes(groupKey) ? prev.filter(k => k !== groupKey) : [...prev, groupKey]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`🚨 Hapus masal ${selectedRows.length} kelompok data?`)) return;
    setSaving(true);
    const allIdsToDelete = filteredAndGroupedSubjects
      .filter((s: any) => selectedRows.includes(s.groupKey))
      .flatMap((s: any) => s.ids_in_group);

    const { error } = await supabase.from('subjects').delete().in('id', allIdsToDelete);
    if (!error) {
      alert("✅ Terhapus masal!");
      setSelectedRows([]);
      fetchData();
    }
    setSaving(false);
  };

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

  // --- CRUD SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const basePayload = { 
        name: formData.name, 
        grade_level: formData.grade_level, 
        teacher_id: formData.teacher_id, 
        kktp: formData.kktp 
    };

    try {
      if (formData.id) {
        // MODE EDIT: Update info umum dan Sinkronisasi Kelas
        await supabase.from('subjects').update(basePayload).in('id', formData.ids_in_group);
        const oldClassIds = formData.class_ids_in_group;
        const newClassIds = formData.selectedClasses;

        const added = newClassIds.filter((id: string) => !oldClassIds.includes(id));
        if (added.length > 0) {
          await supabase.from('subjects').insert(added.map((clsId: string) => ({ ...basePayload, class_id: clsId })));
        }

        const removed = oldClassIds.filter((id: string) => !newClassIds.includes(id));
        if (removed.length > 0) {
          await supabase.from('subjects').delete().in('class_id', removed).eq('name', basePayload.name).eq('teacher_id', basePayload.teacher_id);
        }
        alert("✅ Berhasil Diperbarui!");
      } else {
        // MODE BARU
        if (formData.selectedClasses.length === 0) throw new Error("Pilih minimal satu kelas!");
        const bulk = formData.selectedClasses.map((clsId: string) => ({ ...basePayload, class_id: clsId }));
        const { error } = await supabase.from('subjects').insert(bulk);
        if (error) throw error;
        alert("✅ Berhasil Disimpan!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) { alert("❌ Gagal: " + err.message); } finally { setSaving(false); }
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Mata Pelajaran</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen Kurikulum, KKTP, dan Tujuan Pembelajaran.</p>
        </div>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Hapus ({selectedRows.length})</button>
          )}
          <button onClick={() => { setFormData({ id: null, name: '', grade_level: 'X', teacher_id: '', class_id: '', kktp: 75, selectedClasses: [] }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Tambah Mapel</button>
        </div>
      </div>

      {/* TOOLBAR: SEARCH & FILTER */}
      <div className={`flex flex-col md:flex-row gap-4 p-4 ${cur.card} border ${cur.border} rounded-[2rem] shadow-sm`}>
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Cari Mata Pelajaran atau Guru Pengampu..." 
            className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-3 rounded-xl font-bold focus:outline-none focus:border-blue-600 transition-all ${cur.text}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-3.5 opacity-20">🔍</span>
        </div>
        <select 
          className={`bg-gray-500/5 border ${cur.border} px-6 py-3 rounded-xl font-bold focus:outline-none ${cur.text}`}
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          <option value="ALL">Semua Tingkat</option>
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </select>
      </div>

      {/* TABLE */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-6 py-5 text-center w-10">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  onChange={handleSelectAll}
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                />
              </th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Daftar Kelas</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">KKTP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">TP</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((s: any, idx: number) => (
              <tr key={idx} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all ${selectedRows.includes(s.groupKey) ? 'bg-blue-600/5' : ''}`}>
                <td className="px-6 py-5 text-center">
                   <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                    checked={selectedRows.includes(s.groupKey)}
                    onChange={() => toggleRowSelection(s.groupKey)}
                  />
                </td>
                <td className="px-6 py-5">
                    <p className="font-black text-lg tracking-tight uppercase">{s.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{s.teacher?.full_name || 'GURU KOSONG'}</p>
                </td>
                <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5 max-w-[350px]">
                        {s.display_classes.map((clsName: string, i: number) => (
                            <span key={i} className="bg-gray-500/10 px-3 py-1 rounded-lg font-black text-[9px] opacity-60 uppercase whitespace-nowrap">{clsName}</span>
                        ))}
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
                  <button onClick={() => { setFormData({...s, selectedClasses: s.class_ids_in_group}); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100">Edit</button>
                  <button onClick={async () => { if(confirm(`🚨 Hapus plotting?`)) { await supabase.from('subjects').delete().in('id', s.ids_in_group); fetchData(); } }} className="text-[10px] font-black uppercase text-red-600 opacity-40 hover:opacity-100">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- UI PAGINATION --- */}
        <div className={`p-6 border-t ${cur.border} flex flex-col md:flex-row justify-between items-center bg-gray-500/5 gap-4`}>
            <p className="text-[10px] font-black uppercase opacity-40 ml-4">
                Menampilkan {paginatedData.length} dari {filteredAndGroupedSubjects.length} Kelompok Mapel • Halaman {currentPage} dari {totalPages || 1}
            </p>
            <div className="flex gap-2">
                <button 
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-black/10 hover:bg-black hover:text-white disabled:opacity-10 transition-all"
                >
                    Sebelumnya
                </button>
                <button 
                    disabled={currentPage === totalPages || loading || filteredAndGroupedSubjects.length === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-600/20 disabled:opacity-10 active:scale-95 transition-all"
                >
                    Selanjutnya
                </button>
            </div>
        </div>
      </div>

      {/* MODAL TP */}
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
             <h2 className="text-3xl font-black mb-8">Plotting Mapel</h2>
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
                    <select required className={`w-full bg-gray-500/10 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none appearance-none`} value={formData.teacher_id || ''} onChange={(e)=>setFormData({...formData, teacher_id:e.target.value})}>
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
                            <button key={c.id} type="button" onClick={() => toggleClassSelection(c.id)} className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase transition-all border ${formData.selectedClasses.includes(c.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-95' : `bg-gray-500/5 border-transparent ${cur.text} opacity-60 hover:opacity-100`}`}>{c.nama_kelas}</button>
                        ))}
                    </div>
                </div>
                
                <div className="pt-4">
                    <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all">{saving ? "Memproses..." : 'Simpan Data Plotting'}</button>
                    <button type="button" onClick={()=>setIsModalOpen(false)} className="w-full text-[10px] font-black uppercase opacity-40 mt-4 hover:opacity-100 transition-all">Batalkan</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}