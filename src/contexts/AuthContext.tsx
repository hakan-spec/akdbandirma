import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth session error:', error);
          setError('Kimlik doğrulama hatası: ' + error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Kimlik doğrulama başlatılamadı');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null); // Clear any previous errors on successful auth change
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || !supabase.supabaseKey) {
        return { error: { message: 'Supabase yapılandırması eksik. Lütfen .env dosyasını kontrol edin.' } };
      }

      // Additional validation for URL format
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return { error: { message: 'VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY .env dosyasında tanımlanmalı.' } };
      }
      
      if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
        return { error: { message: 'Geçersiz Supabase URL. URL https://your-project.supabase.co formatında olmalı.' } };
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          return { error: { message: 'Supabase sunucusuna bağlanılamıyor. Lütfen .env dosyasındaki VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.' } };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Geçersiz e-posta veya şifre.' } };
        }
      }
      
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        return { error: { message: 'Ağ bağlantısı hatası. Supabase URL ve anahtarınızı kontrol edin:\n\n1. .env dosyasında VITE_SUPABASE_URL=https://your-project.supabase.co\n2. .env dosyasında VITE_SUPABASE_ANON_KEY=your-anon-key\n\nBu bilgileri Supabase Dashboard > Settings > API bölümünden alabilirsiniz.' } };
      }
      return { error: { message: 'Giriş yapılırken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata') } };
    }
  };


  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bağlantı Hatası</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};