"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataTanggalRapor() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form disederhanakan hanya untuk data Waktu & Tempat
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

  // LOGIKA SIMPAN: Diperbarui agar mengambil Tahun Ajaran aktif supaya tidak hilang di Rapor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Ambil Tahun Ajaran yang sedang aktif
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('year')
      .eq('is_active', true)
      .maybeSingle();

    const { id, ...payload } = formData;
    
    // 2. Masukkan academic_year ke dalam payload
    const dataWithYear = {
      ...payload,
      academic_year: activeYear?.year || '-'
    };

    // 3. Gunakan logika Update jika ada ID, Insert jika tidak ada
    let result;
    if (id) {
      result = await supabase.from('report_dates').update(dataWithYear).eq('id', id);
    } else {
      result = await supabase.from('report_dates').insert([dataWithYear]);
    }

    if (!result.error) {
      alert("Waktu Rapor Berhasil Disimpan! 📅");
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } else {
      alert("Gagal: " + result.error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus pengaturan tanggal ini?")) {
      setLoading(true);
      const { error } = await supabase.from('report_dates').delete().eq('id', id);
      if (!error) fetchData();
      setLoading(false);
    }
  };

  const resetForm = () => setFormData({ 
    id: null, 
    semester: 'Ganjil', 
    semester_number: 1, 
    location: '', 
    report_date: '' 
  });

  if (loading && !isModalOpen) return (
    <div className={`min-h-[400px] flex items-center justify-center font-black opacity-20 ${cur.text}`}>
      MENYIAPKAN KALENDER RAPOR...
    </div>
  );

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Tanggal Rapor</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola periode semester dan waktu penerbitan dokumen.</p>
        </div>
        <button 
          onClick={() => { 
            resetForm();
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
          Tambah Konfigurasi
        </button>
      </div>

      {/* TABLE */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Semester</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Lokasi & Tanggal Terbit</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((d) => (
                <tr key={d.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                  <td className="px-8 py-5">
                    <div className="font-black">{d.semester}</div>
                    <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">Semester Ke-{d.semester_number}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold uppercase text-xs opacity-60">{d.location}</div>
                    <div className="font-black tracking-tight text-blue-600">{d.report_date}</div>
                  </td>
                  <td className="px-8 py-5 text-right space-x-4">
                    <button onClick={() => { setFormData(d); setIsModalOpen(true); }} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-[10px] font-black uppercase text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dates.length === 0 && (
             <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest">Belum ada pengaturan tanggal</div>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-3xl font-black tracking-tighter mb-6">{formData.id ? 'Update' : 'Set'} Waktu Rapor</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Semester</label>
                    <select className={`w-full bg-gray-500/10 border ${cur.border} px-5 py-3.5 rounded-2xl font-bold appearance-none`} value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Semester Ke- (Angka)</label>
                    <input type="number" required className={`w-full bg-gray-500/10 border ${cur.border} px-5 py-3.5 rounded-2xl font-bold`} value={formData.semester_number} onChange={(e) => setFormData({...formData, semester_number: parseInt(e.target.value)})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Lokasi Penerbitan</label>
                    <input required className={`w-full bg-gray-500/10 border ${cur.border} px-5 py-3.5 rounded-2xl font-bold`} value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Contoh: Samarinda" />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">Tanggal Rapor</label>
                    <input required className={`w-full bg-gray-500/10 border ${cur.border} px-5 py-3.5 rounded-2xl font-bold`} value={formData.report_date} onChange={(e) => setFormData({...formData, report_date: e.target.value})} placeholder="Contoh: 25 Maret 2026" />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase opacity-40 transition-all">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                    {loading ? 'Proses...' : 'Simpan Waktu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}