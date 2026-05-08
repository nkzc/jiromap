<script lang="ts">
	export let size: 'banner' | 'rectangle' = 'banner';
</script>

<div class="ad-placeholder ad-{size}" aria-label="広告">
	<span>広告</span>
</div>

<style>
	.ad-placeholder {
		background: #f3f4f6;
		border: 1px dashed #d1d5db;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		font-size: 12px;
	}
	.ad-banner {
		width: 100%;
		height: 90px;
	}
	.ad-rectangle {
		width: 100%;
		height: 250px;
	}
</style>
