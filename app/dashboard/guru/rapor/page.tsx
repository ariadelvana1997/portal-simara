"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout'; // Mengambil context dari layout guru
import { supabase } from '@/lib/supabase';

export default function RaporWalikelas() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'identity' | 'report'>('list');

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [school, setSchool] = useState<any>(null);
  const [reportDate, setReportDate] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [allTPs, setAllTPs] = useState<any[]>([]);
  const [ekskul, setEkskul] = useState<any[]>([]);
  const [kokurikuler, setKokurikuler] = useState<any[]>([]);

  // --- PRINT & OVERRIDE SETTINGS ---
  const [paperSize, setPaperSize] = useState('A4'); 
  const [margin, setMargin] = useState(1.5); 
  const [scale, setScale] = useState(100); 
  const [bgIdentity, setBgIdentity] = useState('#ffffff'); 
  const [overrideTeacherNuptk, setOverrideTeacherNuptk] = useState("");

  // --- LOGIKA SISTEMATIKA NAMA & GELAR ---
  const formatNamaGelar = (str: string) => {
    if (!str || str === "-") return "-";
    const parts = str.split(',');
    let namaAsli = parts[0].trim().toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (parts.length > 1) {
      let gelarPart = parts.slice(1).join(',').toUpperCase();
      let gelarRapi = gelarPart
        .replace(/S\.PD/g, "S.Pd.")
        .replace(/GR/g, "Gr.")
        .replace(/\s+/g, ' ')
        .split(',')
        .map(g => g.trim())
        .join(', ');

      gelarRapi = gelarRapi.replace(/\.\./g, ".");
      if (!gelarRapi.endsWith('.')) gelarRapi += '.';
      return `${namaAsli}, ${gelarRapi}`;
    }
    return namaAsli;
  };

  useEffect(() => { 
    if (profile) fetchInitial(); 
  }, [profile]);

  const fetchInitial = async () => {
    setLoading(true);
    try {
        // SINKRONISASI: Filter kelas berdasarkan Wali Kelas yang sedang login
        const { data: cls } = await supabase
            .from('classes')
            .select(`*, profiles:profiles!walikelas_id(*)`)
            .eq('walikelas_id', profile.id)
            .order('nama_kelas');

        const { data: sch } = await supabase.from('school_info').select('*').single();
        const { data: dt } = await supabase.from('report_dates').select('*').order('created_at', { ascending: false }).limit(1).single();
        
        if (cls) {
            setClasses(cls);
            // Jika Guru hanya punya 1 kelas walas, langsung muat siswanya
            if (cls.length === 1) {
                loadStudents(cls[0]);
            }
        }
        setSchool(sch); 
        setReportDate(dt);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const loadStudents = async (clsObj: any) => {
    setLoading(true);
    try {
        const { data: freshCls } = await supabase
            .from('classes')
            .select(`*, profiles:profiles!walikelas_id(*)`)
            .eq('id', clsObj.id)
            .single();

        setSelectedClass(freshCls || clsObj);
        setOverrideTeacherNuptk(freshCls?.profiles?.nuptk || "");

        const { data: stdData } = await supabase
            .from('class_students')
            .select(`student_id, profiles:profiles!student_id (*)`)
            .eq('class_id', clsObj.id);
            
        setStudents(stdData || []);
    } finally {
        setLoading(false);
    }
  };

  const prepareCetak = async (student: any, mode: 'identity' | 'report') => {
    setLoading(true);
    setSelectedStudent(student);
    if (mode === 'report') {
      const [gRes, tRes, aRes, eRes, kRes] = await Promise.all([
        supabase.from('student_grades').select(`*, subject:subjects(*, teacher:profiles!teacher_id(full_name))`).eq('student_id', student.student_id),
        supabase.from('learning_objectives').select('*'),
        supabase.from('attendance_records').select('*').eq('student_id', student.student_id).maybeSingle(),
        supabase.from('extracurricular_members').select(`*, ekskul:extracurriculars(*)`).eq('student_id', student.student_id),
        supabase.from('kokurikuler_descriptions')
                .select(`description_text, group:kokurikuler_groups(group_name, activity:kokurikuler_activities(activity_name))`)
                .eq('student_id', student.student_id)
      ]);

      setGrades(gRes.data || []); 
      setAllTPs(tRes.data || []); 
      setAttendance(aRes.data); 
      setEkskul(eRes.data || []);
      setKokurikuler(kRes.data || []);
    }
    setView(mode);
    setLoading(false);
  };

  const getDesc = (g: any) => {
    const achIds = (g.achieved_tp_ids || []).map((id: any) => String(id));
    const impIds = (g.improvement_tp_ids || []).map((id: any) => String(id));
    const achText = allTPs.filter(tp => achIds.includes(String(tp.id))).map(tp => tp.description).filter(Boolean).join(", ");
    const impText = allTPs.filter(tp => impIds.includes(String(tp.id))).map(tp => tp.description).filter(Boolean).join(", ");
    let finalDesc = "";
    if (achText) finalDesc += `Menunjukkan penguasaan yang baik dalam ${achText}. `;
    if (impText) finalDesc += `Perlu ditingkatkan dalam memahami ${impText}.`;
    return finalDesc || "-";
  };

  const getFase = (namaKelas: string) => {
    if (!namaKelas) return "-";
    const k = namaKelas.toUpperCase();
    if (k.includes("X") && !k.includes("XI") && !k.includes("XII")) return "E";
    return "F";
  };

  const BiodataRow = ({ label, value, no, sub }: any) => (
    <tr className="align-top text-[12px]">
      <td className="py-1 w-8 text-center">{no && `${no}.`}</td>
      <td className={`py-1 ${sub ? 'pl-6' : ''}`}>{label}</td>
      <td className="py-1 w-4 text-center">:</td>
      <td className="py-1 font-bold uppercase pl-2">{value || '-'}</td>
    </tr>
  );

  if (view !== 'list') {
    return (
      <div className="bg-gray-100 min-h-screen p-0 md:p-10 flex flex-col items-center">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            header, aside, .no-print, nav, button, [role="navigation"] { display: none !important; visibility: hidden !important; }
            html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
            @page { size: ${paperSize === 'A4' ? '210mm 297mm' : '215mm 330mm'}; margin: 0; counter-increment: page; }
            body { counter-reset: page 0; }
            .print-area { position: relative !important; width: 100% !important; padding: ${margin}cm !important; padding-bottom: 3.5cm !important; transform: scale(${scale / 100}); transform-origin: top center; background: white !important; box-shadow: none !important; }
            .avoid-break { break-inside: avoid !important; }
            .print-footer { display: flex !important; position: fixed; bottom: 1cm; left: ${margin}cm; right: ${margin}cm; justify-content: space-between; font-size: 7.5pt; border-top: 1px solid #000; padding-top: 5px; background: white !important; z-index: 999; }
            .page-counter::after { content: "Halaman : " counter(page); }
          }
          .paper-preview { background: white; width: ${paperSize === 'A4' ? '210mm' : '215mm'}; min-height: ${paperSize === 'A4' ? '297mm' : '330mm'}; padding: ${margin}cm; padding-bottom: 3.5cm; box-shadow: 0 0 50px rgba(0,0,0,0.1); position: relative; transform: scale(${scale / 100}); transform-origin: top center; }
        `}} />

        <div className={`no-print ${cur.card} w-full max-w-[210mm] p-6 rounded-[2.5rem] border ${cur.border} shadow-sm mb-8 space-y-6`}>
          <div className="flex justify-between items-center px-2 text-blue-600">
            <h1 className="text-xl font-black uppercase tracking-tighter underline decoration-4">Rapor Configuration</h1>
            <div className="flex gap-2">
              <button onClick={() => setView('list')} className="bg-black text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase">Kembali</button>
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Download PDF</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-2">
            <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40">Kertas</label><select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full p-2 border rounded-lg text-xs font-bold bg-white outline-none"><option value="A4">A4</option><option value="F4">F4</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40">Margin</label><input type="number" step="0.1" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full p-2 border rounded-lg text-xs font-bold" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40">Skala (%)</label><input type="number" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full p-2 border rounded-lg text-xs font-bold" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40">Warna ID</label><input type="color" value={bgIdentity} onChange={(e) => setBgIdentity(e.target.value)} className="w-full h-9 rounded-lg border-none cursor-pointer" /></div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-blue-600">NUPTK Wali Kelas</label>
                <input type="text" value={overrideTeacherNuptk} onChange={(e) => setOverrideTeacherNuptk(e.target.value)} className="w-full p-2 border-1 border-blue-600/20 rounded-lg text-xs font-black bg-blue-50/30" />
            </div>
          </div>
        </div>

        <div className="print-area paper-preview font-serif text-black leading-tight flex flex-col">
          {view === 'identity' && (
            <div className="space-y-8 flex-1">
              <div className="text-center mb-10"><h1 className="text-lg font-black uppercase underline decoration-2">Identitas Peserta Didik</h1></div>
              <table className="w-full border-collapse">
                <tbody>
                  <BiodataRow no="1" label="Nama Lengkap Peserta Didik" value={selectedStudent?.profiles?.full_name} />
                  <BiodataRow no="2" label="Nomor Induk / NISN" value={`${selectedStudent?.profiles?.nis || '-'} / ${selectedStudent?.profiles?.nisn || '-'}`} />
                  <BiodataRow no="3" label="Tempat, Tanggal Lahir" value={`${selectedStudent?.profiles?.pob || '-'}, ${selectedStudent?.profiles?.dob || '-'}`} />
                  <BiodataRow no="4" label="Jenis Kelamin" value={selectedStudent?.profiles?.gender} />
                  <BiodataRow no="5" label="Agama" value={selectedStudent?.profiles?.religion} />
                  <BiodataRow no="6" label="Status dalam Keluarga" value={selectedStudent?.profiles?.family_status} />
                  <BiodataRow no="7" label="Anak ke" value={selectedStudent?.profiles?.child_order} />
                  <BiodataRow no="8" label="Alamat Peserta Didik" value={selectedStudent?.profiles?.address} />
                  <BiodataRow no="9" label="Nomor Telepon Rumah" value={selectedStudent?.profiles?.phone} />
                  <BiodataRow no="10" label="Sekolah Asal" value={selectedStudent?.profiles?.previous_school} />
                  <BiodataRow no="11" label="Diterima di sekolah ini" value="" />
                  <BiodataRow sub label="a. Di Kelas" value={selectedClass?.nama_kelas} />
                  <BiodataRow sub label="b. Pada Tanggal" value={selectedStudent?.profiles?.admission_date} />
                  <BiodataRow no="12" label="Nama Orang Tua" value="" />
                  <BiodataRow sub label="a. Ayah" value={selectedStudent?.profiles?.father_name} />
                  <BiodataRow sub label="b. Ibu" value={selectedStudent?.profiles?.mother_name} />
                  <BiodataRow no="13" label="Alamat Orang Tua" value={selectedStudent?.profiles?.parent_address || selectedStudent?.profiles?.address} />
                  <BiodataRow no="14" label="Pekerjaan Orang Tua" value="" />
                  <BiodataRow sub label="a. Ayah" value={selectedStudent?.profiles?.father_job} />
                  <BiodataRow sub label="b. Ibu" value={selectedStudent?.profiles?.mother_job} />
                  <BiodataRow no="15" label="Nama Wali Siswa" value={selectedStudent?.profiles?.guardian_name} />
                  <BiodataRow no="16" label="Alamat Wali Murid" value={selectedStudent?.profiles?.guardian_address} />
                  <BiodataRow no="17" label="Pekerjaan Wali Murid" value={selectedStudent?.profiles?.guardian_job} />
                </tbody>
              </table>
              <div className="pt-16 flex justify-between items-start avoid-break">
                <div className="w-28 h-36 border border-black flex items-center justify-center text-[10px] text-center ml-10">Pas Foto<br/>3 x 4</div>
                <div className="text-center space-y-20 mr-10">
                    <div className="text-sm"><p>{reportDate?.location || 'Cicalengka'}, {reportDate?.report_date || '-'}</p><p>Kepala Sekolah,</p></div>
                    <div>
                        <p className="font-bold underline text-[13px]">{formatNamaGelar(school?.nama_ks || '-')}</p>
                        <p className="text-xs">{school?.nuptk_ks ? 'NUPTK' : 'NIP'}. {school?.nuptk_ks || school?.nip_ks || '-'}</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {view === 'report' && (
            <div className="space-y-6 text-[11.5px] flex-1">
              <div className="flex justify-between gap-x-10 avoid-break p-2" style={{ backgroundColor: bgIdentity, display: 'flex', flexDirection: 'row' }}>
                <div className="w-1/2 space-y-1">
                  <div className="flex"><span className="w-28 shrink-0">Nama Murid</span><span className="w-4">:</span><span className="font-bold uppercase flex-1">{selectedStudent?.profiles?.full_name}</span></div>
                  <div className="flex"><span className="w-28 shrink-0">NIS / NISN</span><span className="w-4">:</span><span className="flex-1">{selectedStudent?.profiles?.nis || '-'} / {selectedStudent?.profiles?.nisn}</span></div>
                  <div className="flex"><span className="w-28 shrink-0">Sekolah</span><span className="w-4">:</span><span className="uppercase flex-1">{school?.nama || 'SMK MA\'ARIF CICALENGKA'}</span></div>
                  <div className="flex items-start"><span className="w-28 shrink-0">Alamat</span><span className="w-4">:</span><span className="flex-1 text-justify">{school?.alamat_jalan || '-'}</span></div>
                </div>
                <div className="w-1/2 space-y-1 pl-4">
                  <div className="flex"><span className="w-28 shrink-0">Kelas</span><span className="w-4">:</span><span className="font-bold flex-1">{selectedClass?.nama_kelas}</span></div>
                  <div className="flex"><span className="w-28 shrink-0">Fase</span><span className="w-4">:</span><span className="flex-1">{getFase(selectedClass?.nama_kelas)}</span></div>
                  <div className="flex"><span className="w-28 shrink-0">Semester</span><span className="w-4">:</span><span className="flex-1">{reportDate?.semester_number || '1'}</span></div>
                  <div className="flex"><span className="w-28 shrink-0">Tahun Ajaran</span><span className="w-4">:</span><span className="flex-1">{reportDate?.academic_year || '2025/2026'}</span></div>
                </div>
              </div>
              <div className="text-center pt-2 avoid-break"><h2 className="text-sm font-black uppercase tracking-widest underline">LAPORAN HASIL BELAJAR</h2></div>
              <table className="w-full border-collapse border-1 border-black avoid-break">
                <thead><tr className="bg-gray-50"><th className="border-1 border-black p-2 w-8 text-center">No</th><th className="border-1 border-black p-2 text-left">Mata Pelajaran</th><th className="border-1 border-black p-2 w-20 text-center">Nilai Akhir</th><th className="border-1 border-black p-2 text-left">Capaian Kompetensi</th></tr></thead>
                <tbody>{grades.map((g, i) => (<tr key={g.id} className="align-top"><td className="border-1 border-black p-2 text-center">{i + 1}</td><td className="border-1 border-black p-2 font-medium">{g.subject?.name}</td><td className="border-1 border-black p-2 text-center font-bold text-[14px]">{g.score}</td><td className="border-1 border-black p-2 text-[10px] text-justify leading-snug">{getDesc(g)}</td></tr>))}</tbody>
              </table>

              <div className="mt-10 mb-2 space-y-1 avoid-break">
                <h3 className="font-bold uppercase tracking-wide">Kokurikuler</h3>
                <div className="border-1 border-black p-3 space-y-4 text-justify leading-relaxed">
                  {kokurikuler.length > 0 ? kokurikuler.map((k, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-bold uppercase text-[10px] text-blue-800">
                        Kegiatan: {k.group?.activity?.activity_name || k.group?.group_name}
                      </p>
                      <p className="text-[11px]">{k.description_text}</p>
                    </div>
                  )) : (
                    <p className="text-gray-400 italic text-center text-[10px]">Data kokurikuler (P5) belum digenerate oleh guru pembina.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-x-6 avoid-break mt-4" style={{ display: 'flex', flexDirection: 'row' }}>
                <div className="w-[60%] space-y-1">
                  <h3 className="font-bold uppercase">Ekstrakurikuler</h3>
                  <table className="w-full border-collapse border-1 border-black">
                    <thead><tr className="bg-gray-50"><th className="border-1 border-black p-1 w-8 text-center">No</th><th className="border-1 border-black p-1 text-left">Ekstrakurikuler</th><th className="border-1 border-black p-1 text-center">Keterangan</th></tr></thead>
                    <tbody>{ekskul.length > 0 ? ekskul.map((e, i) => (<tr key={e.id}><td className="border-1 border-black p-1 text-center">{i+1}</td><td className="border-1 border-black p-1">{e.ekskul?.name}</td><td className="border-1 border-black p-1 text-center font-bold">{e.predicate}</td></tr>)) : <tr><td colSpan={3} className="border-1 border-black p-1 text-center opacity-30">Belum ada data</td></tr>}</tbody>
                  </table>
                </div>
                <div className="w-[40%] space-y-1">
                  <h3 className="font-bold uppercase">Ketidakhadiran</h3>
                  <table className="w-full border-collapse border-1 border-black">
                    <tbody>
                      <tr><td className="border-1 border-black p-1 px-3">Sakit</td><td className="border-1 border-black p-1 text-center font-bold">{attendance?.sick || 0} hari</td></tr>
                      <tr><td className="border-1 border-black p-1 px-3">Izin</td><td className="border-1 border-black p-1 text-center font-bold">{attendance?.permit || 0} hari</td></tr>
                      <tr><td className="border-1 border-black p-1 px-3">Tanpa Keterangan</td><td className="border-1 border-black p-1 text-center font-bold">{attendance?.absent || 0} hari</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-4 avoid-break mt-auto">
                <div className="space-y-3"><div className="border-1 border-black p-2"><p className="font-bold uppercase text-[9px] mb-1">Catatan Wali Kelas:</p><p className="">"{attendance?.teacher_note || '-'}"</p></div><div className="border-1 border-black p-2 min-h-[45px]"><p className="font-bold uppercase text-[9px] mb-1">Tanggapan Orang Tua/Wali Murid:</p></div></div>
                <div className="pt-8 flex justify-between text-center" style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="w-1/3 flex flex-col justify-between min-h-[120px]"><p>Mengetahui,<br/>Orang Tua Murid</p><p className="font-bold">...........................................</p></div>
                    <div className="w-1/3 flex flex-col justify-between min-h-[120px]">
                      <p>{reportDate?.location || 'Cicalengka'}, {reportDate?.report_date || '-'}<br/>Wali Kelas</p>
                      <div>
                        <p className="font-bold underline">{formatNamaGelar(selectedClass?.profiles?.full_name || '-')}</p>
                        <p>NUPTK. {overrideTeacherNuptk || '-'}</p>
                      </div>
                    </div>
                </div>
                <div className="flex justify-center text-center mt-8">
                  <div className="w-1/3 flex flex-col justify-between min-h-[120px] avoid-break">
                    <p>Kepala Sekolah,</p>
                    <div className="mt-16">
                      <p className="font-bold underline">{formatNamaGelar(school?.nama_ks || '-')}</p>
                      <p>{school?.nuptk_ks ? 'NUPTK' : 'NIP'}. {school?.nuptk_ks || school?.nip_ks || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="hidden print-footer"><span>{selectedClass?.nama_kelas} | {selectedStudent?.profiles?.full_name} | -</span><span className="page-counter"></span></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-12 animate-in fade-in duration-700 p-4 md:p-10 ${cur.text}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h1 className="text-5xl font-black tracking-tighter uppercase leading-none ">Cetak <span className="text-blue-600">Rapor</span></h1><p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Silahkan pilih Rombel binaan Anda untuk mencetak rapor.</p></div>
        {selectedClass && classes.length > 1 && (<button onClick={() => { setSelectedClass(null); setStudents([]); }} className="bg-black text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all">Kembali ke Daftar Rombel</button>)}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase opacity-40 text-center">Menyinkronkan data...</p></div>
      ) : !selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {classes.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-[0.5em] border-4 border-dashed border-black/5 rounded-[4rem]">Anda belum ditugaskan sebagai Wali Kelas.</div>
          ) : (
              classes.map((c) => (
                <div key={c.id} onClick={() => loadStudents(c)} className={`${cur.card} border-4 border-black/5 p-8 rounded-[3.5rem] space-y-6 shadow-xl hover:shadow-2xl hover:border-blue-600/30 hover:-translate-y-2 cursor-pointer transition-all duration-500 group relative overflow-hidden`}>
                  <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 transition-all text-blue-600 group-hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"/></svg></div>
                  <div><h3 className="text-2xl font-black tracking-tighter uppercase">{c.nama_kelas}</h3><p className="text-[10px] font-bold opacity-40 uppercase mt-1">Wali: Anda</p></div>
                  <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">Buka Siswa <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                </div>
              ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students.map((s) => (
            <div key={s.student_id} className={`${cur.card} border-4 border-black/5 p-8 rounded-[3.5rem] space-y-6 shadow-xl hover:shadow-2xl transition-all duration-500`}>
              <div><h3 className="text-xl font-black tracking-tighter uppercase leading-none">{s.profiles?.full_name}</h3><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-3 ">NISN: {s.profiles?.nisn || '-'}</p></div>
              <div className="flex gap-3"><button onClick={() => prepareCetak(s, 'identity')} className="flex-1 bg-gray-500/10 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-500/20 transition-all">Identitas</button><button onClick={() => prepareCetak(s, 'report')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Cetak Rapor</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}