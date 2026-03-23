"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/app/providers';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx'; // Library untuk olah Excel

export default function MasterSiswa() {
  const { cur } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Baru untuk Import, Pagination, Filter & Select
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // State Form Lengkap Sesuai Screenshot Excel
  const initialForm = {
    id: null, full_name: '', email: '', nisn: '', nis: '', pob: '', dob: '', 
    gender: 'Laki-laki', religion: 'Islam', family_status: 'Anak Kandung', 
    child_order: 1, address: '', phone: '', previous_school: '', 
    admission_date: '', father_name: '', father_job: '', mother_name: '', 
    mother_job: '', parent_address: '',
    guardian_name: '', guardian_job: '', guardian_address: '',
    roles: ['Siswa']
  };

  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .contains('roles', ['Siswa'])
      .order('full_name');
    setStudents(data || []);
    setLoading(false);
  };

  // --- LOGIKA FILTER & SORT ---
  const filteredAndSortedStudents = useMemo(() => {
    let result = students.filter(s => 
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn?.includes(searchTerm) ||
      s.nis?.includes(searchTerm)
    );

    result.sort((a, b) => {
      if (sortOrder === 'asc') return a.full_name.localeCompare(b.full_name);
      return b.full_name.localeCompare(a.full_name);
    });

    return result;
  }, [students, searchTerm, sortOrder]);

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedIds([]); 
  };

  // --- LOGIKA SELEKSI (CHECKBOX) ---
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentStudents.map(s => s.id));
    }
  };

  // --- LOGIKA HAPUS MASAL ---
  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} siswa terpilih secara permanen?`)) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').delete().in('id', selectedIds);
    if (!error) {
      alert("✅ Data terpilih berhasil dihapus!");
      setSelectedIds([]);
      fetchData();
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // --- LOGIKA DOWNLOAD TEMPLATE ---
  const downloadTemplate = () => {
    const headers = [[
      'Nama Lengkap', 'Email', 'NISN', 'NIS', 'Tempat Lahir', 'Tgl Lahir (YYYY-MM-DD)', 
      'Jenis Kelamin', 'Agama', 'Status Keluarga', 'Anak Ke', 'Alamat', 'Telepon', 
      'Sekolah Asal', 'Tgl Diterima (YYYY-MM-DD)', 'Nama Ayah', 'Pekerjaan Ayah', 
      'Nama Ibu', 'Pekerjaan Ibu', 'Alamat Orang Tua', 'Nama Wali', 'Pekerjaan Wali'
    ]];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "Template_Master_Siswa.xlsx");
  };

  // --- LOGIKA UPLOAD & MAPPING EXCEL ---
  // --- LOGIKA UPLOAD & MAPPING EXCEL (VERSI ANTI-DUPLIKAT) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) return alert("File kosong!");

        // 1. Mapping data mentah dari Excel
        const preparedData = rawData.map((row) => ({
          id: crypto.randomUUID(),
          full_name: row['Nama Lengkap'] || '',
          email: row['Email'] || '',
          nisn: row['NISN']?.toString() || null,
          nis: row['NIS']?.toString() || null,
          pob: row['Tempat Lahir'] || '',
          dob: row['Tgl Lahir (YYYY-MM-DD)'] || null,
          gender: row['Jenis Kelamin'] || 'Laki-laki',
          religion: row['Agama'] || 'Islam',
          family_status: row['Status Keluarga'] || 'Anak Kandung',
          child_order: parseInt(row['Anak Ke']) || 1,
          address: row['Alamat'] || '',
          phone: row['Telepon']?.toString() || '',
          previous_school: row['Sekolah Asal'] || '',
          admission_date: row['Tgl Diterima (YYYY-MM-DD)'] || null,
          father_name: row['Nama Ayah'] || '',
          father_job: row['Pekerjaan Ayah'] || '',
          mother_name: row['Nama Ibu'] || '',
          mother_job: row['Pekerjaan Ibu'] || '',
          parent_address: row['Alamat Orang Tua'] || '',
          guardian_name: row['Nama Wali'] || '',
          guardian_job: row['Pekerjaan Wali'] || '',
          roles: ['Siswa']
        }));

        // --- 2. LOGIKA ANTI-BENTROK (DE-DUPLIKASI) ---
        // Kita filter berdasarkan Email agar tidak ada email yang sama dikirim sekaligus
        const uniqueData = Array.from(
          new Map(preparedData.map((item) => [item.email, item])).values()
        );

        const { error } = await supabase.from('profiles').upsert(uniqueData, { onConflict: 'email' });
        
        if (!error) {
          alert(`🎉 Berhasil! ${uniqueData.length} data diproses (Duplikat diabaikan).`);
          setIsImportOpen(false);
          fetchData();
        } else throw error;
      } catch (err: any) {
        alert("Gagal Import: " + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };
  // --- FIX GARIS MERAH: Menggunakan casting 'any' agar indexing aman ---
  const openEdit = (s: any) => {
    const cleanedData: any = { ...initialForm };
    Object.keys(initialForm).forEach((key) => {
      cleanedData[key] = s[key] ?? (initialForm as any)[key];
    });
    setFormData(cleanedData);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };

    // Sanitasi Tanggal & Angka
    if (payload.dob === "") payload.dob = null;
    if (payload.admission_date === "") payload.admission_date = null;
    if (payload.child_order === "" || payload.child_order === null) payload.child_order = 1;
    if (!payload.id) payload.id = crypto.randomUUID();

    const { error } = await supabase.from('profiles').upsert(payload);
    
    if (!error) {
      setIsModalOpen(false);
      fetchData();
      alert("Data Siswa Berhasil Disinkronkan!");
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${cur.text}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase ">Master Siswa</h1>
          <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.3em] mt-1`}>Total: {filteredAndSortedStudents.length} / {students.length} Siswa</p>
        </div>
        <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} className="bg-red-600 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl animate-in zoom-in duration-300">Hapus ({selectedIds.length})</button>
            )}
            <button onClick={() => setIsImportOpen(true)} className="bg-gray-500/10 px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-500/20 transition-all">Import Excel</button>
            <button onClick={() => { setFormData(initialForm); setIsModalOpen(true); }} className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">Tambah Manual</button>
        </div>
      </div>

      {/* SEARCH & SORT BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input type="text" placeholder="Cari nama, NISN, atau NIS..." className={`w-full bg-gray-500/5 border ${cur.border} pl-12 pr-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all`} value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
        <select className={`bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest focus:outline-none`} value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
          <option value="asc">Urutkan A-Z</option>
          <option value="desc">Urutkan Z-A</option>
        </select>
      </div>

      {/* TABEL SINGKAT */}
      <div className={`${cur.card} rounded-[3rem] border ${cur.border} overflow-hidden shadow-sm`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} bg-gray-500/5`}>
              <th className="px-6 py-6 text-center w-10">
                <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" checked={selectedIds.length === currentStudents.length && currentStudents.length > 0} onChange={handleSelectAll} />
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Nama Lengkap</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">NISN / NIS</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {currentStudents.map((s) => (
              <tr key={s.id} className={`group hover:bg-gray-500/5 transition-all ${selectedIds.includes(s.id) ? 'bg-blue-600/5' : ''}`}>
                <td className="px-6 py-6 text-center">
                  <input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" checked={selectedIds.includes(s.id)} onChange={() => handleSelectOne(s.id)} />
                </td>
                <td className="px-8 py-6">
                    <p className="font-black text-lg tracking-tight uppercase">{s.full_name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase ">{s.address || 'Alamat belum diisi'}</p>
                </td>
                <td className="px-8 py-6 text-center">
                    <span className="bg-gray-500/10 px-4 py-1.5 rounded-full font-black text-[10px]">{s.nisn || '-'} / {s.nis || '-'}</span>
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <button onClick={() => openEdit(s)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all hover:text-blue-600">Lengkapi Biodata</button>
                  <button onClick={async () => { if(confirm('Hapus siswa ini?')) { await supabase.from('profiles').delete().eq('id', s.id); fetchData(); } }} className="text-[10px] font-black uppercase text-red-600 opacity-40 hover:opacity-100 transition-all">Hapus</button>
                </td>
              </tr>
            ))}
            {currentStudents.length === 0 && !loading && (
                <tr><td colSpan={4} className="p-20 text-center font-black opacity-20 uppercase">Data tidak ditemukan</td></tr>
            )}
          </tbody>
        </table>

        {/* --- UI PAGINATION --- */}
        {filteredAndSortedStudents.length > itemsPerPage && (
          <div className={`p-6 border-t ${cur.border} flex justify-between items-center bg-gray-500/5`}>
            <p className="text-[10px] font-black uppercase opacity-40">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white border shadow-sm'}`}>Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-white border shadow-sm'}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMPORT EXCEL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className={`${cur.card} w-full max-w-md rounded-[3.5rem] border ${cur.border} p-12 shadow-2xl animate-in zoom-in-95 duration-300`}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Import Siswa</h2>
                        <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2">Batch Upload Biodata Lengkap</p>
                    </div>
                    <button onClick={() => setIsImportOpen(false)} className="text-3xl font-black opacity-20 hover:opacity-100 transition-all">×</button>
                </div>
                <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-3 bg-blue-600/10 text-blue-600 py-5 rounded-[2rem] mb-6 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">⬇️ Unduh Template Excel</button>
                <div className={`relative border-4 border-dashed ${uploading ? 'border-blue-600 animate-pulse' : 'border-gray-500/10'} rounded-[2.5rem] p-12 text-center transition-all`}>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="space-y-2"><span className="text-5xl block mb-2">📊</span><p className="font-black text-xs uppercase tracking-widest">{uploading ? 'Menyinkronkan...' : 'Klik/Seret File'}</p></div>
                </div>
                <button onClick={() => setIsImportOpen(false)} className="mt-8 w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest opacity-20 hover:opacity-100 transition-all">Batalkan</button>
            </div>
        </div>
      )}

      {/* MODAL FORM LENGKAP (SAMA DENGAN EXCEL KAMU) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className={`${cur.card} w-full max-w-4xl rounded-[3.5rem] border ${cur.border} p-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500`}>
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase ">Formulir Biodata Siswa</h2>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-1">Pastikan data sesuai dengan Akta Kelahiran/KK</p>
                </div>
                <button onClick={()=>setIsModalOpen(false)} className="text-3xl font-black opacity-20 hover:opacity-100 transition-all">×</button>
             </div>

             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-10 custom-scrollbar">
                
                {/* SEKSI 1: DATA PRIBADI */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] border-b border-blue-600/20 pb-2">I. Data Pribadi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Nama Lengkap</label>
                            <input required className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all`} value={formData.full_name || ''} onChange={(e)=>setFormData({...formData, full_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Email (Identitas Unik)</label>
                            <input type="email" required className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-600 transition-all`} value={formData.email || ''} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">NISN</label>
                                <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.nisn || ''} onChange={(e)=>setFormData({...formData, nisn: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">NIS</label>
                                <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.nis || ''} onChange={(e)=>setFormData({...formData, nis: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Tgl Lahir</label>
                                <input type="date" className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.dob || ''} onChange={(e)=>setFormData({...formData, dob: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Telepon</label>
                                <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.phone || ''} onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-2">Alamat Lengkap</label>
                        <textarea className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold h-24 focus:outline-none`} value={formData.address || ''} onChange={(e)=>setFormData({...formData, address: e.target.value})} />
                    </div>
                </div>

                {/* SEKSI 2: RIWAYAT & KELUARGA */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] border-b border-blue-600/20 pb-2">II. Riwayat & Keluarga</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Status Keluarga</label>
                                <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.family_status || ''} onChange={(e)=>setFormData({...formData, family_status: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Anak Ke-</label>
                                <input type="number" className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.child_order} onChange={(e)=>setFormData({...formData, child_order: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Sekolah Asal</label>
                                <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.previous_school || ''} onChange={(e)=>setFormData({...formData, previous_school: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Tgl Diterima</label>
                                <input type="date" className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.admission_date || ''} onChange={(e)=>setFormData({...formData, admission_date: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEKSI 3: DATA ORANG TUA (LENGKAP SESUAI EXCEL) */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] border-b border-blue-600/20 pb-2">III. Data Orang Tua</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Nama Ayah</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.father_name || ''} onChange={(e)=>setFormData({...formData, father_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Pekerjaan Ayah</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.father_job || ''} onChange={(e)=>setFormData({...formData, father_job: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Nama Ibu</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.mother_name || ''} onChange={(e)=>setFormData({...formData, mother_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Pekerjaan Ibu</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.mother_job || ''} onChange={(e)=>setFormData({...formData, mother_job: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-2">Alamat Orang Tua</label>
                        <input placeholder="Kosongkan jika sama dengan siswa" className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.parent_address || ''} onChange={(e)=>setFormData({...formData, parent_address: e.target.value})} />
                    </div>
                </div>

                {/* SEKSI 4: DATA WALI */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-orange-600 tracking-[0.3em] border-b border-orange-600/20 pb-2">IV. Data Wali (Opsional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Nama Wali</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.guardian_name || ''} onChange={(e)=>setFormData({...formData, guardian_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-2">Pekerjaan Wali</label>
                            <input className={`w-full bg-gray-500/5 border ${cur.border} px-6 py-4 rounded-2xl font-bold`} value={formData.guardian_job || ''} onChange={(e)=>setFormData({...formData, guardian_job: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Simpan Seluruh Biodata</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-white text-[10px] tracking-widest uppercase">Menyinkronkan Database...</p>
        </div>
      )}
    </div>
  );
}