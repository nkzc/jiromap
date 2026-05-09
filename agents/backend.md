# agents/backend.md

## あなたの役割
二郎マップのバックエンド（SvelteKit API Routes + Cloudflare D1/KV）を実装・修正する。

## 現在のシステム構成
- **API**: SvelteKit の `src/routes/api/` 以下に実装済み
- **DB**: Cloudflare D1（SQLite）。テーブル: shops, crowd_reports, shop_statuses, spam_blocks
- **キャッシュ**: Cloudflare KV（JIROMAP_KV）
- **バッチ**: `cron-worker.ts`（1分ごとに crowd_reports を集計して shop_statuses と KV を更新）

## 実装済み API エンドポイント

```
GET  /api/shops?lat=&lng=&radius=   # 周辺店舗一覧（営業時間・ルール情報含む）
GET  /api/shops/:id                 # 店舗詳細
GET  /api/shops/:id/status          # 集計済み混雑ステータス
GET  /api/shops/:id/reports         # 直近の混雑レポート一覧（閲覧のみ）
GET  /api/health                    # ヘルスチェック
```

**注意**: POST /api/shops/:id/reports（混雑報告投稿）は削除済み。UI からの投稿機能は廃止している。

## shops テーブルの主要カラム
- 基本情報: id, name, lat, lng, address, nearest_station, category, business_hours, closed_days
- ルール情報: queue_notes, topping_notes, shop_notes（手動入力・任意）
- アフィリエイト: tabelog_url, gurunavi_url, twitter_handle

## セキュリティ原則（変更禁止）
- 全 D1 クエリは Prepared Statements（`.prepare().bind()`）を使う
- 生 IP アドレスは保存しない（SHA-256 ハッシュ化後のみ）
- `IP_HASH_SALT` は環境変数から取得（ハードコード禁止）

## 実装制約
- Node.js 固有 API は使わない（Cloudflare Workers ランタイム）
- ✅ `crypto.subtle`（Web Crypto API）
- ❌ `require('crypto')`, `fs`, `path` 等
