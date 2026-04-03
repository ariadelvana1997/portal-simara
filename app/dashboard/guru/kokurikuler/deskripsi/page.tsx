"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/dashboard/guru/layout'; 
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const IconMagic = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
const IconSave = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline></svg>;

export default function DeskripsiKokurikuler() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data Master & Selection
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});

  // MAPPING DESKRIPSI DARI Deskripsi Dimensi.docx
  const descMaster: Record<string, any> = {
    "Hubungan dengan Tuhan Yang Maha Esa": {
      Berkembang: "menghayati dan mengamalkan ajaran Tuhan Yang Maha Esa namun belum konsisten",
      Cakap: "menghayati dan mengamalkan ajaran Tuhan Yang Maha Esa secara konsisten serta menegakkannya dalam kehidupan",
      Mahir: "menghayati dan mengamalkan ajaran Tuhan secara konsisten, menegakkannya, serta menjadi teladan bagi orang lain"
    },
    "Hubungan dengan sesama manusia": {
      Berkembang: "menunjukkan perilaku akhlak mulia yang mencerminkan kedewasaan moral dan spiritual namun perlu penguatan integrasi",
      Cakap: "menunjukkan perilaku akhlak mulia serta menginternalisasi nilai kasih sayang, kejujuran, dan keadilan",
      Mahir: "menunjukkan perilaku akhlak mulia, menginternalisasi nilai kejujuran serta memberikan kebermanfaatan kepada sesama"
    },
    "Hubungan dengan Lingkungan Alam": {
      Berkembang: "mulai membangun kesadaran terhadap lingkungan alam dan mengidentifikasi solusi permasalahan lingkungan",
      Cakap: "secara konsisten membangun kesadaran peduli lingkungan serta mengimplementasikan solusi di dunia kerja",
      Mahir: "aktif membangun kesadaran peduli lingkungan, melakukan evaluasi, serta menjadi teladan bagi orang lain"
    },
    "Kewargaan Lokal": {
      Berkembang: "menunjukkan kesadaran atas norma, aturan dan nilai sosial budaya yang berlaku di masyarakatnya",
      Cakap: "terbiasa berperilaku sesuai norma, aturan dan nilai sosial budaya yang berlaku di lingkungannya",
      Mahir: "terbiasa berperilaku sesuai norma sosial budaya serta mampu mengajak orang lain melakukan hal yang sama"
    },
    "Penyampaian Argumentasi": {
      Berkembang: "menyampaikan argumen logis secara runtut disertai alasan sederhana",
      Cakap: "menyampaikan argumen logis secara runtut disertai alasan dan bukti kuat",
      Mahir: "menyampaikan argumen logis didukung teori dan data kuat serta mampu mempertahankan argumennya"
    },
    "Gagasan baru": {
      Berkembang: "menganalisis beberapa gagasan inovatif yang logis sesuai dengan bidang keahliannya",
      Cakap: "menghubungkan beberapa gagasan inovatif untuk menghasilkan kombinasi gagasan baru",
      Mahir: "menghasilkan gagasan inovatif yang logis dan efektif dengan memikirkan segala resikonya"
    },
    "Bertanggung Jawab": {
      Berkembang: "menetapkan target pembelajaran dan melakukan upaya untuk mencapainya dengan bimbingan",
      Cakap: "menetapkan target pembelajaran dan melakukan upaya untuk mencapainya secara tuntas",
      Mahir: "mampu mencapai target pembelajaran yang telah ditentukan sendiri secara tuntas"
    },
    "Kerja sama": {
      Berkembang: "bekerjasama dengan berbagai pihak untuk peningkatan kualitas bersama namun belum konsisten",
      Cakap: "bekerjasama dengan berbagai pihak untuk peningkatan kualitas bersama secara konsisten",
      Mahir: "mengambil inisiatif untuk bekerjasama dengan berbagai pihak demi peningkatan kualitas bersama"
    }
  };

  useEffect(() => { if (profile) fetchGroups(); }, [profile]);

  const fetchGroups = async () => {
    const { data } = await supabase.from('kokurikuler_groups').select('*').eq('teacher_id', profile.id);
    if (data) setMyGroups(data);
    setLoading(false);
  };

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    setLoading(true);
    
    const [sRes, dRes] = await Promise.all([
      supabase.from('kokurikuler_group_members').select(`student_id, profiles:profiles!student_id(full_name, nisn)`).eq('group_id', groupId),
      supabase.from('kokurikuler_descriptions').select('student_id, description_text').eq('group_id', groupId)
    ]);

    if (sRes.data) setStudents(sRes.data);
    
    const descMap: any = {};
    dRes.data?.forEach(d => { descMap[d.student_id] = d.description_text; });
    setDescriptions(descMap);
    
    setLoading(false);
  };

  // --- LOGIKA GENERATE NARASI EFEKTIF ---
  const generateDescription = async (studentId: string) => {
    const { data: grades } = await supabase
      .from('kokurikuler_grades')
      .select('score_code, activity_profiles(subdimension)')
      .eq('group_id', selectedGroup)
      .eq('student_id', studentId);

    if (!grades || grades.length === 0) return alert("Siswa ini belum memiliki nilai!");

    const studentName = students.find(s => s.student_id === studentId)?.profiles?.full_name || "Siswa";

    // Kelompokkan template berdasarkan level kompetensi
    const mahir: string[] = [];
    const cakap: string[] = [];
    const berkembang: string[] = [];

    grades.forEach((g: any) => {
      const subName = (g.activity_profiles as any)?.subdimension;
      const score = g.score_code;
      const template = descMaster[subName]?.[score];
      
      if (template) {
        if (score === 'Mahir') mahir.push(template);
        else if (score === 'Cakap') cakap.push(template);
        else berkembang.push(template);
      } else {
        // Fallback jika mapping tidak ditemukan
        const fallback = `menunjukkan kemampuan ${score} dalam ${subName}`;
        if (score === 'Mahir') mahir.push(fallback);
        else if (score === 'Cakap') cakap.push(fallback);
        else berkembang.push(fallback);
      }
    });

    // Susun kalimat yang mengalir
    let finalDesc = `Dalam kegiatan ini, Ananda ${studentName} menunjukkan capaian yang sangat baik. `;
    
    if (mahir.length > 0) {
      finalDesc += `Ia telah mampu ${mahir.join(" serta ")}. `;
    }
    
    if (cakap.length > 0) {
      finalDesc += `Selain itu, Ananda juga sudah ${cakap.join(" dan ")}. `;
    }

    if (berkembang.length > 0) {
      finalDesc += `Di sisi lain, Ananda sedang berproses dalam ${berkembang.join(", ")}.`;
    }

    setDescriptions(prev => ({ ...prev, [studentId]: finalDesc }));
  };

  const saveDescription = async (studentId: string) => {
    const text = descriptions[studentId];
    if (!text) return;

    setSaving(true);
    const { error } = await supabase
      .from('kokurikuler_descriptions')
      .upsert({
        group_id: selectedGroup,
        student_id: studentId,
        description_text: text,
        updated_at: new Date()
      }, { onConflict: 'group_id,student_id' });

    if (!error) alert("✅ Deskripsi Berhasil Disimpan!");
    setSaving(false);
  };

  return (
    <div className="space-y-10 p-6 animate-in fade-in duration-700">
      <div className="space-y-2 px-2">
        <h1 className="text-5xl font-black uppercase tracking-tighter ">Deskripsi <span className="text-blue-600">Kokurikuler</span></h1>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Narasi Otomatis Capaian Profil Lulusan</p>
      </div>

      {/* SELECT KELOMPOK */}
      <div className={`${cur.card} border ${cur.border} p-8 rounded-[2.5rem] shadow-xl max-w-md`}>
        <div className="flex items-center gap-3 text-blue-600 mb-4"><IconUsers /> <span className="font-black text-[10px] uppercase tracking-widest">Pilih Kelompok Kokurikuler</span></div>
        <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} className="w-full bg-gray-500/5 p-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-600 transition-all cursor-pointer">
          <option value="">-- Pilih Kelompok --</option>
          {myGroups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
        </select>
      </div>

      {/* LIST SISWA & DESKRIPSI */}
      {selectedGroup && (
        <div className="space-y-6">
          {students.map((s) => (
            <div key={s.student_id} className={`${cur.card} border ${cur.border} p-10 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row gap-8 items-start animate-in slide-in-from-bottom-4 duration-500`}>
              <div className="w-full lg:w-1/4 space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Siswa</p>
                <h3 className="font-black text-xl text-gray-900 leading-tight">{s.profiles?.full_name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">NISN: {s.profiles?.nisn || '-'}</p>
                
                <button 
                  onClick={() => generateDescription(s.student_id)}
                  className="mt-6 flex items-center gap-3 bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
                >
                  <IconMagic /> Generate Narasi
                </button>
              </div>

              <div className="flex-1 w-full space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Narasi Deskripsi Rapor</p>
                <textarea 
                  value={descriptions[s.student_id] || ''}
                  onChange={(e) => setDescriptions({...descriptions, [s.student_id]: e.target.value})}
                  rows={6}
                  placeholder="Klik 'Generate Narasi' atau ketik manual deskripsi capaian siswa di sini..."
                  className="w-full bg-gray-500/5 p-8 rounded-[2rem] font-bold text-sm leading-relaxed text-gray-700 outline-none border-2 border-transparent focus:border-blue-600 transition-all resize-none"
                />
                <div className="flex justify-end">
                   <button 
                    disabled={saving}
                    onClick={() => saveDescription(s.student_id)}
                    className="flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
                   >
                     <IconSave /> Simpan Deskripsi
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}