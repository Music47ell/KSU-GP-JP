import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const seeker_id = formData.get("seeker_id")?.toString();
		const owner_id = formData.get("owner_id")?.toString();

		if (!seeker_id || !owner_id) {
			return new Response(JSON.stringify({ error: "Owner and Seeker are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase
			.from("job_interests")
			.insert([{ seeker_id, owner_id }])
			.select();

		if (error) {
			console.error("Job create error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/seeker/dashboard");
	} catch (err) {
		console.error("Job create error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};