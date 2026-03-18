"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../layout'; // Pastikan path ke layout benar
import { supabase } from '@/lib/supabase';

// --- ICONS ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>;

type Role = 'Admin' | 'Walikelas' | 'Guru' | 'Siswa';

export default function MasterPengguna() {
  const { cur } = useTheme();
  const [activeTab, setActiveTab] = useState<Role>('Admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form / Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: '', 
    email: '', 
    full_name: '', 
    password: '', 
    roles: [] as string[] 
  });

  const availableRoles = ['Admin', 'Walikelas', 'Guru', 'Siswa'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  // Filter users berdasarkan role
  const filteredUsers = users.filter(user => {
    // Pastikan roles ada dan berbentuk array, jika tidak jadikan array kosong
    const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    return userRoles.some((r: string) => r?.toLowerCase() === activeTab.toLowerCase());
  });

  const toggleRoleSelection = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role) 
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roles.length === 0) return alert("Pilih minimal satu role!");

    // Payload dasar
    const payload: any = {
      full_name: formData.full_name,
      email: formData.email,
      roles: formData.roles 
    };

    let result;
    
    if (isEditing) {
      // Update data yang sudah ada (ID sudah tersedia)
      result = await supabase.from('profiles').update(payload).eq('id', formData.id);
    } else {
      // --- LOGIKA MANDIRI (OPSIONAL TAPI BAGUS) ---
      // Generate UUID baru jika user baru untuk mencegah "null value in column id"
      payload.id = crypto.randomUUID(); 
      result = await supabase.from('profiles').insert([payload]);
    }

    if (result.error) {
      console.error("Database Error:", result.error);
      alert("Gagal Simpan Data: " + result.error.message);
    } else {
      alert(isEditing ? "Berhasil Update!" : "User Berhasil Ditambahkan!");
      setModalOpen(false);
      fetchUsers(); // Refresh daftar
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus pengguna ini secara permanen?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert("Gagal Hapus: " + error.message);
      else fetchUsers();
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
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase ">Master Pengguna</h1>
          <p className={`${cur.textMuted} text-sm font-medium`}>Kelola akun dan otoritas login SIMARA.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
        >
          <IconPlus /> Tambah Pengguna
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className={`flex p-1.5 ${cur.card} border ${cur.border} rounded-2xl w-fit gap-1 shadow-sm overflow-x-auto`}>
        {availableRoles.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Role)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : `${cur.textMuted} hover:bg-gray-500/10`}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE DATA */}
      <div className={`${cur.card} border ${cur.border} rounded-[2rem] shadow-sm overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${cur.border} ${cur.bg} bg-opacity-50`}>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Identitas User</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Otoritas / Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-right">Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {loading ? (
              <tr><td colSpan={3} className="p-20 text-center animate-pulse font-bold opacity-30  uppercase">Sinkronisasi Database...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={3} className="p-20 text-center font-bold opacity-30  uppercase">Belum ada data untuk kategori {activeTab}.</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className={`${cur.hover} transition-colors group`}>
                <td className="px-8 py-5">
                  <div className="font-bold tracking-tight text-sm uppercase">{user.full_name}</div>
                  <div className="text-[10px] opacity-50 font-bold">{user.email}</div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-1.5 flex-wrap">
                    {(Array.isArray(user.roles) ? user.roles : [user.role]).map((r: string) => (
                      <span key={r} className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-tighter border border-blue-600/20">{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(user)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-blue-600 transition-all active:scale-90`}><IconEdit /></button>
                    <button onClick={() => handleDelete(user.id)} className={`p-2.5 rounded-xl ${cur.bg} border ${cur.border} hover:text-red-500 transition-all active:scale-90`}><IconTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${cur.card} w-full max-w-lg rounded-[2.5rem] border ${cur.border} p-10 shadow-2xl animate-in zoom-in-95 duration-500`}>
            <h2 className="text-2xl font-black tracking-tighter mb-1  uppercase">{isEditing ? 'Perbarui' : 'Daftarkan'} Pengguna</h2>
            <p className={`${cur.textMuted} text-[10px] font-black uppercase tracking-[0.2em] mb-8`}>Account Configuration</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Nama Lengkap</label>
                  <input required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} placeholder="user@mail.com" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Pilih Akses Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableRoles.map(role => (
                    <div 
                      key={role} 
                      onClick={() => toggleRoleSelection(role)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.roles.includes(role) ? 'border-blue-600 bg-blue-600/5' : `${cur.border} ${cur.hover}`}`}
                    >
                      <span className={`text-xs font-black uppercase tracking-widest ${formData.roles.includes(role) ? 'text-blue-600' : 'opacity-40'}`}>{role}</span>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${formData.roles.includes(role) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {formData.roles.includes(role) && <IconCheck />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Password Default</label>
                  <input type="password" required className={`w-full ${cur.bg} border ${cur.border} px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all font-bold text-sm`} placeholder="Minimal 6 karakter" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${cur.hover} transition-all`}>Batalkan</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}