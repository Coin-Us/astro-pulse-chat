import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzupzqmkhlepgncyfpbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dXB6cW1raGxlcGduY3lmcGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDQ4NTAsImV4cCI6MjA3ODA4MDg1MH0.I7572vgAfeYniHyriHmMrwFmDUk7liUzzdO8YgapqnY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
