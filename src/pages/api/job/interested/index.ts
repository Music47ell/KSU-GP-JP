import { supabase } from "../../../../lib/supabase";

export async function POST({ request }) {
	const { job_id, seeker_id, owner_id } = await request.json();

	const { data, error } = await supabase.from("job_interests").insert([
		{
			job_id,
			seeker_id,
			owner_id,
		},
	]);

	if (error) {
		return new Response(JSON.stringify({ message: error.message }), {
			status: 400,
		});
	}

	return new Response(
		JSON.stringify({ message: "Job interest added successfully" }),
		{
			status: 200,
		}
	);
}
