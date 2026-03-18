"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function LeggerNilai() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  // Data Legger
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('id, nama_kelas').order('nama_kelas');
    setClasses(data || []);
  };

  const loadLeggerData = async (clsId: string) => {
    if (!clsId) {
        setSelectedClass(null);
        return;
    }
    setLoading(true);
    
    // Cari data kelas yang dipilih
    const cls = classes.find(c => c.id.toString() === clsId.toString());
    setSelectedClass(cls);

    // 1. Ambil semua Mapel di kelas ini
    const { data: subjs } = await supabase
      .from('subjects')
      .select('id, name, kktp')
      .eq('class_id', clsId)
      .order('name');

    // 2. Ambil semua Siswa di kelas ini (DIPERBAIKI: Menggunakan explicit join !student_id)
    const { data: stus } = await supabase
      .from('class_students')
      .select(`
        student_id, 
        profiles:profiles!student_id(full_name)
      `)
      .eq('class_id', clsId);

    // 3. Ambil semua Nilai untuk mapel-mapel tersebut
    const subjectIds = subjs?.map(s => s.id) || [];
    
    if (subjectIds.length > 0) {
        const { data: grds } = await supabase
          .from('student_grades')
          .select('student_id, subject_id, score')
          .in('subject_id', subjectIds);
          
        setGrades(grds || []);
    } else {
        setGrades([]);
    }

    setSubjects(subjs || []);
    setStudents(stus || []);
    setLoading(false);
  };

  // Fungsi Helper: Ambil Nilai Spesifik
  const getScore = (studentId: string, subjectId: number) => {
    const record = grades.find(g => g.student_id === studentId && g.subject_id === subjectId);
    return record ? record.score : 0;
  };

  // Fungsi Helper: Hitung Rata-rata Siswa
  const getAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.student_id === studentId);
    if (studentGrades.length === 0 || subjects.length === 0) return "0.0";
    const total = studentGrades.reduce((sum, g) => sum + g.score, 0);
    return (total / subjects.length).toFixed(1);
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Legger Nilai</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em]`}>
            Rekapitulasi Capaian Hasil Belajar Per Rombel
          </p>
        </div>
        
        <select 
          onChange={(e) => loadLeggerData(e.target.value)}
          className={`bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-3 rounded-2xl font-black text-xs uppercase outline-none focus:border-blue-600 transition-all`}
        >
          <option value="">-- Pilih Kelas --</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black  opacity-20 animate-pulse text-2xl">MENGKOMPILASI DATA LEGGER...</div>
      ) : selectedClass ? (
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-2xl`}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 sticky left-0 bg-white dark:bg-slate-900 z-10">Nama Siswa</th>
                  {subjects.map(s => (
                    <th key={s.id} className="px-4 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center min-w-[120px]">
                      {s.name}
                      <span className="block text-[8px] text-orange-600 mt-1 ">KKTP: {s.kktp}</span>
                    </th>
                  ))}
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-60 text-center bg-blue-600/5">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id} className={`border-b ${cur.border} hover:bg-gray-500/5 transition-all`}>
                    <td className="px-8 py-5 font-black text-xs uppercase sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-gray-500/5">
                      {/* DIPERBAIKI: Menggunakan optional chaining untuk profiles */}
                      {s.profiles?.full_name || "Tanpa Nama"}
                    </td>
                    {subjects.map(sub => {
                      const score = getScore(s.student_id, sub.id);
                      const isUnderKKTP = score < (sub.kktp || 75);
                      return (
                        <td key={sub.id} className={`px-4 py-5 text-center font-black text-sm ${isUnderKKTP && score > 0 ? 'text-red-500' : ''}`}>
                          {score === 0 ? <span className="opacity-10">-</span> : score}
                        </td>
                      );
                    })}
                    <td className="px-8 py-5 text-center font-black text-sm bg-blue-600/5 text-blue-600 ">
                      {getAverage(s.student_id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* FOOTER INFO */}
          <div className="p-6 bg-gray-500/5 flex justify-between items-center text-[9px] font-black uppercase opacity-40 tracking-widest">
            <span>Total Siswa: {students.length}</span>
            <span>SIMARA Legger System v1.0 By DELVANA dan Ceu Ai</span>
          </div>
        </div>
      ) : (
        <div className="p-32 border-4 border-dashed border-gray-500/10 rounded-[4rem] flex flex-col items-center justify-center opacity-20">
            <span className="text-6xl mb-4">📊</span>
            <p className="font-black  text-xl">Silakan pilih kelas untuk melihat rekap nilai.</p>
        </div>
      )}

      {/* FLOATING ACTION */}
      {selectedClass && (
        <div className="fixed bottom-10 right-10">
            <button 
                onClick={() => window.print()}
                className="bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
                Cetak Legger
            </button>
        </div>
      )}
    </div>
  );
}