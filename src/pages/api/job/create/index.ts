import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const seeker_id = formData.get("seeker_id")?.toString();
  const owner_id = formData.get("owner_id")?.toString();
  const time = formData.get("time")?.toString();
  const purpose = formData.get("purpose")?.toString();

  if (!seeker_id || !owner_id) {
    return new Response("Owner and Seeker are required", { status: 400 });
  }

  const { error } = await supabase
    .from("job_interests")
    .insert([
      {
        seeker_id,
        owner_id,
        time,
        purpose,
      },
    ])
    .select();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/seeker/dashboard");
};