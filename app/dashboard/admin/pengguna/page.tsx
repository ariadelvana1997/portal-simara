"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../layout';
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconChevron = ({ dir }: { dir: 'L' | 'R' }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points={dir === 'L' ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline></svg>;
const IconSort = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="ml-1 opacity-20"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>;
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

type Role = 'Admin' | 'Walikelas' | 'Guru' | 'Siswa';

export default function MasterPengguna() {
  const { cur, t = (key: string) => key } = useTheme();
  const [activeTab, setActiveTab] = useState<Role>('Admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'full_name', direction: 'asc' });
  const itemsPerPage = 5;

  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [formData, setFormData] = useState({ id: '', email: '', full_name: '', password: '', roles: [] as string[] });

  const availableRoles = ['Admin', 'Walikelas', 'Guru', 'Siswa'];

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); }, [activeTab, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const processedUsers = useMemo(() => {
    let result = users.filter(user => {
      const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
      const matchesTab = userRoles.some((r: string) => r?.toLowerCase() === activeTab.toLowerCase());
      const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });

    result.sort((a, b) => {
      const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, activeTab, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedUsers.length) setSelectedIds([]);
    else setSelectedIds(paginatedUsers.map(u => u.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (confirm(`🚨 PERINGATAN: Hapus ${selectedIds.length} pengguna terpilih secara permanen?`)) {
      const { error } = await supabase.from('profiles').delete().in('id', selectedIds);
      if (!error) {
        alert("Pembersihan Berhasil!");
        setSelectedIds([]);
        fetchUsers();
      }
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const generateRandomID = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${randomNum}@simara.com`;
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => {
      let updatedEmail = prev.email;
      if (!isEditing && val.length > 0 && !prev.email) {
        updatedEmail = generateRandomID();
      } else if (val.length === 0 && !isEditing) {
        updatedEmail = '';
      }
      return { ...prev, full_name: val, email: updatedEmail };
    });
  };

  const handleRefreshID = () => {
    if (!isEditing) setFormData(prev => ({ ...prev, email: generateRandomID() }));
  };

  const toggleRoleSelection = (role: string) => {
    setFormData(prev => ({ ...prev, roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roles.length === 0) return alert("Pilih minimal satu role!");
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase.from('profiles')
          .update({ full_name: formData.full_name, roles: formData.roles })
          .eq('id', formData.id);
        
        if (error) throw error;
        alert("✅ " + (t('save_success') || "Profil Berhasil Diperbarui!"));
      } else {
        // --- LOGIKA PENDAFTARAN USER BARU (Fix Invalid Credentials) ---
        // 1. Daftarkan Akun ke Supabase Authentication (Login System)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.full_name }
          }
        });

        if (authError) throw authError;

        // 2. Gunakan UPSERT untuk mengisi profil (Sinkronkan ID dari Auth)
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id, 
            email: formData.email,
            full_name: formData.full_name,
            roles: formData.roles
          }, { onConflict: 'id' });
          
          if (profileError) throw profileError;
        }
        alert("✅ Akun Berhasil Didaftarkan! User sekarang bisa login.");
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.message.includes("User already registered")) {
        alert("🚨 Email sudah digunakan! Silakan gunakan email lain.");
      } else {
        alert("🚨 Gagal: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus pengguna ini secara permanen?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  const openModal = (user: any = null) => {
    if (user) {
      setIsEditing(true);
      setFormData({ 
        id: user.id, 
        email: user.email, 
        full_name: user.full_name, 
        password: '', 
        roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []) 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: '', email: '', full_name: '', password: '', roles: [activeTab] });
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase ">Master Pengguna</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola akun dan otoritas login SIMARA.</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-500 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all animate-in zoom-in">
                    <IconTrash /> Hapus ({selectedIds.length})
                </button>
            )}
            <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                <IconPlus /> Tambah Pengguna
            </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className={`flex p-1.5 ${cur.card} border ${cur.border} rounded-2xl w-full lg:w-fit gap-1 shadow-sm overflow-x-auto custom-scrollbar`}>
            {availableRoles.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as Role)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : `${cur.textMuted} hover:bg-gray-500/10`}`}>
                {tab}
            </button>
            ))}
        </div>

        <div className={`relative w-full lg:max-w-xs group`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2"><IconSearch /></div>
            <input 
                type="text" 
                placeholder="Cari Nama / Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${cur.card} border ${cur.border} pl-11 pr-4 py-3.5 rounded-2xl font-bold text-xs focus:outline-none focus:border-blue-600 transition-all shadow-sm group-hover:shadow-md ${cur.text}`}
            />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className={`${cur.card} border ${cur.border} rounded-[2rem] shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className={`border-b ${cur.border} bg-gray-500/5`}>
                <th className="px-6 py-5 w-10">
                    <button onClick={handleSelectAll} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0 && <IconCheck />}
                    </button>
                </th>
                <th onClick={() => handleSort('full_name')} className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
                    Identitas User <IconSort />
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Otoritas / Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-right">Manajemen</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
                {loading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse font-black opacity-10 uppercase tracking-widest">Sinkronisasi Database...</td></tr>
                ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center font-black opacity-10 uppercase tracking-widest">Data Tidak Ditemukan.</td></tr>
                ) : paginatedUsers.map((user) => (
                <tr key={user.id} className={`${cur.hover} transition-colors group ${selectedIds.includes(user.id) ? 'bg-blue-600/[0.03]' : ''}`}>
                    <td className="px-6 py-5">
                        <button onClick={() => toggleSelect(user.id)} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(user.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {selectedIds.includes(user.id) && <IconCheck />}
                        </button>
                    </td>
                    <td className="px-4 py-5">
                        <div className="font-black tracking-tight text-sm uppercase">{user.full_name}</div>
                        <div className="text-[10px] opacity-40 font-bold">{user.email}</div>
                    </td>
                    <td className="px-8 py-5">
                    <div className="flex gap-1.5 flex-wrap">
                        {(Array.isArray(user.roles) ? user.roles : [user.role || 'User']).map((r: string) => (
                        <span key={r} className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-tighter border border-blue-600/20">{r}</span>
                        ))}
                    </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(user)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-blue-600 transition-all active:scale-90 shadow-sm`}><IconEdit /></button>
                        <button onClick={() => handleDelete(user.id)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-red-500 transition-all active:scale-90 shadow-sm`}><IconTrash /></button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* PAGINATION CONTROL */}
      {totalPages > 1 && (
          <div className="flex justify-between items-center px-4">
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Halaman {currentPage} dari {totalPages}</p>
              <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`p-3 rounded-xl border ${cur.border} ${cur.card} transition-all active:scale-90 disabled:opacity-20 shadow-sm`}><IconChevron dir="L"/></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`p-3 rounded-xl border ${cur.border} ${cur.card} transition-all active:scale-90 disabled:opacity-20 shadow-sm`}><IconChevron dir="R"/></button>
              </div>
          </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-lg rounded-[2.5rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-500`}>
            <h2 className="text-2xl font-black tracking-tighter mb-1 uppercase">{isEditing ? 'Perbarui' : 'Daftarkan'} Pengguna</h2>
            <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mb-8`}>Account Configuration</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Nama Lengkap</label>
                  <input required value={formData.full_name} onChange={(e) => handleNameChange(e.target.value)} className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm ${cur.text}`} placeholder="Masukkan Nama..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className={`w-full ${cur.bg} border ${cur.border} pl-5 pr-12 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm ${!isEditing && 'bg-blue-600/5'} ${cur.text}`} 
                      placeholder="Otomatis..." 
                      readOnly={!isEditing}
                    />
                    {!isEditing && (
                        <button type="button" onClick={handleRefreshID} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-blue-600/20 text-blue-600 transition-all" title="Generate Ulang ID">
                            <IconRefresh />
                        </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Pilih Akses Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableRoles.map(role => (
                    <div key={role} onClick={() => toggleRoleSelection(role)} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.roles.includes(role) ? 'border-blue-600 bg-blue-600/5' : `${cur.border} ${cur.hover}`}`}>
                      <span className={`text-xs font-black uppercase tracking-widest ${formData.roles.includes(role) ? 'text-blue-600' : 'opacity-40'}`}>{role}</span>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${formData.roles.includes(role) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {formData.roles.includes(role) && <IconCheck />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">
                    {isEditing ? 'Ganti Password (Kosongkan jika tidak diubah)' : 'Password Akun'}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!isEditing} 
                  className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm ${cur.text}`} 
                  placeholder={isEditing ? "Isi untuk ganti password..." : "Minimal 6 karakter"} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${cur.hover} transition-all`}>Batalkan</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                  {isSubmitting ? 'Proses...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}