<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>Jiro Map | Find Ramen Jiro Near You</title>
		<meta name="description" content="Find Ramen Jiro locations near you on a map. Check open/closed status in real time across 48 direct-lineage shops in Japan." />
		<meta property="og:title" content="Jiro Map | Find Ramen Jiro Near You" />
		<meta property="og:url" content="https://jiromap.pages.dev/en" />
	{:else}
		<title>二郎マップ | ラーメン二郎を地図で探す</title>
		<meta name="description" content="現在地周辺のラーメン二郎の直系店舗を地図で探せます。営業中かどうかをリアルタイムで確認。二郎文化の解説も。" />
		<meta property="og:title" content="二郎マップ | ラーメン二郎を地図で探す" />
		<meta property="og:url" content="https://jiromap.pages.dev/" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if lang === 'en'}
<div class="about-page">
	<section class="hero">
		<h1>Find Ramen Jiro<br>Near You</h1>
		<p>Real-time open/closed status for all 48 direct-lineage Jiro shops across Japan — shown as pins on a map.</p>
		<a href={lang === 'en' ? '/en/map' : '/map'} class="cta-button">Open Map →</a>
	</section>

	<section class="section">
		<h2 class="section-title">What is Ramen Jiro?</h2>
		<p>Ramen Jiro is a ramen chain founded in 1968 in Mita, Tokyo. Known for its thick tonkotsu-soy broth, extra-thick noodles, mountains of bean sprouts and cabbage, and large slabs of pork (called "buta"), it has built a cult following among fans known as "Jiro-rians".</p>
		<p>There are about 50 direct-lineage shops nationwide. Each is run by a master trained at the original shop, maintaining the Jiro style while adding their own character. The "call" culture — telling staff your preferences for vegetables, garlic, fat, and soy sauce — is unique to Jiro.</p>
		<figure class="jiro-photo">
			<img
				src="/jiro.jpg"
				alt="Ramen Jiro Mita main store - large bowl with all toppings maxed out"
				loading="lazy"
				class="jiro-img"
			/>
			<figcaption class="jiro-caption">A large bowl from the Mita main store &mdash; the original Ramen Jiro location &mdash; ordered &ldquo;zenmasimashi&rdquo; (all toppings maxed out): extra bean sprouts, garlic, back fat, and soy sauce. This is Jiro at its most iconic.</figcaption>
		</figure>
	</section>

	<section class="section">
		<h2 class="section-title">"Ninniku Iremasuka?" — Do You Want Garlic?</h2>
		<p>This phrase — heard in Ramen Jiro shops as the noodles finish cooking — has become one of the most iconic expressions in the Jiro world.</p>
		<p>Its origins were entirely practical. At Jiro, multiple bowls are cooked in batches, leaving no natural moment for staff to take topping preferences until the very last second. Before this custom took hold, first-time customers often didn't know when to speak up. Some would try to call out their preferences at the start, only to be told "I'll ask you later" — leaving them flustered before they'd even taken a bite.</p>
		<p>"Ninniku iremasuka?" was born to fix that confusion. By having staff ask the question at precisely the right moment, the exchange became smooth and predictable. Equally important: asking rather than assuming means customers who dislike garlic, or who have plans the next day, can simply say no without any awkwardness.</p>
		<p>The custom has since spread to branch shops across Japan, but how and when the question is asked — and what options are offered — varies by location. "Ninniku iremasuka?" is one expression of a broader conversation that has evolved over decades.</p>
	</section>

	<section class="section">
		<h2 class="section-title">Key Features</h2>
		<ul class="feature-list">
			<li>
				<span class="feature-icon">📍</span>
				<div>
					<strong>Find Jiro Near You</strong>
					<p>Uses GPS to get your current location and shows nearby direct-lineage shops as pins on a map. A <strong>blue semi-transparent circle</strong> shows the search radius around you. Adjust the range from 5–50km using the slider.</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🔴</span>
				<div>
					<strong>Pin Colors Show Status</strong>
					<p>Shops likely to be open show as <strong>red pins</strong>; closed or holiday shops show as <strong>grey pins</strong>. Your current location is shown as a <strong>blue pin</strong>.</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🗺</span>
				<div>
					<strong>Map Center Mode</strong>
					<p>Switch to "Map Center" mode to search based on wherever you scroll the map — great for planning trips or finding shops along a route. A <strong>green pin</strong> and green circle mark the search center.</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🧭</span>
				<div>
					<strong>Directions</strong>
					<p>Tap a pin to open the shop card, then tap "Open in Maps" to get directions from your current location via Google Maps.</p>
				</div>
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">How to Use</h2>
		<ol class="steps">
			<li><strong>Allow location access</strong> — When you open the page, your browser will ask for location permission. Allow it to automatically show nearby shops.</li>
			<li><strong>Check the red pins</strong> — Red pins indicate shops likely to be open. Grey pins are closed or on a regular holiday.</li>
			<li><strong>Adjust the radius</strong> — Use the slider at the bottom of the screen to change the search range from 5–50km. Default is 10km.</li>
			<li><strong>Tap a pin for details</strong> — The shop card shows hours, nearest station, and a button to open directions.</li>
		</ol>
	</section>

	<section class="section">
		<h2 class="section-title">About Listed Shops</h2>
		<p>We currently list <strong>48 direct-lineage Ramen Jiro locations</strong>, covering all of Japan from Hokkaido to Fukuoka. The shop list is updated as needed.</p>
		<p>Information (hours, closed days, address, etc.) is compiled from publicly available sources, but may change without notice due to individual shop circumstances. Please check each shop's official social media for the latest information before visiting.</p>
	</section>

	<section class="section">
		<h2 class="section-title">Disclaimer</h2>
		<p>While we strive to provide accurate information, we cannot guarantee the accuracy, completeness, or timeliness of any content on this service. We accept no responsibility for any loss or inconvenience resulting from reliance on information provided here.</p>
	</section>
</div>
{:else}
<div class="about-page">
	<section class="hero">
		<h1>現在地から<br>ラーメン二郎を探す</h1>
		<p>全国48店舗の直系二郎をリアルタイムで。営業中かどうかを地図上のピンで一目確認。</p>
		<a href={lang === 'en' ? '/en/map' : '/map'} class="cta-button">地図で探す →</a>
	</section>

	<section class="section">
		<h2 class="section-title">ラーメン二郎とは</h2>
		<p>ラーメン二郎は1968年に東京・三田で創業した、独自のスタイルを持つラーメンです。豚骨醤油ベースの濃厚なスープ、極太麺、大量の野菜（モヤシ・キャベツ）、大きな豚肉（通称「豚」）が特徴で、そのボリュームと個性的な味が熱狂的なファン「ジロリアン」を生み出しています。</p>
		<p>直系店舗は全国で約50店舗。本店から暖簾分けを受けた店主がそれぞれ運営しており、基本スタイルを継承しつつも店ごとに異なる個性を持ちます。注文時に野菜・ニンニク・背脂・醤油の量を伝える「コール」と呼ばれる文化も二郎ならではです。</p>
		<figure class="jiro-photo">
			<img
				src="/jiro.jpg"
				alt="ラーメン二郎 三田本店 大ラーメン 全マシマシ"
				loading="lazy"
				class="jiro-img"
			/>
			<figcaption class="jiro-caption">三田本店の大ラーメン、コール「全マシマシ」。ヤサイ・ニンニク・アブラ・カラメすべて増量した、二郎の真骨頂とも言える一杯。</figcaption>
		</figure>
	</section>

	<section class="section">
		<h2 class="section-title">「ニンニク入れますか？」とは</h2>
		<p>ラーメン二郎の店内で、麺が仕上がるころに店員から発せられるこの一言は、今や二郎文化の象徴となっています。もともとはごく実用的な理由から生まれました。二郎では一度に複数人分の麺をまとめて茹でるため、丼が完成する直前まで客に声をかけるタイミングがありません。この仕組みが広まる以前は、初めての客が「いつトッピングを伝えればいいのか」わからず、最初に声をかけて「後で聞くから」と言われ、萎縮したまま食べた——そんな経験をした人も少なくなかったといいます。</p>
		<p>「ニンニク入れますか？」という問いかけはその混乱を解消するために生まれ、やがて二郎ならではのコミュニケーションとして定着しました。デフォルトで入れるのではなく、あえて聞くことで、ニンニクが苦手な人や翌日に予定がある人も気軽に断ることができます。この小さな配慮が、独特の接客スタイルとして語られることもあります。</p>
		<p>この文化はその後、各地の暖簾分け店へと受け継がれていきましたが、聞き方・タイミング・確認する項目は店によって異なります。「ニンニク入れますか？」はあくまでも一例であり、二郎という文化が積み重ねてきた対話の形のひとつです。</p>
	</section>

	<section class="section">
		<h2 class="section-title">主な機能</h2>
		<ul class="feature-list">
			<li>
				<span class="feature-icon">📍</span>
				<div>
					<strong>現在地から二郎を検索</strong>
					<p>GPS で現在地を取得し、周辺の直系店舗を地図上にピン表示します。現在地を中心に<strong>青い半透明の円</strong>が表示され、検索範囲を示します。範囲は5〜50kmのスライダーで調整できます。</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🔴</span>
				<div>
					<strong>ピンの色でステータスがわかる</strong>
					<p>営業中と思われる店舗は<strong>赤いピン</strong>、閉店・定休日の店舗は<strong>グレーのピン</strong>で表示されます。自分の現在地は<strong>青いピン</strong>で表示されます。</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🗺</span>
				<div>
					<strong>地図中心モード</strong>
					<p>「地図中心」モードに切り替えると、地図をスクロールした先の場所を基準に店舗を検索できます。旅行先や移動中の立ち寄りスポット探しに便利です。地図中央に<strong>緑のピン</strong>と緑の半透明な円が表示され、検索の中心と範囲を示します。</p>
				</div>
			</li>
			<li>
				<span class="feature-icon">🧭</span>
				<div>
					<strong>ルート案内</strong>
					<p>ピンをタップして店舗カードを開き「ルートを見る」ボタンを押すと、Google マップで現在地からのルート（交通機関）を確認できます。</p>
				</div>
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">使い方</h2>
		<ol class="steps">
			<li><strong>位置情報を許可する</strong> — ページを開くとブラウザが現在地の取得許可を求めます。許可すると自動的に近くの店舗が表示されます。</li>
			<li><strong>赤いピンを確認する</strong> — 赤いピンが今営業中と思われる店舗です。グレーのピンは閉店・定休日の店舗です。</li>
			<li><strong>スライダーで範囲を調整する</strong> — 画面下部のスライダーで検索範囲を5〜50kmの間で変更できます。デフォルトは10kmです。</li>
			<li><strong>ピンをタップして詳細を見る</strong> — 店舗カードに営業時間・最寄駅・ルートボタンが表示されます。</li>
		</ol>
	</section>

	<section class="section">
		<h2 class="section-title">掲載店舗について</h2>
		<p>現在、<strong>ラーメン二郎の直系店舗48店舗</strong>を掲載しています。北海道から福岡まで全国をカバーしており、店舗数は随時更新しています。</p>
		<p>掲載情報（営業時間・定休日・住所など）は公開情報をもとに作成していますが、店舗の都合により予告なく変更される場合があります。訪問前には各店舗の公式 SNS 等で最新情報をご確認ください。</p>
	</section>

	<section class="section">
		<h2 class="section-title">免責事項</h2>
		<p>本サービスに掲載している情報は、可能な限り正確な情報を提供するよう努めていますが、その内容の正確性・完全性・最新性を保証するものではありません。掲載情報に基づいて訪問した結果生じた損害について、当サービスは一切の責任を負いません。</p>
	</section>
</div>
{/if}

<style>
	.about-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 24px 16px 48px;
	}

	.hero {
		text-align: center;
		padding: 48px 16px 40px;
		background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
		border-radius: 12px;
		margin-bottom: 32px;
	}

	.hero h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 12px;
		line-height: 1.3;
	}

	.hero p {
		font-size: 15px;
		color: #6b7280;
		margin: 0 0 24px;
	}

	.cta-button {
		display: inline-block;
		background: #dc2626;
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		padding: 14px 32px;
		border-radius: 8px;
		text-decoration: none;
	}

	.cta-button:hover {
		background: #b91c1c;
	}

	.section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0 0 12px;
		padding-bottom: 8px;
		border-bottom: 2px solid #dc2626;
	}

	p {
		font-size: 14px;
		line-height: 1.8;
		color: var(--color-text, #1f2937);
		margin: 0 0 10px;
	}

	.feature-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.feature-list li {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.feature-icon {
		font-size: 20px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.feature-list strong {
		display: block;
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.feature-list p {
		margin: 0;
		font-size: 13px;
		color: var(--color-muted, #6b7280);
	}

	.steps {
		margin: 0;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.steps li {
		font-size: 14px;
		line-height: 1.7;
		color: var(--color-text, #1f2937);
	}

	.jiro-photo {
		margin: 16px 0 0;
	}

	.jiro-img {
		width: 100%;
		border-radius: 8px;
		display: block;
	}

	.jiro-caption {
		font-size: 12px;
		line-height: 1.6;
		color: var(--color-muted, #6b7280);
		margin-top: 6px;
	}
</style>
