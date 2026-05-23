<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>Jiro Glossary | Jiro Map</title>
		<meta name="description" content="A glossary of Ramen Jiro terms. Learn what &quot;call,&quot; &quot;lot,&quot; &quot;Jiro-rian,&quot; and more mean before your first visit." />
		<meta property="og:title" content="Jiro Glossary | Jiro Map" />
		<meta property="og:description" content="A glossary of Ramen Jiro terms. Learn what &quot;call,&quot; &quot;lot,&quot; &quot;Jiro-rian,&quot; and more mean before your first visit." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/glossary" />
	{:else}
		<title>二郎用語集 | 二郎マップ</title>
		<meta name="description" content="ラーメン二郎の用語集。コール・ロット・ジロリアン・乳化など、初めての人が知っておきたい言葉をまとめました。" />
		<meta property="og:title" content="二郎用語集 | 二郎マップ" />
		<meta property="og:description" content="ラーメン二郎の用語集。コール・ロット・ジロリアン・乳化など、初めての人が知っておきたい言葉をまとめました。" />
		<meta property="og:url" content="https://jiromap.pages.dev/glossary" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="glossary-page">
	<h1 class="page-title">Jiro Glossary</h1>

	<section class="section">
		<p class="lead">Ramen Jiro has its own vocabulary that can be unfamiliar to first-time visitors. Knowing these terms before you go will make ordering much smoother.</p>
		<p class="note">※ The available toppings, terminology, and call options vary by shop. Some options may not be offered, and some shops have their own unique customs. Check the signs and notices inside the shop before ordering.</p>
	</section>

	<section class="section">
		<dl class="glossary-list">
			<div class="glossary-item">
				<dt class="term">Call (コール)</dt>
				<dd class="definition">The moment just before your noodles are ready when staff ask "Ninniku iremasuka?" ("Do you want garlic?"). This is when you state your topping preferences for garlic, vegetables, fat, and soy sauce.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Lot (ロット)</dt>
				<dd class="definition">A batch of noodles cooked together at the same time. Everyone in the same lot is served simultaneously, so it gives you a sense of when your bowl will arrive.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Jiro-rian (ジロリアン)</dt>
				<dd class="definition">A devoted fan of Ramen Jiro.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Buta (豚)</dt>
				<dd class="definition">The thick, chunky pork served at Jiro — closer to a slab than a typical chashu slice.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Yasai (ヤサイ)</dt>
				<dd class="definition">A mix of bean sprouts and cabbage, the standard vegetable topping at Jiro. Can be increased via the call.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Abura (アブラ)</dt>
				<dd class="definition">Back fat. Can be added or increased via the call.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Karame (カラメ)</dt>
				<dd class="definition">Extra soy sauce tare added to the soup, making it richer and saltier.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Mashi (マシ)</dt>
				<dd class="definition">An increase in a topping. "Yasai mashi" means extra vegetables. Some shops also offer "mashi mashi" for an even larger portion.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Zen-mashi (全マシ)</dt>
				<dd class="definition">Increasing all toppings — yasai, ninniku, abura, and karame — at once. Not available at all shops.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Nyuka (乳化)</dt>
				<dd class="definition">The emulsified state of the broth, where pork bone and fat are fully blended together. Gives the soup its characteristic cloudy white appearance. The degree of emulsification varies by shop.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Chokukei / Direct-lineage (直系)</dt>
				<dd class="definition">Shops run by owners who trained at the Mita main store and received official permission from the founder. Only these shops may use the "Ramen Jiro" name.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Norenwake (暖簾分け)</dt>
				<dd class="definition">The system by which a trained disciple receives the master's blessing to open their own shop. All direct-lineage locations were established through norenwake from the Mita main store.</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">Sho / Dai (小・大)</dt>
				<dd class="definition">Small and large portion sizes. Even the "small" at Jiro is generous compared to a typical bowl of ramen.</dd>
			</div>
		</dl>
	</section>

	<section class="section cta-section">
		<a href="/en" class="back-btn">← Back to Top</a>
	</section>
</div>
{:else}
<div class="glossary-page">
	<h1 class="page-title">二郎用語集</h1>

	<section class="section">
		<p class="lead">ラーメン二郎には、初めての人には聞き慣れない独自の用語が多くあります。来店前に知っておくと、注文がスムーズになります。</p>
		<p class="note">※ トッピングの種類・呼び方・コールで選べる内容は店によって異なります。扱っていないオプションや独自のコールが存在する場合があります。来店前に店内の案内や張り紙を確認してください。</p>
	</section>

	<section class="section">
		<dl class="glossary-list">
			<div class="glossary-item">
				<dt class="term">コール</dt>
				<dd class="definition">麺が仕上がる直前に店員から「ニンニク入れますか？」と声がかかる、トッピングの注文タイミング・内容のこと。このとき、ニンニク・ヤサイ・アブラ・カラメの希望を伝える。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">ロット</dt>
				<dd class="definition">一度にまとめて茹でる麺のひとまとまり。同じロットの客は同時に提供される。自分の順番がいつ来るかの目安になる。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">ジロリアン</dt>
				<dd class="definition">ラーメン二郎の熱狂的なファンの総称。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">豚</dt>
				<dd class="definition">二郎の大きなチャーシュー。通常のチャーシューより厚く、塊に近い形状で提供される。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">ヤサイ</dt>
				<dd class="definition">モヤシとキャベツを混ぜた二郎定番のトッピング。コールで増量できる。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">アブラ</dt>
				<dd class="definition">背脂のこと。コールで追加・増量できる。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">カラメ</dt>
				<dd class="definition">醤油ダレを追加すること。カラメにするとスープの味が濃くなる。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">マシ</dt>
				<dd class="definition">トッピングを増量すること。「ヤサイマシ」で野菜増量。さらに多い「マシマシ」に対応している店もある。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">全マシ</dt>
				<dd class="definition">ヤサイ・ニンニク・アブラ・カラメの全トッピングを増量すること。対応していない店もある。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">乳化</dt>
				<dd class="definition">スープの豚骨と脂が均一に混ざり合った状態。白濁した見た目が特徴で、店や仕込みによって乳化度が異なる。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">直系</dt>
				<dd class="definition">三田本店で修業し、創業者から正式に暖簾分けを受けた店舗。「ラーメン二郎」の屋号を名乗れるのは直系のみ。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">暖簾分け</dt>
				<dd class="definition">修業を積んだ弟子が師匠の許可を得て独立開業すること。直系店舗はすべて本店からの暖簾分けによって生まれた。</dd>
			</div>
			<div class="glossary-item">
				<dt class="term">小・大</dt>
				<dd class="definition">麺量の単位。二郎の「小」でも一般的なラーメンよりボリュームがある。</dd>
			</div>
		</dl>
	</section>

	<section class="section cta-section">
		<a href="/" class="back-btn">← トップページへ</a>
	</section>
</div>
{/if}

<style>
	.glossary-page {
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
		margin: 0 0 12px;
	}

	.note {
		font-size: 13px;
		line-height: 1.7;
		color: var(--color-text, #1f2937);
		margin: 0;
		padding: 12px 16px;
		background: #fffbeb;
		border-left: 4px solid #f59e0b;
		border-radius: 0 6px 6px 0;
	}

	.glossary-list {
		margin: 0;
		padding: 0;
	}

	.glossary-item {
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		padding: 16px 0;
	}

	.glossary-item:last-child {
		border-bottom: none;
	}

	.term {
		font-size: 15px;
		font-weight: 700;
		color: var(--color-primary, #dc2626);
		margin: 0 0 6px;
	}

	.definition {
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
