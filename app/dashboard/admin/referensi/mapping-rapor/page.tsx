"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers'; // Pastikan path ini benar ke file providers.tsx
import { supabase } from '@/lib/supabase';

export default function MappingRapor() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mappings, setMappings] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: null, subject_id: '', group_id: '', sequence_number: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Ambil data Mapping
    const { data: mapData } = await supabase
      .from('report_mappings')
      .select(`*, subject:subjects(name, grade_level), group:subject_groups(kode, nama)`)
      .order('sequence_number', { ascending: true });

    // 2. Ambil data Mata Pelajaran
    const { data: subData } = await supabase.from('subjects').select('id, name, grade_level').order('name');
    
    // 3. Ambil data Kelompok
    const { data: grpData } = await supabase.from('subject_groups').select('id, kode, nama').eq('is_active', true);

    // --- LOGIKA ANTI-MENUMPUK (Filter Unik berdasarkan Nama & Tingkat) ---
    const uniqueSubjects = subData ? subData.reduce((acc: any[], current: any) => {
      // Cek apakah kombinasi Nama + Tingkat sudah ada di penampung (acc)
      const isDuplicate = acc.find(item => 
        item.name === current.name && item.grade_level === current.grade_level
      );
      if (!isDuplicate) {
        return acc.concat([current]);
      }
      return acc;
    }, []) : [];

    setMappings(mapData || []);
    setSubjects(uniqueSubjects); // Gunakan data yang sudah difilter unik
    setGroups(grpData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      subject_id: formData.subject_id,
      group_id: formData.group_id,
      sequence_number: formData.sequence_number || 0
    };
    if (formData.id) payload.id = formData.id;

    const { error } = await supabase.from('report_mappings').upsert(payload);
    if (!error) {
      alert("Mapping Rapor Berhasil! 📝");
      setIsModalOpen(false);
      setFormData({ id: null, subject_id: '', group_id: '', sequence_number: 1 });
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Mapping Rapor</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola Urutan Mapel & Kelompok Mapel.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, subject_id: '', group_id: '', sequence_number: 1 }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Tambah Mapping
        </button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Urutan</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Mata Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Kelompok</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5 font-black text-blue-600 ">#{m.sequence_number}</td>
                <td className="px-8 py-5">
                    <p className="font-black tracking-tight">{m.subject?.name}</p>
                    <p className="text-[9px] font-bold opacity-30 uppercase">Tingkat {m.subject?.grade_level}</p>
                </td>
                <td className="px-8 py-5 text-center">
                    <span className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase">
                        {m.group?.kode} - {m.group?.nama}
                    </span>
                </td>
                <td className="px-8 py-5 text-right space-x-3">
                  <button onClick={() => { setFormData(m); setIsModalOpen(true); }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-blue-600">Edit</button>
                  <button onClick={() => { if(confirm('Hapus?')) supabase.from('report_mappings').delete().eq('id', m.id).then(()=>fetchData()) }} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 hover:text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings.length === 0 && !loading && (
          <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest">Belum ada data mapping</div>
        )}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <h2 className="text-3xl font-black tracking-tighter mb-8">Plotting Rapor</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Mata Pelajaran</label>
                <select required className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all`} value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade_level})</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Kelompok Mapel</label>
                <select required className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all`} value={formData.group_id} onChange={(e) => setFormData({...formData, group_id: e.target.value})}>
                  <option value="">-- Pilih Kelompok Mapel --</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.kode} - {g.nama}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Nomor Urut di Rapor</label>
                <input type="number" required placeholder="Contoh: 1" className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all`} value={formData.sequence_number} onChange={(e) => setFormData({...formData, sequence_number: parseInt(e.target.value)})} />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}