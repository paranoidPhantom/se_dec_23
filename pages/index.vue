<script lang="ts" setup>
const votingEnabled = false
const streamEnabled = false
</script>

<template>
    <div class="__home px-6 sm:px-12 md:px-20 lg:px-32 pt-12">
	<img src="/logo.webp" alt="Логотип - ёлка" class="w-2/3 md:w1/3 xl:w-1/6" style="filter: drop-shadow(0 1rem 3rem rgba(0,0,0,0.5));">
		<Stream />
		<Stream v-if="streamEnabled"/>
		<Voting v-if="votingEnabled"/>
	</div>
</template>

<style lang="scss" scoped>
.__home {
    display: flex;
    flex-direction: column;
	align-items: center;
	gap: 3rem;
}
</style>
