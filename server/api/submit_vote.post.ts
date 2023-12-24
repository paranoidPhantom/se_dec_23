import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	if (process.server) {
		const req = event.node.req
		const headers = (req && req.headers) ? Object.assign({}, req.headers) : {};
		const xForwardedFor = headers['x-forwarded-for'];
		const xRealIp = headers['x-real-ip'];
		const IP = xForwardedFor || xRealIp || event.context.clientAddress
		const supabase = serverSupabaseServiceRole(event);
		const body = await readBody(event)
		const { UID, vote, link } = body
		const { data: votesWithIP } = await supabase.from("votes").select("ip").eq("ip", IP);
		if (votesWithIP && votesWithIP?.length > 0) throw createError({
			statusCode: 400,
			statusMessage: "IP"
		})
		if (vote.length !== 3) throw createError({
			statusCode: 400
		})
		const { error } = await supabase.from("votes").insert({
			voter_id: UID,
			vote: vote,
			ip: IP
		} as any)
		if (error) throw createError({
			statusCode: 400,
			statusMessage: error.code
		}); else await fetch(link);
	}
})