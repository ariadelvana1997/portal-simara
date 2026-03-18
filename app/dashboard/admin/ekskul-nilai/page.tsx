"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function PenilaianEkskul() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [view, setView] = useState<'list' | 'grade'>('list');
  const [selectedEkskul, setSelectedEkskul] = useState<any>(null);

  // State Data
  const [ekskulData, setEkskulData] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isMappingOpen, setIsMappingOpen] = useState(false);

  useEffect(() => {
    if (view === 'list') fetchSummary();
  }, [view]);

  const fetchSummary = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('extracurriculars')
      .select(`
        *,
        coach:profiles!coach_id(full_name),
        members_count:extracurricular_members(count)
      `)
      .order('name', { ascending: true });

    setEkskulData(data || []);
    setLoading(false);
  };

  // --- LOGIKA MAPPING (TAMBAH/HAPUS ANGGOTA) ---
  const openMapping = async (ekskul: any) => {
    setLoading(true);
    setSelectedEkskul(ekskul);
    
    // 1. Ambil semua profil dengan role Siswa
    const { data: stus } = await supabase.from('profiles').select('id, full_name').contains('roles', ['Siswa']);
    
    // 2. Ambil ID siswa yang sudah terdaftar di ekskul ini
    const { data: mbs } = await supabase.from('extracurricular_members').select('student_id').eq('ekskul_id', ekskul.id);
    
    setAllStudents(stus || []);
    setMembers(mbs || []); // Gunakan mbs untuk tracking checkbox di modal
    setIsMappingOpen(true);
    setLoading(false);
  };

  const toggleMapping = async (studentId: string) => {
    const isMember = members.some(m => m.student_id === studentId);
    
    if (isMember) {
      await supabase.from('extracurricular_members').delete().eq('ekskul_id', selectedEkskul.id).eq('student_id', studentId);
    } else {
      await supabase.from('extracurricular_members').insert({ 
        ekskul_id: selectedEkskul.id, 
        student_id: studentId, 
        predicate: 'Baik',
        description: `Telah mengikuti kegiatan ${selectedEkskul.name} dengan baik.`
      });
    }
    
    // Refresh list anggota di modal secara instan
    const { data } = await supabase.from('extracurricular_members').select('student_id').eq('ekskul_id', selectedEkskul.id);
    setMembers(data || []);
  };

  // --- LOGIKA PENILAIAN ---
  const openAssessment = async (ekskul: any) => {
    setLoading(true);
    setSelectedEkskul(ekskul);
    const { data: mbs } = await supabase
        .from('extracurricular_members')
        .select(`
            *, 
            student:profiles!student_id(
                full_name, 
                class_students(classes(nama_kelas))
            )
        `)
        .eq('ekskul_id', ekskul.id);
    
    if (!mbs || mbs.length === 0) {
        alert("⚠️ Belum ada anggota! Silakan lakukan 'Mapping' terlebih dahulu.");
        setLoading(false);
        return;
    }

    setMembers(mbs || []);
    setView('grade');
    setLoading(false);
  };

  const handleGradeUpdate = (memberId: number, predicate: string) => {
    const desc = `Telah mengikuti kegiatan ${selectedEkskul.name} dengan ${predicate.toLowerCase()}.`;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, predicate, description: desc } : m));
  };

  const saveAllGrades = async () => {
    setSaveLoading(true);
    const updates = members.map(m => ({ 
        id: m.id, 
        ekskul_id: m.ekskul_id, 
        student_id: m.student_id, 
        predicate: m.predicate, 
        description: m.description 
    }));

    const { error } = await supabase.from('extracurricular_members').upsert(updates);
    
    if (!error) {
        alert("✨ Sukses! Nilai Ekstrakurikuler telah disimpan.");
        setView('list');
    } else {
        alert("Gagal menyimpan: " + error.message);
    }
    setSaveLoading(false);
  };

  if (loading && view === 'list') return <div className="p-20 text-center font-black  opacity-20 tracking-tighter">MENGINKRONKAN DATA EKSKUL...</div>;

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          {view === 'grade' && (
            <button onClick={() => setView('list')} className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest hover:opacity-100 transition-all">← Kembali ke Monitoring</button>
          )}
          <h1 className="text-4xl font-black tracking-tighter ">
            {view === 'list' ? 'Penilaian Ekskul' : `Input Nilai: ${selectedEkskul?.name}`}
          </h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em]`}>
            {view === 'list' ? 'Manajemen Anggota dan Capaian' : `Pembina: ${selectedEkskul?.coach?.full_name}`}
          </p>
        </div>
        {view === 'grade' && (
          <button 
            onClick={saveAllGrades} 
            className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            Simpan Semua Nilai
          </button>
        )}
      </div>

      {/* VIEW 1: MONITORING EKSKUL */}
      {view === 'list' && (
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Ekstrakurikuler</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Jumlah Anggota</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody>
              {ekskulData.map((e) => (
                <tr key={e.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-6">
                    <p className="font-black text-lg  tracking-tight uppercase leading-none">{e.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase  mt-1">Pembina: {e.coach?.full_name || 'BELUM ADA'}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-gray-500/10 px-5 py-1.5 rounded-full font-black text-[10px] ">
                        {e.members_count?.[0]?.count || 0} Siswa
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => openMapping(e)} className="bg-gray-500/10 text-[9px] px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-500/20 transition-all">Mapping Anggota</button>
                    <button onClick={() => openAssessment(e)} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Input Nilai</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL MAPPING SISWA */}
      {isMappingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`${cur.card} w-full max-w-xl rounded-[3.5rem] border ${cur.border} p-12 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300`}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-3xl font-black  tracking-tighter uppercase leading-none">Mapping Anggota</h2>
                        <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-1">{selectedEkskul?.name}</p>
                    </div>
                    <button onClick={() => { setIsMappingOpen(false); fetchSummary(); }} className="text-3xl font-black opacity-20 hover:opacity-100 transition-all">×</button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-3 custom-scrollbar">
                    {allStudents.map(s => {
                        const isMember = members.some(m => m.student_id === s.id);
                        return (
                            <div 
                                key={s.id} 
                                onClick={() => toggleMapping(s.id)} 
                                className={`flex justify-between items-center p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 ${isMember ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-600/5' : 'border-gray-500/10 opacity-40 hover:opacity-60'}`}
                            >
                                <p className="font-black text-xs uppercase tracking-tight">{s.full_name}</p>
                                <div className={`w-6 h-6 rounded-full border-4 transition-all ${isMember ? 'bg-blue-600 border-blue-600' : 'border-gray-500/20'}`}></div>
                            </div>
                        )
                    })}
                </div>
                
                <button 
                    onClick={() => { setIsMappingOpen(false); fetchSummary(); }} 
                    className="mt-10 w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                    Selesai & Simpan Mapping
                </button>
            </div>
        </div>
      )}

      {/* VIEW 2: FORM PENILAIAN */}
      {view === 'grade' && (
        <div className="space-y-4">
            {members.map((m) => {
                const className = m.student?.class_students?.[0]?.classes?.nama_kelas || 'Tanpa Kelas';
                return (
                    <div key={m.id} className={`${cur.card} border ${cur.border} rounded-[3rem] p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-sm hover:shadow-xl transition-all duration-500`}>
                        <div className="lg:col-span-3">
                            <h4 className="text-[9px] font-black uppercase opacity-30 mb-2">Data Siswa</h4>
                            <p className="font-black text-lg tracking-tighter uppercase truncate leading-none">{m.student?.full_name}</p>
                            <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase mt-2 inline-block ">{className}</span>
                        </div>
                        
                        <div className="lg:col-span-4 flex justify-center gap-1.5 bg-gray-500/5 p-2 rounded-[2rem] border border-gray-500/10">
                            {['Sangat Baik', 'Baik', 'Cukup', 'Kurang'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => handleGradeUpdate(m.id, p)} 
                                    className={`flex-1 px-2 py-3 rounded-2xl text-[8px] font-black uppercase transition-all border-2 ${m.predicate === p ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-transparent border-transparent opacity-30 hover:opacity-50'}`}
                                >
                                    {p.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="lg:col-span-5 bg-blue-600/5 p-6 rounded-[2.5rem] border border-blue-600/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full -mr-10 -mt-10"></div>
                            <h5 className="text-[8px] font-black uppercase text-blue-600 mb-2 tracking-[0.2em]">Capaian Rapor</h5>
                            <p className="text-[11px] leading-relaxed font-bold  opacity-80 relative z-10">
                                "{m.description || `Telah mengikuti kegiatan ${selectedEkskul?.name} dengan ${m.predicate.toLowerCase()}.`}"
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
      )}

      {/* SAVE LOADING OVERLAY */}
      {saveLoading && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black  text-white text-[10px] tracking-[0.3em] uppercase">Mensinkronisasi Penilaian...</p>
        </div>
      )}
    </div>
  );
}