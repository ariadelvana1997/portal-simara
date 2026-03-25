"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout'; // Mengambil context dari GuruLayout
import { supabase } from '@/lib/supabase';

// --- PREMIUM SVG ICONS ---
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconTarget = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;

export default function ModulPenilaianGuru() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // State Navigasi Internal
  const [view, setView] = useState<'list' | 'input' | 'tp'>('list');
  const [selectedSub, setSelectedSub] = useState<any>(null);

  // State Data
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tpList, setTpList] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({});

  // State Input TP Baru
  const [newTp, setNewTp] = useState('');

  useEffect(() => {
    if (view === 'list' && profile?.id) fetchSummary();
  }, [view, profile]);

  // --- 1. MONITORING DAFTAR MAPEL (Filter by Teacher ID) ---
  const fetchSummary = async () => {
    setLoading(true);
    const { data: subjects } = await supabase
      .from('subjects')
      .select(`
        *, 
        teacher:profiles!teacher_id(full_name), 
        class:classes!class_id(id, nama_kelas, students_count:class_students(count)), 
        grades_count:student_grades(count),
        tp_count:learning_objectives(count)
      `)
      .eq('teacher_id', profile.id)
      .order('name', { ascending: true });

    if (subjects) {
      const processed = subjects.map(s => {
        const totalSiswa = s.class?.students_count?.[0]?.count || 0;
        const sudahDinilai = s.grades_count?.[0]?.count || 0;
        const totalTP = s.tp_count?.[0]?.count || 0;
        const progress = totalSiswa > 0 ? (sudahDinilai / totalSiswa) * 100 : 0;
        return { ...s, totalSiswa, sudahDinilai, progress, totalTP };
      });
      setAssessmentData(processed);
    }
    setLoading(false);
  };

  // --- 2. MANAJEMEN TUJUAN PEMBELAJARAN (TP) ---
  const openTP = async (sub: any) => {
    setLoading(true);
    setSelectedSub(sub);
    const { data: tps } = await supabase
      .from('learning_objectives')
      .select('*')
      .eq('subject_id', sub.id)
      .order('created_at', { ascending: true });
    setTpList(tps || []);
    setView('tp');
    setLoading(false);
  };

  const addTp = async () => {
    if (!newTp.trim()) return;
    const { data, error } = await supabase
      .from('learning_objectives')
      .insert([{ subject_id: selectedSub.id, description: newTp }])
      .select();
    if (!error && data) {
      setTpList([...tpList, data[0]]);
      setNewTp('');
    }
  };

  const deleteTp = async (id: string) => {
    if (confirm("Hapus Tujuan Pembelajaran ini?")) {
      await supabase.from('learning_objectives').delete().eq('id', id);
      setTpList(tpList.filter(t => t.id !== id));
    }
  };

  // --- 3. LOGIKA INPUT NILAI & AUTO-TEXT ---
  const openInputNilai = async (sub: any) => {
    setLoading(true);
    setSelectedSub(sub);
    
    const { data: tps } = await supabase.from('learning_objectives').select('*').eq('subject_id', sub.id);
    const { data: stus } = await supabase.from('class_students').select('student_id, profiles(full_name)').eq('class_id', sub.class_id);
    const { data: existingGrades } = await supabase.from('student_grades').select('*').eq('subject_id', sub.id);

    setTpList(tps || []);
    setStudents(stus || []);
    
    const gradeMap: any = {};
    existingGrades?.forEach(g => {
      gradeMap[g.student_id] = { 
        score: g.score, 
        achieved: g.achieved_tp_ids || [], 
        improvement: g.improvement_tp_ids || [] 
      };
    });
    setGrades(gradeMap);
    
    setView('input');
    setLoading(false);
  };

  const handleUpdateGrade = (studentId: string, field: string, value: any) => {
    let update: any = { [field]: value };

    if (field === 'score') {
      const score = parseInt(value) || 0;
      const kktp = selectedSub?.kktp || 75;
      const allTpIds = tpList.map(tp => tp.id);

      if (score >= kktp) {
        update.achieved = allTpIds;
        update.improvement = [];
      } else {
        update.achieved = [];
        update.improvement = allTpIds;
      }
    }

    setGrades((prev: any) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { score: 0, achieved: [], improvement: [] }), ...update }
    }));
  };

  const saveGrades = async () => {
    setLoading(true);
    const payloads = students.map(s => ({
      student_id: s.student_id,
      subject_id: selectedSub.id,
      score: grades[s.student_id]?.score || 0,
      achieved_tp_ids: grades[s.student_id]?.achieved || [],
      improvement_tp_ids: grades[s.student_id]?.improvement || []
    }));

    const { error } = await supabase.from('student_grades').upsert(payloads, { onConflict: 'student_id, subject_id' });
    if (!error) {
      alert("🎉 Penilaian & Deskripsi Otomatis Berhasil Disimpan!");
      setView('list');
    }
    setLoading(false);
  };

  const generateDescription = (studentId: string, type: 'achieved' | 'improvement') => {
    const selectedIds = grades[studentId]?.[type] || [];
    if (selectedIds.length === 0) return "-";

    const filteredTP = tpList.filter(tp => selectedIds.includes(tp.id)).map(tp => tp.description);
    const prefix = type === 'achieved' 
      ? "Menunjukkan penguasaan yang baik dalam " 
      : "Perlu ditingkatkan dalam memahami ";

    return `${prefix} ${filteredTP.join(", ")}`;
  };

  if (loading && view === 'list') return <div className="p-20 text-center font-black opacity-20 uppercase tracking-[0.3em]">Memuat Modul Guru...</div>;

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 mb-4 tracking-widest">← Kembali</button>
          )}
          <h1 className="text-4xl font-black tracking-tighter ">
            {view === 'list' ? 'Penilaian Rapor' : view === 'tp' ? 'Tujuan Pembelajaran' : `Input Nilai: ${selectedSub?.name}`}
          </h1>
          <div className="flex gap-4 mt-1">
             <p className="text-blue-600 font-black uppercase text-xs tracking-widest">
                {view === 'list' ? 'Monitor Progress Siswa' : `Mata Pelajaran: ${selectedSub?.name} • Kelas ${selectedSub?.class?.nama_kelas}`}
             </p>
             {view === 'input' && (
                <p className="text-orange-600 font-black uppercase text-xs tracking-widest underline decoration-2 underline-offset-4">KKTP: {selectedSub?.kktp}</p>
             )}
          </div>
        </div>
        {view === 'input' && (
          <button onClick={saveGrades} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Simpan Nilai Akhir</button>
        )}
      </div>

      {/* VIEW 1: DAFTAR MAPEL GURU */}
      {view === 'list' && (
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran & Kelas</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">TP</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">KKTP</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Progress</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {assessmentData.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center font-black opacity-10 uppercase tracking-widest">Belum ada Mapel yang diampu.</td></tr>
                ) : assessmentData.map((item) => (
                  <tr key={item.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                    <td className="px-8 py-6">
                      <p className="font-black text-lg tracking-tight uppercase">{item.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Kelas {item.class?.nama_kelas} • {item.totalSiswa} Siswa</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 rounded-lg bg-gray-500/10 text-[10px] font-black">{item.totalTP} TP</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-xl text-orange-600 ">{item.kktp}</span>
                    </td>
                    <td className="px-8 py-6 w-48">
                      <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-gray-500/10 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${item.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${item.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black">{Math.round(item.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button onClick={() => openTP(item)} className={`p-3 rounded-xl border ${cur.border} hover:text-blue-600 transition-all shadow-sm active:scale-90`} title="Atur Tujuan Pembelajaran"><IconTarget /></button>
                      <button onClick={() => openInputNilai(item)} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">Mulai Penilaian</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MANAJEMEN TP GURU */}
      {view === 'tp' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className={`${cur.card} border ${cur.border} rounded-[2.5rem] p-8 space-y-6 shadow-sm`}>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={newTp} 
                onChange={(e) => setNewTp(e.target.value)} 
                placeholder="Tulis Tujuan Pembelajaran Baru..." 
                className={`flex-1 ${cur.bg} border ${cur.border} px-6 py-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition-all`} 
              />
              <button onClick={addTp} className="bg-blue-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all">
                <IconPlus /> Tambah
              </button>
            </div>
            <div className="space-y-3">
              {tpList.map((tp, i) => (
                <div key={tp.id} className={`flex items-center justify-between p-5 rounded-2xl border ${cur.border} bg-gray-500/5 group animate-in slide-in-from-top-2 duration-300`}>
                  <div className="flex gap-4 items-center">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center justify-center italic">{i+1}</span>
                    <p className="font-bold text-sm tracking-tight">{tp.description}</p>
                  </div>
                  <button onClick={() => deleteTp(tp.id)} className="text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all active:scale-90">
                    <IconTrash />
                  </button>
                </div>
              ))}
              {tpList.length === 0 && (
                <div className="py-20 text-center font-black opacity-10 uppercase tracking-[0.3em] text-xs">Belum Ada Tujuan Pembelajaran.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FORM INPUT GURU */}
      {view === 'input' && (
        <div className="space-y-6">
            {students.map((s) => {
                const currentScore = grades[s.student_id]?.score || 0;
                const isPassing = currentScore >= (selectedSub?.kktp || 75);

                return (
                    <div key={s.student_id} className={`${cur.card} border ${cur.border} rounded-[3rem] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm hover:shadow-xl transition-all duration-500`}>
                        {/* Kolom Nama & Nilai */}
                        <div className="lg:col-span-3 space-y-4">
                            <div>
                                <h4 className="text-[9px] font-black uppercase opacity-30 mb-1">Nama Siswa</h4>
                                <p className="font-black text-lg tracking-tighter uppercase truncate">{s.profiles.full_name}</p>
                            </div>
                            <div className="space-y-1 relative">
                                <label className="text-[9px] font-black uppercase opacity-30">Nilai Akhir</label>
                                <input 
                                    type="number" 
                                    className={`w-full bg-gray-500/5 border-b-4 ${isPassing ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'} rounded-2xl py-5 text-center font-black text-4xl outline-none focus:bg-gray-500/10 transition-all`}
                                    value={grades[s.student_id]?.score || ''} 
                                    onChange={(e) => handleUpdateGrade(s.student_id, 'score', e.target.value)} 
                                />
                                <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-white ${isPassing ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {isPassing ? 'Lulus' : 'Remedial'}
                                </div>
                            </div>
                        </div>

                        {/* Status TP */}
                        <div className="lg:col-span-3 space-y-3">
                            <h4 className="text-[9px] font-black uppercase opacity-30 ">Review Tujuan Pembelajaran</h4>
                            <div className="max-h-32 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                {tpList.length === 0 ? (
                                  <p className="text-[8px] font-black opacity-20 uppercase italic">TP Belum Diatur Guru.</p>
                                ) : tpList.map(tp => {
                                    const ach = grades[s.student_id]?.achieved?.includes(tp.id);
                                    return (
                                        <div key={tp.id} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${ach ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                            <p className="text-[8px] font-bold opacity-40 truncate">{tp.description}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Kolom Preview Deskripsi Otomatis */}
                        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 self-stretch">
                             <div className={`p-5 rounded-[2rem] border transition-all duration-700 ${isPassing ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-500/5 border-transparent opacity-10'}`}>
                                <h5 className="text-[8px] font-black uppercase text-green-600 mb-2">Capaian Kompetensi</h5>
                                <p className="text-[10px] leading-relaxed font-bold ">{generateDescription(s.student_id, 'achieved')}</p>
                             </div>
                             <div className={`p-5 rounded-[2rem] border transition-all duration-700 ${!isPassing ? 'bg-orange-500/5 border-orange-500/20' : 'bg-gray-500/5 border-transparent opacity-10'}`}>
                                <h5 className="text-[8px] font-black uppercase text-orange-600 mb-2">Perlu Peningkatan</h5>
                                <p className="text-[10px] leading-relaxed font-bold ">{generateDescription(s.student_id, 'improvement')}</p>
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
      )}

      {loading && view !== 'list' && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-white text-[10px] tracking-[0.3em]">SINKRONISASI DATA...</p>
        </div>
      )}
    </div>
  );
}