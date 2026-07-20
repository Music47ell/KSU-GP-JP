import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
	try {
		cookies.delete("sb-access-token", { path: "/" });
		cookies.delete("sb-refresh-token", { path: "/" });
		return redirect("/");
	} catch (err) {
		console.error("Sign out error:", err);
		return redirect("/");
	}
};