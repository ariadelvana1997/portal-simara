"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function TahunAjaran() {
  const { cur } = useTheme();
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({ id: null, year: '', semester: 'Ganjil', is_active: false });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .order('year', { ascending: false });
    if (!error) setYears(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Pisahkan ID agar tidak ikut terkirim ke dalam kolom data
    const { id, ...dataToSubmit } = formData;

    if (id) {
      // PROSES UPDATE
      const { error } = await supabase
        .from('academic_years')
        .update(dataToSubmit)
        .eq('id', id);
      
      if (error) {
        alert("Gagal update: " + error.message);
      } else {
        alert("✅ Berhasil diperbarui!");
        setIsModalOpen(false);
        resetForm();
      }
    } else {
      // PROSES INSERT (Tambah Baru)
      const { error } = await supabase
        .from('academic_years')
        .insert([dataToSubmit]);
      
      if (error) {
        alert("Gagal simpan baru: " + error.message);
      } else {
        alert("✅ Tahun Ajaran baru ditambahkan!");
        setIsModalOpen(false);
        resetForm();
      }
    }

    fetchYears();
    setLoading(false);
  };

  const handleActivate = async (id: number) => {
    setLoading(true);
    
    // 1. Matikan semua status aktif (reset semua jadi false)
    await supabase.from('academic_years').update({ is_active: false }).neq('id', 0);
    
    // 2. Aktifkan tahun ajaran yang dipilih
    const { data: selectedYear, error: activateError } = await supabase
        .from('academic_years')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();
    
    if (activateError) {
        alert("Gagal mengaktifkan: " + activateError.message);
    } else if (selectedYear) {
      // 3. Ambil referensi tanggal rapor terakhir agar tidak hilang datanya
      const { data: lastDate } = await supabase
        .from('report_dates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // 4. SINKRONISASI KE TABEL REPORT_DATES
      const semNumber = selectedYear.semester === 'Ganjil' ? '1' : '2';
      
      const { error: syncError } = await supabase.from('report_dates').insert([{
        academic_year: selectedYear.year,
        semester_number: semNumber,
        report_date: lastDate?.report_date || '25 Maret 2026',
        location: lastDate?.location || 'Samarinda'
      }]);

      if (syncError) {
        alert("Tahun aktif, tapi gagal sinkron ke rapor: " + syncError.message);
      } else {
        alert(`✅ TAHUN AKTIF: ${selectedYear.year} (${selectedYear.semester}). Rapor otomatis terupdate!`);
      }
    }
    
    fetchYears();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus tahun ajaran ini?")) {
      setLoading(true);
      const { error } = await supabase.from('academic_years').delete().eq('id', id);
      if (error) alert("Gagal hapus: " + error.message);
      fetchYears();
    }
  };

  const resetForm = () => setFormData({ id: null, year: '', semester: 'Ganjil', is_active: false });

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Tahun Ajaran</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola periode akademik dan semester aktif.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Tambah Tahun
        </button>
      </div>

      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Tahun Pelajaran</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Semester</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5 font-black tracking-tight">{y.year}</td>
                <td className="px-8 py-5 font-bold opacity-70">{y.semester}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    {y.is_active ? (
                      <span className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-500/20">Aktif Sekarang</span>
                    ) : (
                      <button 
                        onClick={() => handleActivate(y.id)}
                        className="opacity-20 group-hover:opacity-100 hover:text-blue-600 text-[9px] font-black uppercase transition-all"
                      >
                        Aktifkan
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                  <button onClick={() => { setFormData(y); setIsModalOpen(true); }} className="p-2 hover:text-blue-600 transition-colors opacity-40 hover:opacity-100 font-black text-xs">Edit</button>
                  <button onClick={() => handleDelete(y.id)} className="p-2 hover:text-red-600 transition-colors opacity-40 hover:opacity-100 font-black text-xs">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {years.length === 0 && !loading && (
            <div className="p-20 text-center opacity-20 font-black uppercase tracking-[0.5em]">Belum ada data tahun ajaran</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <h2 className="text-2xl font-black tracking-tighter mb-6">{formData.id ? 'Edit' : 'Tambah'} Tahun</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Tahun Pelajaran</label>
                <input 
                  required
                  placeholder="2025/2026"
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all`}
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Semester</label>
                <select 
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`}
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50">
                   {loading ? 'Proses...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}