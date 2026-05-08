<script lang="ts">
	import type { Shop } from '../types.js';
	import WaitLevelBadge from './WaitLevelBadge.svelte';

	export let shop: Shop;
	export let onReport: (shop: Shop) => void = () => {};

	function formatRelativeTime(isoString: string | null): string {
		if (!isoString) return '';
		const diff = Date.now() - new Date(isoString).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'たった今';
		if (minutes < 60) return `${minutes}分前`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}時間前`;
		return `${Math.floor(hours / 24)}日前`;
	}

	function openInMaps(shop: Shop) {
		const url = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
		window.open(url, '_blank', 'noopener');
	}

	$: status = shop.status;
	$: reportedAt = status?.last_reported_at ? formatRelativeTime(status.last_reported_at) : '';
	$: confidenceLabel =
		status?.confidence != null
			? status.confidence >= 0.8
				? '高信頼'
				: status.confidence >= 0.5
					? '中信頼'
					: '低信頼'
			: '';
</script>

<div class="shop-card">
	<div class="card-header">
		<h3 class="shop-name">{shop.name}</h3>
	</div>

	<div class="status-row">
		<WaitLevelBadge level={status?.current_wait_level} label={status?.wait_level_label} />
		{#if status && status.report_count > 0}
			<span class="meta-info">
				{status.report_count}件
				{#if confidenceLabel}&nbsp;・&nbsp;{confidenceLabel}{/if}
			</span>
		{/if}
	</div>

	{#if shop.business_hours}
		<p class="detail-text">{shop.business_hours}</p>
	{/if}
	{#if shop.closed_days}
		<p class="detail-text closed">定休: {shop.closed_days}</p>
	{/if}
	{#if reportedAt}
		<p class="detail-text muted">最終更新: {reportedAt}</p>
	{/if}

	<div class="card-actions">
		<button class="btn btn-primary" on:click={() => onReport(shop)}>並びを報告する</button>
		<div class="secondary-actions">
			<button class="btn btn-secondary" on:click={() => openInMaps(shop)}>地図で開く</button>
			<a class="btn btn-secondary" href="/shops/{shop.id}">詳細</a>
		</div>
	</div>
</div>

<style>
	.shop-card {
		min-width: 280px;
		max-width: 320px;
		font-family: sans-serif;
	}

	.card-header {
		margin-bottom: 8px;
	}

	.shop-name {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0;
		line-height: 1.4;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.meta-info {
		font-size: 11px;
		color: var(--color-muted, #6b7280);
	}

	.detail-text {
		font-size: 12px;
		color: var(--color-text, #1f2937);
		margin: 0 0 4px;
		line-height: 1.4;
	}

	.detail-text.closed {
		color: var(--color-muted, #6b7280);
	}

	.detail-text.muted {
		color: var(--color-muted, #6b7280);
		font-size: 11px;
	}

	.card-actions {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.secondary-actions {
		display: flex;
		gap: 6px;
	}

	.btn {
		min-height: 36px;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		border: none;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.15s;
	}

	.btn:hover {
		opacity: 0.85;
	}

	.btn-primary {
		background: var(--color-primary, #dc2626);
		color: #fff;
		width: 100%;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: var(--color-text, #1f2937);
		flex: 1;
	}
</style>
