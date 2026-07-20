import { defineMiddleware } from "astro:middleware";
import { setSupabaseEnv } from "@/lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const runtime = (context.locals as Record<string, unknown>).runtime as
    | { env: Record<string, string | undefined> }
    | undefined;

  if (runtime?.env?.SUPABASE_URL && runtime?.env?.SUPABASE_ANON_KEY) {
    setSupabaseEnv(
      runtime.env.SUPABASE_URL,
      runtime.env.SUPABASE_ANON_KEY,
      runtime.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  return next();
});
