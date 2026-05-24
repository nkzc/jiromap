# システム構成

## 全体像

```
ブラウザ
  │
  │ HTTPS
  ▼
Cloudflare Pages (jiromap.pages.dev)
  ├── 静的ファイル配信（HTML/CSS/JS/OGP画像）
  └── SvelteKit Worker（API Routes + SSR）
        │
        ├── Cloudflare D1 (jiromap)      ← 永続データ
        └── Cloudflare KV (JIROMAP_KV)   ← キャッシュ

Cloudflare Worker (jiromap-cron)         ← 1分バッチ
  └── cron: */1 * * * *
        ├── D1 から30分以内の投稿を集計
        ├── shop_statuses を upsert
        └── KV に結果をキャッシュ（差分チェックあり）
```

---

## ディレクトリ構成

```
jiro/
├── src/
│   ├── app.html                    # HTML テンプレート（Leaflet CSS, preconnect）
│   ├── app.d.ts                    # Cloudflare Platform 型定義
│   ├── hooks.server.ts             # SvelteKit handle hook（言語リダイレクト・transformPageChunk で <html lang> を動的置換）＋バッチ集計ロジック（cron-worker.ts と共有）
│   │
│   ├── lib/
│   │   ├── config.ts               # アプリ設定定数（RADIUS_MIN_KM=5, RADIUS_MAX_KM=50, RADIUS_STEP_KM=5, RADIUS_DEFAULT_KM=20 等）
│   │   ├── stores.ts               # Svelte writable store（radiusKm: 初期値 20）
│   │   ├── types.ts                # 共有型定義（Shop, ShopStatus, Report）
│   │   ├── api.ts                  # フロントエンド向け API クライアント
│   │   ├── haversine.ts            # 距離計算（ハバーサイン公式）
│   │   ├── hash.ts                 # IP ハッシュ化（Web Crypto API）
│   │   ├── wait-level.ts           # 混雑レベルラベル定義
│   │   ├── colors.ts               # 混雑レベル色定義（0=緑〜4=赤〜null=灰）
│   │   ├── shop-hours.ts           # 営業時間・定休日解析（isShopLikelyOpen）
│   │   ├── error.ts                # 統一エラーレスポンス生成
│   │   ├── seo.ts                  # JSON-LD 構造化データ生成
│   │   ├── affiliate.ts            # アフィリエイト URL ユーティリティ
│   │   ├── spam-check.ts           # スパムチェック（KV + D1 フォールバック）
│   │   ├── mock-data.ts            # 開発用モックデータ
│   │   │
│   │   ├── content/
│   │   │   └── jiro-guide.ts       # 頼み方ガイド本文（GuideSection[] + GUIDE_VERSION）
│   │   │
│   │   └── components/
│   │       ├── Map.svelte          # Leaflet 地図（SSR 非対応, onMount で動的 import）
│       │                       #   props: userLat/userLng — 現在地ピン（青ドット）表示
│       │                       #   props: onMapMove — moveend イベントで地図中心座標を通知
│       │                       #   props: lang — 'ja' のとき OpenStreetMap タイル、'en' のとき Carto Voyager タイルを使用
│   │       ├── ShopCard.svelte     # 店舗カード（地図のポップアップ）
│       │                       #   「ルートを見る」= Google Maps directions 外部リンク
│   │       ├── WaitLevelBadge.svelte # 混雑レベルバッジ
│   │       ├── AdBanner.svelte     # 広告（dev=プレースホルダー, 本番=AdSense）
│   │       └── AdPlaceholder.svelte # 開発用広告プレースホルダー
│   │
│   └── routes/
│       ├── +layout.svelte          # グローバルナビ（ヘッダーに「地図」/「Map」ボタンあり）・AdSense スクリプト・canonical（フッターに /about・/contact・/glossary・/guide・/history リンクあり）
│       ├── +page.svelte            # トップページ（ランディングページ: 二郎解説・ニンニク文化・機能説明・地図への CTA ボタン）
│       ├── map/
│       │   └── +page.svelte        # 地図ページ（地図 + 30秒ポーリング + 検索範囲スライダー + 地図中心モードトグル）
│       │                           # mapMode: 'gps' | 'map' — GPS モード/地図中心モードの切替
│       │                           # pollTick(): 30秒ごとに位置情報も更新（GPS モード時）
│       ├── shops/
│       │   ├── +page.svelte        # 店舗一覧（距離順・AdSense 5件ごと・現在の範囲km表示）
│       │   └── [id]/
│       │       ├── +page.svelte    # 店舗詳細（JSON-LD・外部リンク・「この店のルール」セクション）
│       │       └── +page.ts        # SSR データ取得（shop + recentReports）
│       ├── about/+page.svelte      # 制作背景ページ（4つの動機・トップページへ戻るボタン）
│       ├── contact/+page.svelte    # お問い合わせページ（メールアドレス掲載・日英両対応）
│       ├── glossary/+page.svelte   # 二郎用語集（13語・日英対応）
│       ├── guide/+page.svelte      # 初心者向けガイド（5セクション・免責事項付き・日英対応）
│       ├── history/+page.svelte    # ラーメン二郎の歴史（4セクション・日英対応）
│       ├── privacy/+page.svelte    # プライバシーポリシー
│       ├── terms/+page.svelte      # 利用規約
│       ├── sitemap.xml/+server.ts  # 動的 sitemap 生成（/map・/en/map・/about・/contact・/glossary・/guide・/history・/shops 等を含む）
│       ├── googled6c3660b134714e9.html/+server.ts  # Google Search Console 確認
│       └── api/
│           ├── health/+server.ts          # GET /api/health
│           ├── shops/+server.ts           # GET /api/shops
│           └── shops/[id]/
│               ├── +server.ts             # GET /api/shops/:id
│               ├── status/+server.ts      # GET /api/shops/:id/status
│               └── reports/+server.ts     # GET /api/shops/:id/reports（POST は削除済み）
│
├── migrations/
│   ├── 0001_initial.sql            # テーブル定義（4テーブル）
│   ├── 0002_seed.sql               # 初期 8 店舗データ
│   ├── 0003_shop_rules.sql         # shops テーブルにルール列追加（queue_notes, topping_notes, shop_notes）
│   ├── 0004_seed_shops.sql         # 直系二郎 48 店舗データ追加
│   └── 0005_update_shops.sql       # 営業時間・定休日の情報更新（jiro-matome.com をもとに）
│
├── tests/
│   ├── unit/                       # ユニットテスト（95 件・D1/KV はモック）
│   └── integration/                # 統合テスト（18 件・本番 URL に実際に fetch）
│
├── cron-worker.ts                  # Cron バッチ Worker 本体
├── wrangler.toml                   # Pages 設定（D1・KV バインディング）
├── wrangler.cron.toml              # Cron Worker 設定（triggers: */1 * * * *）
├── svelte.config.js                # SvelteKit + Cloudflare adapter 設定
└── docs/                           # このドキュメント群
```

---

## API エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/health` | D1・KV 稼働確認 |
| GET | `/api/shops?lat=&lng=&radius=` | 周辺店舗一覧（ハバーサイン距離計算・ステータス JOIN） |
| GET | `/api/shops/:id` | 店舗詳細 |
| GET | `/api/shops/:id/status` | 混雑ステータス（KV キャッシュ優先） |
| GET | `/api/shops/:id/reports` | 直近 30 分の投稿一覧 |

---

## データフロー：ステータス表示まで

> **注記**: `POST /api/shops/:id/reports`（混雑投稿）は削除済み。現在は読み取り専用フロー。

```
[Cron Worker が 1 分ごとに実行]
    1. crowd_reports の直近 30 分を Window 関数で集計
    2. shop_statuses を upsert
    3. KV に結果を書き込み（差分チェック: 変化なしはスキップ）

[ユーザーが 30 秒ポーリング]
    GET /api/shops/:id/status
    → KV ヒット → 即返却（低レイテンシ）
    → KV ミス → D1 shop_statuses から返却（フォールバック）
```

---

## 混雑レベル定義

| 値 | 色 | ラベル |
|---|---|------|
| 0 | 緑 `#22c55e` | 並びなし |
| 1 | 黄緑 `#84cc16` | 1〜5人 |
| 2 | 黄 `#eab308` | 6〜10人 |
| 3 | 橙 `#f97316` | 11人以上 |
| 4 | 赤 `#ef4444` | 麺切れ/臨時休業 |
| null | 灰 `#64748b` | 情報なし |
