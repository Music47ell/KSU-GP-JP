import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const owner_id = formData.get("owner_id")?.toString();
		const title = formData.get("title")?.toString();
		const description = formData.get("description")?.toString();
		const tags = formData.get("tags")?.toString();

		if (!owner_id || !title || !description || !tags) {
			return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const tagsArray = tags.split(",").map((tag) => tag.trim());

		const { error } = await supabase.from("job_listings").insert({
			owner_id,
			title,
			description,
			tags: tagsArray,
		});

		if (error) {
			console.error("Job add error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/owner/dashboard");
	} catch (err) {
		console.error("Job add error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
