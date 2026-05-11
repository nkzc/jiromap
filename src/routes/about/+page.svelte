<svelte:head>
	<title>二郎マップについて | 二郎マップ</title>
	<meta name="description" content="二郎マップはラーメン二郎の全国直系店舗を地図で探せるサービスです。現在地から近い順に表示し、営業中かどうかをリアルタイムで確認できます。" />
	<meta property="og:title" content="二郎マップについて" />
	<meta property="og:description" content="ラーメン二郎の全国直系店舗を地図で探せるサービス。現在地周辺の営業中店舗を一目で確認できます。" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://jiromap.pages.dev/about" />
	<meta property="og:image" content="https://jiromap.pages.dev/ogp.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

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

	.feature-list a {
		color: #dc2626;
		text-decoration: underline;
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

	.faq {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.faq-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	dt {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	dd {
		font-size: 13px;
		line-height: 1.7;
		color: var(--color-muted, #6b7280);
		margin: 0;
		padding-left: 12px;
		border-left: 3px solid #e5e7eb;
	}
</style>
