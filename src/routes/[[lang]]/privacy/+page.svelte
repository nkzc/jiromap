<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lang = data.lang;
</script>

<svelte:head>
	{#if lang === 'en'}
		<title>Privacy Policy | Jiro Map</title>
		<meta name="description" content="Privacy Policy for Jiro Map. How we handle cookies, location data, and advertising." />
		<meta name="robots" content="index, follow" />
	{:else}
		<title>プライバシーポリシー | 二郎マップ</title>
		<meta name="description" content="二郎マップのプライバシーポリシー。Cookie・位置情報・広告の取り扱いについて説明します。" />
		<meta name="robots" content="index, follow" />
	{/if}
</svelte:head>

{#if lang === 'en'}
<div class="policy-page">
	<div class="policy-inner">
		<h1 class="policy-title">Privacy Policy</h1>
		<p class="policy-date">Last updated: May 2, 2026</p>

		<section class="policy-section">
			<h2>1. Introduction</h2>
			<p>
				Jiro Map (the "Service") respects your privacy and is committed to protecting your personal information.
				This policy explains what information the Service collects and how it is used.
			</p>
		</section>

		<section class="policy-section">
			<h2>2. Information We Collect</h2>

			<h3>2-1. Location Data</h3>
			<p>
				The Service may use your browser's Geolocation API to obtain your current location in order to show
				nearby Ramen Jiro shops. Location data is processed only in your browser and is never stored on our servers.
				Providing location data is optional; if you decline, shops will be shown based on central Tokyo.
			</p>

			<h3>2-2. Crowdsourced Status Reports (UGC)</h3>
			<p>
				When a user submits a crowd status report, only a SHA-256 hash of their IP address is stored on the server
				for spam prevention. Raw IP addresses are never stored.
				The content of submissions (crowd level, comments) is stored in our database.
			</p>

			<h3>2-3. Cookies and Local Storage</h3>
			<p>
				The Service uses cookies for the following purposes:
			</p>
			<ul>
				<li>Advertising delivery via Google AdSense (see "About Advertising" below)</li>
				<li>Session management to prevent duplicate submissions (valid for 30 minutes)</li>
				<li>Storing your language preference (valid for 1 year)</li>
			</ul>
		</section>

		<section class="policy-section">
			<h2>3. About Advertising (Google AdSense)</h2>
			<p>
				This Service uses Google AdSense, an advertising service provided by Google LLC.
				Google AdSense may use cookies to collect information about your past website visits in order to
				display ads based on your interests.
			</p>
			<p>
				If you do not wish to receive personalized ads, you can opt out via
				<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
					Google Ad Settings
				</a>.
				Alternatively, visit
				<a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
					aboutads.info
				</a>
				to disable interest-based advertising cookies from third-party vendors.
			</p>
			<p>
				For more information, please refer to the
				<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
					Google Privacy Policy
				</a>.
			</p>
		</section>

		<section class="policy-section">
			<h2>4. Analytics</h2>
			<p>
				We may introduce analytics tools in the future. If we do, this policy will be updated and users will be notified.
			</p>
		</section>

		<section class="policy-section">
			<h2>5. Sharing Information with Third Parties</h2>
			<p>
				We do not share collected information with third parties except as required by law or with the user's consent.
			</p>
		</section>

		<section class="policy-section">
			<h2>6. Changes to This Policy</h2>
			<p>
				This policy may be updated from time to time. For significant changes, we will notify users within the Service.
				Continued use of the Service after changes constitutes acceptance of the updated policy.
			</p>
		</section>

		<section class="policy-section">
			<h2>7. Contact</h2>
			<p>
				For inquiries regarding this policy, please contact us at:
			</p>
			<p>
				Email: <a href="mailto:ckzc007@gmail.com">ckzc007@gmail.com</a>
			</p>
		</section>
	</div>
</div>
{:else}
<div class="policy-page">
	<div class="policy-inner">
		<h1 class="policy-title">プライバシーポリシー</h1>
		<p class="policy-date">最終更新日: 2026年5月2日</p>

		<section class="policy-section">
			<h2>1. はじめに</h2>
			<p>
				二郎マップ（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
				本ポリシーは、本サービスが収集する情報およびその利用方法について説明します。
			</p>
		</section>

		<section class="policy-section">
			<h2>2. 収集する情報</h2>

			<h3>2-1. 位置情報</h3>
			<p>
				本サービスは、周辺のラーメン二郎の店舗を表示するためにブラウザの Geolocation API
				を使用して現在地を取得することがあります。
				位置情報はブラウザ上でのみ処理され、サーバーには保存されません。
				位置情報の提供は任意であり、拒否した場合は東京都心を基準に店舗を表示します。
			</p>

			<h3>2-2. 混雑情報の投稿（UGC）</h3>
			<p>
				ユーザーが混雑状況を投稿する際、スパム対策のため IP アドレスを
				SHA-256 アルゴリズムでハッシュ化した値のみをサーバーに保存します。
				生の IP アドレスは一切保存しません。
				投稿内容（混雑レベル・コメント）はデータベースに保存されます。
			</p>

			<h3>2-3. Cookie およびローカルストレージ</h3>
			<p>
				本サービスは以下の目的で Cookie を使用します：
			</p>
			<ul>
				<li>Google AdSense による広告配信（詳細は「広告について」の項をご覧ください）</li>
				<li>スパム投稿防止のためのセッション管理（有効期間: 30分）</li>
				<li>言語設定の保存（有効期間: 1年）</li>
			</ul>
		</section>

		<section class="policy-section">
			<h2>3. 広告について（Google AdSense）</h2>
			<p>
				本サービスでは、Google LLC が提供する広告配信サービス「Google AdSense」を利用しています。
				Google AdSense は、ユーザーの興味・関心に基づいた広告を表示するため、
				Cookie を使用してユーザーの過去のウェブサイト訪問情報を収集することがあります。
			</p>
			<p>
				広告 Cookie の使用を希望しない場合は、
				<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
					Google 広告設定
				</a>
				からオプトアウトできます。
				または
				<a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
					aboutads.info
				</a>
				にアクセスして、インタレストベース広告に使用されるサードパーティベンダーの Cookie を無効にできます。
			</p>
			<p>
				Google のプライバシーポリシーについては
				<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
					Google プライバシーポリシー
				</a>
				をご参照ください。
			</p>
		</section>

		<section class="policy-section">
			<h2>4. アクセス解析</h2>
			<p>
				本サービスは将来的にアクセス解析ツールを導入する可能性があります。
				その際は本ポリシーを更新し、ユーザーに通知します。
			</p>
		</section>

		<section class="policy-section">
			<h2>5. 第三者への情報提供</h2>
			<p>
				本サービスは、法令に基づく場合または利用者の同意がある場合を除き、
				収集した情報を第三者に提供することはありません。
			</p>
		</section>

		<section class="policy-section">
			<h2>6. ポリシーの変更</h2>
			<p>
				本ポリシーは必要に応じて変更されることがあります。
				重要な変更がある場合は、サービス内でお知らせします。
				変更後も本サービスを継続してご利用いただいた場合、変更後のポリシーに同意したものとみなします。
			</p>
		</section>

		<section class="policy-section">
			<h2>7. お問い合わせ</h2>
			<p>
				本ポリシーに関するお問い合わせは、以下の方法でご連絡ください。
			</p>
			<p>
				メール: <a href="mailto:ckzc007@gmail.com">ckzc007@gmail.com</a>
			</p>
		</section>
	</div>
</div>
{/if}

<style>
	.policy-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px 48px;
	}

	.policy-inner {
		line-height: 1.75;
		color: var(--color-text, #1f2937);
	}

	.policy-title {
		font-size: 22px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.policy-date {
		font-size: 13px;
		color: var(--color-muted, #6b7280);
		margin: 0 0 32px;
	}

	.policy-section {
		margin-bottom: 28px;
	}

	.policy-section h2 {
		font-size: 17px;
		font-weight: 700;
		margin: 0 0 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.policy-section h3 {
		font-size: 15px;
		font-weight: 600;
		margin: 12px 0 6px;
	}

	.policy-section p {
		font-size: 14px;
		margin: 0 0 10px;
	}

	.policy-section ul {
		font-size: 14px;
		padding-left: 20px;
		margin: 0 0 10px;
	}

	.policy-section li {
		margin-bottom: 4px;
	}

	.policy-section a {
		color: var(--color-primary, #dc2626);
		text-decoration: underline;
	}
</style>
