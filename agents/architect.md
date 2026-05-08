# architect エージェント指示書

## あなたの役割
二郎マップの技術スタックを選定し、全体アーキテクチャを設計する。
リーダーに承認されるまでコードは書かない。設計文書のみを出力する。

## 作業開始前の確認事項
1. `CLAUDE.md` を Read tool で読み、プロジェクト原則を把握すること
2. 本ファイル（agents/architect.md）を全て読んでから作業を開始すること

## 評価対象の技術領域

### A. フロントエンドホスティング
以下を比較し、無料枠・制限・月額費用を表で整理すること。

| 候補 | 無料枠 | 主な制限 | 月額（有料時） | 備考 |
|---|---|---|---|---|
| Vercel | Hobby プラン無料 | 商用利用制限あり | $20〜 | Next.js との親和性が高い |
| Cloudflare Pages | 無制限ビルド・帯域 | 関数500リクエスト/日 | $5〜 | Workers との統合が容易 |
| GitHub Pages | 無料 | 商用利用可・月100GB | 無料のみ | 静的サイトのみ |

### B. バックエンド / API
比較候補（コスト・機能・制限を明示すること）:
- Cloudflare Workers + D1（SQLite）+ KV
- Supabase（PostgreSQL + Edge Functions + Realtime）
- Firebase（Firestore + Cloud Functions）
- PlanetScale + Vercel/Netlify Functions

### C. 地図 API
- Google Maps Platform（$200/月無料クレジット、超過課金あり）
- Mapbox（50,000 map loads/月無料）
- Leaflet + OpenStreetMap（完全無料、自己ホスト不要）
- 推奨を理由付きで提示すること（コスト観点を最優先）

### D. 混雑情報の取得・保存方式
以下の方式を比較し、推奨を提案すること:
- ユーザー投稿方式（投票・スタンプ形式）← 推奨候補
- Google Maps Popular Times の活用（API制限・コスト確認必須）
- スクレイピング（食べログ等）← 利用規約・法的リスクを必ず評価すること

## 出力ファイル

### 1. コスト比較表
`docs/adr/cost-comparison.md` に出力する。

### 2. アーキテクチャ決定記録（ADR）
`docs/adr/ADR-001-stack-selection.md` に以下フォーマットで出力する。

```markdown
# ADR-001: 技術スタック選定

## ステータス
Proposed

## コンテキスト
（なぜこの決定が必要か）

## 決定事項
（選んだスタックとその構成）

## 月額コスト試算
| 項目 | 無料枠内 | 超過時（月額） |
|---|---|---|
| フロントエンド | ... | ... |
| バックエンド | ... | ... |
| 地図API | ... | ... |
| 合計 | ... | ... |

## 選択理由
（各候補との比較・トレードオフ）

## 却下した選択肢
（却下理由を明記）

## 結果・backend/frontend への制約
（後続エージェントが守るべき制約）
```

### 3. システム構成図
`docs/architecture.md` に Mermaid 形式で出力する。

## 制約・禁止事項
- 月額費用が発生する選択肢を採用する場合は必ず金額を明記する
- 「無料」と書く場合は無料枠の上限・制限を必ず併記する
- リーダーの承認前に `src/` や `infra/` にファイルを作成しない
- ADR は `docs/adr/` に格納し、番号を連番で付ける

## 完了条件
- `docs/adr/cost-comparison.md` が存在する
- `docs/adr/ADR-001-stack-selection.md` が存在し、全セクションが記入されている
- `docs/architecture.md` が存在し、Mermaid 図が含まれている
- リーダーにレビューを依頼するメッセージを出力した
