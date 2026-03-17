"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../layout';
import { supabase } from '@/lib/supabase';

export default function DataGuru() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({ 
    id: '', 
    full_name: '', 
    nuptk: '', 
    jk: 'L', 
    jenis_ptk: 'Guru Mapel' 
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    // LOGIKA: Ambil user dari profiles yang roles-nya mengandung 'Guru'
    // Lalu JOIN dengan tabel teachers untuk ambil NUPTK, JK, dll
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        roles,
        teachers (nuptk, jk, jenis_ptk)
      `)
      .contains('roles', ['Guru']); // Filter role Guru

    if (!error) {
      // Merapikan data agar mudah dibaca di tabel
      const formatted = data.map((item: any) => ({
        id: item.id,
        full_name: item.full_name,
        nuptk: item.teachers?.nuptk || '-',
        jk: item.teachers?.jk || '-',
        jenis_ptk: item.teachers?.jenis_ptk || '-'
      }));
      setTeachers(formatted);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Upsert data ke tabel teachers berdasarkan ID profil yang dipilih
    const { error } = await supabase
      .from('teachers')
      .upsert({
        id: formData.id,
        nuptk: formData.nuptk,
        jk: formData.jk,
        jenis_ptk: formData.jenis_ptk,
        updated_at: new Date()
      });

    if (!error) {
      alert("Data Guru Berhasil Disinkronkan! 🚀");
      setIsModalOpen(false);
      fetchTeachers();
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter ">Data Guru</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Manajemen biodata tenaga pendidik yang terdaftar.</p>
        </div>
      </div>

      {/* Table List */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">No</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Guru</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">NUPTK</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">JK</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Jenis PTK</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? teachers.map((g, i) => (
              <tr key={g.id} className={`border-b ${cur.border} group hover:bg-gray-500/5 transition-all`}>
                <td className="px-8 py-5 font-black opacity-20 text-xs">{i + 1}</td>
                <td className="px-8 py-5 font-black tracking-tight">{g.full_name}</td>
                <td className="px-8 py-5 font-bold opacity-70">{g.nuptk}</td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${g.jk === 'L' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                    {g.jk === 'L' ? 'LAKI-LAKI' : g.jk === 'P' ? 'PEREMPUAN' : '-'}
                   </span>
                </td>
                <td className="px-8 py-5 font-bold opacity-60 text-xs uppercase">{g.jenis_ptk}</td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => { setFormData(g); setIsModalOpen(true); }}
                    className="bg-gray-500/10 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-90"
                  >
                    LENGKAPI DATA
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-20 text-center opacity-20 font-black ">Belum ada user dengan role Guru.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form LENGKAPI DATA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-md rounded-[3rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <h2 className="text-2xl font-black tracking-tighter  mb-2">Lengkapi Biodata</h2>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-8">{formData.full_name}</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">NUPTK</label>
                <input 
                  required
                  placeholder="Masukkan 16 digit NUPTK"
                  className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all`}
                  value={formData.nuptk}
                  onChange={(e) => setFormData({...formData, nuptk: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Jenis Kelamin</label>
                    <select 
                        className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`}
                        value={formData.jk}
                        onChange={(e) => setFormData({...formData, jk: e.target.value})}
                    >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30  ml-2">Jenis PTK</label>
                    <select 
                        className={`w-full bg-gray-500/10 border ${cur.border} ${cur.text} px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-bold transition-all appearance-none`}
                        value={formData.jenis_ptk}
                        onChange={(e) => setFormData({...formData, jenis_ptk: e.target.value})}
                    >
                        <option value="Guru Mapel">Guru Mapel</option>
                        <option value="Guru BK">Guru BK</option>
                        <option value="Walikelas">Walikelas</option>
                        <option value="Kepala Sekolah">Kepala Sekolah</option>
                    </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Update Guru</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}