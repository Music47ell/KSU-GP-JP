import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const owner_id = formData.get("owner_id");
	const title = formData.get("title");
	const tags = formData.get("tags");
	const description = formData.get("description");

	if (!owner_id) {
		return new Response("Owner are required", { status: 400 });
	}

	const { error } = await supabase
		.from("owner")
		.update({ title, tags, description })
		.eq("user_id", owner_id)
		.single();

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/owner/dashboard");
};
