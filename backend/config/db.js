// config/db.js – Supabase connection
const { createClient } = require('@supabase/supabase-js');

let supabase;

const connectDB = async () => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    console.error('');
    console.error('════════════════════════════════════════════════════════');
    console.error('❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env');
    console.error('════════════════════════════════════════════════════════');
    console.error('');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }

  try {
    supabase = createClient(url, key);
    console.log(`✅ Supabase client initialized connected to: ${url}`);
  } catch (err) {
    console.error('❌ Supabase initialization error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('⚠️  Running without DB – all database operations will fail.');
  }
};

const getSupabase = () => supabase;

module.exports = { connectDB, getSupabase };

