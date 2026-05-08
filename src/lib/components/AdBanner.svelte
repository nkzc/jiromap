<script lang="ts">
	import { dev } from '$app/environment';
	import AdPlaceholder from './AdPlaceholder.svelte';

	let { size = 'banner' }: { size?: 'banner' | 'rectangle' } = $props();

	// 固定サイズを事前確保して CLS を防止
	const dimensions = {
		banner: { width: '100%', height: '90px' },
		rectangle: { width: '100%', height: '250px' }
	} as const;
</script>

{#if dev}
	<AdPlaceholder {size} />
{:else}
	<!-- AdSense: publisher ID は審査通過後に差し替え -->
	<div style="min-height: {dimensions[size].height}; width: {dimensions[size].width};">
		<ins
			class="adsbygoogle"
			style="display:block; min-height:{dimensions[size].height};"
			data-ad-client="ca-pub-4102046917046088"
			data-ad-slot="YYYYYYYYYY"
			data-ad-format={size === 'banner' ? 'horizontal' : 'rectangle'}
			data-full-width-responsive="true"
		></ins>
	</div>
{/if}
