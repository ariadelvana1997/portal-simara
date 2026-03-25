"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../layout';
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function MasterTemaKokurikuler() {
  const { cur } = useTheme();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', is_active: true });

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kokurikuler_themes')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setThemes(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = { 
        name: formData.name, 
        is_active: formData.is_active 
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from('kokurikuler_themes').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('kokurikuler_themes').insert([payload]);
        if (error) throw error;
      }

      alert("✅ Data Berhasil Disimpan!");
      setModalOpen(false);
      fetchThemes();
    } catch (err: any) {
      alert("🚨 Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("🚨 Hapus tema ini? Pastikan tidak ada kegiatan yang menggunakan tema ini.")) {
      const { error } = await supabase.from('kokurikuler_themes').delete().eq('id', id);
      if (!error) fetchThemes();
      else alert("Gagal menghapus: Data mungkin sedang digunakan.");
    }
  };

  const openModal = (theme: any = null) => {
    if (theme) {
      setIsEditing(true);
      setFormData({ id: theme.id, name: theme.name, is_active: theme.is_active });
    } else {
      setIsEditing(false);
      setFormData({ id: '', name: '', is_active: true });
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase ">Tema Kokurikuler</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola tema Kokurikuler.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all w-fit">
            <IconPlus /> Tambah Tema
        </button>
      </div>

      {/* Table Data */}
      <div className={`${cur.card} border ${cur.border} rounded-[2rem] shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 w-16">No.</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Tema Kegiatan Kokurikuler</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse font-black opacity-10 uppercase tracking-widest">Sinkronisasi Tema...</td></tr>
              ) : themes.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center font-black opacity-10 uppercase tracking-widest">Belum ada tema.</td></tr>
              ) : themes.map((theme, i) => (
                <tr key={theme.id} className={`${cur.hover} transition-colors group`}>
                  <td className="px-8 py-6 font-black opacity-30 ">{i + 1}</td>
                  <td className="px-8 py-6">
                    <div className="font-black tracking-tight text-sm uppercase">{theme.name}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${theme.is_active ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                      {theme.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(theme)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-blue-600 transition-all active:scale-90 shadow-sm`}><IconEdit /></button>
                        <button onClick={() => handleDelete(theme.id)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-red-500 transition-all active:scale-90 shadow-sm`}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-lg rounded-[2.5rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-500`}>
            <h2 className="text-2xl font-black tracking-tighter mb-1 uppercase">{isEditing ? 'Perbarui' : 'Tambah'} Tema</h2>
            <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mb-8`}>P5 Theme Configuration</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Nama Tema Kokurikuler</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} 
                  placeholder="Contoh: Gaya Hidup Berkelanjutan..." 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Status Aktif</label>
                <div 
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_active ? 'border-green-600 bg-green-600/5' : `${cur.border} ${cur.hover}`}`}
                >
                  <span className={`text-xs font-black uppercase tracking-widest ${formData.is_active ? 'text-green-600' : 'opacity-40'}`}>
                    {formData.is_active ? 'Tema Aktif' : 'Non-Aktifkan Tema'}
                  </span>
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${formData.is_active ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {formData.is_active && <IconCheck />}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${cur.hover} transition-all`}>Batalkan</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                  {isSubmitting ? 'Proses...' : 'Simpan Tema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}