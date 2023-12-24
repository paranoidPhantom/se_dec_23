<script lang="ts" setup>
definePageMeta({
    name: "Новогодний концерт 2023'24",
});
</script>

<template>
	<p class="notice" style="position: fixed; z-index: -1; left: 1rem; top: 1rem;">(Ждём фон от дизайнера)</p>
    <div class="__home px-6 sm:px-12 md:px-20 lg:px-32 pt-12">
		<Voting />
	</div>
</template>

<style lang="scss" scoped>
.__home {
    display: flex;
    flex-direction: column;
	align-items: center;
}
</style>
