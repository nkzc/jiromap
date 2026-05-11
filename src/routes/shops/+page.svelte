<script lang="ts">
	import { onMount } from 'svelte';
	import WaitLevelBadge from '$lib/components/WaitLevelBadge.svelte';
	import AdBanner from '$lib/components/AdBanner.svelte';
	import { fetchNearbyShops } from '$lib/api.js';
	import { MOCK_SHOPS } from '$lib/mock-data.js';
	import { radiusKm } from '$lib/stores.js';
	import type { Shop } from '$lib/types.js';

	const TOKYO_CENTER = { lat: 35.6585, lng: 139.7454 };

	let shops: Shop[] = [];
	let loading = true;
	let error = '';

	function formatDistance(meters: number): string {
		if (meters < 1000) return `${meters}m`;
		return `${(meters / 1000).toFixed(1)}km`;
	}

	async function loadShops(lat: number, lng: number) {
		loading = true;
		error = '';
		try {
			shops = await fetchNearbyShops(lat, lng, $radiusKm * 1000);
		} catch {
			shops = MOCK_SHOPS;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(pos) => loadShops(pos.coords.latitude, pos.coords.longitude),
				() => loadShops(TOKYO_CENTER.lat, TOKYO_CENTER.lng),
				{ timeout: 10000 }
			);
		} else {
			loadShops(TOKYO_CENTER.lat, TOKYO_CENTER.lng);
		}
	});
</script>

<svelte:head>
	<title>二郎店舗一覧 | 二郎マップ</title>
	<meta name="description" content="現在地周辺のラーメン二郎の店舗を一覧で確認。近い順に表示。" />
	<meta property="og:title" content="二郎マップ — 現在地から二郎を探す" />
	<meta property="og:description" content="ラーメン二郎の店舗を地図で探せるサービス。" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://jiromap.pages.dev/shops" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="shops-page">
	<p class="page-intro">現在地周辺のラーメン二郎直系店舗を近い順に表示しています。赤いピンが営業中、グレーが閉店・定休日の目安です。</p>
	<div class="page-header">
		<h1 class="page-title">周辺の二郎</h1>
		<span class="radius-badge">{$radiusKm}km圏内</span>
		{#if !loading}
			<span class="shop-count">{shops.length}件</span>
		{/if}
	</div>

	{#if loading}
		<div class="loading">読み込み中...</div>
	{:else if shops.length === 0}
		<div class="empty">周辺に店舗が見つかりませんでした</div>
	{:else}
		<ul class="shop-list">
			{#each shops as shop, i}
				<li class="shop-item">
					<a href="/shops/{shop.id}" class="shop-link">
						<div class="shop-info">
							<div class="shop-name-row">
								<span class="shop-icon">📍</span>
								<span class="shop-name">{shop.name}</span>
								<span class="shop-distance">{formatDistance(shop.distance_m)}</span>
							</div>
							<div class="shop-status-row">
								<WaitLevelBadge
									level={shop.status?.current_wait_level}
									label={shop.status?.wait_level_label}
								/>
								<span class="shop-category">{shop.category === 'jiro' ? '二郎' : 'インスパイア'}</span>
							</div>
							{#if shop.business_hours}
								<p class="shop-hours">{shop.business_hours}</p>
							{/if}
						</div>
					</a>
				</li>

				<!-- Insert ad every 5 shops -->
				{#if (i + 1) % 5 === 0 && i < shops.length - 1}
					<li class="ad-item">
						<AdBanner size="banner" />
					</li>
				{/if}
			{/each}
		</ul>

		<!-- Bottom ad -->
		<div class="bottom-ad">
			<AdBanner size="rectangle" />
		</div>
	{/if}
</div>

<style>
	.shops-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 0 0 32px;
	}

	.page-intro {
		font-size: 13px;
		color: #6b7280;
		line-height: 1.7;
		margin: 0;
		padding: 10px 16px 0;
	}

	.page-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 16px 16px 8px;
	}

	.page-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.shop-count {
		font-size: 14px;
		color: var(--color-muted, #6b7280);
	}

	.radius-badge {
		font-size: 12px;
		color: #2563eb;
		background: #eff6ff;
		border-radius: 999px;
		padding: 2px 8px;
		white-space: nowrap;
	}

	.loading,
	.empty {
		padding: 32px 16px;
		text-align: center;
		color: var(--color-muted, #6b7280);
		font-size: 14px;
	}

	.shop-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.shop-item {
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.shop-link {
		display: block;
		padding: 14px 16px;
		text-decoration: none;
		color: inherit;
		transition: background 0.1s;
	}

	.shop-link:hover {
		background: #f9fafb;
	}

	.shop-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.shop-icon {
		font-size: 14px;
		flex-shrink: 0;
	}

	.shop-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.shop-distance {
		font-size: 13px;
		color: var(--color-muted, #6b7280);
		flex-shrink: 0;
	}

	.shop-status-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.shop-category {
		font-size: 11px;
		color: var(--color-muted, #6b7280);
	}

	.shop-hours {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}

	.ad-item {
		padding: 12px 16px;
	}

	.bottom-ad {
		padding: 12px 16px;
	}

	@media (min-width: 768px) {
		.shops-page {
			padding-bottom: 48px;
		}
	}
</style>
