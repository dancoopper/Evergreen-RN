import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = "https://nnyzdcowcelseumvzsym.supabase.co";
const supabaseAnonKey = 'sb_publishable_pHoMdN_g0NQvc7zdcD4pzQ_pI_Z91Iv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
