<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { dev } from '$app/environment';
	import { t } from '$lib/i18n.js';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	$: lang = data.lang;
	$: tr = t[lang];

	function switchLang() {
		const targetLang = lang === 'ja' ? 'en' : 'ja';
		// Set cookie for 1 year
		document.cookie = `lang=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;

		// Build target URL
		const currentPath = $page.url.pathname;
		let targetPath: string;
		if (targetLang === 'en') {
			// Switching to English: add /en prefix
			// Current path is like / or /about or /shops etc.
			targetPath = '/en' + (currentPath === '/' ? '' : currentPath);
		} else {
			// Switching to Japanese: remove /en prefix
			targetPath = currentPath.replace(/^\/en/, '') || '/';
		}
		goto(targetPath);
	}
</script>

<svelte:head>
	<meta name="robots" content="index, follow" />
	<meta name="google-site-verification" content="VpxkujgvrRn_CUaTzlRc1EFhzsUos8WG9Dvaw_QX0Cg" />
	<link rel="canonical" href="https://jiromap.pages.dev{$page.url.pathname}" />
	<link rel="alternate" hreflang="ja"
		href="https://jiromap.pages.dev{lang === 'en' ? ($page.url.pathname.replace(/^\/en/, '') || '/') : $page.url.pathname}" />
	<link rel="alternate" hreflang="en"
		href="https://jiromap.pages.dev{lang === 'en' ? $page.url.pathname : '/en' + ($page.url.pathname === '/' ? '' : $page.url.pathname)}" />
	<link rel="alternate" hreflang="x-default"
		href="https://jiromap.pages.dev{lang === 'en' ? ($page.url.pathname.replace(/^\/en/, '') || '/') : $page.url.pathname}" />
	{#if !dev}
		<!-- AdSense: 本番のみ読み込み -->
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4102046917046088" crossorigin="anonymous"></script>
	{/if}
</svelte:head>

<div class="app-wrapper">
	<header class="app-header">
		<a href={lang === 'en' ? '/en' : '/'} class="brand">
			<span class="brand-icon">🍜</span>
			<span class="brand-name">{tr.siteTitle}</span>
		</a>
		<nav class="nav">
			<a href={lang === 'en' ? '/en/map' : '/map'} class="nav-map-btn">
				{lang === 'en' ? 'Map' : '地図'}
			</a>
			<a href={lang === 'en' ? '/en/about' : '/about'} class="nav-link">{tr.nav.about}</a>
			<a href={lang === 'en' ? '/en/shops' : '/shops'} class="nav-link">{tr.nav.list}</a>
			<button class="lang-btn" on:click={switchLang} aria-label="Switch language">
				{lang === 'ja' ? 'EN' : '日本語'}
			</button>
		</nav>
	</header>

	<main class="app-main">
		<slot />
	</main>

	<footer class="app-footer">
		<nav class="footer-nav">
			<a href={lang === 'en' ? '/en/about' : '/about'} class="footer-link">{tr.footer.about}</a>
			<a href={lang === 'en' ? '/en/contact' : '/contact'} class="footer-link">{lang === 'en' ? 'Contact' : 'お問い合わせ'}</a>
			<a href={lang === 'en' ? '/en/glossary' : '/glossary'} class="footer-link">{lang === 'en' ? 'Glossary' : '用語集'}</a>
			<a href={lang === 'en' ? '/en/guide' : '/guide'} class="footer-link">{lang === 'en' ? 'Guide' : '初心者ガイド'}</a>
			<a href={lang === 'en' ? '/en/privacy' : '/privacy'} class="footer-link">{tr.footer.privacy}</a>
		</nav>
		<p class="footer-copy">&copy; 2026 {tr.siteTitle}</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		background: #fff;
		color: #1f2937;
	}

	:global(:root) {
		--color-primary: #dc2626;
		--color-bg: #fff;
		--color-text: #1f2937;
		--color-muted: #6b7280;
		--color-border: #e5e7eb;
		--header-height: 52px;
	}

	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		height: var(--header-height);
		background: var(--color-primary);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		position: sticky;
		top: 0;
		z-index: 1000;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 6px;
		text-decoration: none;
		color: #fff;
	}

	.brand-icon {
		font-size: 22px;
	}

	.brand-name {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.nav {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.nav-link {
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.nav-link:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.nav-map-btn {
		background: #fff;
		color: #dc2626;
		font-weight: 600;
		font-size: 13px;
		padding: 6px 14px;
		border-radius: 6px;
		text-decoration: none;
		border: 1.5px solid #fff;
	}

	.nav-map-btn:hover {
		background: #fef2f2;
	}

	.lang-btn {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.4);
		font-size: 13px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
	}

	.lang-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		color: #fff;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.app-footer {
		background: #f9fafb;
		border-top: 1px solid var(--color-border, #e5e7eb);
		padding: 12px 16px;
		text-align: center;
	}

	.footer-nav {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-bottom: 6px;
	}

	.footer-link {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
		text-decoration: none;
	}

	.footer-link:hover {
		text-decoration: underline;
	}

	.footer-copy {
		font-size: 11px;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}
</style>
