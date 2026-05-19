# 技術スタック解説

## なぜこの構成か

「無料で動かし続ける」「サーバー管理不要」「AdSense 審査に通る品質」の 3 条件を満たすために選定。

---

## 各技術の役割と選定理由

### SvelteKit（TypeScript）

**役割**: フレームワーク全体。フロントエンド UI + API Routes を一体で管理する。

**なぜ SvelteKit か**
- Cloudflare Pages/Workers に公式アダプターがある（`@sveltejs/adapter-cloudflare`）
- React/Vue より軽量でビルド成果物が小さい → Workers の CPU 時間制限（10ms/req）に収まりやすい
- SSR（サーバーサイドレンダリング）が標準対応 → SEO・AdSense 審査に有利

**重要な制約**
- Cloudflare Workers ランタイムで動くため Node.js の API（`fs`, `path`, `crypto` モジュール等）は使えない
- ハッシュ計算などは Web Crypto API（`crypto.subtle`）を使う

---

### Cloudflare Pages

**役割**: フロントエンド（HTML/CSS/JS）と API（SvelteKit API Routes）のホスティング。

**なぜ Cloudflare Pages か**
- 無料枠が実質無制限（帯域制限なし・ビルド回数500/月）
- Cloudflare の CDN エッジで世界中に配信される → 日本ユーザーには東京リージョンから応答
- D1・KV との統合が最も簡単（同じ Cloudflare エコシステム）

**URL**
- 本番: `https://jiromap.pages.dev`
- デプロイごとにユニークなプレビュー URL も生成される（例: `https://abc123.jiromap.pages.dev`）

---

### Cloudflare Workers（jiromap-cron）

**役割**: 1 分ごとのバッチ集計専用の Worker。Pages とは別プロセスで動く。

**なぜ別 Worker か**
- Cloudflare Pages Functions は Cron Trigger（定期実行）をサポートしていないため
- Pages が HTTP リクエストを処理し、Worker が定期バッチを処理するという分担

**設定ファイル**: `wrangler.cron.toml`

---

### Cloudflare D1（SQLite）

**役割**: メインデータベース。店舗情報・混雑投稿・ステータスを永続保存。

**なぜ D1 か**
- Workers/Pages と同じ Cloudflare 内にあるため接続が高速・無料
- SQLite なので Window 関数・Partial Index など標準 SQL 機能が使える（Phase 0 で動作確認済み）
- 無料枠: 5GB ストレージ・5,000 万行読み取り/月

**テーブル構成**
| テーブル | 用途 |
|---------|------|
| `shops` | 店舗マスタ（48 店舗を seed 投入済み・直系二郎全国） |
| `crowd_reports` | ユーザーの混雑投稿（30 分で失効扱い） |
| `shop_statuses` | バッチ集計済みステータス（KV のフォールバック） |
| `spam_blocks` | 重複投稿ブロック記録 |

**リソース情報**
- データベース名: `jiromap`
- database_id: `5c2500bc-4980-4db5-ae3f-1f2d235f8627`

---

### Cloudflare KV

**役割**: 混雑ステータスのキャッシュ（TTL 90 秒）。

**なぜ KV か**
- D1 より読み取りレイテンシが低い（グローバルキャッシュ）
- 混雑ステータスは 1 分に 1 回しか更新されないのでキャッシュに最適
- 無料枠: 100,000 読み取り/日・1,000 書き込み/日

**KV に保存するキー**
| キー | 内容 | TTL |
|-----|------|-----|
| `status:shop:{id}` | 店舗の最新混雑ステータス（JSON） | 90 秒 |
| `spam:session:{uuid}:shop:{id}` | 重複投稿ブロック | 1800 秒 |
| `spam:ip:{hash}:shop:{id}` | IP ベースブロック | 1800 秒 |
| `ratelimit:*` | レート制限カウンター | 120 秒 |

**KV 差分チェック（重要）**
書き込みは変化があった場合のみ実行する。無料枠（1,000 write/日）の節約のため。

**リソース情報**
- Namespace ID: `6c77505c53334764b12aeb5bafa3d991`

---

### Leaflet + OpenStreetMap / Carto Voyager

**役割**: 地図表示とマーカー描画。

**なぜ Leaflet か**
- 完全無料（Google Maps は月 200 ドルの無料枠を超えると課金）
- OpenStreetMap・Carto Voyager のタイルも無料（属性表示が必要）
- SSR 非対応のため `onMount` 内で動的 import する実装パターンが必要

**タイル切り替え**
- 日本語（`lang === 'ja'`）: OpenStreetMap タイル（`tile.openstreetmap.org`）
- 英語（`lang === 'en'`）: Carto Voyager タイル（`basemaps.cartocdn.com`）— 英語ラベルで海外ユーザーに最適化

**注意点**
- Leaflet の CSS は CDN から読み込む（`app.html` の `<link rel="preload">`）
- Vite ビルド時にデフォルトアイコンのパスが壊れるため `Icon.Default.mergeOptions` で上書きが必要
- `app.html` に `basemaps.cartocdn.com` の `preconnect` / `dns-prefetch` を追加済み

---

### Vitest

**役割**: テストフレームワーク。

| 種類 | 場所 | 対象 |
|------|------|------|
| ユニットテスト | `tests/unit/` | D1・KV をモックして純粋な関数をテスト |
| 統合テスト | `tests/integration/` | 本番 URL に実際に HTTP fetch してテスト |

---

### Google AdSense

**役割**: 収益化。広告表示。

- Publisher ID: `ca-pub-4102046917046088`
- 本番環境のみスクリプトを読み込む（`dev` フラグで分岐）
- 広告スロット ID（`data-ad-slot`）は審査通過後に `AdBanner.svelte` に設定する
