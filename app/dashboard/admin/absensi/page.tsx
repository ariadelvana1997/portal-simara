"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function AbsensiDanCatatan() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({}); // { student_id: { sick: 0, permit: 0, absent: 0, note: '' } }

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    // Ambil data kelas beserta Wali Kelasnya
    const { data } = await supabase
      .from('classes')
      .select(`id, nama_kelas, teacher:profiles!walikelas_id(full_name)`)
      .order('nama_kelas');
    setClasses(data || []);
    setLoading(false);
  };

  const loadStudentAttendance = async (cls: any) => {
    setLoading(true);
    setSelectedClass(cls);
    
    // 1. Ambil Siswa di kelas ini
    const { data: stus } = await supabase
      .from('class_students')
      .select(`student_id, profiles(full_name)`)
      .eq('class_id', cls.id);

    // 2. Ambil Rekam Absensi yang sudah ada
    const { data: records } = await supabase.from('attendance_records').select('*');

    const attMap: any = {};
    records?.forEach(r => {
      attMap[r.student_id] = { sick: r.sick, permit: r.permit, absent: r.absent, note: r.teacher_note };
    });

    setStudents(stus || []);
    setAttendance(attMap);
    setLoading(false);
  };

  const handleUpdate = (studentId: string, field: string, value: any) => {
    setAttendance((prev: any) => ({
      ...prev,
      [studentId]: { 
        ...(prev[studentId] || { sick: 0, permit: 0, absent: 0, note: '' }), 
        [field]: value 
      }
    }));
  };

  const saveAll = async () => {
    setSaveLoading(true);
    const payloads = students.map(s => ({
      student_id: s.student_id,
      sick: attendance[s.student_id]?.sick || 0,
      permit: attendance[s.student_id]?.permit || 0,
      absent: attendance[s.student_id]?.absent || 0,
      teacher_note: attendance[s.student_id]?.note || ''
    }));

    const { error } = await supabase.from('attendance_records').upsert(payloads, { onConflict: 'student_id' });
    
    if (!error) {
        alert("✨ Absensi dan Catatan Berhasil Disimpan!");
    } else {
        alert("Gagal: " + error.message);
    }
    setSaveLoading(false);
  };

  if (loading && !selectedClass) return <div className="p-20 text-center font-black  opacity-20">MENGAMBIL DATA KELAS...</div>;

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Absensi & Catatan</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em]`}>
            {selectedClass ? `Wali Kelas: ${selectedClass.teacher?.full_name}` : 'Pilih Rombongan Belajar'}
          </p>
        </div>
        {selectedClass && (
          <button onClick={saveAll} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Simpan Perubahan</button>
        )}
      </div>

      {/* PILIH KELAS */}
      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map(c => (
                <div key={c.id} onClick={() => loadStudentAttendance(c)} className={`${cur.card} border ${cur.border} p-8 rounded-[3rem] cursor-pointer hover:border-blue-600 transition-all group`}>
                    <h3 className="text-3xl font-black  tracking-tighter group-hover:text-blue-600">{c.nama_kelas}</h3>
                    <p className="text-[10px] font-black opacity-30 uppercase mt-1">Walas: {c.teacher?.full_name}</p>
                </div>
            ))}
        </div>
      ) : (
        <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Siswa</th>
                            <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center w-24">Sakit</th>
                            <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center w-24">Izin</th>
                            <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center w-24">Alfa</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Catatan Wali Kelas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.student_id} className={`border-b ${cur.border} hover:bg-gray-500/5 transition-all`}>
                                <td className="px-8 py-6">
                                    <p className="font-black text-sm uppercase tracking-tight">{s.profiles.full_name}</p>
                                </td>
                                <td className="px-4 py-6">
                                    <input type="number" className="w-full bg-gray-500/5 border border-gray-500/10 rounded-xl py-3 text-center font-black text-lg focus:border-blue-600 outline-none" value={attendance[s.student_id]?.sick || 0} onChange={(e) => handleUpdate(s.student_id, 'sick', parseInt(e.target.value) || 0)} />
                                </td>
                                <td className="px-4 py-6">
                                    <input type="number" className="w-full bg-gray-500/5 border border-gray-500/10 rounded-xl py-3 text-center font-black text-lg focus:border-blue-600 outline-none" value={attendance[s.student_id]?.permit || 0} onChange={(e) => handleUpdate(s.student_id, 'permit', parseInt(e.target.value) || 0)} />
                                </td>
                                <td className="px-4 py-6">
                                    <input type="number" className="w-full bg-gray-500/5 border border-gray-500/10 rounded-xl py-3 text-center font-black text-lg focus:border-blue-600 outline-none" value={attendance[s.student_id]?.absent || 0} onChange={(e) => handleUpdate(s.student_id, 'absent', parseInt(e.target.value) || 0)} />
                                </td>
                                <td className="px-8 py-6">
                                    <textarea 
                                        placeholder="Tulis catatan perkembangan siswa di sini..."
                                        className="w-full bg-gray-500/5 border border-gray-500/10 rounded-2xl p-4 text-[11px] font-bold focus:border-blue-600 outline-none resize-none h-20"
                                        value={attendance[s.student_id]?.note || ''}
                                        onChange={(e) => handleUpdate(s.student_id, 'note', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-8 bg-gray-500/5 flex justify-center">
                 <button onClick={() => setSelectedClass(null)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 tracking-widest">Pilih Kelas Lain</button>
            </div>
        </div>
      )}

      {saveLoading && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black  text-white text-[10px] tracking-[0.3em] uppercase">Menyimpan Catatan Walas...</p>
        </div>
      )}
    </div>
  );
}