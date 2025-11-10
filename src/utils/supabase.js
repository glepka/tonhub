import { createClient } from "@supabase/supabase-js";

let cached = null;

export const getSupabase = () => {
  if (cached) return cached;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn("Supabase URL or anon key is missing");
    return null;
  }
  
  // Validate URL format
  if (!url.includes("supabase.co") && !url.includes("supabase.com")) {
    console.error("Invalid Supabase URL format:", url);
    return null;
  }
  
  try {
    cached = createClient(url, anon, {
      auth: { persistSession: false },
      global: { headers: { "x-application-name": "tonhub" } },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cached;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
};

export const supabase = getSupabase();


