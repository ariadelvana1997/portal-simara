"use client";
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ThemeContext = createContext<any>(null);

export const useTheme = () => useContext(ThemeContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'light' | 'dark' | 'read'>('light');
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const cur = {
    light: { bg: "bg-gray-50", card: "bg-white", text: "text-gray-900", border: "border-gray-200", textMuted: "text-gray-500", hover: "hover:bg-gray-50" },
    dark: { bg: "bg-gray-950", card: "bg-gray-900", text: "text-gray-100", border: "border-gray-800", textMuted: "text-gray-400", hover: "hover:bg-gray-800" }
  }[mode === 'read' ? 'light' : mode]; // Simple fallback

  return (
    <ThemeContext.Provider value={{ profile, loading, cur, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}