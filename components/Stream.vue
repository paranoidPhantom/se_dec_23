<script lang="ts" setup>
const supabase = useSupabaseClient()

const embed_url = ref()

onMounted(async () => {
	const { data } = await supabase.from("config").select().eq("key", "stream").single()
	embed_url.value = data
})
</script>

<template>
  <div class="__live-stream">
    <iframe :src="`https://www.youtube.com/embed/${embed_url ? (embed_url as any).value : ''}?hl=ru&autoplay=1&color=white`" title="Прямой эфир" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</template>

<style lang="scss" scoped>
.__live-stream {
	width: 90%;
	max-width: 55rem;
	iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 1rem;
    	border: 1px dashed rgb(var(--color-primary-DEFAULT));
	}
}
</style>