"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../layout';
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconGear = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function MasterKegiatanKokurikuler() {
  const { cur, profile } = useTheme();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // States
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isProfilModalOpen, setProfilModalOpen] = useState(false);
  const [isSelectProfileOpen, setSelectProfileOpen] = useState(false);
  
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: '', theme_id: '', activity_name: '', final_objective: '', nomor_urut: 1 });

  // MASTER DATA 24 ITEM PROFIL
  const masterProfil = [
    { dim: 'keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa', sub: 'Hubungan dengan Tuhan Yang Maha Esa' },
    { dim: 'keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa', sub: 'Hubungan dengan sesama manusia' },
    { dim: 'keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa', sub: 'Hubungan dengan Lingkungan Alam' },
    { dim: 'kewargaan', sub: 'Kewargaan Lokal' },
    { dim: 'kewargaan', sub: 'Kewargaan Nasional' },
    { dim: 'kewargaan', sub: 'Kewargaan Global' },
    { dim: 'penalaran kritis', sub: 'Penyampaian Argumentasi' },
    { dim: 'penalaran kritis', sub: 'Pengambilan Keputusan' },
    { dim: 'penalaran kritis', sub: 'Penyelesaian Masalah' },
    { dim: 'kreativitas', sub: 'Gagasan baru' },
    { dim: 'kreativitas', sub: 'Fleksibilitas berpikir' },
    { dim: 'kreativitas', sub: 'Karya' },
    { dim: 'kemandirian', sub: 'Bertanggung Jawab' },
    { dim: 'kemandirian', sub: 'Kepemimpinan' },
    { dim: 'kemandirian', sub: 'Pengembangan Diri' },
    { dim: 'kolaborasi', sub: 'Berbagi' },
    { dim: 'kolaborasi', sub: 'Kerja sama' },
    { dim: 'komunikasi', sub: 'Menyimak' },
    { dim: 'komunikasi', sub: 'Berbicara' },
    { dim: 'komunikasi', sub: 'Membaca' },
    { dim: 'komunikasi', sub: 'Menulis' },
    { dim: 'kesehatan', sub: 'Hidup bersih dan sehat' },
    { dim: 'kesehatan', sub: 'Kebugaran, kesehatan fisik, dan kesehatan mental' },
    { dim: 'kesehatan', sub: 'Prinsip keselamatan dan kesehatan kerja (K3) di dunia kerja' },
  ];

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [tRes, aRes] = await Promise.all([
      supabase.from('kokurikuler_themes').select('*').eq('is_active', true).order('created_at'),
      supabase.from('kokurikuler_activities').select('*')
    ]);
    if (tRes.data) setThemes(tRes.data);
    if (aRes.data) setActivities(aRes.data);
    setLoading(false);
  };

  // --- LOGIKA UTAMA DISPLAY ---
  const displayData = themes.map((theme, i) => {
    const act = activities.find(a => a.theme_id === theme.id);
    return {
        id: act?.id || `temp-${theme.id}`,
        theme_id: theme.id,
        theme_name: theme.name,
        activity_name: act?.activity_name || theme.name,
        final_objective: act?.final_objective || '',
        nomor_urut: act?.nomor_urut || i + 1,
        is_empty: !act
    };
  });

  // --- FUNGSI SAVE/UPDATE KEGIATAN ---
  const handleSave = async () => {
    const payload = {
        theme_id: formData.theme_id,
        activity_name: formData.activity_name,
        final_objective: formData.final_objective,
        nomor_urut: formData.nomor_urut,
        fase: 'Fase E'
    };

    let res;
    if (formData.id) {
        res = await supabase.from('kokurikuler_activities').update(payload).eq('id', formData.id);
    } else {
        res = await supabase.from('kokurikuler_activities').insert([payload]);
    }

    if (!res.error) {
        alert("✅ Data Berhasil Disimpan!");
        setModalOpen(false);
        fetchData();
    }
  };

  // --- FUNGSI HAPUS KEGIATAN ---
  const handleDeleteActivity = async (id: string, isEmpty: boolean) => {
    if (isEmpty) return alert("Baris ini belum disimpan ke database.");
    if (confirm("🚨 Hapus kegiatan ini? Semua capaian profil juga akan terhapus.")) {
      const { error } = await supabase.from('kokurikuler_activities').delete().eq('id', id);
      if (!error) {
        alert("✅ Terhapus!");
        fetchData();
        setActiveMenu(null);
      }
    }
  };

  // --- FUNGSI PROFIL LULUSAN ---
  const openProfilModal = async (item: any) => {
    if (item.is_empty) return alert("Simpan kegiatan dulu sebelum mengatur profil!");
    setSelectedSub(item);
    setLoading(true);
    const { data } = await supabase.from('activity_profiles').select('*').eq('activity_id', item.id);
    setSavedProfiles(data || []);
    setProfilModalOpen(true);
    setLoading(false);
    setActiveMenu(null);
  };

  const addCapaian = async (p: any) => {
    const { data, error } = await supabase.from('activity_profiles').insert([{
        activity_id: selectedSub.id,
        dimension: p.dim,
        subdimension: p.sub
    }]).select();

    if (!error) {
        setSavedProfiles([...savedProfiles, data[0]]);
        setSelectProfileOpen(false);
    }
  };

  const deleteCapaian = async (id: string) => {
    const { error } = await supabase.from('activity_profiles').delete().eq('id', id);
    if (!error) setSavedProfiles(savedProfiles.filter(p => p.id !== id));
  };

  if (!profile) return <div className="p-20 text-center font-black opacity-20 uppercase">Syncing Profile...</div>;

  return (
    <div className="space-y-8 p-4 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black uppercase tracking-tighter  px-4">Kegiatan <span className="text-blue-600">Kokurikuler</span></h1>

      {/* TABLE */}
      <div className={`${cur.card} border ${cur.border} rounded-[3rem] shadow-sm relative overflow-visible`}>
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5 text-[10px] font-black uppercase tracking-widest text-gray-500`}>
              <th className="px-10 py-6 w-16 text-center">No</th>
              <th className="px-10 py-6">Judul Kegiatan</th>
              <th className="px-10 py-6 text-right">Opsi</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, i) => (
              <tr key={item.id} className={`border-b ${cur.border} hover:bg-gray-500/5 transition-all group`}>
                <td className="px-10 py-6 font-bold text-gray-900 text-center ">{i + 1}</td>
                <td className="px-10 py-6">
                    <p className={`font-black uppercase text-sm ${item.is_empty ? 'text-gray-400' : 'text-gray-900'}`}>{item.activity_name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Tema: {item.theme_name}</p>
                </td>
                <td className="px-10 py-6 text-right relative overflow-visible">
                  <div className="flex justify-end gap-2 items-center">
                    <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} className={`p-2 rounded-xl transition-all ${activeMenu === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-900 hover:bg-gray-500/10'}`}><IconGear /></button>
                  </div>

                  {activeMenu === item.id && (
                    <div className={`absolute right-10 top-14 w-56 rounded-2xl border ${cur.border} ${cur.card} shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden`}>
                      <button onClick={() => { setSelectedSub(item); setFormData({ id: item.is_empty ? '' : item.id, theme_id: item.theme_id, activity_name: item.activity_name, final_objective: item.final_objective, nomor_urut: item.nomor_urut }); setModalOpen(true); setActiveMenu(null); }} className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-gray-900 hover:bg-blue-600 hover:text-white flex items-center gap-3"><IconEdit /> Edit Kegiatan</button>
                      <button onClick={() => openProfilModal(item)} className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-gray-900 hover:bg-blue-600 hover:text-white flex items-center gap-3"><span className="text-sm font-black">+</span> Profil Lulusan</button>
                      <button onClick={() => handleDeleteActivity(item.id, item.is_empty)} className="w-full text-left px-5 py-3 text-[11px] font-black uppercase text-red-500 hover:bg-red-600 hover:text-white flex items-center gap-3 border-t"><IconTrash /> Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: EDIT KEGIATAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cur.card} w-full max-w-2xl rounded-[3rem] border ${cur.border} shadow-2xl overflow-hidden`}>
            <div className="p-8 border-b ${cur.border} flex justify-between items-center bg-gray-500/5 uppercase font-black">
              <h2 className="text-[11px]">Edit Kegiatan: {selectedSub?.theme_name}</h2>
              <button onClick={() => setModalOpen(false)} className="text-2xl text-gray-900">×</button>
            </div>
            <div className="p-10 space-y-6 text-xs font-black uppercase">
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="col-span-1 text-gray-900">Nomor Urut</label>
                  <span>:</span>
                  <input type="number" value={formData.nomor_urut} onChange={(e) => setFormData({...formData, nomor_urut: parseInt(e.target.value) || 0})} className={`col-span-2 border ${cur.border} rounded-2xl p-4 ${cur.bg} text-gray-900 font-bold outline-none focus:border-blue-600`} />
               </div>
               <div className="grid grid-cols-4 gap-6 items-center">
                  <label className="col-span-1 text-gray-900">Nama Kegiatan</label>
                  <span>:</span>
                  <input type="text" value={formData.activity_name} onChange={(e) => setFormData({...formData, activity_name: e.target.value})} className={`col-span-2 border ${cur.border} rounded-2xl p-4 ${cur.bg} text-gray-900 font-bold outline-none focus:border-blue-600`} />
               </div>
               <div className="grid grid-cols-4 gap-6 items-start">
                  <label className="col-span-1 pt-4 text-gray-900">Tujuan Akhir</label>
                  <span className="pt-4">:</span>
                  <textarea rows={5} value={formData.final_objective} onChange={(e) => setFormData({...formData, final_objective: e.target.value})} className={`col-span-2 border ${cur.border} rounded-2xl p-5 ${cur.bg} text-gray-900 font-bold resize-none outline-none focus:border-blue-600`} />
               </div>
               <div className="flex justify-end gap-4 pt-8">
                  <button onClick={() => setModalOpen(false)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase">Close</button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-600/30">Simpan</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROFIL LULUSAN (FUNCTIONAL) */}
      {isProfilModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cur.card} w-full max-w-5xl rounded-[3rem] border ${cur.border} shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}>
             <div className="p-8 border-b ${cur.border} flex justify-between items-center bg-gray-500/5">
                <h2 className="text-xl font-black uppercase text-gray-900">Profil Lulusan pada Kegiatan <span className="text-blue-600 ">{selectedSub?.activity_name}</span></h2>
                <button onClick={() => setProfilModalOpen(false)} className="text-3xl text-gray-900">×</button>
             </div>
             <div className="p-10 overflow-y-auto custom-scrollbar">
                <div className="flex justify-end mb-8">
                   <button onClick={() => setSelectProfileOpen(true)} className="bg-blue-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                      <span className="bg-white text-blue-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">+</span> Tambah Capaian
                   </button>
                </div>
                <table className="w-full text-left border border-collapse border-gray-200">
                   <thead>
                      <tr className="bg-gray-500/5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                         <th className="p-5 border border-gray-200 w-16 text-center">No</th>
                         <th className="p-5 border border-gray-200">Dimensi</th>
                         <th className="p-5 border border-gray-200">Subdimensi</th>
                         <th className="p-4 border border-gray-200 w-20 text-center">Opsi</th>
                      </tr>
                   </thead>
                   <tbody className="text-[11px] font-bold uppercase text-gray-900">
                      {savedProfiles.map((p, idx) => (
                         <tr key={p.id} className="hover:bg-gray-500/5 transition-colors group">
                            <td className="p-5 border border-gray-200 text-center ">{idx + 1}</td>
                            <td className="p-5 border border-gray-200 leading-relaxed">{p.dimension}</td>
                            <td className="p-5 border border-gray-200 leading-relaxed text-blue-600">{p.subdimension}</td>
                            <td className="p-5 border border-gray-200 text-center">
                               <button onClick={() => deleteCapaian(p.id)} className="text-red-500 hover:scale-125 transition-all"><IconTrash /></button>
                            </td>
                         </tr>
                      ))}
                      {savedProfiles.length === 0 && <tr><td colSpan={4} className="p-10 text-center opacity-40 font-black  uppercase">Belum ada capaian.</td></tr>}
                   </tbody>
                </table>
             </div>
             <div className="p-8 border-t ${cur.border} flex justify-end">
                <button onClick={() => setProfilModalOpen(false)} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase">Close</button>
             </div>
          </div>
        </div>
      )}

      {/* POPUP SELECTION (Pilih dari 24 item) */}
      {isSelectProfileOpen && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cur.card} w-full max-w-2xl rounded-[2.5rem] border ${cur.border} p-8 shadow-2xl max-h-[80vh] flex flex-col`}>
             <div className="mb-6 flex justify-between items-center px-2">
                <h3 className="font-black uppercase text-sm tracking-widest text-gray-900">Pilih Capaian Profil Lulusan</h3>
                <button onClick={() => setSelectProfileOpen(false)} className="text-2xl text-gray-900">×</button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {masterProfil.map((p, i) => (
                    <div key={i} onClick={() => addCapaian(p)} className={`p-4 rounded-2xl border ${cur.border} hover:border-blue-600 hover:bg-blue-600/5 cursor-pointer transition-all group`}>
                        <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-widest">{p.dim}</p>
                        <p className="text-[10px] font-bold uppercase text-gray-900 group-hover:text-blue-700">{p.sub}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}