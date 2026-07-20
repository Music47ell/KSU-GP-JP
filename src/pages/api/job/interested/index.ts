import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
	try {
		const { job_id, seeker_id, owner_id } = await request.json();

		if (!job_id || !seeker_id || !owner_id) {
			return new Response(JSON.stringify({ error: "job_id, seeker_id, and owner_id are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase.from("job_interests").insert([
			{ job_id, seeker_id, owner_id },
		]);

		if (error) {
			console.error("Job interest error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		return new Response(JSON.stringify({ message: "Job interest added successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (err) {
		console.error("Job interest error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
