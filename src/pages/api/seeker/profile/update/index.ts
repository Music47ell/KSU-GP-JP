import type { APIRoute } from "astro";
import { supabase } from "../../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const user_id = formData.get("user_id")?.toString();

		if (!user_id) {
			return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase
			.from("seeker")
			.update({
				name: formData.get("name")?.toString(),
				resume_url: formData.get("resume_url")?.toString(),
				github_url: formData.get("github_url")?.toString(),
				linkedin_url: formData.get("linkedin_url")?.toString(),
				portfolio_url: formData.get("portfolio_url")?.toString(),
			})
			.eq("user_id", user_id);

		if (error) {
			console.error("Seeker profile update error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/seeker/dashboard");
	} catch (err) {
		console.error("Seeker profile update error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
