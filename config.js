// Supabase configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Note: You'll need to replace the above values with your actual Supabase project credentials
// Get these from: https://supabase.com/dashboard 