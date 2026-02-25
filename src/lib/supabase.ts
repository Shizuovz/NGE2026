import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
console.log('Deployment timestamp:', new Date().toISOString());

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Try service role key first, fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'Resource not found';
  } else if (error.code === '23505') {
    return 'This record already exists';
  } else if (error.code === '23503') {
    return 'Referenced record does not exist';
  } else if (error.code === '23514') {
    return 'Data validation failed';
  } else {
    return error.message || 'An error occurred';
  }
};

// Types for our database tables
export interface Database {
  public: {
    Tables: {
      colleges: {
        Row: {
          id: number;
          name: string;
          abbreviation: string | null;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          abbreviation?: string | null;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          abbreviation?: string | null;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: number;
          name: string;
          full_name: string | null;
          team_size: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          full_name?: string | null;
          team_size: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          full_name?: string | null;
          team_size?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: number;
          registration_id: string;
          team_name: string;
          registration_type: 'college' | 'open_category' | 'sponsor' | 'visitor';
          game_id: number;
          status: 'pending' | 'confirmed' | 'rejected' | 'withdrawn';
          college_id: number | null;
          team_category: 'professionals' | 'semi_pro' | 'community' | null;
          captain_name: string;
          captain_email: string;
          captain_phone: string;
          additional_message: string | null;
          terms_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          registration_id: string;
          team_name: string;
          registration_type: 'college' | 'open_category' | 'sponsor' | 'visitor';
          game_id: number;
          status?: 'pending' | 'confirmed' | 'rejected' | 'withdrawn';
          college_id?: number | null;
          team_category?: 'professionals' | 'semi_pro' | 'community' | null;
          captain_name: string;
          captain_email: string;
          captain_phone: string;
          additional_message?: string | null;
          terms_accepted: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          registration_id?: string;
          team_name?: string;
          registration_type?: 'college' | 'open_category' | 'sponsor' | 'visitor';
          game_id?: number;
          status?: 'pending' | 'confirmed' | 'rejected' | 'withdrawn';
          college_id?: number | null;
          team_category?: 'professionals' | 'semi_pro' | 'community' | null;
          captain_name?: string;
          captain_email?: string;
          captain_phone?: string;
          additional_message?: string | null;
          terms_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: number;
          team_id: number;
          player_number: number;
          ign: string;
          game_id: string;
          is_substitute: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          team_id: number;
          player_number: number;
          ign: string;
          game_id: string;
          is_substitute?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          team_id?: number;
          player_number?: number;
          ign?: string;
          game_id?: string;
          is_substitute?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sponsor_registrations: {
        Row: {
          id: number;
          registration_id: string;
          company_name: string;
          sponsorship_tier_id: number | null;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          message: string | null;
          status: 'pending' | 'contacted' | 'confirmed' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          registration_id: string;
          company_name: string;
          sponsorship_tier_id?: number | null;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'confirmed' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          registration_id?: string;
          company_name?: string;
          sponsorship_tier_id?: number | null;
          contact_person?: string;
          contact_email?: string;
          contact_phone?: string;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'confirmed' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      visitor_registrations: {
        Row: {
          id: number;
          registration_id: string;
          full_name: string;
          email: string;
          phone: string;
          status: 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          registration_id: string;
          full_name: string;
          email: string;
          phone: string;
          status?: 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          registration_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          status?: 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      sponsorship_tiers: {
        Row: {
          id: number;
          name: string;
          price: number | null;
          description: string | null;
          benefits: Record<string, any>[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price?: number | null;
          description?: string | null;
          benefits?: Record<string, any>[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number | null;
          description?: string | null;
          benefits?: Record<string, any>[] | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type DatabaseTable = keyof Database['public']['Tables'];
export type DatabaseRow<T extends DatabaseTable> = Database['public']['Tables'][T]['Row'];
export type DatabaseInsert<T extends DatabaseTable> = Database['public']['Tables'][T]['Insert'];
export type DatabaseUpdate<T extends DatabaseTable> = Database['public']['Tables'][T]['Update'];
