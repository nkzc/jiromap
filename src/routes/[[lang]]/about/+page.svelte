<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>About Jiro Map | Jiro Map</title>
		<meta name="description" content="About Jiro Map — why it was built, what makes it different, and who it's for." />
		<meta property="og:title" content="About Jiro Map" />
		<meta property="og:description" content="About Jiro Map — why it was built, what makes it different, and who it's for." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/about" />
	{:else}
		<title>二郎マップについて | 二郎マップ</title>
		<meta name="description" content="二郎マップの制作背景と目的。直系店舗に特化した理由、リアルタイム営業確認の必要性など。" />
		<meta property="og:title" content="二郎マップについて" />
		<meta property="og:description" content="二郎マップの制作背景と目的。直系店舗に特化した理由、リアルタイム営業確認の必要性など。" />
		<meta property="og:url" content="https://jiromap.pages.dev/about" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="about-page">
	<h1 class="page-title">About Jiro Map</h1>

	<section class="section">
		<p class="summary">Jiro Map is a map service for finding direct-lineage Ramen Jiro shops near your current location.</p>
	</section>

	<section class="section">
		<h2 class="section-title">Why We Built This</h2>
		<ul class="reason-list">
			<li class="reason-item">
				<span class="reason-number">01</span>
				<div class="reason-body">
					<strong>Share Jiro culture with the world</strong>
					<p>We wanted to deliver accurate shop information and the unique culture of Ramen Jiro to people who have never visited — including those overseas.</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">02</span>
				<div class="reason-body">
					<strong>A map filtered to direct-lineage shops only</strong>
					<p>Tools like Google Maps mix in Jiro-inspired restaurants alongside the real thing. We needed a map that shows only the authentic, direct-lineage locations.</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">03</span>
				<div class="reason-body">
					<strong>Make the distinction clear for newcomers</strong>
					<p>The difference between direct-lineage Jiro and Jiro-inspired shops is confusing for first-timers and foreign visitors. This service makes that distinction immediately clear.</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">04</span>
				<div class="reason-body">
					<strong>Check real-time status before making the trip</strong>
					<p>Individual owner-operated shops often close without notice. We wanted a way to check whether a shop is actually open before traveling all the way there.</p>
				</div>
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">About Our Data</h2>
		<p class="data-note">Business hours and closed days listed on this service are based on publicly available information from each shop. As independently owned businesses, details can change without notice. Real-time crowd status is based on user-submitted reports and may not always be accurate. Please verify the latest information with each shop before visiting.</p>
	</section>

	<section class="section cta-section">
		<a href="/en" class="back-btn">← Back to Top</a>
	</section>
</div>
{:else}
<div class="about-page">
	<h1 class="page-title">二郎マップについて</h1>

	<section class="section">
		<p class="summary">二郎マップは、ラーメン二郎の直系店舗を現在地から探せる地図サービスです。</p>
	</section>

	<section class="section">
		<h2 class="section-title">制作背景</h2>
		<ul class="reason-list">
			<li class="reason-item">
				<span class="reason-number">01</span>
				<div class="reason-body">
					<strong>二郎文化を世界に届けたい</strong>
					<p>海外を含む二郎未経験者に、正確な店舗情報と二郎文化を届けたい。そんな思いからこのサービスを作りました。</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">02</span>
				<div class="reason-body">
					<strong>直系店舗だけに絞った地図が欲しかった</strong>
					<p>Google マップなどでは直系店舗と二郎系・インスパイア系が混在しています。本物の直系店だけを表示するツールが必要でした。</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">03</span>
				<div class="reason-body">
					<strong>初心者・外国人にわかりにくい区別を解消したい</strong>
					<p>直系とインスパイア系の違いは、初めて二郎に挑戦する人や外国人にはわかりにくいものです。このサービスでその違いをひと目で伝えます。</p>
				</div>
			</li>
			<li class="reason-item">
				<span class="reason-number">04</span>
				<div class="reason-body">
					<strong>突発的な臨時休業に対応したい</strong>
					<p>個人経営の店舗は予告なく休業することが少なくありません。わざわざ足を運ぶ前に営業状況をリアルタイムで確認できるようにしたいと考えました。</p>
				</div>
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">掲載データについて</h2>
		<p class="data-note">掲載している営業時間・定休日などの情報は、各店舗の公開情報をもとに作成しています。個人経営の店舗のため、予告なく変更されることがあります。リアルタイムの混雑状況はユーザーからの投稿をもとに集計しており、常に正確とは限りません。訪問前には各店舗の最新情報をご確認ください。</p>
	</section>

	<section class="section cta-section">
		<a href="/" class="back-btn">← トップページへ</a>
	</section>
</div>
{/if}

<style>
	.about-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 24px 16px 48px;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0 0 24px;
	}

	.section {
		margin-bottom: 32px;
	}

	.summary {
		font-size: 15px;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
		margin: 0;
		padding: 16px;
		background: #fef2f2;
		border-left: 4px solid #dc2626;
		border-radius: 0 6px 6px 0;
	}

	.section-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0 0 16px;
		padding-bottom: 8px;
		border-bottom: 2px solid #dc2626;
	}

	.reason-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.reason-item {
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}

	.reason-number {
		font-size: 13px;
		font-weight: 700;
		color: #dc2626;
		background: #fef2f2;
		border: 1.5px solid #fca5a5;
		border-radius: 6px;
		padding: 4px 8px;
		flex-shrink: 0;
		line-height: 1;
		margin-top: 2px;
	}

	.reason-body strong {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		margin-bottom: 6px;
	}

	.reason-body p {
		font-size: 14px;
		line-height: 1.8;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}

	.data-note {
		font-size: 14px;
		line-height: 1.8;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}

	.cta-section {
		margin-top: 8px;
	}

	.back-btn {
		display: inline-block;
		background: #dc2626;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		padding: 10px 20px;
		border-radius: 8px;
		text-decoration: none;
		transition: background 0.15s;
	}

	.back-btn:hover {
		background: #b91c1c;
	}
</style>
