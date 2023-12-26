<script lang="ts" setup></script>

<template>
    <div class="__admin-layout">
		<header class="p-4 flex items-center gap-2 border-b border-b-gray-800">
			<UButton to="/" label="На домашнюю" variant="soft"/>
			<UButton to="/results" label="Результаты" variant="soft"/>
			<UButton to="/results?fullscreen=1" label="Результаты (только график)" variant="soft"/>
		</header>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.__admin-layout {
	background-color: rgb(15,15,15);
	min-height: 100vh;
}
</style>
