<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>First-Timer's Guide to Ramen Jiro | Jiro Map</title>
		<meta name="description" content="A complete guide for first-time Ramen Jiro visitors. How to queue, order, call your toppings, and what to expect." />
		<meta property="og:title" content="First-Timer's Guide to Ramen Jiro | Jiro Map" />
		<meta property="og:description" content="A complete guide for first-time Ramen Jiro visitors. How to queue, order, call your toppings, and what to expect." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/guide" />
	{:else}
		<title>初めての二郎ガイド | 二郎マップ</title>
		<meta name="description" content="初めてラーメン二郎に行く人向けのガイド。並び方・食券の買い方・コールの仕方・マナーをまとめました。" />
		<meta property="og:title" content="初めての二郎ガイド | 二郎マップ" />
		<meta property="og:description" content="初めてラーメン二郎に行く人向けのガイド。並び方・食券の買い方・コールの仕方・マナーをまとめました。" />
		<meta property="og:url" content="https://jiromap.pages.dev/guide" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="guide-page">
	<h1 class="page-title">First-Timer's Guide to Ramen Jiro</h1>

	<section class="section">
		<p class="lead">Ramen Jiro has its own ordering style and unwritten rules. Here's a walkthrough of the full experience — from lining up to leaving — so you can walk in with confidence.</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">1</span>Lining Up</h2>
		<p class="section-body">Expect a queue outside. Holding spots for others (having one person save multiple seats) is not allowed. Whether you buy your ticket before or after joining the line depends on the shop — follow the signs at the entrance or watch what other customers do. Wait for staff to guide you to a seat.</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">2</span>Buying Your Ticket</h2>
		<p class="section-body">Use the vending machine to choose your meal. The basics are "sho ramen" (small) and "dai ramen" (large), with options like extra pork or double pork. If it's your first time, start with the small.</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">3</span>How to Call (Order Toppings)</h2>
		<p class="section-body">Just before your noodles are ready, staff will ask: "Ninniku iremasuka?" ("Do you want garlic?"). At minimum, you need to answer yes or no for garlic. For yasai, abura, and karame, simply say nothing if you want the default amount — no call needed means no change.</p>
		<div class="example-box">
			<p class="example-label">Examples</p>
			<p class="example-text">"Ninniku ari, yasai mashi" (garlic yes, extra vegetables)</p>
			<p class="example-text">"Ninniku nashi" (no garlic)</p>
		</div>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">4</span>Eating Etiquette</h2>
		<p class="section-body">Finish everything in your bowl — leaving food is considered bad manners. When you're done, many shops expect you to place your bowl on the counter.</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">5</span>Tips for First-Timers</h2>
		<p class="section-body">Extra-large topping options (mashi and above) may not be available at every shop. Start with the default portions and work your way up on future visits. Research the shop before your first visit.</p>
	</section>

	<section class="section cta-section">
		<a href="/en" class="back-btn">← Back to Top</a>
	</section>
</div>
{:else}
<div class="guide-page">
	<h1 class="page-title">初めての二郎ガイド</h1>

	<section class="section">
		<p class="lead">ラーメン二郎は、独自の注文スタイルとルールがある特別なラーメンです。初めての人が戸惑わないよう、入店から退店までの流れをまとめました。</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">1</span>並び方</h2>
		<p class="section-body">店外に行列ができていることが多い。代表待ち（一人で複数人分の席を確保すること）はNG。食券を並ぶ前に買う店・並んだ後に買う店があるため、入口の案内や前の客の動きを参考にする。席は店員の案内に従う。</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">2</span>食券の買い方</h2>
		<p class="section-body">券売機で食べたいメニューを選ぶ。「小ラーメン」「大ラーメン」が基本で、豚入り・豚ダブルなどのオプションもある。初めての場合は小ラーメンから試すのがおすすめ。</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">3</span>コールの仕方</h2>
		<p class="section-body">麺が仕上がる直前に「ニンニク入れますか？」と声がかかる。ニンニクは入れるか入れないかを最低限伝える必要がある。ヤサイ・アブラ・カラメはコールしなければ増減なし。</p>
		<div class="example-box">
			<p class="example-label">例</p>
			<p class="example-text">「ニンニクあり、ヤサイマシで」</p>
			<p class="example-text">「ニンニクなしで」</p>
		</div>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">4</span>食べるときのマナー</h2>
		<p class="section-body">残さず食べきるのが基本。食べ終わったら丼をカウンターに上げる店が多い。</p>
	</section>

	<section class="guide-section">
		<h2 class="section-title"><span class="step-num">5</span>初心者へのひとことアドバイス</h2>
		<p class="section-body">マシ以上の増量は対応していない店もある。まずは普通の分量から試すのがおすすめ。初めて行く店舗は事前に調べておくこと。</p>
	</section>

	<section class="section cta-section">
		<a href="/" class="back-btn">← トップページへ</a>
	</section>
</div>
{/if}

<style>
	.guide-page {
		max-width: 720px;
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

	.lead {
		font-size: 15px;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.guide-section {
		margin-bottom: 28px;
		padding: 20px 24px;
		background: #f9fafb;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 10px;
	}

	.section-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0 0 10px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-primary, #dc2626);
		color: #fff;
		font-size: 14px;
		font-weight: 700;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.section-body {
		font-size: 14px;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.example-box {
		margin-top: 12px;
		padding: 12px 16px;
		background: #fff;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 6px;
	}

	.example-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 6px;
	}

	.example-text {
		font-size: 14px;
		color: var(--color-text, #1f2937);
		margin: 4px 0 0;
	}

	.example-text:first-of-type {
		margin-top: 0;
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
