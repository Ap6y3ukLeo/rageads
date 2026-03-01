import { createClient } from '@supabase/supabase-js';

// Fallback для production (Vercel) - публичные ключи можно хардкодить
const DEFAULT_SUPABASE_URL = 'https://cgfbstfgnvdqwzxpjfjp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_tlZ35e6I6Eyme3dCMJEqgg_V1N3xkYC';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

// Проверка переменных
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing! Check .env file');
}

// Создаем клиент
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Экспортируем
export { supabase };
