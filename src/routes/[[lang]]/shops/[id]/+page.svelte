<script lang="ts">
	import type { PageData } from './$types';
	import WaitLevelBadge from '$lib/components/WaitLevelBadge.svelte';
	import AdBanner from '$lib/components/AdBanner.svelte';
	import { WAIT_LEVEL_LABELS } from '$lib/wait-level.js';
	import { buildRestaurantJsonLd } from '$lib/seo.js';
	import { buildTabelogUrl } from '$lib/affiliate.js';
	import { t } from '$lib/i18n.js';
	import { favorites } from '$lib/favorites.js';
	import type { Report } from '$lib/types.js';

	export let data: PageData;

	$: lang = data.lang;
	$: tr = t[lang];
	$: shop = data.shop;
	$: recentReports = (data.recentReports as Report[]) ?? [];

	function formatRelativeTime(isoString: string | null): string {
		if (!isoString) return '';
		const diff = Date.now() - new Date(isoString).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return tr.shopDetail.justNow;
		if (minutes < 60) return `${minutes}${tr.shopDetail.minutesAgo}`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}${tr.shopDetail.hoursAgo}`;
		return `${Math.floor(hours / 24)}${tr.shopDetail.daysAgo}`;
	}

	function openInMaps() {
		if (!shop) return;
		const url = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
		window.open(url, '_blank', 'noopener');
	}

	$: confidenceLabel =
		shop?.status?.confidence != null
			? shop.status.confidence >= 0.8
				? tr.shopDetail.highConf
				: shop.status.confidence >= 0.5
					? tr.shopDetail.midConf
					: tr.shopDetail.lowConf
			: '';

	$: tabelogUrl = shop ? buildTabelogUrl(shop.tabelog_url ?? null) : null;
	$: restaurantJsonLd = shop ? buildRestaurantJsonLd(shop) : null;
	$: backHref = lang === 'en' ? '/en/shops' : '/shops';
</script>

<svelte:head>
	{#if shop}
		{#if lang === 'en'}
			<title>{shop.name} — Hours & Status | Jiro Map</title>
			<meta name="description" content="{shop.name} — Tokyo ramen in Japan. Check if it's open now, view hours, address, and get directions to this Ramen Jiro location." />
			<meta property="og:title" content="{shop.name} — Jiro Map" />
			<meta property="og:description" content="Check current status of {shop.name}" />
			<meta property="og:url" content="https://jiromap.pages.dev/en/shops/{shop.id}" />
		{:else}
			<title>{shop.name}の混雑状況・並び時間 | 二郎マップ</title>
			<meta name="description" content="{shop.name}（{shop.address}）のリアルタイム混雑状況・営業時間・アクセス情報。" />
			<meta property="og:title" content="{shop.name} — 二郎マップ" />
			<meta property="og:description" content="{shop.name}の今の混雑状況を確認" />
			<meta property="og:url" content="https://jiromap.pages.dev/shops/{shop.id}" />
		{/if}
		<meta property="og:type" content="restaurant" />
		<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
		<meta name="twitter:card" content="summary_large_image" />
		{#if restaurantJsonLd}
			{@html `<script type="application/ld+json">${restaurantJsonLd}</script>`}
		{/if}
	{:else}
		<title>{lang === 'en' ? 'Shop Detail — Jiro Map' : '店舗詳細 — 二郎マップ'}</title>
	{/if}
</svelte:head>

<div class="detail-page">
	{#if !shop}
		<div class="not-found">
			<p>{tr.shopDetail.notFound}</p>
			<a href={backHref} class="back-link">{tr.shopDetail.backToList}</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="page-header">
			<a href={backHref} class="back-btn" aria-label={tr.shopDetail.backToList}>{tr.shopDetail.back}</a>
			<h1 class="shop-title">{shop.name}</h1>
			<button
				class="fav-btn"
				class:favorited={$favorites.includes(shop.id)}
				on:click={() => favorites.toggle(shop.id)}
				aria-label={$favorites.includes(shop.id) ? tr.favorites.remove : tr.favorites.add}
			>
				{$favorites.includes(shop.id) ? '♥' : '♡'}
			</button>
		</div>

		<!-- Status card -->
		<section class="card status-card">
			<div class="status-row">
				<WaitLevelBadge
					level={shop.status?.current_wait_level}
					label={shop.status?.wait_level_label}
				/>
				{#if confidenceLabel}
					<span class="confidence-label">({confidenceLabel})</span>
				{/if}
			</div>
			{#if shop.status?.report_count}
				<p class="meta-text">{shop.status.report_count}{tr.shopDetail.reportsCount}</p>
			{/if}
			{#if shop.status?.last_reported_at}
				<p class="meta-text">{tr.shopDetail.lastUpdated} {formatRelativeTime(shop.status.last_reported_at)}</p>
			{/if}
		</section>

		<!-- Shop info -->
		<section class="card info-card">
			<dl class="info-list">
				{#if shop.address}
					<div class="info-row">
						<dt>{tr.shopDetail.address}</dt>
						<dd>{shop.address}</dd>
					</div>
				{/if}
				{#if shop.nearest_station}
					<div class="info-row">
						<dt>{tr.shopDetail.station}</dt>
						<dd>{shop.nearest_station}</dd>
					</div>
				{/if}
				{#if shop.business_hours}
					<div class="info-row">
						<dt>{tr.shopDetail.hours}</dt>
						<dd>{shop.business_hours}</dd>
					</div>
				{/if}
				{#if shop.closed_days}
					<div class="info-row">
						<dt>{tr.shopDetail.closedDays}</dt>
						<dd>{shop.closed_days}</dd>
					</div>
				{/if}
				<div class="info-row">
					<dt>{tr.shopDetail.category}</dt>
					<dd>{shop.category === 'jiro' ? tr.shopDetail.jiro : tr.shopDetail.inspire}</dd>
				</div>
			</dl>
		</section>

		<!-- Rules -->
		{#if shop.queue_notes || shop.topping_notes || shop.shop_notes}
			<section class="card rules-card">
				<h2 class="section-title">{tr.shopDetail.rules}</h2>
				<dl class="info-list">
					{#if shop.queue_notes}
						<div class="info-row">
							<dt>{tr.shopDetail.queue}</dt>
							<dd>{shop.queue_notes}</dd>
						</div>
					{/if}
					{#if shop.topping_notes}
						<div class="info-row">
							<dt>{tr.shopDetail.topping}</dt>
							<dd>{shop.topping_notes}</dd>
						</div>
					{/if}
					{#if shop.shop_notes}
						<div class="info-row">
							<dt>{tr.shopDetail.other}</dt>
							<dd>{shop.shop_notes}</dd>
						</div>
					{/if}
				</dl>
				<p class="rules-note">{tr.shopDetail.rulesNote}</p>
			</section>
		{/if}

		<!-- Recent reports -->
		{#if recentReports.length > 0}
			<section class="card">
				<h2 class="section-title">{tr.shopDetail.recentReports}</h2>
				<ul class="report-list">
					{#each recentReports as report}
						<li class="report-item">
							<span class="report-time">{formatRelativeTime(report.reported_at)}</span>
							<WaitLevelBadge
								level={report.wait_level}
								label={WAIT_LEVEL_LABELS[report.wait_level]}
							/>
							{#if report.comment}
								<p class="report-comment">{report.comment}</p>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Ad -->
		<div class="ad-wrap">
			<AdBanner size="rectangle" />
		</div>

		<!-- External links -->
		<section class="card links-card">
			{#if tabelogUrl}
				<a href={tabelogUrl} target="_blank" rel="noopener noreferrer sponsored" class="ext-link tabelog">
					{tr.shopDetail.tabelogLink} <span class="pr-label">PR</span>
				</a>
			{:else}
				<span class="ext-link tabelog ext-link--placeholder">{lang === 'en' ? 'Tabelog (PR)' : '食べログ（PR）'}</span>
			{/if}
			<button class="ext-link maps" on:click={openInMaps}>
				{tr.shopDetail.mapsLink}
			</button>
		</section>
	{/if}
</div>

<style>
	.detail-page {
		max-width: 640px;
		margin: 0 auto;
		padding-bottom: 32px;
	}

	.not-found {
		padding: 48px 16px;
		text-align: center;
		color: var(--color-muted, #6b7280);
	}

	.back-link {
		display: inline-block;
		margin-top: 12px;
		color: var(--color-primary, #dc2626);
		text-decoration: none;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.back-btn {
		font-size: 18px;
		text-decoration: none;
		color: var(--color-primary, #dc2626);
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.shop-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0;
		line-height: 1.3;
		flex: 1;
		min-width: 0;
	}

	.fav-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		min-height: 44px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 22px;
		color: #d1d5db;
		padding: 0;
		margin-left: auto;
		transition: color 0.15s, transform 0.1s;
	}

	.fav-btn:hover {
		color: #dc2626;
		transform: scale(1.15);
	}

	.fav-btn.favorited {
		color: #dc2626;
	}

	.card {
		margin: 12px 16px;
		padding: 14px;
		background: #fff;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 10px;
	}

	.status-card .status-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.confidence-label {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
	}

	.meta-text {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
		margin: 0 0 2px;
	}

	.info-list {
		margin: 0;
		padding: 0;
	}

	.info-row {
		display: flex;
		gap: 12px;
		padding: 6px 0;
		border-bottom: 1px solid #f3f4f6;
		font-size: 14px;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-row dt {
		flex-shrink: 0;
		width: 72px;
		color: var(--color-muted, #6b7280);
		font-weight: 500;
	}

	.info-row dd {
		margin: 0;
		color: var(--color-text, #1f2937);
		flex: 1;
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		margin: 0 0 10px;
	}

	.report-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.report-item {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 6px;
		padding: 8px 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.report-item:last-child {
		border-bottom: none;
	}

	.report-time {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
		flex-shrink: 0;
	}

	.report-comment {
		font-size: 13px;
		color: var(--color-text, #1f2937);
		margin: 0;
		width: 100%;
	}

	.ad-wrap {
		margin: 12px 16px;
	}

	.links-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ext-link {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
		transition: opacity 0.15s;
		width: 100%;
	}

	.ext-link:hover {
		opacity: 0.85;
	}

	.ext-link.tabelog {
		background: #f97316;
		color: #fff;
	}

	.ext-link.tabelog.ext-link--placeholder {
		opacity: 0.6;
		cursor: default;
	}

	.pr-label {
		font-size: 10px;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		padding: 1px 4px;
		margin-left: 6px;
		letter-spacing: 0.05em;
	}

	.ext-link.maps {
		background: #3b82f6;
		color: #fff;
	}

	.rules-note {
		font-size: 11px;
		color: var(--color-muted, #6b7280);
		margin: 8px 0 0;
	}

	@media (min-width: 768px) {
		.detail-page {
			padding-bottom: 48px;
		}
	}
</style>
