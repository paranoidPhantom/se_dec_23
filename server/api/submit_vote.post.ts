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
		const { UID, vote, link, info } = body
		if (vote.length !== 3) throw createError({
			statusCode: 400
		})
		const { error } = await supabase.from("votes").insert({
			voter_id: UID,
			vote: vote,
			ip: `IP=${IP}<br>${info}`
		} as any)
		if (error) throw createError({
			statusCode: 400,
			statusMessage: error.code
		}); else await fetch(link);
	}
})