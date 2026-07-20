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
					role: "admin",
				},
			},
		});

		if (error) {
			console.error("Admin signup error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		return redirect("/");
	} catch (err) {
		console.error("Admin signup error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
