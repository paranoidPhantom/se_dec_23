<script lang="ts" setup>
const supabase = useSupabaseClient();

const embed_urls = reactive({
    stream: "",
    stream2: "",
});

onMounted(async () => {
    const { data: stream } = await supabase
        .from("config")
        .select()
        .eq("key", "stream")
        .single();
    const { data: stream2 } = await supabase
        .from("config")
        .select()
        .eq("key", "stream2")
        .single();
    embed_urls.stream = stream as unknown as string;
    embed_urls.stream2 = stream2 as unknown as string;
});

const tabs = [
    {
        label: "28.12 (1-6 классы)",
        key: "stream",
    },
    {
        label: "29.12 (7-11 классы + учителя)",
        key: "stream2",
    },
];
</script>

<template>
    <div class="__live-stream">
        <UTabs :items="tabs" class="tabs">
            <template #item="{ item }">
                <iframe
                    :src="`https://www.youtube.com/embed/${(embed_urls as any)[item.key] ? (embed_urls as any)[item.key].value : ''}?hl=ru&autoplay=1&color=white`"
                    title="Прямой эфир"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>
            </template>
        </UTabs>
    </div>
</template>

<style lang="scss">
.__live-stream {
	[role=tablist] {
		border: 1px dashed rgb(var(--color-primary-DEFAULT));
	}
}
</style>

<style lang="scss" scoped>
.__live-stream {
    width: 90%;
    max-width: 55rem;
    iframe {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 1rem;
        border: 1px dashed rgb(var(--color-primary-DEFAULT));
		background-color: black;
    }
}
</style>
