<script setup lang="ts">
const { website_name } = useAppConfig();

const route = useRoute();

watchEffect(() => {
    useHead({
        title: route.meta.name,
        titleTemplate: (titleChunk) => {
            return titleChunk
                ? `${titleChunk} | ${website_name}`
                : website_name;
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
    <div id="snow" data-count="100"></div>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
