import { createClient } from '@supabase/supabase-js';

// Ensure URL has protocol and no trailing slash
const formatUrl = (url: string) => {
  if (!url) return '';
  let formatted = url.trim();
  if (!formatted.startsWith('http')) {
    formatted = `https://${formatted}`;
  }
  return formatted.replace(/\/$/, '');
};

const supabaseUrl = formatUrl(import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Debug logging for production troubleshooting
const urlDebug = supabaseUrl ? `${supabaseUrl.substring(0, 15)}...${supabaseUrl.substring(supabaseUrl.length - 5)}` : 'MISSING';
console.log(`[Supabase Init] URL: ${urlDebug}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-client-info': 'REPOT-app'
    }
  }
});

console.log('Supabase client initialized successfully');

// Database types (you can generate these with `supabase gen types typescript`)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      identifications: {
        Row: {
          id: string;
          user_id: string;
          species: string;
          confidence: number;
          identified_by: string;
          image_url?: string;
          found_in_database: boolean;
          location?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species: string;
          confidence: number;
          identified_by: string;
          image_url?: string;
          found_in_database: boolean;
          location?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          species?: string;
          confidence?: number;
          identified_by?: string;
          image_url?: string;
          found_in_database?: boolean;
          location?: string;
          created_at?: string;
        };
      };
    };
  };
}
