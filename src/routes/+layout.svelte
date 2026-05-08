<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
</script>

<svelte:head>
	<meta name="robots" content="index, follow" />
	<meta name="google-site-verification" content="VpxkujgvrRn_CUaTzlRc1EFhzsUos8WG9Dvaw_QX0Cg" />
	<link rel="canonical" href="https://jiromap.pages.dev{$page.url.pathname}" />
	{#if !dev}
		<!-- AdSense: 本番のみ読み込み（審査通過後に publisher ID を差し替える） -->
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4102046917046088" crossorigin="anonymous"></script>
	{/if}
</svelte:head>

<div class="app-wrapper">
	<header class="app-header">
		<a href="/" class="brand">
			<span class="brand-icon">🍜</span>
			<span class="brand-name">二郎マップ</span>
		</a>
		<nav class="nav">
			<a href="/shops" class="nav-link">一覧</a>
		</nav>
	</header>

	<main class="app-main">
		<slot />
	</main>

	<footer class="app-footer">
		<nav class="footer-nav">
			<a href="/privacy" class="footer-link">プライバシーポリシー</a>
			<a href="/terms" class="footer-link">利用規約</a>
		</nav>
		<p class="footer-copy">&copy; 2026 二郎マップ</p>
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
