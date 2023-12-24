<script lang="ts" setup></script>

<template>
    <div class="__default-layout">
        <slot />
        <footer class="px-6 md:px-28 lg:px-72 py-4">
			<div class="info flex flex-col mt-8">
				<p class="mb-4"><b>Сайт разработали</b></p>
				<ul class="list-disc">
					<li class="ml-6"><span class="font-medium"><a href="https://github.com/paranoidPhantom" target="_blank">Худалла Андрей (10Б)</a></span> - Разработчик <Icon name="tdesign:terminal-rectangle"/></li>
					<li class="ml-6"><span class="font-medium"><a href="https://vk.com/zlum41" target="_blank">Каменик Леонид (11Б)</a></span> - UX/UI Дизайнер <Icon name="tdesign:animation-1"/></li>
					<li class="ml-6"><span class="font-medium">Шатохин Анатолий (10Б)</span> - Бета тестирование <Icon name="tdesign:bug"/></li>
				</ul>
				<hr style="scale: 1.1 1;" class="my-6">
				<a href="https://www.flaticon.com/ru/" target="_blank">Иконка сайта - Flaticon (Автор justicon)</a>
			</div>
			<hr style="scale: 1.1 1;" class="xl:hidden mt-12 w-full !opacity-50">
			<div class="media flex flex-col w-full xl:w-auto xl:text-right my-8">
				<p class="mb-4"><b>Информация о проекте</b></p>
				<a class="flex items-center gap-2 xl:justify-end" href="https://github.com/paranoidPhantom/se_dec_23" target="_blank"><Icon name="radix-icons:github-logo"/> Ссылка на GitHub</a>
				<hr style="scale: 1.1 1;" class="my-6">
				<p class="mb-4"><b>Технологии</b></p>
				<a class="flex items-center gap-2 xl:justify-end" href="https://nuxt.com" target="_blank"><Icon name="logos:nuxt-icon"/> Nuxt 3</a>
				<a class="flex items-center gap-2 xl:justify-end" href="https://ui.nuxt.com" target="_blank"><Icon name="logos:nuxt-icon" style="filter: hue-rotate(38deg);"/> Nuxt UI</a>
				<a class="flex items-center gap-2 xl:justify-end" href="https://supabase.com" target="_blank"><Icon name="logos:supabase-icon"/> Supabase</a>
			</div>
		</footer>
    </div>
</template>

<style lang="scss" scoped>
.__default-layout {
    footer {
        display: flex;
        justify-content: space-between;
		align-items: center;
        margin-top: 2rem;
        min-height: 50vh;
        background-color: rgba(0, 0, 0, 0.5);
		box-shadow: 0 0.3rem 1rem black inset;
		backdrop-filter: blur(5rem);
		font-family: 'Source Code Pro', monospace;
		font-weight: 200;
		flex-wrap: wrap;
		a {
			text-decoration: underline dotted 1px rgb(var(--color-primary-DEFAULT) / 0.8);
		}
    }
}
</style>
