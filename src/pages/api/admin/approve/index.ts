import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const owner_id = formData.get("owner_id");
  const approved = formData.get("approved");

  if (!owner_id) {
    return new Response("Doctor are required", { status: 400 });
  }

  const { error } = await supabase
    .from("owner")
    .update({ approved: approved })
    .eq("user_id", owner_id)
    .single();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/admin/dashboard");
};