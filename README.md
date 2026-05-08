# 🍜 二郎マップ

現在地周辺の**二郎系ラーメン店**の並び・混雑状況をリアルタイムで確認できる Web サービス。

**🔗 本番サイト: https://jiromap.pages.dev**

---

## 画面イメージ

<!-- スクリーンショットを撮って以下に差し替えてください -->
<!-- ![トップページ](docs/images/screenshot-top.png) -->

| トップ（地図） | 店舗詳細 |
|---|---|
| 現在地周辺の店舗をピン表示 | 混雑状況・投稿フォーム |
| ピン色: 🟢 並びなし → 🔴 麺切れ | 営業時間・最寄駅情報 |

---

## 主な機能

- **現在地周辺の店舗を地図表示** — Geolocation API + Leaflet + OpenStreetMap
- **混雑レベルのリアルタイム表示** — 5段階（並びなし / 1〜5人 / 6〜10人 / 11人以上 / 麺切れ）
- **混雑情報の投稿** — 匿名投稿・スパム対策（セッション + IP 二重チェック）
- **30秒ポーリング** — 自動で最新状態に更新
- **店舗一覧・詳細ページ** — SEO 対応・構造化データ（JSON-LD）
- **AdSense 対応** — 本番環境でのみ広告を表示

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | [SvelteKit](https://kit.svelte.dev/) + TypeScript |
| ホスティング | [Cloudflare Pages](https://pages.cloudflare.com/) |
| データベース | [Cloudflare D1](https://developers.cloudflare.com/d1/)（SQLite） |
| キャッシュ | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| バッチ処理 | Cloudflare Workers（1分 Cron Trigger） |
| 地図 | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) |
| テスト | [Vitest](https://vitest.dev/) |

**月額コスト: $0**（すべて無料枠内で動作）

---

## システム構成

```
ブラウザ
  └── HTTPS ──► Cloudflare Pages (jiromap.pages.dev)
                  ├── 静的ファイル (HTML/CSS/JS)
                  └── SvelteKit Worker (API)
                        ├── Cloudflare D1  ← 永続データ
                        └── Cloudflare KV  ← キャッシュ (TTL 90秒)

Cloudflare Worker (jiromap-cron)
  └── cron: */1 * * * *  ← D1 集計 → KV 更新
```

詳細は [`docs/overview.md`](docs/overview.md) を参照。

---

## ローカル開発

### 必要なもの

- Node.js v22 以上
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)

### セットアップ

```bash
# 依存パッケージのインストール
npm install

# ローカル D1 にスキーマ・seed データを適用
npx wrangler d1 execute jiromap --local --file=migrations/0001_initial.sql
npx wrangler d1 execute jiromap --local --file=migrations/0002_seed.sql

# ローカル用環境変数を作成
cp .env.example .dev.vars
# .dev.vars を編集して IP_HASH_SALT を設定
```

### 起動

```bash
# UI 確認用（API なし・モックデータで動作）
npm run dev
# → http://localhost:5173

# フル統合確認（D1/KV も使える）
npm run build && npm run wrangler:dev
# → http://localhost:8787
```

---

## テスト

```bash
# ユニットテスト（D1/KV はモック）
npm run test:unit

# 統合テスト（本番 URL に実際に fetch）
npm run test:integration
```

---

## デプロイ

```bash
# Pages（フロントエンド + API）
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name jiromap --branch main

# Cron Worker（バッチ集計）
npm run deploy:cron
```

詳細は [`docs/deployment.md`](docs/deployment.md) を参照。

---

## ディレクトリ構成

```
├── src/
│   ├── lib/
│   │   ├── components/    # Svelte コンポーネント (Map, ShopCard, ReportForm ...)
│   │   ├── api.ts         # API クライアント
│   │   ├── haversine.ts   # 距離計算
│   │   └── spam-check.ts  # スパム対策
│   └── routes/
│       ├── api/           # バックエンド API エンドポイント
│       ├── shops/         # 店舗一覧・詳細ページ
│       ├── privacy/       # プライバシーポリシー
│       └── terms/         # 利用規約
├── migrations/            # D1 スキーマ・seed データ
├── tests/
│   ├── unit/              # ユニットテスト (99件)
│   └── integration/       # 統合テスト (18件)
├── cron-worker.ts         # バッチ集計 Worker
├── wrangler.toml          # Pages 設定
└── wrangler.cron.toml     # Cron Worker 設定
```

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [`docs/overview.md`](docs/overview.md) | システム全体図・データフロー |
| [`docs/architecture.md`](docs/architecture.md) | ディレクトリ構成・API 一覧 |
| [`docs/tech-stack.md`](docs/tech-stack.md) | 各技術の詳細と選定理由 |
| [`docs/deployment.md`](docs/deployment.md) | デプロイ・DB 操作手順 |
| [`docs/data_model.md`](docs/data_model.md) | DB テーブル定義・ER 図 |
| [`docs/api_spec.md`](docs/api_spec.md) | API リクエスト/レスポンス仕様 |

---

## ライセンス

MIT
