import type { APIRoute } from "astro";
import { supabase } from "../../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	try {
		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const password = formData.get("password")?.toString();

		if (!email || !password) {
			return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name: formData.get("name")?.toString(),
					role: "seeker",
					resume_url: formData.get("resume_url")?.toString(),
					github_url: formData.get("github_url")?.toString(),
					linkedin_url: formData.get("linkedin_url")?.toString(),
					portfolio_url: formData.get("portfolio_url")?.toString(),
				},
			},
		});

		if (error) {
			console.error("Seeker signup error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/");
	} catch (err) {
		console.error("Seeker signup error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
