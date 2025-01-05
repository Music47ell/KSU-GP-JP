import type { APIRoute } from "astro";
import { supabase } from "../.././../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
	const formData = await request.formData();
	const user_id = formData.get("user_id") as string;
	const name = formData.get("name") as string;
	const resume_url = formData.get("resume_url") as string;
	const github_url = formData.get("github_url") as string;
	const linkedin_url = formData.get("linkedin_url") as string;
	const portfolio_url = formData.get("portfolio_url") as string;

	if (!user_id) {
		return new Response("Seeker are required", { status: 400 });
	}

	const { error } = await supabase
		.from("seeker")
		.update({ name, resume_url, github_url, linkedin_url, portfolio_url })
		.eq("user_id", user_id)
		.single();

	if (error) {
		return new Response(error.message, { status: 500 });
	}

	return redirect("/seeker/dashboard");
};
