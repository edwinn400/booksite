// Supabase configuration
const SUPABASE_URL = 'https://gahynyqrjfgujenypvko.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaHlueXFyamZndWplbnlwdmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTIzNDgsImV4cCI6MjA3MTgyODM0OH0.3w4mY4V6f4QU8f1l7M0iEQIktTfib0ZD09T8jwLQJec';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration complete! Your booksite is now connected to Supabase. 