import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const supabase = serverSupabaseServiceRole(event);
	const body = await readBody(event)
	const { UID, vote } = body
	const { error } = await supabase.from("votes").insert({
		voter_id: UID,
		vote: vote
	} as any)
	console.log(error)
	if (error) throw createError({
		statusCode: 400,
		statusMessage: error.code
	})
})