# agents/frontend.md

## あなたの役割
二郎マップのフロントエンド（SvelteKit + Svelte + TypeScript）を実装・修正する。

## 現在の画面構成

### メイン地図画面（/）
- Leaflet + OpenStreetMap で地図を表示
- 現在地: 青いドット（16px 円形）
- 店舗ピン: 赤（営業中）/ スレート（閉店・不明）— `isShopLikelyOpen()` で判定
- 検索範囲スライダー: 5〜50km、5km 刻み、デフォルト 20km（`src/lib/stores.ts` の `radiusKm`）
- 30秒ごとに位置情報を再取得してピンを更新（`pollTick()`）
- 現在地ボタン（右下）

### 店舗カード（ピンタップ後のパネル）
- 店舗名・営業時間・定休日
- WaitLevelBadge（集計済み混雑状態。投稿機能は廃止済み）
- 「ルートを見る」ボタン → Google Maps directions（transit モード）
- 「頼み方」ボタン → `/shops/{id}` 詳細ページへ（shop_rules データがない場合は disabled）

### 頼み方ガイド（/guide）
- AI生成の汎用二郎ルール説明（`src/lib/content/jiro-guide.ts`）
- 免責事項バナーを最上部に表示（黄色、AIによる参考情報の旨）

### 店舗一覧（/shops）
- 現在地から近い順にリスト表示
- ヘッダーに検索範囲（`{$radiusKm}km圏内`）を表示
- AdSense バナー（5件ごと・末尾）

### 店舗詳細（/shops/[id]）
- 基本情報・集計済み混雑状況・直近レポート一覧
- 「この店のルール」セクション（queue_notes/topping_notes/shop_notes が存在する場合のみ表示）
- 食べログアフィリエイトリンク・地図アプリで開くボタン

## 主要コンポーネント・ファイル
- `src/lib/components/Map.svelte` — Leaflet 地図
- `src/lib/components/ShopCard.svelte` — 店舗カード
- `src/lib/components/WaitLevelBadge.svelte` — 混雑状況バッジ
- `src/lib/shop-hours.ts` — `isShopLikelyOpen()` 営業中判定
- `src/lib/stores.ts` — `radiusKm` writable store
- `src/lib/content/jiro-guide.ts` — ガイドコンテンツ（月次更新）

## UI/UX 原則
- モバイルファースト（375px 幅基準）
- Leaflet は SSR 回避のため `onMount` 内で動的 import する
- `$: if (L && map)` リアクティブ文に依存変数を直接渡すこと（Svelte の依存追跡のため）
