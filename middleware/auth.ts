export default defineNuxtRouteMiddleware((to, from) => {
	if (process.client) {
		const user = useSupabaseUser();
		if (!user.value) return navigateTo("/admin/login")
	}
})