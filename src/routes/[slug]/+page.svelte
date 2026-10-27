<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';

	let { data } = $props();
</script>

{#key data.slug}
	<Terminal boot={[`cat ${data.slug}`]} />
{/key}
