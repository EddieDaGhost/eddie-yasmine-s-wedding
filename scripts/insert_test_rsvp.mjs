import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(2);
}

const supabase = createClient(url, key);

async function run() {
  try {
    const payload = {
      name: 'Test User (automated)',
      email: 'test+automated@example.com',
      guests: 1,
      meal_choice: 'beef',
      message: 'Automated test RSVP from local script',
      status: 'attending',
    };

    console.log('Inserting RSVP payload:', payload);
    const { data, error } = await supabase.from('rsvps').insert([payload]).select('*').limit(1);
    if (error) {
      console.error('Insert error:', error);
      process.exitCode = 1;
      return;
    }
    console.log('Insert succeeded:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exitCode = 1;
  }
}

run();
