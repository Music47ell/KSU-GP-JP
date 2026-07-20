import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let injectedUrl: string | null = null;
let injectedAnonKey: string | null = null;
let injectedServiceKey: string | null = null;
let cachedClient: SupabaseClient | null = null;

export function setSupabaseEnv(url: string, anonKey: string, serviceRoleKey?: string) {
  injectedUrl = url;
  injectedAnonKey = anonKey;
  if (serviceRoleKey) injectedServiceKey = serviceRoleKey;
  cachedClient = null;
}

function resolveUrl(): string {
  return injectedUrl ?? import.meta.env.SUPABASE_URL;
}

function resolveAnonKey(): string {
  return injectedAnonKey ?? import.meta.env.SUPABASE_ANON_KEY;
}

function resolveServiceKey(): string | null {
  return injectedServiceKey ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
}

function getSupabaseClient(): SupabaseClient {
  const url = resolveUrl();
  const key = resolveAnonKey();
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set");
  }
  return createClient(url, key);
}

export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    if (!cachedClient) {
      cachedClient = getSupabaseClient();
    }
    return Reflect.get(cachedClient, prop);
  },
});

export function createAdminClient() {
  const url = resolveUrl();
  const key = resolveServiceKey();
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client");
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}