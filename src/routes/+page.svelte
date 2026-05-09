<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Map from '$lib/components/Map.svelte';
	import ShopCard from '$lib/components/ShopCard.svelte';
	import ReportForm from '$lib/components/ReportForm.svelte';
	import { fetchNearbyShops } from '$lib/api.js';
	import { MOCK_SHOPS } from '$lib/mock-data.js';
	import { radiusKm } from '$lib/stores.js';
	import { RADIUS_MIN_KM, RADIUS_MAX_KM, RADIUS_STEP_KM } from '$lib/config.js';
	import type { Shop } from '$lib/types.js';
	import { buildWebsiteJsonLd } from '$lib/seo.js';

	const websiteJsonLd = buildWebsiteJsonLd();

	const TOKYO_CENTER = { lat: 35.6585, lng: 139.7454 };
	const POLL_INTERVAL = 30000;

	let shops: Shop[] = [];
	let currentLat = TOKYO_CENTER.lat;
	let currentLng = TOKYO_CENTER.lng;
	let userLat: number | null = null;
	let userLng: number | null = null;
	let selectedShop: Shop | null = null;
	let showReport = false;
	let loading = false;
	let error = '';
	let pollTimer: ReturnType<typeof setInterval>;
	let radiusDebounceTimer: ReturnType<typeof setTimeout>;
	let mapComponent: Map;

	async function loadShops(lat: number, lng: number) {
		loading = true;
		error = '';
		try {
			shops = await fetchNearbyShops(lat, lng, $radiusKm * 1000);
		} catch {
			// API unavailable (e.g. Vite dev mode) – fall back to mock data
			shops = MOCK_SHOPS;
		} finally {
			loading = false;
		}
	}

	function handleShopClick(shop: Shop) {
		selectedShop = shop;
		showReport = false;
	}

	function handleReport(shop: Shop) {
		selectedShop = shop;
		showReport = true;
	}

	function handleReportSuccess() {
		// Reload shops after successful report
		loadShops(currentLat, currentLng);
	}

	function closePanel() {
		selectedShop = null;
		showReport = false;
	}

	function locateUser() {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					currentLat = pos.coords.latitude;
					currentLng = pos.coords.longitude;
					userLat = pos.coords.latitude;
					userLng = pos.coords.longitude;
					mapComponent?.panTo(currentLat, currentLng);
					loadShops(currentLat, currentLng);
				},
				() => {
					loadShops(TOKYO_CENTER.lat, TOKYO_CENTER.lng);
				},
				{ timeout: 10000 }
			);
		}
	}

	onMount(() => {
		// Initial load: try geolocation, fall back to Tokyo center
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					currentLat = pos.coords.latitude;
					currentLng = pos.coords.longitude;
					userLat = pos.coords.latitude;
					userLng = pos.coords.longitude;
					mapComponent?.panTo(currentLat, currentLng);
					loadShops(currentLat, currentLng);
				},
				() => {
					loadShops(TOKYO_CENTER.lat, TOKYO_CENTER.lng);
				},
				{ timeout: 10000 }
			);
		} else {
			loadShops(TOKYO_CENTER.lat, TOKYO_CENTER.lng);
		}

		// 30-second polling
		pollTimer = setInterval(() => loadShops(currentLat, currentLng), POLL_INTERVAL);
	});

	function onRadiusChange() {
		clearTimeout(radiusDebounceTimer);
		radiusDebounceTimer = setTimeout(() => {
			clearInterval(pollTimer);
			loadShops(currentLat, currentLng);
			pollTimer = setInterval(() => loadShops(currentLat, currentLng), POLL_INTERVAL);
		}, 300);
	}

	onDestroy(() => {
		clearInterval(pollTimer);
		clearTimeout(radiusDebounceTimer);
	});
</script>

<svelte:head>
	<title>二郎マップ — 周辺の二郎系ラーメン混雑状況をリアルタイム確認</title>
	<meta name="description" content="現在地周辺の二郎系・インスパイア系ラーメン店の並び・混雑状況をリアルタイムで確認。今すぐ食べに行けるか一目でわかる。" />
	<meta property="og:title" content="二郎マップ — 二郎系ラーメン混雑マップ" />
	<meta property="og:description" content="周辺の二郎系ラーメン店の今の混雑状況がわかるマップサービス" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://jiromap.pages.dev/" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
	{@html `<script type="application/ld+json">${websiteJsonLd}</script>`}
</svelte:head>

<div class="page">
	<div class="map-wrap">
		<Map
			bind:this={mapComponent}
			{shops}
			centerLat={currentLat}
			centerLng={currentLng}
			{userLat}
			{userLng}
			onShopClick={handleShopClick}
		/>

		<!-- Radius control -->
		<div class="radius-control">
			<input
				type="range"
				min={RADIUS_MIN_KM}
				max={RADIUS_MAX_KM}
				step={RADIUS_STEP_KM}
				bind:value={$radiusKm}
				on:input={onRadiusChange}
				class="radius-slider"
				aria-label="検索範囲"
			/>
			<span class="radius-value">{$radiusKm}km</span>
		</div>

		<!-- Locate button -->
		<button class="locate-btn" on:click={locateUser} aria-label="現在地に移動">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
			</svg>
		</button>

		{#if loading}
			<div class="loading-badge">読み込み中...</div>
		{/if}
	</div>

	<!-- Shop popup panel -->
	{#if selectedShop}
		<div class="side-panel">
			{#if showReport}
				<ReportForm
					shopId={selectedShop.id}
					shopName={selectedShop.name}
					onClose={closePanel}
					onSuccess={handleReportSuccess}
				/>
			{:else}
				<ShopCard
					shop={selectedShop}
					onReport={handleReport}
				/>
				<button class="panel-close" on:click={closePanel} aria-label="閉じる">&times;</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page {
		position: relative;
		height: calc(100vh - var(--header-height, 52px));
		display: flex;
		flex-direction: column;
	}

	.map-wrap {
		flex: 1;
		position: relative;
	}

	.locate-btn {
		position: absolute;
		bottom: 80px;
		right: 10px;
		z-index: 800;
		background: #fff;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #555;
		padding: 0;
		transition: background 0.15s;
	}

	.locate-btn:hover {
		background: #f4f4f4;
	}

	.loading-badge {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 800;
		background: rgba(0, 0, 0, 0.65);
		color: #fff;
		font-size: 12px;
		padding: 4px 12px;
		border-radius: 999px;
	}

	.side-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 900;
		background: var(--color-bg, #fff);
		border-top: 1px solid var(--color-border, #e5e7eb);
		border-radius: 16px 16px 0 0;
		padding: 16px;
		max-height: 60vh;
		overflow-y: auto;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
	}

	.panel-close {
		position: absolute;
		top: 12px;
		right: 12px;
		background: none;
		border: none;
		font-size: 22px;
		cursor: pointer;
		color: var(--color-muted, #6b7280);
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.side-panel {
			position: absolute;
			bottom: auto;
			top: 16px;
			left: 16px;
			right: auto;
			width: 340px;
			border-radius: 12px;
			border: 1px solid var(--color-border, #e5e7eb);
			max-height: calc(100% - 32px);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		}
	}

	.radius-control {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		width: 55%;
		z-index: 800;
		background: #fff;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		padding: 6px 10px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.radius-slider {
		flex: 1;
		accent-color: #2563eb;
		cursor: pointer;
		min-width: 0;
	}

	.radius-value {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
		white-space: nowrap;
		min-width: 36px;
		text-align: right;
		user-select: none;
	}
</style>
