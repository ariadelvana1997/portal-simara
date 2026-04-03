"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/dashboard/guru/layout'; 
import { supabase } from '@/lib/supabase';

// --- ICONS (KONSISTEN SAMSUNG STYLE) ---
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconSave = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

export default function InputNilaiKokurikuler() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data State
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [filteredDimensions, setFilteredDimensions] = useState<any[]>([]); 
  const [students, setStudents] = useState<any[]>([]);

  // Selection State
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>(''); 
  const [grades, setGrades] = useState<Record<string, string>>({});

  useEffect(() => { if (profile) fetchInitialData(); }, [profile]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: groups } = await supabase
        .from('kokurikuler_groups')
        .select(`*, activity:kokurikuler_activities(*)`)
        .eq('teacher_id', profile.id);
      
      if (groups) setMyGroups(groups);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedDimension(''); 
    setGrades({}); 
    
    const groupObj = myGroups.find(g => g.id === groupId);
    const activity = groupObj?.activity;
    setSelectedActivity(activity || null);
    
    setLoading(true);
    if (activity) {
      const { data: activityProfs } = await supabase
        .from('activity_profiles')
        .select('*')
        .eq('activity_id', activity.id);

      setFilteredDimensions(activityProfs || []);
    } else {
      setFilteredDimensions([]);
    }
    
    const { data: members } = await supabase
      .from('kokurikuler_group_members')
      .select(`student_id, profiles:profiles!student_id(full_name, nisn)`)
      .eq('group_id', groupId);
    
    setStudents(members || []);
    setLoading(false);
  };

  const fetchExistingGrades = async (profileId: string) => {
    if (!selectedGroup || !profileId) return;
    const { data } = await supabase
      .from('kokurikuler_grades')
      .select('student_id, score_code')
      .eq('group_id', selectedGroup)
      .eq('activity_profile_id', profileId);
    
    if (data) {
      const gMap: any = {};
      data.forEach(item => { gMap[item.student_id] = item.score_code; });
      setGrades(gMap);
    }
  };

  // --- AKTIVASI FUNGSI SIMPAN NILAI ---
  const saveAllGrades = async () => {
    if (!selectedGroup || !selectedDimension) return alert("Pilih Kelompok & Dimensi!");
    
    // Filter hanya siswa yang sudah diberi nilai agar tidak mengirim data kosong
    const gradedItems = Object.entries(grades).filter(([_, score]) => score !== "");
    if (gradedItems.length === 0) return alert("Silahkan pilih nilai untuk siswa terlebih dahulu!");

    setSaving(true);
    try {
      const payload = gradedItems.map(([studentId, score]) => ({
        group_id: selectedGroup,
        activity_profile_id: selectedDimension,
        student_id: studentId,
        score_code: score,
        teacher_id: profile.id,
        updated_at: new Date()
      }));

      // Menggunakan upsert dengan onConflict agar data ter-update otomatis jika kunci unik bentrok
      const { error } = await supabase.from('kokurikuler_grades').upsert(payload, { 
          onConflict: 'group_id,activity_profile_id,student_id' 
      });

      if (error) throw error;
      alert("✅ Seluruh Nilai Berhasil Disimpan!");
      
    } catch (err: any) {
      console.error(err);
      alert("❌ Gagal Menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 p-2 md:p-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="space-y-2 px-2">
        <h1 className="text-5xl font-black uppercase tracking-tighter ">Input Nilai <span className="text-blue-600">Kokurikuler</span></h1>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Data Real-time dari Profil Lulusan Kegiatan</p>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cur.card} border ${cur.border} p-8 rounded-[2.5rem] shadow-xl space-y-4`}>
          <div className="flex items-center gap-3 text-blue-600"><IconUsers /> <span className="font-black text-[10px] uppercase tracking-widest">Pilih Kelompok</span></div>
          <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} className="w-full bg-gray-500/5 p-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-600 transition-all cursor-pointer">
            <option value="">-- Pilih Kelompok --</option>
            {myGroups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
          </select>
        </div>

        <div className={`${cur.card} border ${cur.border} p-8 rounded-[2.5rem] shadow-xl space-y-4`}>
          <div className="flex items-center gap-3 text-purple-600"><IconActivity /> <span className="font-black text-[10px] uppercase tracking-widest">Kegiatan Projek</span></div>
          <div className="p-4 bg-purple-500/5 rounded-2xl min-h-[56px] flex items-center border border-purple-500/10">
            <span className="font-black text-xs text-purple-700 uppercase tracking-tighter">{selectedActivity ? selectedActivity.activity_name : "Pilih kelompok..."}</span>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3 text-orange-500 px-2">
            <IconTarget /> <span className="font-black text-[10px] uppercase tracking-[0.3em]">Pilih Dimensi & Capaian</span>
          </div>
          
          {!selectedActivity ? (
            <div className="p-12 text-center border-4 border-dashed border-gray-100 rounded-[3rem] opacity-30 bg-gray-50/50">
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">Silahkan tentukan kelompok untuk melihat dimensi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDimensions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDimension(d.id); fetchExistingGrades(d.id); }}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden group
                    ${selectedDimension === d.id 
                      ? 'border-orange-500 bg-orange-500 text-white shadow-2xl shadow-orange-500/30 scale-[1.02]' 
                      : 'border-gray-100 bg-white text-gray-900 hover:border-orange-200'
                    }`}
                >
                  <div className={`absolute -right-4 -bottom-4 opacity-10 transition-transform duration-700 group-hover:scale-150 ${selectedDimension === d.id ? 'text-white' : 'text-orange-500'}`}>
                    <IconTarget />
                  </div>
                  <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${selectedDimension === d.id ? 'text-white/70' : 'text-orange-500'}`}>
                    {d.dimension.split(',')[0]}
                  </p>
                  <h4 className="text-xs font-black leading-relaxed uppercase tracking-tight mb-1">{d.subdimension}</h4>
                  <p className={`text-[9px] font-bold ${selectedDimension === d.id ? 'text-white/60' : 'text-gray-400'}  line-clamp-1`}>{d.dimension}</p>
                  {selectedDimension === d.id && (
                    <div className="absolute top-6 right-6 bg-white/20 p-2 rounded-full animate-in zoom-in duration-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </button>
              ))}
              {filteredDimensions.length === 0 && (
                <div className="col-span-full p-12 text-center bg-red-50 border-2 border-red-100 rounded-[3rem]">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">⚠️ Admin belum mengisi Profil Lulusan untuk kegiatan ini.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABEL PENILAIAN */}
      {selectedGroup && selectedDimension && (
        <div className={`${cur.card} border ${cur.border} rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-700`}>
          <div className="bg-gray-500/5 p-8 px-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
            <div className="text-center md:text-left">
                <h3 className="font-black text-xl tracking-tighter uppercase">Penilaian Anggota</h3>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Capaian: <span className="underline">{filteredDimensions.find(d => d.id === selectedDimension)?.subdimension}</span></p>
            </div>
            <button 
              disabled={saving} 
              onClick={saveAllGrades} 
              className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3"
            >
              {saving ? 'Proses Simpan...' : <><IconSave /> Simpan Nilai</>}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">
                  <th className="px-10 py-6">Nama Siswa</th>
                  <th className="px-4 py-6 text-center w-44 text-yellow-600 bg-yellow-500/5">Berkembang</th>
                  <th className="px-4 py-6 text-center w-44 text-green-600 bg-green-500/5">Cakap</th>
                  <th className="px-4 py-6 text-center w-44 text-blue-600 bg-blue-500/5">Mahir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-gray-500/5 transition-all">
                    <td className="px-10 py-6">
                      <div className="font-black text-gray-900 text-sm uppercase">{s.profiles?.full_name}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">NISN: {s.profiles?.nisn || '-'}</div>
                    </td>
                    {['Berkembang', 'Cakap', 'Mahir'].map(code => (
                      <td key={code} className={`px-4 py-6 text-center ${code === 'Berkembang' ? 'bg-yellow-500/5' : code === 'Cakap' ? 'bg-green-500/5' : 'bg-blue-500/5'}`}>
                        <label className="relative flex items-center justify-center cursor-pointer mx-auto w-10 h-10 group">
                          <input type="radio" name={`g-${s.student_id}`} value={code} checked={grades[s.student_id] === code} onChange={() => setGrades({...grades, [s.student_id]: code})} className="peer hidden" />
                          <div className={`w-9 h-9 rounded-2xl border-2 border-gray-200 peer-checked:border-none transition-all duration-300 flex items-center justify-center 
                            ${code === 'Berkembang' ? 'peer-checked:bg-yellow-500 peer-checked:shadow-yellow-500/40' : 
                              code === 'Cakap' ? 'peer-checked:bg-green-600 peer-checked:shadow-green-600/40' : 
                              'peer-checked:bg-blue-600 peer-checked:shadow-blue-600/40'}`}>
                            {grades[s.student_id] === code && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="animate-in zoom-in duration-300">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}