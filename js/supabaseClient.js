// Configuración de conexión a Supabase.
// Reemplaza estos valores por los de tu proyecto (Settings > API).
const SUPABASE_URL = 'https://cfngpjtbbfnjemvgluvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbmdwanRiYmZuamVtdmdsdXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNTQwOTMsImV4cCI6MjEwMDczMDA5M30.dO7bpw8yrLxzajbKDGM1O9poxG5pnlMDkQ335Z2es6I';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
