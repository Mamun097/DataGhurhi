import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabaseUrl = 'https://hearrmxusukxrwmuvkac.supabase.co';
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYXJybXh1c3VreHJ3bXV2a2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNzAyNDksImV4cCI6MjA1Njc0NjI0OX0.Mk7aMnx7IBjl04ZkaLvsbHcEfs_z4CJjjuzpaq-eC7o";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
