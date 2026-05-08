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
│   ├── hooks.server.ts             # バッチ集計ロジック（cron-worker.ts と共有）
│   │
│   ├── lib/
│   │   ├── types.ts                # 共有型定義（Shop, ShopStatus, Report）
│   │   ├── api.ts                  # フロントエンド向け API クライアント
│   │   ├── haversine.ts            # 距離計算（ハバーサイン公式）
│   │   ├── hash.ts                 # IP ハッシュ化（Web Crypto API）
│   │   ├── wait-level.ts           # 混雑レベルラベル定義
│   │   ├── colors.ts               # 混雑レベル色定義（0=緑〜4=赤〜null=灰）
│   │   ├── error.ts                # 統一エラーレスポンス生成
│   │   ├── seo.ts                  # JSON-LD 構造化データ生成
│   │   ├── affiliate.ts            # アフィリエイト URL ユーティリティ
│   │   ├── spam-check.ts           # スパムチェック（KV + D1 フォールバック）
│   │   ├── mock-data.ts            # 開発用モックデータ
│   │   │
│   │   └── components/
│   │       ├── Map.svelte          # Leaflet 地図（SSR 非対応, onMount で動的 import）
│       │                       #   props: userLat/userLng — 現在地ピン（青ドット）表示
│   │       ├── ShopCard.svelte     # 店舗カード（地図のポップアップ）
│   │       ├── ReportForm.svelte   # 混雑投稿フォーム
│   │       ├── WaitLevelBadge.svelte # 混雑レベルバッジ
│   │       ├── AdBanner.svelte     # 広告（dev=プレースホルダー, 本番=AdSense）
│   │       └── AdPlaceholder.svelte # 開発用広告プレースホルダー
│   │
│   └── routes/
│       ├── +layout.svelte          # グローバルナビ・AdSense スクリプト・canonical
│       ├── +page.svelte            # トップページ（地図 + 30秒ポーリング）
│       ├── shops/
│       │   ├── +page.svelte        # 店舗一覧（距離順・AdSense 5件ごと）
│       │   └── [id]/
│       │       ├── +page.svelte    # 店舗詳細（JSON-LD・投稿フォーム・外部リンク）
│       │       └── +page.ts        # SSR データ取得（shop + recentReports）
│       ├── privacy/+page.svelte    # プライバシーポリシー
│       ├── terms/+page.svelte      # 利用規約
│       ├── sitemap.xml/+server.ts  # 動的 sitemap 生成
│       ├── googled6c3660b134714e9.html/+server.ts  # Google Search Console 確認
│       └── api/
│           ├── health/+server.ts          # GET /api/health
│           ├── shops/+server.ts           # GET /api/shops
│           └── shops/[id]/
│               ├── +server.ts             # GET /api/shops/:id
│               ├── status/+server.ts      # GET /api/shops/:id/status
│               └── reports/+server.ts     # GET/POST /api/shops/:id/reports
│
├── migrations/
│   ├── 0001_initial.sql            # テーブル定義（4テーブル）
│   └── 0002_seed.sql               # 初期 8 店舗データ
│
├── tests/
│   ├── unit/                       # ユニットテスト（99 件・D1/KV はモック）
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
| POST | `/api/shops/:id/reports` | 混雑投稿（スパムチェック・KV Purge） |

---

## データフロー：混雑投稿から表示まで

```
[ユーザーが投稿]
    │ POST /api/shops/:id/reports
    ▼
[Workers API]
    1. IP ハッシュ化（SHA-256 + ソルト）
    2. セッション ID 取得（Cookie）
    3. KV スパムチェック × 2（セッション・IP）
       → 重複なら 429
    4. D1 に INSERT（crowd_reports）
    5. KV にスパムブロック書き込み（TTL 1800秒）
    6. KV のステータスキャッシュ削除（status:shop:{id}）
    7. 201 レスポンス（最新ステータスを即時返却）

[1 分後: Cron Worker が実行]
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
| null | 灰 `#9ca3af` | 情報なし |
