import process from "node:process";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return "";
}

let client: SupabaseClient | undefined;

// Read-only client for the request path. Uses the public anon key — safe to
// read here since it's already shipped to the browser via VITE_ vars.
export function getSupabaseClient(): SupabaseClient | undefined {
  if (client) return client;

  const url = readEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = readEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) return undefined;

  client = createClient(url, key);
  return client;
}
