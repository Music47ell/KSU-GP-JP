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
			.update({ approved: formData.get("approved")?.toString() })
			.eq("user_id", owner_id);

		if (error) {
			console.error("Admin approve error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/admin/dashboard");
	} catch (err) {
		console.error("Admin approve error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
