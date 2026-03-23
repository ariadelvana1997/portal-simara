"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataKelas() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [walikelas, setWalikelas] = useState<any[]>([]);
  
  // Modal State Kelas (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null, kurikulum: 'Kurikulum Merdeka', nama_kelas: '', jenis_rombel: 'Reguler',
    program_keahlian: '', konsentrasi_keahlian: '', tingkat: 'X', walikelas_id: ''
  });

  // Modal State Kelola Siswa (Mapping)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  
  // --- STATE BARU UNTUK SEARCH DI MODAL ---
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: classData } = await supabase
      .from('classes')
      .select(`
        *,
        walikelas:profiles!walikelas_id(full_name),
        students_count:class_students(count)
      `)
      .order('nama_kelas', { ascending: true });

    const { data: waliData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .contains('roles', ['Walikelas']);

    setClasses(classData || []);
    setWalikelas(waliData || []);
    setLoading(false);
  };

  // --- LOGIKA MAPPING SISWA ---
  const openStudentManager = async (cls: any) => {
    setSelectedClass(cls);
    setIsStudentModalOpen(true);
    setStudentSearchTerm(''); // Reset search saat buka modal
    await fetchStudentsForMapping(cls.id);
  };

  const fetchStudentsForMapping = async (classId: number) => {
    const { data: inClass } = await supabase
      .from('class_students')
      .select(`student_id, profiles(full_name, nisn)`)
      .eq('class_id', classId);
    
    const { data: allSiswa } = await supabase
      .from('profiles')
      .select(`id, full_name, nisn, class_students(class_id)`)
      .contains('roles', ['Siswa']);

    setClassStudents(inClass || []);
    
    if (allSiswa) {
      // Filter: Hanya ambil siswa yang class_students-nya kosong (Belum Berkelas)
      // Ini bagian yang bikin pool siswa berkurang otomatis (193 -> berkurang)
      const filtered = allSiswa.filter((s: any) => (s.class_students?.length || 0) === 0);
      setAvailableStudents(filtered);
    }
  };

  // --- LOGIKA FILTER SEARCH (MEMOIZED) ---
  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter(s => 
      s.full_name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.nisn?.includes(studentSearchTerm)
    );
  }, [availableStudents, studentSearchTerm]);

  const addStudentToClass = async (studentId: string) => {
    const { error } = await supabase.from('class_students').insert({ class_id: selectedClass.id, student_id: studentId });
    if (!error) fetchStudentsForMapping(selectedClass.id);
  };

  const removeStudentFromClass = async (studentId: string) => {
    const { error } = await supabase.from('class_students').delete().eq('student_id', studentId);
    if (!error) fetchStudentsForMapping(selectedClass.id);
  };

  // --- CRUD KELAS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { id, students_count, walikelas, ...rest } = formData; 
    const payload = id ? { id, ...rest } : rest;
    const { error } = await supabase.from('classes').upsert(payload);
    if (!error) {
      alert("Sempurna! Data Kelas Berhasil Disimpan! 🏫");
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus kelas ini? Semua mapping siswa di dalamnya akan ikut terhapus.")) {
      await supabase.from('classes').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Data Kelas</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen rombongan belajar dan wali kelas.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, kurikulum: 'Kurikulum Merdeka', nama_kelas: '', jenis_rombel: 'Reguler', tingkat: 'X', program_keahlian: '', konsentrasi_keahlian: '', walikelas_id: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Tambah Kelas
        </button>
      </div>

      {/* TABLE KELAS */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">No</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Kurikulum</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Nama Kelas</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Tingkat</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Wali Kelas</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Siswa</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-6 py-5 font-black opacity-20 text-xs">{i + 1}</td>
                  <td className="px-6 py-5 font-bold text-[10px] uppercase">{c.kurikulum}</td>
                  <td className="px-6 py-5 font-black tracking-tighter text-lg">{c.nama_kelas}</td>
                  <td className="px-6 py-5 text-center font-black text-blue-600">{c.tingkat}</td>
                  <td className="px-6 py-5 font-bold text-xs">{c.walikelas?.full_name || 'BELUM ADA'}</td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => openStudentManager(c)}
                      className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        {c.students_count?.[0]?.count || 0} Siswa
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    <button onClick={() => { setFormData(c); setIsModalOpen(true); }} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-[10px] font-black uppercase text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MAPPING SISWA (DENGAN SEARCH & SCROLL) */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-5xl rounded-[3rem] border ${cur.border} p-10 shadow-2xl flex flex-col h-[85vh]`}>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter ">Kelola Anggota</h2>
                    <p className="text-blue-600 font-black uppercase text-xs tracking-widest">Kelas {selectedClass?.nama_kelas}</p>
                </div>
                <button onClick={() => { setIsStudentModalOpen(false); fetchData(); }} className="text-2xl font-black opacity-20 hover:opacity-100">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 overflow-hidden">
                {/* KOLOM KIRI: TERDAFTAR */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Siswa Terdaftar ({classStudents.length})</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {classStudents.map((s:any) => (
                            <div key={s.student_id} className={`flex justify-between items-center p-4 rounded-2xl border ${cur.border} bg-gray-500/5 group hover:border-red-500/30 transition-all`}>
                                <div>
                                    <p className="font-bold text-sm">{s.profiles.full_name}</p>
                                    <p className="text-[9px] opacity-40 font-black uppercase">{s.profiles.nisn || 'Tanpa NISN'}</p>
                                </div>
                                <button onClick={() => removeStudentFromClass(s.student_id)} className="text-[9px] font-black text-red-500 uppercase opacity-0 group-hover:opacity-100 transition-all bg-red-500/10 px-3 py-1.5 rounded-lg">Keluarkan</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KOLOM KANAN: POOL (BELUM BERKELAS) */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-blue-600">Siswa Tanpa Kelas ({availableStudents.length})</h4>
                    </div>
                    
                    {/* SEARCH INPUT */}
                    <div className="relative mb-4">
                        <input 
                            type="text" 
                            placeholder="Cari nama atau NISN..." 
                            className={`w-full bg-gray-500/5 border ${cur.border} pl-10 pr-4 py-3 rounded-xl font-bold text-xs focus:outline-none focus:border-blue-500 transition-all`}
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredAvailableStudents.map((s:any) => (
                            <div 
                                key={s.id} 
                                className={`flex justify-between items-center p-4 rounded-2xl border ${cur.border} hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group`} 
                                onClick={() => addStudentToClass(s.id)}
                            >
                                <div>
                                    <p className="font-bold text-sm">{s.full_name}</p>
                                    <p className="text-[9px] opacity-40 font-black uppercase">{s.nisn || 'Tanpa NISN'}</p>
                                </div>
                                <span className="text-blue-600 font-black text-[18px] opacity-0 group-hover:opacity-100">+</span>
                            </div>
                        ))}
                        {filteredAvailableStudents.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                <span className="text-4xl mb-2">✨</span>
                                <p className="font-black uppercase text-[10px] text-center">Tidak ada siswa yang ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT KELAS (TETAP SAMA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-2xl rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]`}>
            <h2 className="text-3xl font-black tracking-tighter  mb-8">{formData.id ? 'Edit' : 'Tambah'} Kelas</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <InputItem label="Kurikulum" value={formData.kurikulum} onChange={(v:any)=>setFormData({...formData, kurikulum:v})} cur={cur} isSelect options={['Kurikulum Merdeka', 'Kurikulum 2013']} />
              <InputItem label="Nama Kelas" value={formData.nama_kelas} onChange={(v:any)=>setFormData({...formData, nama_kelas:v})} cur={cur} placeholder="Contoh: XI RPL 1" />
              <InputItem label="Jenis Rombel" value={formData.jenis_rombel} onChange={(v:any)=>setFormData({...formData, jenis_rombel:v})} cur={cur} isSelect options={['Reguler', 'Khusus', 'Praktik']} />
              <InputItem label="Tingkat" value={formData.tingkat} onChange={(v:any)=>setFormData({...formData, tingkat:v})} cur={cur} isSelect options={['X', 'XI', 'XII']} />
              <div className="col-span-2 space-y-4">
                <InputItem label="Program Keahlian" value={formData.program_keahlian} onChange={(v:any)=>setFormData({...formData, program_keahlian:v})} cur={cur} placeholder="Contoh: Pengembangan Perangkat Lunak" />
                <InputItem label="Konsentrasi Keahlian" value={formData.konsentrasi_keahlian} onChange={(v:any)=>setFormData({...formData, konsentrasi_keahlian:v})} cur={cur} placeholder="Contoh: PPLG" />
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Wali Kelas (Sync Master Pengguna)</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`} value={formData.walikelas_id || ''} onChange={(e) => setFormData({...formData, walikelas_id: e.target.value})}>
                        <option value="">-- Pilih Wali Kelas --</option>
                        {walikelas.map((w) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                    </select>
                </div>
              </div>
              <div className="col-span-2 pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InputItem({ label, value, onChange, cur, isSelect = false, options = [], placeholder = "" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">{label}</label>
      {isSelect ? (
        <select className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input required placeholder={placeholder} className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all`} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}