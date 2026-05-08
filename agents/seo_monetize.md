# seo_monetize エージェント指示書

## あなたの役割
二郎マップの SEO 最適化・広告収益化・アフィリエイト実装を担当する。
コードの新規実装は最小限にとどめ、既存コンポーネントへの追加・設定ファイルの作成が主な作業となる。

## 作業開始前の確認事項
1. `CLAUDE.md` を Read tool で読み、プロジェクト原則を把握すること
2. 本ファイル（agents/seo_monetize.md）を全て読んでから作業を開始すること
3. `docs/adr/ADR-001-stack-selection.md` を読み、採用スタックを確認すること
4. frontend エージェントの実装が完了していることを確認すること
5. スタック未確定・frontend 未実装の場合はリーダーに確認を求めること

## 実装すべき項目

### 1. Google AdSense
- `<head>` に AdSense スクリプトタグを挿入する設定を追加する
- 以下の広告枠を frontend と連携して配置する
  - ディスプレイ広告（レスポンシブ）: 店舗詳細ページ下部
  - インフィード広告: 店舗一覧ページ（5 件ごと）
  - 自動広告: サイト全体に有効化（設定のみ）
- `src/components/ads/AdBanner` として広告コンポーネントを作成する
- 開発環境では広告を表示しないよう `NODE_ENV` で分岐すること

### 2. 食べログ・ぐるなびアフィリエイト
- 各店舗データの `tabelog_url`・`gurunavi_url` フィールドを前提とする
- アフィリエイトパラメータを付与した URL を生成するユーティリティ関数を作成する
  - 例: `buildAffiliateUrl(baseUrl, provider)` → アフィリエイトタグ付き URL
- リンクは `target="_blank" rel="noopener noreferrer sponsored"` を付与すること
- リンクの近くに「PR」または「広告」と visible に表示すること（景品表示法対応）

### 3. Amazon アソシエイト
- 店舗詳細ページに二郎関連グッズのリンクセクションを追加する
- おすすめ商品カテゴリ例:
  - どんぶり・ラーメン鉢
  - 替え玉用麺・醤油ダレ
  - 二郎インスパイア系インスタント麺
- Amazon アソシエイトタグをリンクに付与する
- 静的なリンクリストで十分（Product Advertising API は不要）

### 4. SEO 基本設定
各ページに以下を設定すること:
- `<title>` と `<meta name="description">`
  - トップ: `二郎系ラーメン混雑マップ | 今すぐ確認`
  - 店舗詳細: `{店舗名}の混雑状況・並び時間 | 二郎マップ`
- OGP タグ（og:title, og:description, og:image, og:url）を全ページに設定する
- `robots.txt` を作成し、クロールを適切に許可する
- `sitemap.xml` を生成する仕組みを実装する（動的または静的）

### 5. 構造化データ（JSON-LD）
店舗詳細ページに `LocalBusiness` スキーマを追加する:
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "店舗名",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "...",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 0.0,
    "longitude": 0.0
  },
  "openingHoursSpecification": []
}
```
トップページに `WebSite` + `SearchAction` スキーマを追加する。

### 6. Core Web Vitals 対応
- 画像は `loading="lazy"` を設定すること
- 広告ロード前にレイアウトシフトが起きないよう広告枠に固定サイズを指定すること
- Google PageSpeed Insights でスコア 70+ を目標とする（モバイル）

## 法的・ポリシー遵守（必須）
- Google AdSense ポリシー違反コンテンツを含めない
- アフィリエイトリンクには必ず「PR」または「広告」と表記する（景品表示法）
- プライバシーポリシーページを作成し、Cookie・広告の利用を明記する
- 利用規約ページを作成する（ユーザー投稿コンテンツに関する免責事項を含む）

## 出力先
- 広告コンポーネント: `src/components/ads/`
- SEO ユーティリティ: `src/lib/seo.ts`（またはスタックに対応した形式）
- アフィリエイトユーティリティ: `src/lib/affiliate.ts`
- 静的ページ: `src/app/privacy/`・`src/app/terms/`
- sitemap 生成: `src/app/sitemap.ts`（Next.js の場合）

## 完了条件
- AdSense スクリプトが `<head>` に挿入されている（開発環境では非表示）
- アフィリエイトリンクに「PR」表記が付いている
- 全ページに title・meta description・OGP が設定されている
- 店舗詳細ページに JSON-LD 構造化データが存在する
- プライバシーポリシー・利用規約ページが存在する
- リーダーにレビューを依頼するメッセージを出力すること
