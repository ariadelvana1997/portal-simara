"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function MappingSiswa() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [targetClass, setTargetClass] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // 1. Ambil data Kelas untuk dropdown
    const { data: classData } = await supabase.from('classes').select('id, nama_kelas').order('nama_kelas');
    if (classData) setClasses(classData);

    // 2. Ambil data Siswa dan mapping kelasnya saat ini
    const { data: studentData } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name,
        class_students (
          class_id,
          classes (nama_kelas)
        )
      `)
      .contains('roles', ['Siswa'])
      .order('full_name');

    if (studentData) setStudents(studentData);
    setLoading(false);
  };

  const handleUpdateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClass) return alert("Pilih kelas terlebih dahulu!");

    setLoading(true);
    const { error } = await supabase
      .from('class_students')
      .upsert({
        student_id: selectedStudent.id,
        class_id: targetClass
      });

    if (!error) {
      alert(`Berhasil! ${selectedStudent.full_name} kini masuk kelas baru. 🚀`);
      setIsModalOpen(false);
      fetchInitialData();
    } else {
      alert("Gagal mapping: " + error.message);
    }
    setLoading(false);
  };

  const handleRemoveMapping = async (studentId: string) => {
    if (confirm("Keluarkan siswa ini dari kelas?")) {
      setLoading(true);
      await supabase.from('class_students').delete().eq('student_id', studentId);
      fetchInitialData();
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Mapping Siswa</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Tempatkan siswa ke dalam rombongan belajar (Kelas).</p>
        </div>
        <div className="relative">
            <input 
                type="text" 
                placeholder="Cari nama siswa..."
                className={`bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-3 rounded-2xl w-full md:w-64 focus:outline-none focus:border-blue-500 font-bold text-sm transition-all`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Siswa</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Status Kelas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <tr key={s.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5 font-black tracking-tight">{s.full_name}</td>
                  <td className="px-8 py-5 text-center">
                    {s.class_students?.[0] ? (
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md shadow-blue-500/20">
                        {s.class_students[0].classes.nama_kelas}
                      </span>
                    ) : (
                      <span className="opacity-20 font-black italic text-xs italic uppercase tracking-tighter">Belum Ada Kelas</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button 
                        onClick={() => { setSelectedStudent(s); setTargetClass(s.class_students?.[0]?.class_id || ''); setIsModalOpen(true); }}
                        className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                    >
                      Set Kelas
                    </button>
                    {s.class_students?.[0] && (
                        <button 
                            onClick={() => handleRemoveMapping(s.id)}
                            className="bg-red-500/10 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-90"
                        >
                            Reset
                        </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="p-20 text-center opacity-20 font-black italic">Siswa tidak ditemukan atau belum ada role Siswa.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MAPPING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic">Pilih Kelas</h2>
                <p className="text-blue-600 font-black uppercase text-xs tracking-widest">{selectedStudent?.full_name}</p>
            </div>
            
            <form onSubmit={handleUpdateMapping} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 italic ml-2">Daftar Kelas Tersedia</label>
                <select 
                  required
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`}
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}