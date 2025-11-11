import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://glcbkolaazmzzfbxfvxd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsY2Jrb2xhYXptenpmYnhmdnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODg1MTQsImV4cCI6MjA3ODI2NDUxNH0.W9QReGRrKbHF2Vus5Wnm0xgq4XZFMyUikvpxSSN_CoA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false, // Changed to false - session won't persist after app closes
    detectSessionInUrl: false,
  },
});

