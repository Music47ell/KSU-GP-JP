import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const job_id = formData.get("job_id")?.toString();

		if (!job_id) {
			return new Response(JSON.stringify({ error: "Job ID is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase
			.from("job_interests")
			.delete()
			.eq("id", job_id);

		if (error) {
			console.error("Job delete error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/seeker/dashboard");
	} catch (err) {
		console.error("Job delete error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
