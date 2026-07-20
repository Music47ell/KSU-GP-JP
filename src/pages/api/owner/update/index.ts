import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const owner_id = formData.get("owner_id")?.toString();

		if (!owner_id) {
			return new Response(JSON.stringify({ error: "Owner is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase
			.from("owner")
			.update({
				title: formData.get("title")?.toString(),
				tags: formData.get("tags")?.toString(),
				description: formData.get("description")?.toString(),
			})
			.eq("user_id", owner_id);

		if (error) {
			console.error("Owner update error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/owner/dashboard");
	} catch (err) {
		console.error("Owner update error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
