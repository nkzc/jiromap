# CLAUDE.md — 二郎マップ

## サービス概要
ユーザーの現在地周辺にある二郎系ラーメン店を地図上に表示し、
各店舗の現在の並び・混雑状況をリアルタイムに確認できる Web サービス。
Google AdSense・アフィリエイトによる収益化が主目的。

**本番 URL**: `https://jiromap.pages.dev`

## 開発ドキュメント（必ず読むこと）
| ファイル | 内容 |
|---------|------|
| `docs/overview.md` | **最初に読む**。サービス全体図・データフロー・収益化 |
| `docs/architecture.md` | ディレクトリ構成・API 一覧・混雑レベル定義 |
| `docs/tech-stack.md` | 各技術の役割と選定理由・制約事項・リソース ID |
| `docs/deployment.md` | デプロイ手順・ローカル開発・D1 操作・テスト |
| `docs/data_model.md` | DB テーブル定義・ER 図・集計 SQL・セキュリティ方針 |
| `docs/api_spec.md` | エンドポイント仕様・レスポンス例・エラーコード |

## 技術スタック
| カテゴリ | 技術 |
|---------|------|
| フレームワーク | SvelteKit（TypeScript） |
| ホスティング | Cloudflare Pages（jiromap） |
| バッチ | Cloudflare Worker（jiromap-cron・1分ごと） |
| DB | Cloudflare D1（jiromap・ID: `5c2500bc-4980-4db5-ae3f-1f2d235f8627`） |
| キャッシュ | Cloudflare KV（JIROMAP_KV・ID: `6c77505c53334764b12aeb5bafa3d991`） |
| 地図 | Leaflet + OpenStreetMap |
| 広告 | Google AdSense（`ca-pub-4102046917046088`） |

## 開発環境ルール
- Node.js は `C:\nodejs22\node-v22.15.0-win-x64` の v22 を使う（システムの v14 では動かない）
  ```powershell
  $env:PATH = "C:\nodejs22\node-v22.15.0-win-x64;$env:PATH"
  ```
- パッケージ管理は npm を使用する
- **Node.js 固有 API は使わない**（Cloudflare Workers ランタイム制約）
  - ✅ `crypto.subtle`（Web Crypto API）
  - ❌ `require('crypto')`, `fs`, `path` 等
- ローカル開発は `npm run dev`（UI のみ）または `npm run wrangler:dev`（フル統合）
- KV コマンド: `wrangler kv namespace ...`（v4 以降は `:` なし）
- PowerShell スクリプトの実行確認ダイアログは自動で承認すること

## エージェント運用方針
- あなた（デフォルトセッション）がリーダーとして振る舞う
- **実際のファイル生成・編集はサブエージェント（Agent tool）に委譲する**
- リーダーは指示・統合・レビューのみ行い、自分ではファイルを書かない
- サブエージェントへの指示には必ず以下を読ませること：
  1. `docs/architecture.md`（構成把握）
  2. `docs/tech-stack.md`（制約把握）
  3. 修正対象に関連する `docs/` ファイル

## 修正・機能追加のサイクル

### 1機能・1修正あたりのサイクル
1. **implementer** が実装
2. **reviewer** がレビュー
   - LGTM → 3へ進む
   - NG → 指摘内容を添えて implementer に差し戻し → 1に戻る
3. **tester** がテスト実行
   - ユニットテスト: `npx vitest run tests/unit/`
   - ビルド確認: `npm run build`
   - 全件グリーン → デプロイへ
   - 失敗 → 失敗内容を添えて implementer に差し戻し → 1に戻る
4. リーダーが本番デプロイ（`docs/deployment.md` 参照）

### 差し戻し上限
差し戻しが 3 回を超えた場合はリーダーが問題をまとめて人間に報告し、判断を仰ぐ

## テスト方針
- カバレッジ基準: C2（条件網羅・ブランチカバレッジ）
- ユニットテスト: `npx vitest run tests/unit/ --coverage`
  - D1・KV・外部 API への依存はすべてモックに置き換える
- 統合テスト: `npm run test:integration`
  - 本番 URL（`https://jiromap.pages.dev`）に実際に fetch する
  - デプロイ後に実行する

## セキュリティ方針（変更禁止）
- 全 D1 クエリは **Prepared Statements**（`.prepare().bind()`）を使う
- 生 IP アドレスは保存しない（SHA-256 ハッシュ化後のみ保存）
- `IP_HASH_SALT` は環境変数から取得（ハードコード禁止）
- フロントエンドから D1 への直接アクセス経路を作らない

## デプロイコマンド（クイックリファレンス）
```powershell
# 通常の修正後デプロイ
npm run build
wrangler pages deploy .svelte-kit/cloudflare --project-name jiromap --branch main

# Cron Worker の変更後
npm run deploy:cron

# D1 にスキーマ変更を適用
wrangler d1 execute jiromap --remote --file=migrations/000X_xxxx.sql
```

## ディレクトリ構成
```
src/            # ソースコード（詳細は docs/architecture.md）
tests/
  unit/         # ユニットテスト（99 件）
  integration/  # 統合テスト（18 件）
migrations/     # D1 マイグレーションファイル
docs/           # ドキュメント
agents/         # サブエージェント指示書
cron-worker.ts  # Cron バッチ Worker
wrangler.toml   # Pages 設定
wrangler.cron.toml  # Cron Worker 設定
```

## Git .gitignore 対象
```
node_modules/
dist/
.svelte-kit/
.wrangler/
.dev.vars
.env
.env.local
.env.test
coverage/
.DS_Store
.idea/
.vscode/
*.swp
```
