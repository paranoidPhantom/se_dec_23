<script lang="ts" setup>
definePageMeta({
	layout: "admin"
})
const supabase = useSupabaseClient()
const pending = ref(false)
const router = useRouter()
const input = reactive<{
	email?: string;
	password?: string;
}>({
	email: undefined,
	password: undefined
})

const authenticate = async () => {
	pending.value = true
	if (input.email && input.password) {
		const { error } = await supabase.auth.signInWithPassword({
			email: input.email,
			password: input.password
		})
		if (!error) {
			router.push("/admin")
		}
	}
}
</script>

<template>
    <div class="__login">
		<div class="form">
			<UInput v-model="input.email" name="email" placeholder="Email" class="w-full"/>
			<UInput v-model="input.password" type="password" placeholder="Password" name="password" class="w-full"/>
			<UButton @click="authenticate" :disabled="pending" :loading="pending" label="Log in" variant="soft" class="w-fit"/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.__login {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	.form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		width: 30%;
	}
}
</style>