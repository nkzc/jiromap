<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>About Jiro Map | Jiro Map</title>
		<meta name="description" content="Your Tokyo ramen guide and Japan ramen map for Ramen Jiro. Discover 48 direct-lineage shops, check open/closed status, and plan your visit." />
		<meta property="og:title" content="About Jiro Map" />
		<meta property="og:description" content="Find Ramen Jiro locations nationwide. Check open/closed status in real time." />
		<meta property="og:url" content="https://jiromap.pages.dev/en/about" />
	{:else}
		<title>二郎マップについて | 二郎マップ</title>
		<meta name="description" content="二郎マップはラーメン二郎の全国直系店舗を地図で探せるサービスです。現在地から近い順に表示し、営業中かどうかをリアルタイムで確認できます。" />
		<meta property="og:title" content="二郎マップについて" />
		<meta property="og:description" content="ラーメン二郎の全国直系店舗を地図で探せるサービス。現在地周辺の営業中店舗を一目で確認できます。" />
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
		<h2 class="section-title">What is this service?</h2>
		<p>Jiro Map is a <strong>map service for finding direct-lineage Ramen Jiro shops near your current location</strong>. It was built to quickly answer: "Is there a Jiro near me?" and "Is it open today?"</p>
		<p>We cover 48 direct-lineage Jiro shops across Japan. Open/closed status is determined in real time based on each shop's business hours and displayed as pin colors on the map. A simple, easy-to-use tool for Jiro fans looking for their next bowl.</p>
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
	<h1 class="page-title">二郎マップについて</h1>

	<section class="section">
		<h2 class="section-title">このサービスとは</h2>
		<p>二郎マップは、<strong>ラーメン二郎の直系店舗を現在地から探せる地図サービス</strong>です。「今近くに二郎はあるか」「今日やってるか」を素早く確認することを目的に作られました。</p>
		<p>全国の直系店舗48店舗を掲載しており、各店舗の営業時間・定休日をもとにリアルタイムで営業中かどうかを判定してピンの色に反映しています。二郎ファンが次の一杯を探すための、シンプルで使いやすいツールです。</p>
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
					<p>営業中と思われる店舗は<strong>赤いピン</strong>で表示されます。閉店・定休日は<strong>グレーのピン</strong>、現在地は<strong>青いピン</strong>です。</p>
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

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0 0 24px;
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
