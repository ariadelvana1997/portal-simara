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

  // State tambahan untuk sinkronisasi Capaian Pembelajaran (TP)
  const [allTPs, setAllTPs] = useState<any[]>([]);

  // --- HELPER FORMAT NAMA & GELAR (PUEBI/EYD) ---
  const formatNamaGelar = (str: string) => {
    if (!str) return "";
    let cleanStr = str.trim();
    const markers = ["S.Pd", "M.Pd", "M.M", "S.T", "S.Kom", "S.Sos", "SPD", "MPD", "MM", "ST", "SKOM", "SSOS"];
    if (!cleanStr.includes(',')) {
      for (const m of markers) {
        const reg = new RegExp(`\\s+(${m})`, 'i');
        if (reg.test(cleanStr)) {
          cleanStr = cleanStr.replace(reg, ', $1');
          break;
        }
      }
    }
    const parts = cleanStr.split(',');
    const nama = parts[0].trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (parts.length > 1) {
      const mapping: { [key: string]: string } = {
        "SPD": "S.Pd.", "S.PD": "S.Pd.", "MPD": "M.Pd.", "M.PD": "M.Pd.",
        "MM": "M.M.", "M.M": "M.M.", "ST": "S.T.", "S.T": "S.T.",
        "SKOM": "S.Kom.", "S.KOM": "S.Kom.", "SSOS": "S.Sos.", "S.SOS": "S.Sos."
      };
      const gelarArr = parts.slice(1).join(',').trim().toUpperCase().split(/[,\s]+/).filter(Boolean).map(g => {
        const key = g.endsWith('.') ? g.slice(0, -1) : g;
        return mapping[key] || g;
      });
      return `${nama}, ${gelarArr.join(', ')}`;
    }
    return nama;
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    // 1. Ambil data Kelas
    const { data: cls } = await supabase.from('classes').select('id, nama_kelas, profiles!walikelas_id(full_name)').order('nama_kelas');
    
    // 2. Ambil data Sekolah (Identitas Sekolah)
    const { data: sch } = await supabase.from('school_info').select('*').single();
    
    // 3. Ambil data Tahun Ajaran & Semester terbaru dari report_dates
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
      // 1. Ambil Nilai Siswa
      const { data: grd } = await supabase.from('student_grades').select(`*, subject:subjects(*, teacher:profiles!teacher_id(full_name))`).eq('student_id', student.student_id);
      
      // 2. SINKRONISASI: Ambil Master TP (Pastikan kolom 'description' ada sesuai modul Nilai Anda)
      const { data: tps } = await supabase.from('learning_objectives').select('*');
      
      const { data: att } = await supabase.from('attendance_records').select('*').eq('student_id', student.student_id).maybeSingle();
      const { data: eks } = await supabase.from('extracurricular_members').select(`*, ekskul:extracurriculars(*)`).eq('student_id', student.student_id);
      
      setGrades(grd || []);
      setAllTPs(tps || []); // Simpan TP ke state
      setAttendance(att);
      setEkskul(eks || []);
    }
    setView(mode);
    setLoading(false);
  };

  // FUNGSI GETDESC: Disinkronkan dengan modul Nilai (menggunakan tp.description)
  const getDesc = (g: any) => {
    // Ambil array ID (pastikan dikonversi ke string untuk perbandingan aman)
    const achIds = (g.achieved_tp_ids || []).map((id: any) => String(id));
    const impIds = (g.improvement_tp_ids || []).map((id: any) => String(id));

    // Filter TP yang sesuai dan ambil kolom 'description' (sesuai modul Nilai Anda)
    const achText = allTPs
      .filter(tp => achIds.includes(String(tp.id)))
      .map(tp => tp.description) // Diganti dari 'title' ke 'description'
      .filter(Boolean)
      .join(", ");

    const impText = allTPs
      .filter(tp => impIds.includes(String(tp.id)))
      .map(tp => tp.description) // Diganti dari 'title' ke 'description'
      .filter(Boolean)
      .join(", ");

    let finalDesc = "";
    if (achText) {
      finalDesc += `Menunjukkan penguasaan yang baik dalam ${achText}. `;
    }
    if (impText) {
      finalDesc += `Perlu ditingkatkan dalam memahami ${impText}.`;
    }

    return finalDesc || "-";
  };

  const getFase = (namaKelas: string) => {
    if (!namaKelas) return "-";
    const k = namaKelas.toUpperCase();
    if (k.includes("X") && !k.includes("XI") && !k.includes("XII")) return "E";
    return "F";
  };

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
          <button onClick={() => setView('list')} className="bg-black text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest">← Kembali</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase shadow-xl">Cetak Sekarang (PDF)</button>
        </div>

        <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] shadow-2xl print:shadow-none print:m-0 print:w-full font-serif text-black">
          
          {/* VIEW 1: IDENTITAS */}
          {view === 'identity' && (
            <div className="space-y-8">
              <div className="text-center mb-10"><h1 className="text-lg font-black uppercase underline">Identitas Peserta Didik</h1></div>
              <table className="w-full border-collapse">
                <tbody>
                  <BiodataRow no="1" label="Nama Lengkap Peserta Didik" value={selectedStudent?.profiles?.full_name} />
                  <BiodataRow no="2" label="Nomor Induk/NISN" value={`${selectedStudent?.profiles?.nis || '-'} / ${selectedStudent?.profiles?.nisn || '-'}`} />
                  <BiodataRow no="3" label="Tempat, Tanggal Lahir" value={`${selectedStudent?.profiles?.pob || '-'}, ${selectedStudent?.profiles?.dob || '-'}`} />
                  <BiodataRow no="4" label="Jenis Kelamin" value={selectedStudent?.profiles?.gender} />
                  <BiodataRow no="5" label="Agama" value={selectedStudent?.profiles?.religion} />
                  <BiodataRow no="6" label="Status dalam Keluarga" value={selectedStudent?.profiles?.family_status} />
                  <BiodataRow no="7" label="Anak ke" value={selectedStudent?.profiles?.child_order} />
                  <BiodataRow no="8" label="Alamat Peserta Didik" value={selectedStudent?.profiles?.address} />
                  <BiodataRow no="9" label="Nomor Telepon Rumah" value={selectedStudent?.profiles?.phone} />
                  <BiodataRow no="10" label="Sekolah Asal" value={selectedStudent?.profiles?.previous_school} />
                  <BiodataRow no="11" label="Diterima di sekolah ini" value="" />
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">a. Di Kelas</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedClass?.nama_kelas}</td></tr>
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">b. Pada Tanggal</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.admission_date || '-'}</td></tr>
                  <BiodataRow no="12" label="Nama Orang Tua" value="" />
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">a. Ayah</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.father_name}</td></tr>
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">b. Ibu</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.mother_name}</td></tr>
                  <BiodataRow no="13" label="Alamat Orang Tua" value={selectedStudent?.profiles?.parent_address || selectedStudent?.profiles?.address} />
                  <BiodataRow no="14" label="Pekerjaan Orang Tua" value="" />
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">a. Ayah</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.father_job}</td></tr>
                  <tr className="text-[12px] align-top"><td></td><td className="py-1 pl-6 ">b. Ibu</td><td className="py-1 text-center">:</td><td className="py-1 font-bold pl-2">{selectedStudent?.profiles?.mother_job}</td></tr>
                  <BiodataRow no="15" label="Nama Wali Siswa" value={selectedStudent?.profiles?.guardian_name} />
                  <BiodataRow no="16" label="Alamat Wali Murid" value={selectedStudent?.profiles?.guardian_address} />
                  <BiodataRow no="17" label="Pekerjaan Wali Murid" value={selectedStudent?.profiles?.guardian_job} />
                </tbody>
              </table>
              <div className="pt-16 flex justify-between items-start">
                <div className="w-28 h-36 border border-black flex items-center justify-center text-[10px] text-center ml-10">Pas Foto<br/>3 x 4</div>
                <div className="text-center space-y-20 mr-10">
                    <div className="text-sm"><p>{reportDate?.location || 'Samarinda'}, {reportDate?.report_date || '-'}</p><p>Kepala Sekolah,</p></div>
                    <div>
                        <p className="font-black underline text-[13px]">{formatNamaGelar(reportDate?.principal_name || school?.nama_ks || '-')}</p>
                        <p className="text-xs">{reportDate?.principal_id_type || 'NUPTK'}. {reportDate?.principal_id_number || school?.nuptk_ks || '-'}</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ISI RAPOR */}
          {view === 'report' && (
            <div className="space-y-4 text-[11px]">
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div className="w-[60%] space-y-1">
                    <div className="grid grid-cols-12"><span className="col-span-4">Nama Murid</span><span className="col-span-1">:</span><span className="col-span-7 font-bold uppercase">{selectedStudent?.profiles?.full_name}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-4">NIS / NISN</span><span className="col-span-1">:</span><span className="col-span-7 font-bold">{selectedStudent?.profiles?.nis} / {selectedStudent?.profiles?.nisn}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-4">Sekolah</span><span className="col-span-1">:</span><span className="col-span-7 font-bold uppercase">{school?.nama || '-'}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-4">Alamat</span><span className="col-span-1">:</span><span className="col-span-7 italic">{school?.alamat_jalan || '-'}</span></div>
                </div>
                <div className="w-[35%] space-y-1">
                    <div className="grid grid-cols-12"><span className="col-span-5">Kelas</span><span className="col-span-1">:</span><span className="col-span-6 font-bold">{selectedClass?.nama_kelas}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-5">Fase</span><span className="col-span-1">:</span><span className="col-span-6 font-bold">{getFase(selectedClass?.nama_kelas)}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-5">Semester</span><span className="col-span-1">:</span><span className="col-span-6 font-bold">{reportDate?.semester_number || '-'}</span></div>
                    <div className="grid grid-cols-12"><span className="col-span-5">Tahun Ajaran</span><span className="col-span-1">:</span><span className="col-span-6 font-bold">{reportDate?.academic_year || '-'}</span></div>
                </div>
              </div>

              <div className="text-center py-2"><h2 className="text-md font-bold uppercase">LAPORAN HASIL BELAJAR</h2></div>

              <table className="w-full border-collapse border border-black">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border border-black p-1.5 w-8">No</th>
                        <th className="border border-black p-1.5 text-left">Mata Pelajaran</th>
                        <th className="border border-black p-1.5 w-20">Nilai Akhir</th>
                        <th className="border border-black p-1.5 text-left">Capaian Kompetensi</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map((g, i) => (
                        <tr key={g.id}>
                            <td className="border border-black p-1.5 text-center">{i + 1}</td>
                            <td className="border border-black p-1.5 font-bold">{g.subject?.name}</td>
                            <td className="border border-black p-1.5 text-center font-bold text-lg">{g.score}</td>
                            {/* Menampilkan Capaian Kompetensi dari DB Nilai */}
                            <td className="border border-black p-1.5 text-[10px] leading-tight text-justify">{getDesc(g)}</td>
                        </tr>
                    ))}
                </tbody>
              </table>

              <div className="space-y-1">
                <h3 className="font-bold uppercase underline">Kokurikuler</h3>
                <div className="border border-black p-3 space-y-2 leading-relaxed text-justify">
                    <p>Pada semester ini, ananda menunjukkan capaian yang baik dalam penguatan profil lulusan melalui kegiatan kokurikuler <strong>PROYEK PENGUATAN PROFIL PELAJAR PANCASILA</strong>.</p>
                    <p>Ananda menunjukkan perkembangan yang sangat baik dalam dimensi Beriman, Bertakwa Kepada Tuhan YME, dan Berakhlak Mulia, dimensi Mandiri, serta dimensi Kreatif. Ananda juga menunjukkan kompetensi yang cakap dalam dimensi Bergotong Royong dan Bernalar Kritis.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h3 className="font-bold uppercase underline mb-1">Ekstrakurikuler</h3>
                    <table className="w-full border-collapse border border-black">
                        <thead><tr className="bg-gray-50"><th className="border border-black p-1 w-8">No</th><th className="border border-black p-1 text-left">Kegiatan</th><th className="border border-black p-1">Keterangan</th></tr></thead>
                        <tbody>
                            {ekskul.map((e, i) => (<tr key={e.id}><td className="border border-black p-1 text-center">{i+1}</td><td className="border border-black p-1 font-bold">{e.ekskul?.name}</td><td className="border border-black p-1 text-center font-bold">{e.predicate}</td></tr>))}
                            {ekskul.length === 0 && <tr><td colSpan={3} className="border border-black p-1 text-center italic">Belum ada data</td></tr>}
                        </tbody>
                    </table>
                 </div>
                 <div>
                    <h3 className="font-bold uppercase underline mb-1">Ketidakhadiran</h3>
                    <table className="w-full border-collapse border border-black">
                        <tbody>
                            <tr><td className="border border-black p-1 px-3">Sakit</td><td className="border border-black p-1 text-center font-bold">{attendance?.sick || 0} hari</td></tr>
                            <tr><td className="border border-black p-1 px-3">Izin</td><td className="border border-black p-1 text-center font-bold">{attendance?.permit || 0} hari</td></tr>
                            <tr><td className="border border-black p-1 px-3">Tanpa Keterangan</td><td className="border border-black p-1 text-center font-bold">{attendance?.absent || 0} hari</td></tr>
                        </tbody>
                    </table>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="border border-black p-2"><p className="font-bold underline uppercase text-[9px] mb-1">Catatan Wali Kelas:</p><p className="italic">"{attendance?.teacher_note || '-'}"</p></div>
                <div className="border border-black p-2 min-h-[40px]"><p className="font-bold underline uppercase text-[9px] mb-1">Tanggapan Orang Tua/Wali Murid:</p></div>
              </div>

              <div className="pt-6">
                <div className="flex justify-between text-center">
                    <div className="w-1/3 space-y-16">
                        <p>Mengetahui,<br/>Orang Tua Murid</p>
                        <p className="font-bold">...........................................</p>
                    </div>
                    <div className="w-1/3 space-y-16">
                        <p>{reportDate?.location || 'Lokasi'}, {reportDate?.report_date || '-'}<br/>Wali Kelas</p>
                        <div>
                            <p className="font-bold underline">{formatNamaGelar(reportDate?.teacher_name || selectedClass?.profiles?.full_name || '-')}</p>
                            <p>NUPTK. {reportDate?.teacher_id_number || '-'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center text-center mt-4">
                    <div className="w-1/3 space-y-16">
                        <p>Mengetahui,<br/>Kepala Sekolah</p>
                        <div>
                            <p className="font-bold underline">{formatNamaGelar(reportDate?.principal_name || school?.nama_ks || '-')}</p>
                            <p>{reportDate?.principal_id_type || 'NUPTK'}. {reportDate?.principal_id_number || school?.nuptk_ks || '-'}</p>
                        </div>
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
      <div className="flex justify-between items-center px-4">
        <div><h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Cetak Rapor</h1><p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manajemen Dokumen Penilaian Siswa.</p></div>
        <select onChange={(e) => loadStudents(e.target.value)} className="bg-gray-500/10 border p-4 rounded-[2rem] font-black text-xs uppercase outline-none focus:border-blue-600 transition-all"><option value="">-- Pilih Rombel --</option>{classes.map(c => <option key={c.id} value={c.id}>{c.nama_kelas}</option>)}</select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <div key={s.student_id} className={`${cur.card} border p-8 rounded-[3.5rem] space-y-6 shadow-sm hover:shadow-xl transition-all duration-500`}>
            <div><h3 className="text-xl font-black tracking-tighter uppercase leading-none">{s.profiles?.full_name}</h3><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">NISN: {s.profiles?.nisn || '-'}</p></div>
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