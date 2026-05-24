<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>The History of Ramen Jiro | Jiro Map</title>
		<meta name="description" content="From its founding in 1968 to today — the history of Ramen Jiro, how its style took shape, and how it spread across Japan." />
		<meta property="og:title" content="The History of Ramen Jiro | Jiro Map" />
		<meta property="og:description" content="From its founding in 1968 to today — the history of Ramen Jiro, how its style took shape, and how it spread across Japan." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/history" />
	{:else}
		<title>ラーメン二郎の歴史 | 二郎マップ</title>
		<meta name="description" content="1968年の創業から現在まで。ラーメン二郎の歴史、スタイルの確立、直系店舗の広がりをまとめました。" />
		<meta property="og:title" content="ラーメン二郎の歴史 | 二郎マップ" />
		<meta property="og:description" content="1968年の創業から現在まで。ラーメン二郎の歴史、スタイルの確立、直系店舗の広がりをまとめました。" />
		<meta property="og:url" content="https://jiromap.pages.dev/history" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="history-page">
	<h1 class="page-title">The History of Ramen Jiro</h1>

	<section class="section">
		<p class="lead">Founded in Tokyo in 1968, Ramen Jiro has built a culture entirely its own over more than half a century.</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">The Beginning (1968)</h2>
		<p class="section-body">Ramen Jiro was founded in 1968 in Mita, Minato, Tokyo — a short walk from Keio University. From the start, it was built around serving generous portions at affordable prices to students. Founder Yamada Takumi's thick tonkotsu-soy broth and extra-thick noodles stood apart from every other ramen shop in the area.</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">A Style Takes Shape</h2>
		<p class="section-body">The Jiro style didn't arrive fully formed. Through years of trial and error, its defining elements — mounds of bean sprouts and cabbage, thick slabs of pork, back fat — gradually took shape. The "call" culture, where staff ask about toppings just before a bowl is served, emerged naturally from the rhythm of the kitchen and became one of Jiro's most recognizable customs.</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">Norenwake and the Birth of Direct-Lineage Shops</h2>
		<p class="section-body">As staff trained at the Mita main store and received the founder's blessing to open their own locations, the direct-lineage system was born. Each owner carries the Jiro style forward while bringing their own character to the shop. Today, there are around 50 direct-lineage locations across Japan.</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">Spreading Across Japan</h2>
		<p class="section-body">Direct-lineage shops have spread from the greater Tokyo area to locations as far as Hokkaido in the north and Fukuoka in the south. The Jiro style also inspired a broader genre of restaurants known as "Jiro-kei" — but only direct-lineage shops may carry the Ramen Jiro name.</p>
	</section>

	<section class="section cta-section">
		<a href="/en" class="back-btn">← Back to Top</a>
	</section>
</div>
{:else}
<div class="history-page">
	<h1 class="page-title">ラーメン二郎の歴史</h1>

	<section class="section">
		<p class="lead">1968年に東京・三田で生まれたラーメン二郎は、半世紀以上にわたって独自の文化を築いてきました。</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">創業（1968年）</h2>
		<p class="section-body">ラーメン二郎は1968年、東京都港区三田に創業しました。慶應義塾大学のそばという立地から、学生を主な客層として、ボリュームがあり手頃な価格のラーメンを提供することを目指しました。創業者・山田拓美氏が生み出した豚骨醤油ベースの濃厚スープと極太麺は、当初から周囲のラーメンとは一線を画すものでした。</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">スタイルの確立</h2>
		<p class="section-body">開店当初から現在の二郎スタイルが完成していたわけではありません。試行錯誤を重ねる中で、大量の野菜（モヤシ・キャベツ）、厚切りの豚肉、背脂といった特徴が徐々に形作られていきました。「ニンニク入れますか？」というコール文化も、客と店のやりとりの中で自然に生まれ、定着していったものです。</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">暖簾分けと直系店舗の誕生</h2>
		<p class="section-body">三田本店で修業を積んだ弟子たちが、山田氏の許可を得て独立開業するようになりました。これが「直系店舗」の始まりです。暖簾分けを受けた店主たちは、本店のスタイルを継承しながらも、それぞれの個性を加えた店作りをしています。現在、直系店舗は全国で約50店舗にのぼります。</p>
	</section>

	<section class="history-section">
		<h2 class="section-title">全国へ</h2>
		<p class="section-body">直系店舗は首都圏を中心に広がり、現在は北海道から福岡まで全国各地に存在します。それぞれの土地で愛されながら、二郎文化は今も受け継がれています。また、二郎にインスパイアされた「二郎系」と呼ばれるジャンルも全国に広がりましたが、「ラーメン二郎」の屋号を使えるのは直系店舗のみです。</p>
	</section>

	<section class="section cta-section">
		<a href="/" class="back-btn">← トップページへ</a>
	</section>
</div>
{/if}

<style>
	.history-page {
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

	.history-section {
		margin-bottom: 28px;
		padding: 20px 24px;
		background: #f9fafb;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 10px;
	}

	.section-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--color-primary, #dc2626);
		margin: 0 0 10px;
	}

	.section-body {
		font-size: 14px;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
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
