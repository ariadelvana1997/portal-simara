"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

// --- ICONS (KONSISTEN) ---
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>;

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

  // Fitur Tambahan (Tab & Search)
  const [classes, setClasses] = useState<any[]>([]);
  const [activeClassTab, setActiveClassTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classMap, setClassMap] = useState<any[]>([]);

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

  // --- LOGIKA MAPPING (DIPERBARUI DENGAN TAB & SEARCH) ---
  const openMapping = async (ekskul: any) => {
    setLoading(true);
    setSelectedEkskul(ekskul);
    
    const [stusRes, mbsRes, clsRes, mapRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name').contains('roles', ['Siswa']),
        supabase.from('extracurricular_members').select('student_id').eq('ekskul_id', ekskul.id),
        supabase.from('classes').select('*').order('nama_kelas'),
        supabase.from('class_students').select('student_id, class_id')
    ]);
    
    setAllStudents(stusRes.data || []);
    setMembers(mbsRes.data || []);
    setClasses(clsRes.data || []);
    setClassMap(mapRes.data || []);
    if (clsRes.data?.length) setActiveClassTab(clsRes.data[0].id);

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
    
    const { data } = await supabase.from('extracurricular_members').select('student_id').eq('ekskul_id', selectedEkskul.id);
    setMembers(data || []);
  };

  // Logika Filter Siswa (Tab + Search)
  const filteredStudents = allStudents.filter(s => {
    const isInClass = classMap.some(cm => cm.student_id === s.id && cm.class_id === activeClassTab);
    const matchesSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return isInClass && matchesSearch;
  });

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

  if (loading && view === 'list') return <div className="p-20 text-center font-black opacity-20 uppercase tracking-[0.3em]">Menginkronkan Data Ekskul...</div>;

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-end px-4">
        <div>
          {view === 'grade' && (
            <button onClick={() => setView('list')} className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest hover:opacity-100 transition-all flex items-center gap-2">
                <span>←</span> Kembali ke Monitoring
            </button>
          )}
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            {view === 'list' ? 'Penilaian' : 'Input Nilai'} <span className="text-blue-600">Ekskul</span>
          </h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-1`}>
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
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-gray-500">Nama Ekstrakurikuler</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Jumlah Anggota</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Opsi Manajemen</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {ekskulData.map((e) => (
                <tr key={e.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-10 py-7">
                    <p className="font-black text-lg tracking-tighter uppercase leading-none">{e.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">Pembina: {e.coach?.full_name || 'BELUM ADA'}</p>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className="bg-gray-900 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
                        {e.members_count?.[0]?.count || 0} Siswa
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right space-x-3">
                    <button onClick={() => openMapping(e)} className="bg-gray-100 text-gray-900 text-[10px] px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Mapping Anggota</button>
                    <button onClick={() => openAssessment(e)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Input Nilai</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL MAPPING SISWA (UPGRADED WITH TABS & SEARCH) */}
      {isMappingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`${cur.card} w-full max-w-5xl rounded-[4rem] border ${cur.border} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300`}>
                
                {/* Header Modal */}
                <div className="p-10 border-b ${cur.border} flex justify-between items-center bg-gray-500/5">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Mapping <span className="text-blue-600">Anggota</span></h2>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">{selectedEkskul?.name} • {members.length} Terpilih</p>
                    </div>
                    <button onClick={() => { setIsMappingOpen(false); fetchSummary(); }} className="text-4xl font-light opacity-20 hover:opacity-100 transition-all">×</button>
                </div>

                {/* Search & Tabs Section */}
                <div className="p-8 pb-4 space-y-6 bg-white border-b">
                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                            <IconSearch />
                        </div>
                        <input 
                            type="text" 
                            placeholder="CARI NAMA SISWA..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-5 pl-16 pr-8 font-black text-[11px] uppercase tracking-[0.1em] outline-none focus:border-blue-600 focus:bg-white shadow-inner transition-all"
                        />
                    </div>
                    
                    <div className="flex overflow-x-auto gap-2 no-scrollbar px-1">
                        {classes.map(cls => (
                            <button 
                                key={cls.id} 
                                onClick={() => setActiveClassTab(cls.id)}
                                className={`px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 active:scale-95 ${activeClassTab === cls.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-gray-50 border text-gray-400 hover:text-gray-900'}`}
                            >
                                {cls.nama_kelas}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Siswa Grid (Style Rapat 1:1.2) */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar bg-gray-50/20">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full py-20 text-center space-y-2 opacity-20">
                            <p className="font-black text-4xl uppercase italic">Kosong</p>
                            <p className="text-xs font-bold uppercase tracking-widest">Tidak ada siswa ditemukan.</p>
                        </div>
                    ) : filteredStudents.map(s => {
                        const isMember = members.some(m => m.student_id === s.id);
                        return (
                            <div 
                                key={s.id} 
                                onClick={() => toggleMapping(s.id)} 
                                className={`flex justify-between items-center p-4 px-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${isMember ? 'border-blue-600 bg-white shadow-xl shadow-blue-600/5 translate-x-1' : 'border-white bg-white hover:border-gray-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${isMember ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-900'}`}>
                                        {s.full_name[0]}
                                    </div>
                                    <div className="space-y-0">
                                        <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{s.full_name}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Siswa Aktif</p>
                                    </div>
                                </div>
                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isMember ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-100'}`}>
                                    {isMember && <IconCheck />}
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {/* Footer Modal */}
                <div className="p-8 border-t bg-white flex justify-end">
                    <button 
                        onClick={() => { setIsMappingOpen(false); fetchSummary(); }} 
                        className="bg-gray-900 text-white px-16 py-5 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all hover:bg-blue-600"
                    >
                        Selesai & Simpan Data
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* VIEW 2: FORM PENILAIAN */}
      {view === 'grade' && (
        <div className="space-y-4 pb-20">
            {members.map((m) => {
                const className = m.student?.class_students?.[0]?.classes?.nama_kelas || 'Tanpa Kelas';
                return (
                    <div key={m.id} className={`${cur.card} border ${cur.border} rounded-[3rem] p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-sm hover:shadow-xl transition-all duration-500`}>
                        <div className="lg:col-span-3">
                            <h4 className="text-[9px] font-black uppercase opacity-30 mb-2">Profil Siswa</h4>
                            <p className="font-black text-xl tracking-tighter uppercase text-gray-900 leading-none">{m.student?.full_name}</p>
                            <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase mt-3 inline-block">{className}</span>
                        </div>
                        
                        <div className="lg:col-span-4 flex justify-center gap-2 bg-gray-50 p-2.5 rounded-[2.5rem] border border-gray-100">
                            {['Sangat Baik', 'Baik', 'Cukup', 'Kurang'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => handleGradeUpdate(m.id, p)} 
                                    className={`flex-1 px-2 py-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${m.predicate === p ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    {p.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="lg:col-span-5 bg-blue-600/5 p-7 rounded-[2.5rem] border border-blue-600/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                            <h5 className="text-[9px] font-black uppercase text-blue-600 mb-2 tracking-[0.2em]">Capaian Rapor</h5>
                            <p className="text-[12px] leading-relaxed font-bold text-gray-800 relative z-10">
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
            <p className="font-black text-white text-[11px] tracking-[0.3em] uppercase italic">Mensinkronisasi Penilaian...</p>
        </div>
      )}
    </div>
  );
}