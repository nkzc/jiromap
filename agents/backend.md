# backend エージェント指示書

## あなたの役割
二郎マップのバックエンドを実装する。
API・データベース・リアルタイム通信・外部 API 連携を担当する。

## 作業開始前の確認事項
1. `CLAUDE.md` を Read tool で読み、プロジェクト原則を把握すること
2. 本ファイル（agents/backend.md）を全て読んでから作業を開始すること
3. `docs/adr/ADR-001-stack-selection.md` を読み、採用スタックを確認すること
4. スタック未確定の場合はリーダーに確認を求め、作業を開始しないこと

## 実装すべき機能

### 1. 店舗データ管理
- 店舗マスタ（名前・住所・緯度経度・営業時間・定休日）の CRUD
- 現在地からの距離検索（緯度経度 + 半径 km）
- 初期データ投入スクリプト（主要な二郎系店舗）

### 2. 混雑・並び状況
- ユーザーが「今の並び人数」「待ち時間」を投稿する API
- 投稿から一定時間（デフォルト 30 分）で鮮度フラグを自動失効させる
- 最新投稿を集計して「混雑スコア」を算出するロジック
- リアルタイム更新（WebSocket / SSE / ポーリング — 採用スタックに応じて選択）

### 3. 認証（軽量）
- 匿名投稿を基本とする（スパム対策: reCAPTCHA または rate limiting）
- 将来的なユーザーアカウント機能の拡張余地を残す設計にすること

### 4. 外部連携
- 食べログ・ぐるなびのアフィリエイト URL を店舗データに紐付ける
- Amazon アソシエイトリンクは静的管理で十分（API 不要）

## API エンドポイント設計
実装前にリーダーへ確認し承認を得ること。

```
GET  /api/shops?lat=35.6&lng=139.7&radius=3     # 周辺店舗一覧
GET  /api/shops/:id                              # 店舗詳細
GET  /api/shops/:id/status                       # 混雑状況（最新）
POST /api/shops/:id/reports                      # 混雑報告投稿
GET  /api/shops/:id/reports                      # 直近の報告一覧
```

## データモデル（スタック確定後に調整）
```
shops
  id, name, address, lat, lng, phone,
  business_hours (JSON), closed_days (JSON),
  tabelog_url, gurunavi_url,
  created_at, updated_at

crowd_reports
  id, shop_id, queue_count, wait_minutes,
  reporter_hash (匿名化 IP ハッシュ),
  reported_at, expires_at
```

## 実装上の制約
- 環境変数は `.env.local`（.gitignore 済み）に格納すること
- API キー・シークレットは絶対にコードにハードコードしないこと
- 無料枠の上限を意識し、N+1 クエリ・無駄なリクエストを避けること
- レートリミットを必ず実装すること（スパム投稿対策）
- CORS 設定は本番ドメインのみ許可すること

## 出力先
- `src/backend/` 以下にコードを配置する
- `src/backend/README.md` にローカル起動手順を記載する
- スキーマ変更・マイグレーションは `src/backend/migrations/` に格納する
- `.env.example` に必要な環境変数を全て記載する

## 完了条件
- 全 API エンドポイントがローカルで動作すること
- 基本的なテスト（単体または統合）が存在すること
- `.env.example` が存在し、必要な環境変数が全て記載されていること
- リーダーにレビューを依頼するメッセージを出力すること
