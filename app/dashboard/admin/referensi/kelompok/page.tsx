"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function KelompokMapel() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form
  const [formData, setFormData] = useState<any>({
    id: null, kode: '', nama: '', is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subject_groups')
      .select('*')
      .order('kode', { ascending: true });
    
    if (!error) setGroups(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { id, ...rest } = formData;
    const payload = id ? formData : rest;

    const { error } = await supabase.from('subject_groups').upsert(payload);

    if (!error) {
      alert("Kelompok Mapel Berhasil Disimpan! 📂");
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('subject_groups')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus kelompok ini? Mapel yang terhubung mungkin akan terpengaruh.")) {
      await supabase.from('subject_groups').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter  text-blue-600">Kelompok Mapel</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Atur kategori pengelompokan mata pelajaran untuk rapor.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, kode: '', nama: '', is_active: true }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Tambah Kelompok
        </button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Kode</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Kelompok</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5 font-black text-blue-600">{g.kode}</td>
                <td className="px-8 py-5 font-bold tracking-tight uppercase text-xs">{g.nama}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleStatus(g.id, g.is_active)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all ${
                        g.is_active 
                        ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                        : 'bg-red-500/10 text-red-600 border-red-500/20 opacity-40'
                      }`}
                    >
                      {g.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5 text-right space-x-3">
                  <button onClick={() => { setFormData(g); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(g.id)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-3xl font-black tracking-tighter  mb-8">{formData.id ? 'Edit' : 'Tambah'} Kelompok</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Kode (A-I / Khusus)</label>
                <input required placeholder="Contoh: A, B, C1" className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`} value={formData.kode} onChange={(e) => setFormData({...formData, kode: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Nama Kelompok</label>
                <input required placeholder="Contoh: Muatan Nasional" className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`} value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}