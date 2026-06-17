import { createClient } from '@supabase/supabase-js';

// Use environment variables for security. 
// Fallback to previous hardcoded values only if env is missing (for local dev safety)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://plgajtzlftdpjhrespuo.supabase.co/';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ2FqdHpsZnRkcGpocmVzcHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzI1MDcsImV4cCI6MjA4Mjc0ODUwN30.fow05dYB-m56dgTTR0hvdkZ47fTzI4ObI7uDHUfsfAY';

export const supabase = createClient(supabaseUrl, supabaseKey);