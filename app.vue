<script setup lang="ts">
const { website_name } = useAppConfig();

const route = useRoute();

watchEffect(() => {
    useHead({
        title: route.meta.name,
        titleTemplate: (titleChunk) => {
            return titleChunk
                ? `${titleChunk} | ${website_name} | Школа №550`
                : `${website_name} | Школа №550`;
        },
        link: [
            {
                rel: "icon",
                type: "image/x-icon",
                href: "/favicon.svg",
            },
        ],
		script: [
			{
				src: "/snow/script.js",
			}
		]
    });
});
</script>

<template>
    <div id="snow" data-count="30"></div>
	<p class="notice" style="position: fixed; z-index: -1; left: 1rem; top: 1rem;">(Ждём фон от дизайнера)</p>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
