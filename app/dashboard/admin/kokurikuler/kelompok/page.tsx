"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../layout';
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default function KelompokKokurikuler() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [mappedStudents, setMappedStudents] = useState<any[]>([]);
  const [currentGroupMembers, setCurrentGroupMembers] = useState<string[]>([]);

  // UI State
  const [isModalOpen, setModalOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeClassTab, setActiveClassTab] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({ id: '', group_name: '', tingkat: '10', fase: 'Fase E', coordinator_id: '', activity_id: '' });

  useEffect(() => { if (profile) fetchData(); }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    // UPDATE: Menggunakan teacher_id untuk sinkronisasi dengan Sidebar Guru
    const [gRes, tRes, aRes, cRes, sRes] = await Promise.all([
      supabase.from('kokurikuler_groups').select('*, teacher:profiles!teacher_id(full_name), activity:kokurikuler_activities!activity_id(activity_name), members_count:kokurikuler_group_members(count)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name').contains('roles', ['Guru']),
      supabase.from('kokurikuler_activities').select('id, activity_name'),
      supabase.from('classes').select('*').order('nama_kelas'),
      supabase.from('class_students').select('student_id, class_id, profiles(full_name)')
    ]);

    if (gRes.data) setGroups(gRes.data);
    if (tRes.data) setTeachers(tRes.data);
    if (aRes.data) setActivities(aRes.data);
    if (cRes.data) {
        setClasses(cRes.data);
        if (!activeClassTab) setActiveClassTab(cRes.data[0]?.id || '');
    }
    if (sRes.data) setMappedStudents(sRes.data);
    setLoading(false);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    // UPDATE: Memastikan coordinator_id dari form masuk ke kolom teacher_id di database
    const payload = { 
        group_name: formData.group_name, 
        tingkat: formData.tingkat, 
        fase: formData.fase, 
        teacher_id: formData.coordinator_id, // Map ke kolom teacher_id
        activity_id: formData.activity_id 
    };

    let res;
    if (isEditing) {
        res = await supabase.from('kokurikuler_groups').update(payload).eq('id', formData.id);
    } else {
        res = await supabase.from('kokurikuler_groups').insert([payload]);
    }

    if (!res.error) {
      alert("✅ Data Kelompok Tersimpan!");
      setModalOpen(false);
      fetchData();
    } else {
      console.error("Save Error:", res.error);
      alert("❌ Gagal menyimpan data.");
    }
  };

  const openMemberModal = async (group: any) => {
    setSelectedGroup(group);
    setLoading(true);
    const { data } = await supabase.from('kokurikuler_group_members').select('student_id').eq('group_id', group.id);
    setCurrentGroupMembers(data?.map(m => m.student_id) || []);
    setMemberModalOpen(true);
    setLoading(false);
  };

  const toggleMember = async (studentId: string) => {
    const isMember = currentGroupMembers.includes(studentId);
    if (isMember) {
        await supabase.from('kokurikuler_group_members').delete().eq('group_id', selectedGroup.id).eq('student_id', studentId);
        setCurrentGroupMembers(currentGroupMembers.filter(id => id !== studentId));
    } else {
        await supabase.from('kokurikuler_group_members').insert([{ group_id: selectedGroup.id, student_id: studentId }]);
        setCurrentGroupMembers([...currentGroupMembers, studentId]);
    }
    fetchData(); 
  };

  if (!profile) return <div className="p-20 text-center font-black opacity-20 uppercase tracking-widest">Syncing...</div>;

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-700">
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter ">Kelompok <span className="text-blue-600">Kokurikuler</span></h1>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Manajemen Anggota & Koordinator Projek</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', group_name: '', tingkat: '10', fase: 'Fase E', coordinator_id: '', activity_id: '' }); setModalOpen(true); }} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-3">
          <IconPlus /> Tambah Kelompok Baru
        </button>
      </div>

      {/* TABLE UTAMA */}
      <div className={`${cur.card} border ${cur.border} rounded-[3rem] shadow-xl shadow-black/5 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500`}>
                <th className="px-10 py-7 w-20 text-center">No</th>
                <th className="px-10 py-7">Nama Kelompok</th>
                <th className="px-10 py-7">Koordinator</th>
                <th className="px-10 py-7">Kegiatan</th>
                <th className="px-10 py-7 text-center">Anggota</th>
                <th className="px-10 py-7 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold uppercase text-gray-900">
              {groups.map((g, i) => (
                <tr key={g.id} className={`border-b ${cur.border} hover:bg-gray-500/5 transition-all group`}>
                  <td className="px-10 py-7 text-center text-gray-400 font-medium italic">{i + 1}</td>
                  <td className="px-10 py-7">
                    <div className="font-black text-sm tracking-tight text-gray-900">{g.group_name}</div>
                    <div className="text-[9px] font-black text-blue-600 mt-1 flex items-center gap-2">
                       <span className="bg-blue-600/10 px-2 py-0.5 rounded-md">TINGKAT {g.tingkat}</span>
                       <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-500">{g.fase}</span>
                    </div>
                  </td>
                  {/* UPDATE: Menampilkan nama dari alias 'teacher' */}
                  <td className="px-10 py-7 text-gray-900 font-black">{g.teacher?.full_name || '-'}</td>
                  <td className="px-10 py-7 text-gray-500 font-medium lowercase first-letter:uppercase">"{g.activity?.activity_name || '-'}"</td>
                  <td className="px-10 py-7 text-center">
                     <button onClick={() => openMemberModal(g)} className="flex items-center justify-center gap-3 mx-auto bg-gray-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-black/20 group/btn active:scale-95">
                        <IconUsers /> <span className="font-black text-xs">{g.members_count?.[0]?.count || 0}</span>
                     </button>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end gap-3">
                       <button onClick={() => { setIsEditing(true); setFormData({ id: g.id, group_name: g.group_name, tingkat: g.tingkat, fase: g.fase, coordinator_id: g.teacher_id, activity_id: g.activity_id }); setModalOpen(true); }} className="p-3 rounded-2xl border bg-white text-gray-900 hover:text-blue-600 hover:border-blue-600 shadow-sm active:scale-90 transition-all"><IconEdit /></button>
                       <button onClick={async () => { if(confirm("Hapus kelompok?")) { await supabase.from('kokurikuler_groups').delete().eq('id', g.id); fetchData(); } }} className="p-3 rounded-2xl border bg-white text-gray-900 hover:text-red-500 hover:border-red-500 shadow-sm active:scale-90 transition-all"><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FORM KELOMPOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-2xl rounded-[3rem] border ${cur.border} shadow-2xl overflow-hidden`}>
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-500/5">
              <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-gray-900">{isEditing ? 'Update Detail' : 'Buat Baru'} Kelompok</h2>
              <button onClick={() => setModalOpen(false)} className="text-3xl font-light text-gray-400 hover:text-gray-900 transition-all">×</button>
            </div>
            <form onSubmit={handleSaveGroup} className="p-12 space-y-8">
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">Nama Kelompok</label>
                  <span className="text-center text-gray-300">:</span>
                  <input required value={formData.group_name} onChange={(e) => setFormData({...formData, group_name: e.target.value})} className={`col-span-2 border ${cur.border} rounded-2xl p-5 font-bold text-gray-900 outline-none focus:border-blue-600 transition-all bg-gray-50/50`} />
               </div>
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">Tingkat & Fase</label>
                  <span className="text-center text-gray-300">:</span>
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <select value={formData.tingkat} onChange={(e) => setFormData({...formData, tingkat: e.target.value})} className="border border-gray-200 rounded-2xl p-5 font-bold text-gray-900 outline-none"><option value="10">Kelas 10</option><option value="11">Kelas 11</option><option value="12">Kelas 12</option></select>
                    <select value={formData.fase} onChange={(e) => setFormData({...formData, fase: e.target.value})} className="border border-gray-200 rounded-2xl p-5 font-bold text-gray-900 outline-none"><option value="Fase E">Fase E</option><option value="Fase F">Fase F</option></select>
                  </div>
               </div>
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">Koordinator</label>
                  <span className="text-center text-gray-300">:</span>
                  <select required value={formData.coordinator_id} onChange={(e) => setFormData({...formData, coordinator_id: e.target.value})} className="col-span-2 border border-gray-200 rounded-2xl p-5 font-bold text-gray-900 outline-none">
                      <option value="">-- Pilih Guru --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">Jenis Projek</label>
                  <span className="text-center text-gray-300">:</span>
                  <select required value={formData.activity_id} onChange={(e) => setFormData({...formData, activity_id: e.target.value})} className="col-span-2 border border-gray-200 rounded-2xl p-5 font-bold text-gray-900 outline-none">
                      <option value="">-- Pilih Projek --</option>
                      {activities.map(a => <option key={a.id} value={a.id}>{a.activity_name}</option>)}
                  </select>
               </div>
               <div className="flex gap-4 pt-10">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 py-5 rounded-3xl font-black text-[11px] uppercase text-gray-900 transition-all hover:bg-gray-200 active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase shadow-2xl shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95">Simpan Data</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAJEMEN ANGGOTA */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className={`${cur.card} w-full max-w-5xl rounded-[3.5rem] border ${cur.border} shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}>
            <div className="p-7 px-9 border-b border-gray-100 flex justify-between items-center bg-gray-500/5">
              <div className="space-y-0.5">
                <h2 className="font-black text-xl text-gray-900 uppercase tracking-tighter">Anggota: {selectedGroup?.group_name}</h2>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">{currentGroupMembers.length} Siswa Terpilih</p>
              </div>
              <button onClick={() => setMemberModalOpen(false)} className="text-3xl font-light text-gray-900 hover:rotate-90 transition-all duration-300">×</button>
            </div>

            <div className="flex overflow-x-auto gap-2 p-5 px-8 bg-white border-b border-gray-100 custom-scrollbar">
                {classes.map(cls => (
                    <button key={cls.id} onClick={() => setActiveClassTab(cls.id)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 active:scale-90 ${activeClassTab === cls.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900'}`}>
                        {cls.nama_kelas}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar bg-gray-50/20">
                {mappedStudents.filter(s => s.class_id === activeClassTab).length === 0 ? (
                    <div className="col-span-full text-center py-20">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum ada pemetaan siswa di kelas ini.</p>
                    </div>
                ) : mappedStudents.filter(s => s.class_id === activeClassTab).map(item => (
                    <div key={item.student_id} onClick={() => toggleMember(item.student_id)} className={`flex items-center justify-between p-4 px-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${currentGroupMembers.includes(item.student_id) ? 'border-blue-600 bg-white shadow-lg shadow-blue-600/5' : 'border-white bg-white hover:border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${currentGroupMembers.includes(item.student_id) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-900'}`}>
                                {item.profiles?.full_name[0]}
                            </div>
                            <div className="space-y-0">
                               <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{item.profiles?.full_name}</p>
                               <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Siswa Aktif</p>
                            </div>
                        </div>
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${currentGroupMembers.includes(item.student_id) ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                            {currentGroupMembers.includes(item.student_id) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end bg-white">
                <button onClick={() => setMemberModalOpen(false)} className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-blue-600">Selesai & Simpan Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}