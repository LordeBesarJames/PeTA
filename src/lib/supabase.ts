// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrhkggwsihgbvvymrylk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yaGtnZ3dzaWhnYnZ2eW1yeWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDY5MDIsImV4cCI6MjA2MzMyMjkwMn0.19I3DzSByrngYCllT66rdrXT6GH5PYiSGcbZ4EHynfU'; 

export const supabase = createClient(supabaseUrl, supabaseKey);