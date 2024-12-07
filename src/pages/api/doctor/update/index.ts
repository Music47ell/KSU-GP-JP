import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const owner_id = formData.get("owner_id");
  const fees = formData.get("fees");
  const status = formData.get("status");

  if (!owner_id) {
    return new Response("Doctor are required", { status: 400 });
  }

  const { error } = await supabase
    .from("owner")
    .update({ fees, status })
    .eq("user_id", owner_id)
    .single();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/owner/dashboard");
};