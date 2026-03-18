"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function ModulCetakRapor() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'identity' | 'report'>('list');

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [school, setSchool] = useState<any>(null);
  const [reportDate, setReportDate] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [ekskul, setEkskul] = useState<any[]>([]);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    const { data: cls } = await supabase.from('classes').select('id, nama_kelas, profiles!walikelas_id(full_name)').order('nama_kelas');
    const { data: sch } = await supabase.from('school_settings').select('*').single();
    const { data: dt } = await supabase.from('report_dates').select('*').order('created_at', { ascending: false }).limit(1).single();
    setClasses(cls || []);
    setSchool(sch);
    setReportDate(dt);
  };

  const loadStudents = async (clsId: string) => {
    setLoading(true);
    const cls = classes.find(c => c.id.toString() === clsId.toString());
    setSelectedClass(cls);
    const { data } = await supabase.from('class_students').select(`student_id, profiles:profiles!student_id (*)`).eq('class_id', clsId);
    setStudents(data || []);
    setLoading(false);
  };

  const prepareCetak = async (student: any, mode: 'identity' | 'report') => {
    setLoading(true);
    setSelectedStudent(student);

    if (mode === 'report') {
      const { data: grd } = await supabase.from('student_grades').select(`*, subject:subjects(*, teacher:profiles!teacher_id(full_name))`).eq('student_id', student.student_id);
      const { data: att } = await supabase.from('attendance_records').select('*').eq('student_id', student.student_id).maybeSingle();
      const { data: eks } = await supabase.from('extracurricular_members').select(`*, ekskul:extracurriculars(*)`).eq('student_id', student.student_id);
      setGrades(grd || []);
      setAttendance(att);
      setEkskul(eks || []);
    }

    setView(mode);
    setLoading(false);
  };

  const getDesc = (g: any) => {
    const ach = g.achieved_tp_ids || [];
    const imp = g.improvement_tp_ids || [];
    let text = "";
    if (ach.length > 0) text += `Menunjukkan penguasaan yang baik dalam kompetensi mata pelajaran ini. `;
    if (imp.length > 0) text += `Perlu bimbingan lebih lanjut pada beberapa materi spesifik.`;
    return text || "-";
  };

  // Helper untuk menentukan Fase secara otomatis
  const getFase = (namaKelas: string) => {
    if (!namaKelas) return "-";
    const k = namaKelas.toUpperCase();
    if (k.includes("X") && !k.includes("XI") && !k.includes("XII")) return "E";
    return "F";
  };

  // KOMPONEN BARIS BIODATA (Tetap <tr>)
  const BiodataRow = ({ label, value, no }: any) => (
    <tr className="align-top text-[12px]">
      <td className="py-1.5 w-8 text-center">{no}.</td>
      <td className="py-1.5 w-60">{label}</td>
      <td className="py-1.5 w-4 text-center">:</td>
      <td className="py-1.5 font-bold uppercase pl-2">{value || '-'}</td>
    </tr>
  );

  if (view !== 'list') {
    return (
      <div className="bg-gray-100 min-h-screen p-0 md:p-10 flex flex-col items-center">
        <div className="flex gap-4 mb-8 print:hidden">
          <button onClick={() => setView('list')} className="bg-black text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">← Kembali</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">Cetak Sekarang (PDF)</button>
        </div>

        <div className="bg-white w-[210mm] min-h-[297mm] p-[25mm] shadow-2xl print:shadow-none print:m-0 print:w-full font-serif text-black">
          
          {/* VIEW: IDENTITAS / BIODATA LENGKAP */}
          {view === 'identity' && (
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h1 className="text-lg font-black uppercase underline">Keterangan Tentang Diri Peserta Didik</h1>
              </div>

              <table className="w-full border-collapse">
                <tbody>
                  <BiodataRow no="1" label="Nama Lengkap Peserta Didik" value={selectedStudent?.profiles?.full_name} />
                  <BiodataRow no="2" label="Nomor Induk Siswa Nasional (NISN)" value={selectedStudent?.profiles?.nisn} />
                  <BiodataRow no="3" label="Nomor Induk Siswa (NIS)" value={selectedStudent?.profiles?.nis} />
                  <BiodataRow no="4" label="Tempat, Tanggal Lahir" value={`${selectedStudent?.profiles?.pob || '-'}, ${selectedStudent?.profiles?.dob || '-'}`} />
                  <BiodataRow no="5" label="Jenis Kelamin" value={selectedStudent?.profiles?.gender} />
                  <BiodataRow no="6" label="Agama" value={selectedStudent?.profiles?.religion} />
                  <BiodataRow no="7" label="Status dalam Keluarga" value={selectedStudent?.profiles?.family_status} />
                  <BiodataRow no="8" label="Anak Ke" value={selectedStudent?.profiles?.child_order} />
                  <BiodataRow no="9" label="Alamat Peserta Didik" value={selectedStudent?.profiles?.address} />
                  <BiodataRow no="10" label="Nomor Telepon Rumah/HP" value={selectedStudent?.profiles?.phone} />
                  <BiodataRow no="11" label="Sekolah Asal" value={selectedStudent?.profiles?.previous_school} />
                  <BiodataRow no="12" label="Diterima di sekolah ini" value="" />
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">a. Di Kelas</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedClass?.nama_kelas}</td>
                  </tr>
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">b. Pada Tanggal</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.admission_date || '-'}</td>
                  </tr>
                  <BiodataRow no="13" label="Nama Orang Tua" value="" />
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">a. Ayah</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.father_name}</td>
                  </tr>
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">b. Ibu</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.mother_name}</td>
                  </tr>
                  <BiodataRow no="14" label="Pekerjaan Orang Tua" value="" />
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">a. Ayah</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.father_job}</td>
                  </tr>
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">b. Ibu</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.mother_job}</td>
                  </tr>
                  <BiodataRow no="15" label="Alamat Orang Tua" value={selectedStudent?.profiles?.parent_address || selectedStudent?.profiles?.address} />
                  <BiodataRow no="16" label="Wali Peserta Didik" value="" />
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">a. Nama Wali</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.guardian_name}</td>
                  </tr>
                  <tr className="text-[12px] align-top">
                    <td></td>
                    <td className="py-1 pl-6 ">b. Pekerjaan Wali</td>
                    <td className="py-1 text-center">:</td>
                    <td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.guardian_job}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-16 flex justify-between items-start">
                <div className="w-28 h-36 border border-black flex items-center justify-center text-[10px] text-center  ml-10">
                  Pas Foto<br/>3 x 4
                </div>
                <div className="text-center space-y-20 mr-10">
                    <div className="text-sm">
                        <p>{reportDate?.location || 'Lokasi'}, {reportDate?.report_date || 'Tanggal'}</p>
                        <p>Kepala Sekolah,</p>
                    </div>
                    <div>
                        <p className="font-black underline uppercase">{school?.principal_name || 'NAMA KEPALA SEKOLAH'}</p>
                        <p className="text-xs">NIP. {school?.principal_nip || '-'}</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ISI RAPOR (HEADER BARU DENGAN SEKOLAH MANUAL) */}
          {view === 'report' && (
            <div className="space-y-6 text-[12px]">
              
              {/* HEADER KIRI & KANAN */}
              <div className="flex justify-between items-start leading-normal">
                {/* Header Bagian Kiri */}
                <div className="w-[58%] space-y-0.5">
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4">Nama Peserta Didik</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-7 font-black uppercase">{selectedStudent?.profiles?.full_name}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4">NISN / NIS</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-7 font-bold">{selectedStudent?.profiles?.nisn} / {selectedStudent?.profiles?.nis}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4">Nama Sekolah</span>
                        <span className="col-span-1 text-center">:</span>
                        {/* MANUAL: NAMA SEKOLAH */}
                        <span className="col-span-7 font-bold">SMK Ma'arif Cicalengka</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4">Alamat</span>
                        <span className="col-span-1 text-center">:</span>
                        {/* MANUAL: ALAMAT SEKOLAH */}
                        <span className="col-span-7  text-[11px] leading-tight">Jl. Ciayunan No. 33</span>
                    </div>
                </div>

                {/* Header Bagian Kanan */}
                <div className="w-[40%] space-y-0.5">
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5">Kelas</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-6 font-bold">{selectedClass?.nama_kelas}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5">Fase</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-6 font-bold">{getFase(selectedClass?.nama_kelas)}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5">Semester</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-6 font-bold">{reportDate?.semester}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5">Tahun Ajaran</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-6 font-bold">{reportDate?.academic_year || '2025/2026'}</span>
                    </div>
                </div>
              </div>

              {/* JUDUL TENGAH */}
              <div className="text-center pt-4">
                <h2 className="text-lg font-black uppercase underline tracking-[0.1em]">LAPORAN HASIL BELAJAR</h2>
              </div>

              {/* TABEL NILAI */}
              <table className="w-full border-collapse border border-black mt-2">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-10 text-center">No</th>
                        <th className="border border-black p-2 text-left">Mata Pelajaran</th>
                        <th className="border border-black p-2 w-20 text-center">Nilai Akhir</th>
                        <th className="border border-black p-2 text-left">Capaian Kompetensi</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map((g, i) => (
                        <tr key={g.id}>
                            <td className="border border-black p-2 text-center">{i + 1}</td>
                            <td className="border border-black p-2 font-bold">{g.subject?.name}</td>
                            <td className="border border-black p-2 text-center font-black text-lg">{g.score}</td>
                            <td className="border border-black p-2 text-[10px] leading-tight ">{getDesc(g)}</td>
                        </tr>
                    ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4">
                 <table className="border-collapse border border-black w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="border border-black p-1 text-[10px] uppercase text-center font-black">Ekstrakurikuler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ekskul.map(e => (
                            <tr key={e.id}>
                                <td className="border border-black p-2 font-bold">{e.ekskul?.name}</td>
                                <td className="border border-black p-2 text-center font-black">{e.predicate}</td>
                            </tr>
                        ))}
                        {ekskul.length === 0 && (
                            <tr><td colSpan={2} className="border border-black p-2 text-center opacity-30 ">- Belum ada data -</td></tr>
                        )}
                    </tbody>
                 </table>

                 <table className="border-collapse border border-black w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="border border-black p-1 text-[10px] uppercase text-center font-black">Ketidakhadiran</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border border-black p-1 px-4">Sakit</td><td className="border border-black p-1 text-center font-bold">{attendance?.sick || 0} Hari</td></tr>
                        <tr><td className="border border-black p-1 px-4">Izin</td><td className="border border-black p-1 text-center font-bold">{attendance?.permit || 0} Hari</td></tr>
                        <tr><td className="border border-black p-1 px-4">Tanpa Keterangan</td><td className="border border-black p-1 text-center font-bold">{attendance?.absent || 0} Hari</td></tr>
                    </tbody>
                 </table>
              </div>

              <div className="border border-black p-4">
                <p className="text-[9px] font-black uppercase mb-1">Catatan Wali Kelas:</p>
                <p className=" font-medium">"{attendance?.teacher_note || '-'}"</p>
              </div>

              <div className="pt-10 grid grid-cols-3 text-center text-[12px]">
                <div className="space-y-20">
                    <p>Orang Tua/Wali,</p>
                    <p className="border-b border-black w-32 mx-auto"></p>
                </div>
                <div className="flex flex-col items-center">
                    <p>{reportDate?.location}, {reportDate?.report_date}</p>
                    <p>Wali Kelas,</p>
                    {selectedClass?.teacher?.signature_url && <img src={selectedClass.teacher.signature_url} className="h-16 object-contain" alt="TTD Walas" />}
                    <div className={selectedClass?.teacher?.signature_url ? "" : "mt-20"}>
                        <p className="font-black underline uppercase">{selectedClass?.teacher?.full_name || 'NAMA WALAS'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <p className="mt-5">Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    {school?.principal_signature_url && <img src={school.principal_signature_url} className="h-16 object-contain" alt="TTD Kepsek" />}
                    <div className={school?.principal_signature_url ? "" : "mt-20"}>
                        <p className="font-black underline uppercase">{school?.principal_name || 'NAMA KEPSEK'}</p>
                        <p className="text-[10px]">NIP. {school?.principal_nip || '-'}</p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter  uppercase leading-none">Cetak Rapor</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-2`}>Manajemen Dokumen Penilaian Siswa.</p>
        </div>
        <select onChange={(e) => loadStudents(e.target.value)} className={`bg-gray-500/10 border ${cur.border} px-8 py-4 rounded-[2rem] font-black text-xs uppercase focus:border-blue-600 transition-all outline-none`}>
          <option value="">-- Pilih Rombel --</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <div key={s.student_id} className={`${cur.card} border ${cur.border} p-8 rounded-[3.5rem] space-y-6 shadow-sm hover:shadow-xl transition-all duration-500`}>
            <div>
                <h3 className="text-xl font-black  tracking-tighter uppercase leading-none">{s.profiles?.full_name}</h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">NISN: {s.profiles?.nisn || '-'}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => prepareCetak(s, 'identity')} className="flex-1 bg-gray-500/10 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-500/20 transition-all">Identitas</button>
                <button onClick={() => prepareCetak(s, 'report')} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Isi Rapor</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}