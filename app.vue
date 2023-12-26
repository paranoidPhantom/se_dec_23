<script setup lang="ts">
const { website_name } = useAppConfig();

const router = useRouter();
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
            },
        ],
    });
});

onMounted(() => {
    let countdown = 10;
    const themeCheckInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            if (document.documentElement.classList.contains("dark"))
                clearInterval(themeCheckInterval);
            else countdown--;
        } else {
            document.documentElement.classList.add("dark");
            clearInterval(themeCheckInterval);
        }
    }, 100);
});

defineShortcuts({
	shift_a: () => router.push("/admin") 
})

const snow = ref(true)
watchEffect(() => {
	snow.value = route.meta.layout !== 'admin'
})
</script>

<template>
    <div
        id="snow"
        v-show="snow"
        data-count="30"
    ></div>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
