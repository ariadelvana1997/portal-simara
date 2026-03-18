"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';

export default function DataTanggalRapor() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form sesuai gambar
  const [formData, setFormData] = useState<any>({
    id: null,
    semester: 'Ganjil',
    semester_number: 1,
    location: '',
    report_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('report_dates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setDates(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { id, ...payload } = formData;
    const finalPayload = id ? formData : payload;

    const { error } = await supabase.from('report_dates').upsert(finalPayload);

    if (!error) {
      alert("Tanggal Rapor Berhasil Disimpan! 📅");
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus pengaturan tanggal ini?")) {
      await supabase.from('report_dates').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading && !isModalOpen) return <div className="p-10 opacity-20 font-black  text-center">MENYIAPKAN KALENDER RAPOR...</div>;

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Tanggal Rapor</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Atur waktu dan tempat penerbitan dokumen rapor.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, semester: 'Ganjil', semester_number: 1, location: '', report_date: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Tambah Tanggal
        </button>
      </div>

      {/* TABLE */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Semester</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Ke</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Tempat Cetak</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Tanggal Rapor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((d) => (
                <tr key={d.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5 font-black ">{d.semester}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-lg font-black text-xs">
                        {d.semester_number}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold uppercase text-xs opacity-60">{d.location}</td>
                  <td className="px-8 py-5 font-black tracking-tight">{d.report_date}</td>
                  <td className="px-8 py-5 text-right space-x-3">
                    <button onClick={() => { setFormData(d); setIsModalOpen(true); }} className="text-[10px] font-black uppercase text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-[10px] font-black uppercase text-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
              {dates.length === 0 && (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black ">Belum ada data tanggal rapor.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-3xl font-black tracking-tighter  mb-8">{formData.id ? 'Edit' : 'Tambah'} Tanggal</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Semester</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold appearance-none`} value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Semester Ke-</label>
                    <input type="number" required className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold`} value={formData.semester_number} onChange={(e) => setFormData({...formData, semester_number: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Tempat Cetak Rapor</label>
                <input 
                  required
                  placeholder="Contoh: Jakarta / Bandung"
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Tanggal Cetak Rapor</label>
                <input 
                  type="date"
                  required
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all`}
                  value={formData.report_date}
                  onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Tanggal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}