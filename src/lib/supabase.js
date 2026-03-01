import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
