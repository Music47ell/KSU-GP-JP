import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const job_id = formData.get("job_id")?.toString();

	const { error } = await supabase
		.from("job_interests")
		.delete()
		.eq("id", job_id);

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/seeker/dashboard");
};
