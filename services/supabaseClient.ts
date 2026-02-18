
import { createClient } from '@supabase/supabase-js';

// Provided by user
const SUPABASE_URL = 'https://tkpeghvijacsmshiozdw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEwgv9jG83dpfr32Qh-NOg_jUoV2-jB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConnected: true, // We hardcode true now that keys are provided
  projectId: 'tkpeghvijacsmshiozdw'
};

// Placeholder for future auth logic
export const authService = {
  login: async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};
