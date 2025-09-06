import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Demo mode flag - set to true to run without Supabase
const DEMO_MODE = false;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlValue: supabaseUrl.substring(0, 20) + '...' // Show first 20 chars for debugging
});

// Helper functions for validation
const isPlaceholder = (value: string): boolean => {
  const placeholders = ['YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY', 'your-project-url', 'your-anon-key'];
  return placeholders.includes(value);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

if (!DEMO_MODE && (!supabaseUrl || !supabaseAnonKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey))) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing'
  });
  throw new Error('Supabase yapılandırması eksik veya geçersiz. Lütfen .env dosyasında gerçek Supabase URL ve anahtarınızı girin.');
}

// Store the auth state change callback for demo mode
let authStateChangeCallback: ((event: string, session: any) => void) | null = null;

// Mock user and session state for demo mode
let mockUser: any = DEMO_MODE ? { id: 'demo-user', email: 'demo@example.com' } : null;
let mockSession: any = DEMO_MODE ? null : null; // Start with no session

// Create a mock client for demo mode
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
    signInWithPassword: () => {
      // Create session on sign in
      mockSession = { 
        user: mockUser, 
        access_token: 'mock-token', 
        refresh_token: 'mock-refresh-token' 
      };
      
      // Trigger auth state change
      if (authStateChangeCallback) {
        setTimeout(() => {
          authStateChangeCallback('SIGNED_IN', mockSession);
        }, 0);
      }
      
      return Promise.resolve({ 
        data: { 
          user: mockUser, 
          session: mockSession 
        }, 
        error: null 
      });
    },
    signOut: () => {
      // Clear session but keep user info for potential re-login
      mockSession = null;
      
      // Trigger auth state change
      if (authStateChangeCallback) {
        setTimeout(() => {
          authStateChangeCallback('SIGNED_OUT', null);
        }, 0);
      }
      
      return Promise.resolve({ error: null });
    },
    onAuthStateChange: (callback: any) => {
      authStateChangeCallback = callback;
      
      // Simulate initial session check
      setTimeout(() => {
        if (mockSession) {
          callback('INITIAL_SESSION', mockSession);
        } else {
          callback('INITIAL_SESSION', null);
        }
      }, 0);
      
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {
              authStateChangeCallback = null;
            } 
          } 
        } 
      };
    },
    getUser: () => {
      if (mockSession) {
        return Promise.resolve({ data: { user: mockUser }, error: null });
      } else {
        return Promise.resolve({ data: { user: null }, error: null });
      }
    }
  },
  channel: (channelName: string) => ({
    on: function() { return this; },
    subscribe: () => ({ unsubscribe: () => {} })
  }),
  from: () => {
    const chainableQuery = {
      data: [],
      error: null,
      select: function() { return this; },
      insert: function() { return this; },
      update: function() { return this; },
      delete: function() { return this; },
      eq: function() { return this; },
      gte: function() { return this; },
      lte: function() { return this; },
      not: function() { return this; },
      order: function() { return this; },
      single: function() { return this; },
      then: function(resolve: any) {
        return Promise.resolve({ data: this.data, error: this.error }).then(resolve);
      }
    };
    return chainableQuery;
  },
  rpc: () => {
    return Promise.resolve({ data: null, error: null });
  }
});

export const supabase = DEMO_MODE ? createMockClient() : createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export validation functions for use in components
export const isSupabaseConfigured = () => {
  if (DEMO_MODE) return true;
  return supabaseUrl && 
         supabaseAnonKey && 
         !isPlaceholder(supabaseUrl) && 
         !isPlaceholder(supabaseAnonKey) && 
         isValidUrl(supabaseUrl);
};