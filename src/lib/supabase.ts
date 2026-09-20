import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://lcazcbxrogxjcytgdohf.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-Xq4XnDL-DTezmT23ttwg_7z6Wt2G3';

// AsyncStorage's web implementation touches `window` directly with no
// SSR guard, which crashes expo-router's static rendering pass (Node,
// no window). Only use it on native; let supabase-js fall back to its
// own SSR-safe browser storage on web.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

