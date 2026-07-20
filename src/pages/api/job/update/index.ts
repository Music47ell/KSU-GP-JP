import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const job_id = formData.get("jobId")?.toString();
		const owner_id = formData.get("ownerId")?.toString();
		const title = formData.get("title")?.toString();
		const tags = formData.get("tags")?.toString();
		const description = formData.get("description")?.toString();

		if (!owner_id) {
			return new Response(JSON.stringify({ error: "Owner is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const tagsArray = tags?.split(",").map((tag) => tag.trim()) ?? [];

		const { error } = await supabase
			.from("job_listings")
			.update({ owner_id, title, tags: tagsArray, description })
			.eq("id", job_id);

		if (error) {
			console.error("Job update error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/owner/dashboard");
	} catch (err) {
		console.error("Job update error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
