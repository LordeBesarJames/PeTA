// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tesqgtpifdycvstmbibh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3FndHBpZmR5Y3ZzdG1iaWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODEyNTUsImV4cCI6MjA2NjE1NzI1NX0.jjcTtf5bqexnMwAxPrInVr8AsttGfL8Ct8ZwanjpbMo";

export const supabase = createClient(supabaseUrl, supabaseKey);
