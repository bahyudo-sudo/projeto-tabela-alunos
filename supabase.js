const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidos no arquivo .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;