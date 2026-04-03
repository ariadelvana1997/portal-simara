"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout'; // Mengambil context dari layout guru
import { supabase } from '@/lib/supabase';

export default function LeggerNilaiGuru() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true); // Default true agar sinkronisasi awal lancar
  const [dataLoading, setDataLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  // Data Legger
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    if (profile) fetchMyClasses();
  }, [profile]);

  const fetchMyClasses = async () => {
    setLoading(true);
    try {
      // MODE TERBUKA: Kita ambil semua daftar kelas tanpa filter walikelas_id
      // Ini menjamin data tidak akan "Zonk" / Terkunci lagi.
      const { data, error } = await supabase
        .from('classes')
        .select('id, nama_kelas')
        .order('nama_kelas');
      
      if (error) throw error;
      setClasses(data || []);

      // Jika guru tersebut memang Wali Kelas di salah satu kelas, 
      // kita coba bantu arahkan otomatis ke kelas miliknya jika ketemu
      const myOwnClass = data?.find((c: any) => c.walikelas_id === profile.id);
      if (myOwnClass) {
          loadLeggerData(myOwnClass.id);
      } else if (data && data.length > 0) {
          // Jika tidak ketemu yang spesifik, biarkan guru memilih sendiri dari dropdown
          // atau muat kelas pertama sebagai preview
          loadLeggerData(data[0].id);
      }
      
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeggerData = async (clsId: string) => {
    if (!clsId) {
        setSelectedClass(null);
        return;
    }
    setDataLoading(true);
    
    try {
      const cls = classes.find(c => c.id.toString() === clsId.toString());
      setSelectedClass(cls);

      // 1. Ambil semua Mapel di kelas ini
      const { data: subjs } = await supabase
        .from('subjects')
        .select('id, name, kktp')
        .eq('class_id', clsId)
        .order('name');

      // 2. Ambil semua Siswa di kelas ini
      const { data: stus } = await supabase
        .from('class_students')
        .select(`
          student_id, 
          profiles:profiles!student_id(full_name)
        `)
        .eq('class_id', clsId);

      // 3. Ambil semua Nilai (SINKRON DENGAN DATABASE UTAMA)
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
    } catch (err) {
      console.error("Error loading legger:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const getScore = (studentId: string, subjectId: number) => {
    const record = grades.find(g => g.student_id === studentId && g.subject_id === subjectId);
    return record ? record.score : 0;
  };

  const getAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.student_id === studentId);
    if (studentGrades.length === 0 || subjects.length === 0) return "0.0";
    const total = studentGrades.reduce((sum, g) => sum + g.score, 0);
    return (total / subjects.length).toFixed(1);
  };

  if (!profile) return null;

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter  uppercase leading-none">
            Legger <span className="text-blue-600">Nilai</span>
          </h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-3`}>
            {selectedClass ? `Rekapitulasi Hasil Belajar Kelas ${selectedClass.nama_kelas}` : 'Pilih Rombongan Belajar Kelas Anda'}
          </p>
        </div>
        
        {classes.length > 1 && (
            <select 
            value={selectedClass?.id || ""}
            onChange={(e) => loadLeggerData(e.target.value)}
            className={`bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-black text-[10px] uppercase outline-none focus:border-blue-600 transition-all cursor-pointer`}
            >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}
            </select>
        )}
      </div>

      {loading || dataLoading ? (
        <div className="p-32 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black text-[10px] uppercase tracking-[0.4em] opacity-20">Menyinkronkan Database...</p>
        </div>
      ) : selectedClass ? (
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500`}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest opacity-40 sticky left-0 bg-white z-10">Nama Siswa</th>
                  {subjects.map(s => (
                    <th key={s.id} className="px-6 py-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-center min-w-[140px]">
                      {s.name}
                      <span className="block text-[8px] text-orange-600 mt-2 tracking-tighter">KKTP: {s.kktp || 75}</span>
                    </th>
                  ))}
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest opacity-60 text-center bg-blue-600/5 text-blue-600">Rata-rata</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {students.map((s) => (
                  <tr key={s.student_id} className={`border-b ${cur.border} hover:bg-gray-500/5 transition-all group`}>
                    <td className="px-10 py-6 font-black text-xs uppercase sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-500/5">
                      {s.profiles?.full_name || "Tanpa Nama"}
                    </td>
                    {subjects.map(sub => {
                      const score = getScore(s.student_id, sub.id);
                      const isUnderKKTP = score < (sub.kktp || 75);
                      return (
                        <td key={sub.id} className={`px-6 py-6 text-center font-black text-sm ${isUnderKKTP && score > 0 ? 'text-red-500' : ''}`}>
                          {score === 0 ? <span className="opacity-10">-</span> : score}
                        </td>
                      );
                    })}
                    <td className="px-10 py-6 text-center font-black text-sm bg-blue-600/5 text-blue-600 ">
                      {getAverage(s.student_id)}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                   <tr><td colSpan={subjects.length + 2} className="p-20 text-center opacity-30 font-black uppercase tracking-widest">Belum ada siswa di kelas ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-gray-500/5 flex justify-between items-center text-[9px] font-black uppercase opacity-40 tracking-widest">
            <div className="flex gap-6">
                <span>Siswa: {students.length}</span>
                <span>Mata Pelajaran: {subjects.length}</span>
            </div>
            <span>SIMARA Legger System v1.0 • Kelas {selectedClass.nama_kelas}</span>
          </div>
        </div>
      ) : (
        <div className="p-32 border-4 border-dashed border-gray-500/10 rounded-[4rem] flex flex-col items-center justify-center opacity-20">
            <span className="text-6xl mb-6">📊</span>
            <p className="font-black text-xl tracking-tighter uppercase">Data Legger Terkunci</p>
            <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Sistem tidak menemukan rombel yang menugaskan anda sebagai Wali Kelas.</p>
        </div>
      )}

      {/* PRINT BUTTON */}
      {selectedClass && (
        <div className="fixed bottom-10 right-10 z-50">
            <button 
                onClick={() => window.print()}
                className="bg-black text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Cetak Legger
            </button>
        </div>
      )}
    </div>
  );
}