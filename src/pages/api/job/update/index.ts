import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const job_id = formData.get("job_id")?.toString();
	const owner_id = formData.get("owner_id")?.toString();
	const time = formData.get("time")?.toString();
	const title = formData.get("title")?.toString();
	const tags = formData.get("tags")?.toString();
	const description = formData.get("description")?.toString();

	if (!owner_id) {
		return new Response("Owner is required", { status: 400 });
	}

	// Convert tags to an array
	const tagsArray = tags?.split(",").map((tag) => tag.trim()) || null;

	const { error } = await supabase
		.from("job_listings")
		.update({ owner_id, time, title, tags: tagsArray, description })
		.eq("id", job_id)
		.single();

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/owner/dashboard");
};
