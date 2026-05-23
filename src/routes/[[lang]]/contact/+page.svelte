<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>Contact | Jiro Map</title>
		<meta name="description" content="Contact Jiro Map — for questions, bug reports, or shop information corrections." />
		<meta property="og:title" content="Contact | Jiro Map" />
		<meta property="og:description" content="Contact Jiro Map — for questions, bug reports, or shop information corrections." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/contact" />
	{:else}
		<title>お問い合わせ | 二郎マップ</title>
		<meta name="description" content="二郎マップへのお問い合わせ。ご質問・不具合・店舗情報の誤りはこちら。" />
		<meta property="og:title" content="お問い合わせ | 二郎マップ" />
		<meta property="og:description" content="二郎マップへのお問い合わせ。ご質問・不具合・店舗情報の誤りはこちら。" />
		<meta property="og:url" content="https://jiromap.pages.dev/contact" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="contact-page">
	<h1 class="page-title">Contact</h1>

	<section class="section">
		<p class="summary">For questions, bug reports, or corrections to shop information, feel free to reach out by email.</p>
	</section>

	<section class="section">
		<div class="contact-box">
			<p class="contact-label">Email</p>
			<a href="mailto:ckzc007@gmail.com" class="contact-email">ckzc007@gmail.com</a>
		</div>
		<p class="contact-note">※ Please note that response times may vary.</p>
	</section>

	<section class="section cta-section">
		<a href="/en" class="back-btn">← Back to Top</a>
	</section>
</div>
{:else}
<div class="contact-page">
	<h1 class="page-title">お問い合わせ</h1>

	<section class="section">
		<p class="summary">ご質問・不具合報告・店舗情報の誤りなど、お気軽にメールでご連絡ください。</p>
	</section>

	<section class="section">
		<div class="contact-box">
			<p class="contact-label">メールアドレス</p>
			<a href="mailto:ckzc007@gmail.com" class="contact-email">ckzc007@gmail.com</a>
		</div>
		<p class="contact-note">※ 返信までにお時間をいただく場合があります。</p>
	</section>

	<section class="section cta-section">
		<a href="/" class="back-btn">← トップページへ</a>
	</section>
</div>
{/if}

<style>
	.contact-page {
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

	.contact-box {
		background: #f9fafb;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		padding: 20px 24px;
		margin-bottom: 12px;
	}

	.contact-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 8px;
	}

	.contact-email {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-primary, #dc2626);
		text-decoration: none;
	}

	.contact-email:hover {
		text-decoration: underline;
	}

	.contact-note {
		font-size: 13px;
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
