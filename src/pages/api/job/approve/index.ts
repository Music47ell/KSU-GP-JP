import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const job_id = formData.get("job_id");
	const approved = formData.get("approved");

	if (!job_id) {
		return new Response("Job is required", { status: 400 });
	}

	const { error } = await supabase
		.from("job_listings")
		.update({ approved: approved })
		.eq("id", job_id)
		.single();

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/admin/dashboard");
};
