import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const owner_id = formData.get("owner_id");
	const title = formData.get("title");
	const description = formData.get("description");
	const tags = formData.get("tags");

	if (!owner_id || !title || !description || !tags) {
		return new Response("All fields are required", { status: 400 });
	}

	if (typeof tags !== "string") {
		return new Response("Invalid tags format", { status: 400 });
	}
	const tagsArray = tags.split(",").map((tag) => tag.trim());

	const { error } = await supabase.from("job_listings").insert({
		owner_id,
		title,
		description,
		tags: tagsArray,
	});

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/owner/dashboard");
};
