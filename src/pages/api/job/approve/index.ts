import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const job_id = formData.get("job_id")?.toString();
		const approved = formData.get("approved")?.toString();

		if (!job_id) {
			return new Response(JSON.stringify({ error: "Job is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase
			.from("job_listings")
			.update({ approved })
			.eq("id", job_id);

		if (error) {
			console.error("Job approve error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/admin/dashboard");
	} catch (err) {
		console.error("Job approve error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
