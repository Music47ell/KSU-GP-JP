import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	try {
		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const password = formData.get("password")?.toString();

		if (!email || !password) {
			return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Sign in error:", error.message);
			return new Response(JSON.stringify({ error: error.message }), { status: 401, headers: { "Content-Type": "application/json" } });
		}

		const { access_token, refresh_token } = data.session;
		cookies.set("sb-access-token", access_token, { path: "/" });
		cookies.set("sb-refresh-token", refresh_token, { path: "/" });

		const role = data.user.user_metadata.role;
		if (role === "admin") return redirect("/admin/dashboard");
		if (role === "owner") return redirect("/owner/dashboard");
		if (role === "seeker") return redirect("/seeker/dashboard");

		return redirect("/");
	} catch (err) {
		console.error("Sign in error:", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
};
