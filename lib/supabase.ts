import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Environment Validation ──────────────────────────────────────
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isConfigured =
  supabaseUrl.length > 10 &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseAnonKey.includes("placeholder");

if (!isConfigured) {
  console.warn(
    "[KiranaAI] ⚠️  Supabase is NOT configured.\n" +
    "  → Copy .env.example to .env and fill in your credentials.\n" +
    "  → The app will run in offline/local-only mode."
  );
}

// ── Supabase Client ─────────────────────────────────────────────
// Falls back to a no-op placeholder when env vars are missing,
// so the app boots normally in offline/local-only mode.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Helper: Returns `true` if Supabase credentials have been properly
 * configured in the environment. Use this to gate cloud features.
 */
export const isSupabaseReady = isConfigured;
