import type { APIRoute } from "astro";
import { supabase } from "../../../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const name = formData.get("name")?.toString();
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	const resume_url = formData.get("resume_url")?.toString();
	const github_url = formData.get("github_url")?.toString();
	const linkedin_url = formData.get("linkedin_url")?.toString();
	const portfolio_url = formData.get("portfolio_url")?.toString();

	if (!email || !password) {
		return new Response("Email and password are required", { status: 400 });
	}

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				name: name,
				role: "seeker",
				resume_url: resume_url,
				github_url: github_url,
				linkedin_url: linkedin_url,
				portfolio_url: portfolio_url,
			},
		},
	});

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/");
};
