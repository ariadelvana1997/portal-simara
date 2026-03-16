export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Portal Simara</h1>
          <p className="text-slate-500 mt-2">E-Rapor Kurikulum Merdeka</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">NIP / Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 mt-1 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border-slate-200" 
              placeholder="Masukkan NIP"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 mt-1 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border-slate-200" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Masuk ke Sistem
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 Portal Simara • Dikembangkan oleh Guru IT
        </p>
      </div>
    </div>
  );
}