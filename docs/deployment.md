# デプロイ手順

## 前提条件

```powershell
# Node.js v22 を PATH に追加（毎回ターミナルを開いたら実行）
$env:PATH = "C:\nodejs22\node-v22.15.0-win-x64;$env:PATH"
Set-Location "c:\Users\kn\Documents\jiro"
```

---

## 本番デプロイ（通常の修正時）

```powershell
# 1. ビルド
npm run build

# 2. Pages（フロントエンド + API）をデプロイ
wrangler pages deploy .svelte-kit/cloudflare --project-name jiromap --branch main
```

**デプロイ先**: `https://jiromap.pages.dev`

---

## Cron Worker のデプロイ（バッチ集計を変更した場合のみ）

```powershell
npm run deploy:cron
# = wrangler deploy --config wrangler.cron.toml
```

**対象ファイル**: `cron-worker.ts`（`wrangler.cron.toml` で設定）

---

## D1 操作

```powershell
# マイグレーション適用（本番）
wrangler d1 execute jiromap --remote --file=migrations/0001_initial.sql

# seed データ投入（本番・全マイグレーションを順番に適用）
wrangler d1 execute jiromap --remote --file=migrations/0002_seed.sql
wrangler d1 execute jiromap --remote --file=migrations/0003_shop_rules.sql
wrangler d1 execute jiromap --remote --file=migrations/0004_seed_shops.sql
wrangler d1 execute jiromap --remote --file=migrations/0005_update_shops.sql

# SQL を直接実行（確認用）
wrangler d1 execute jiromap --remote --command="SELECT id, name FROM shops"

# ローカル D1 に対して実行（--remote を外す）
wrangler d1 execute jiromap --local --command="SELECT * FROM shops"
```

---

## 環境変数・シークレット

```powershell
# シークレットの一覧確認
wrangler pages secret list --project-name jiromap

# シークレットの追加・更新
echo "新しい値" | wrangler pages secret put SECRET_NAME --project-name jiromap
```

現在設定済みのシークレット:
- `IP_HASH_SALT`: IP アドレスのハッシュ化ソルト（32文字ランダム文字列）

---

## ローカル開発

```powershell
# Vite dev サーバー（UI 確認用・API は使えない・モックデータで動作）
npm run dev
# → http://localhost:5173

# wrangler dev（フル統合確認・D1/KV も使える）
npm run build
npm run wrangler:dev
# → http://localhost:8787

# ローカル D1 にマイグレーション適用（wrangler dev 前に1回だけ実行）
wrangler d1 execute jiromap --local --file=migrations/0001_initial.sql
wrangler d1 execute jiromap --local --file=migrations/0002_seed.sql
wrangler d1 execute jiromap --local --file=migrations/0003_shop_rules.sql
wrangler d1 execute jiromap --local --file=migrations/0004_seed_shops.sql
wrangler d1 execute jiromap --local --file=migrations/0005_update_shops.sql
```

**`npm run dev` と `npm run wrangler:dev` の違い**

| | npm run dev | npm run wrangler:dev |
|-|------------|---------------------|
| 速度 | 速い（HMR あり） | 遅い（ビルドが必要） |
| API | 使えない（404） | 使える（D1/KV も） |
| 用途 | UI の見た目確認 | フル動作確認 |

`.dev.vars` ファイルにローカル用の環境変数を設定する（`.gitignore` 済み）:
```
IP_HASH_SALT=local-dev-salt-32chars-xxxxx
```

---

## テスト

```powershell
# ユニットテスト（D1/KV はモック・毎回実行してよい）
npm run test:unit
# または
npx vitest run tests/unit/ --coverage

# 統合テスト（本番 URL に実際に fetch・デプロイ後に実行）
npm run test:integration
# = npx vitest run --config vitest.integration.config.ts

# ステージング URL に向けて統合テスト
$env:INTEGRATION_BASE_URL="https://b999380e.jiromap.pages.dev"; npm run test:integration
```

---

## Cloudflare リソース一覧

| リソース | 名前 | ID |
|---------|------|-----|
| Pages プロジェクト | jiromap | — |
| D1 データベース | jiromap | `5c2500bc-4980-4db5-ae3f-1f2d235f8627` |
| KV Namespace | JIROMAP_KV | `6c77505c53334764b12aeb5bafa3d991` |
| Cron Worker | jiromap-cron | schedule: `*/1 * * * *` |

---

## 新しい店舗を追加する場合

```powershell
# SQL を直接実行して挿入
wrangler d1 execute jiromap --remote --command="
INSERT INTO shops (name, lat, lng, address, nearest_station, business_hours, closed_days, category)
VALUES ('店舗名', 緯度, 経度, '住所', '最寄駅情報', '営業時間', '定休日', 'jiro')
"
```

sitemap.xml は動的生成なので自動で反映される。

---

## AdSense 広告スロット ID の設定（審査通過後）

1. Google AdSense 管理画面で広告ユニットを作成
2. 発行された `data-ad-slot` の値（10桁の数字）をコピー
3. `src/lib/components/AdBanner.svelte` の `data-ad-slot="YYYYYYYYYY"` を差し替え
4. 本番デプロイ（`npm run build && wrangler pages deploy ...`）
