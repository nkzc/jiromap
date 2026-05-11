# 二郎マップ — API 仕様書

> 作成日: 2026-05-02
> 作成者: architect サブエージェント
> ステータス: Draft（リーダーレビュー待ち）

---

## 前提

- ホスティング: Cloudflare Workers（SvelteKit API Routes 経由、`@sveltejs/adapter-cloudflare` 使用）
- ベースURL: `https://jiromap.example.com/api`（仮。実際のドメインは未定）
- 認証: MVP は認証なし（匿名）
- レスポンス形式: `application/json`
- 文字コード: UTF-8
- 日時形式: ISO8601（例: `2026-05-02T12:00:00.000Z`）

---

## 1. エンドポイント一覧

| メソッド | パス | 説明 | 認証 | レート制限 |
|---|---|---|---|---|
| `GET` | `/api/health` | ヘルスチェック | 不要 | なし |
| `GET` | `/api/shops` | 周辺店舗一覧取得（緯度・経度・半径指定） | 不要 | 60 req/分（IP別） |
| `GET` | `/api/shops/:id` | 店舗詳細取得 | 不要 | 60 req/分（IP別） |
| `GET` | `/api/shops/:id/status` | 店舗の現在の混雑ステータス取得 | 不要 | 120 req/分（IP別） |
| `GET` | `/api/shops/:id/reports` | 店舗の直近投稿一覧取得 | 不要 | 60 req/分（IP別） |

> **注記**: `POST /api/shops/:id/reports`（混雑投稿）は削除済み。
> `ReportForm.svelte` コンポーネント・`api.ts` の `postReport()` とともに除去された。
> 混雑投稿機能を復活させる場合は `reports/+server.ts` に POST ハンドラを再実装すること。

---

## 2. 主要エンドポイントのリクエスト・レスポンス例

### 2-1. `GET /api/shops` — 周辺店舗一覧

現在地周辺の二郎系店舗を一覧で取得する。
半径内のすべての店舗と各店舗の最新混雑ステータスを同時に返す（N+1 クエリ回避のため JOIN で取得）。

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | バリデーション | 説明 |
|---|---|---|---|---|---|
| `lat` | `number` | 必須 | — | `-90.0` 〜 `90.0` | 中心点の緯度 |
| `lng` | `number` | 必須 | — | `-180.0` 〜 `180.0` | 中心点の経度 |
| `radius` | `number` | 任意 | `20000` | `100` 〜 `50000`（メートル） | 検索半径（m） |
| `category` | `string` | 任意 | — | `"jiro"` または `"inspired"` | カテゴリフィルタ |
| `limit` | `number` | 任意 | `50` | `1` 〜 `100` | 最大取得件数 |

#### リクエスト例

```
GET /api/shops?lat=35.6585&lng=139.7454&radius=3000&limit=20
```

#### レスポンス例（200 OK）

```json
{
  "shops": [
    {
      "id": 1,
      "name": "ラーメン二郎 三田本店",
      "lat": 35.6474,
      "lng": 139.7399,
      "address": "東京都港区三田2-16-4",
      "nearest_station": "都営三田線 三田駅 徒歩5分",
      "category": "jiro",
      "business_hours": "11:00-14:00, 17:00-20:00",
      "closed_days": "月曜日・祝日",
      "queue_notes": "食券制・券売機は入口右",
      "topping_notes": "ニンニク・ヤサイ・アブラ・カラメが選べます",
      "shop_notes": null,
      "distance_m": 1423,
      "status": {
        "current_wait_level": 2,
        "wait_level_label": "6〜10人",
        "report_count": 3,
        "confidence": 1.0,
        "last_reported_at": "2026-05-02T12:03:45.000Z",
        "aggregated_at": "2026-05-02T12:04:00.000Z"
      }
    },
    {
      "id": 7,
      "name": "ラーメン二郎 神田神保町店",
      "lat": 35.6965,
      "lng": 139.7573,
      "address": "東京都千代田区神田神保町2-10",
      "nearest_station": "都営新宿線 神保町駅 徒歩3分",
      "category": "jiro",
      "business_hours": "11:00-15:00",
      "closed_days": "日曜日・祝日",
      "queue_notes": null,
      "topping_notes": null,
      "shop_notes": null,
      "distance_m": 2187,
      "status": {
        "current_wait_level": null,
        "wait_level_label": "情報なし",
        "report_count": 0,
        "confidence": 0.0,
        "last_reported_at": null,
        "aggregated_at": null
      }
    }
  ],
  "meta": {
    "total": 2,
    "lat": 35.6585,
    "lng": 139.7454,
    "radius_m": 3000,
    "retrieved_at": "2026-05-02T12:04:10.123Z"
  }
}
```

#### wait_level の定義

| 値 | ラベル | 説明 |
|---|---|---|
| `0` | 並びなし | 今すぐ入れる可能性が高い |
| `1` | 1〜5人 | 少し並んでいる |
| `2` | 6〜10人 | それなりに並んでいる |
| `3` | 11人以上 | かなり混んでいる |
| `4` | 麺切れ/臨時休業 | 本日の営業終了または休業 |
| `null` | 情報なし | 直近30分以内の投稿なし |

#### エラーレスポンス例

```json
// 400 Bad Request（lat/lng 未指定）
{
  "error": {
    "code": "MISSING_REQUIRED_PARAMS",
    "message": "lat と lng は必須パラメータです",
    "status": 400
  }
}

// 400 Bad Request（範囲外の値）
{
  "error": {
    "code": "INVALID_PARAM_VALUE",
    "message": "radius は 100 以上 50000 以下で指定してください",
    "status": 400,
    "field": "radius"
  }
}

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエストが多すぎます。しばらくしてから再試行してください",
    "status": 429,
    "retry_after": 60
  }
}
```

---

### 2-2. `GET /api/shops/:id` — 店舗詳細

店舗の詳細情報を取得する。アフィリエイトリンク（食べログ・ぐるなび）も含む。

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `integer` | 必須 | 店舗ID |

#### リクエスト例

```
GET /api/shops/1
```

#### レスポンス例（200 OK）

```json
{
  "shop": {
    "id": 1,
    "name": "ラーメン二郎 三田本店",
    "lat": 35.6474,
    "lng": 139.7399,
    "address": "東京都港区三田2-16-4",
    "nearest_station": "都営三田線 三田駅 徒歩5分",
    "phone": null,
    "business_hours": "11:00-14:00, 17:00-20:00",
    "closed_days": "月曜日・祝日",
    "category": "jiro",
    "tabelog_url": "https://tabelog.com/tokyo/A1307/A130703/13004780/",
    "gurunavi_url": null,
    "twitter_handle": null,
    "queue_notes": "食券制・券売機は入口右",
    "topping_notes": "ニンニク・ヤサイ・アブラ・カラメが選べます",
    "shop_notes": null,
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z"
  }
}
```

#### エラーレスポンス例

```json
// 400 Bad Request（ID が整数でない）
{
  "error": {
    "code": "INVALID_SHOP_ID",
    "message": "店舗IDは整数で指定してください",
    "status": 400
  }
}

// 404 Not Found
{
  "error": {
    "code": "SHOP_NOT_FOUND",
    "message": "指定された店舗が見つかりません",
    "status": 404
  }
}
```

---

### 2-3. `GET /api/shops/:id/status` — 混雑ステータス

店舗の現在の混雑ステータスを取得する。
KV キャッシュ（TTL: 90秒）を優先し、キャッシュミス時は D1 から集計して返す。

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `integer` | 必須 | 店舗ID |

#### リクエスト例

```
GET /api/shops/1/status
```

#### レスポンス例（200 OK — キャッシュヒット時）

```json
{
  "shop_id": 1,
  "current_wait_level": 2,
  "wait_level_label": "6〜10人",
  "report_count": 3,
  "confidence": 1.0,
  "last_reported_at": "2026-05-02T12:03:45.000Z",
  "aggregated_at": "2026-05-02T12:04:00.000Z",
  "cache": {
    "hit": true,
    "expires_at": "2026-05-02T12:05:30.000Z"
  }
}
```

#### レスポンス例（200 OK — 情報なし）

```json
{
  "shop_id": 7,
  "current_wait_level": null,
  "wait_level_label": "情報なし",
  "report_count": 0,
  "confidence": 0.0,
  "last_reported_at": null,
  "aggregated_at": null,
  "cache": {
    "hit": false,
    "expires_at": null
  }
}
```

#### エラーレスポンス例

```json
// 404 Not Found
{
  "error": {
    "code": "SHOP_NOT_FOUND",
    "message": "指定された店舗が見つかりません",
    "status": 404
  }
}
```

---

### 2-4. `POST /api/shops/:id/reports` — 混雑投稿（削除済み）

> **このエンドポイントは削除済み**。`reports/+server.ts` の POST ハンドラ・`ReportForm.svelte`・`api.ts` の `postReport()` とともに除去された。
> 再実装の参考用として仕様を残す。

混雑・待ち状況をユーザーが投稿する（旧仕様）。
スパムチェック（セッション + IP ハッシュ）を通過した場合のみ D1 に保存される。

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `integer` | 必須 | 店舗ID |

#### リクエストボディ（`Content-Type: application/json`）

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `wait_level` | `integer` | 必須 | `0`, `1`, `2`, `3`, `4` のいずれか | 待ちレベル（下記定義参照） |
| `comment` | `string` | 任意 | 最大100文字。HTMLタグ不可 | 自由コメント |

#### リクエスト例

```json
POST /api/shops/1/reports
Content-Type: application/json

{
  "wait_level": 2,
  "comment": "12時台はやはり混んでいます。列が建物の角まで延びています。"
}
```

#### レスポンス例（201 Created）

```json
{
  "report": {
    "id": 1042,
    "shop_id": 1,
    "wait_level": 2,
    "wait_level_label": "6〜10人",
    "comment": "12時台はやはり混んでいます。列が建物の角まで延びています。",
    "created_at": "2026-05-02T12:05:22.000Z"
  },
  "status": {
    "current_wait_level": 2,
    "wait_level_label": "6〜10人",
    "report_count": 4,
    "confidence": 1.0,
    "last_reported_at": "2026-05-02T12:05:22.000Z",
    "aggregated_at": "2026-05-02T12:05:22.000Z"
  },
  "next_allowed_at": "2026-05-02T12:35:22.000Z"
}
```

**レスポンスフィールドの説明**

- `report`: 保存された投稿の内容
- `status`: 投稿後の最新ステータス（クライアントがこれを使って即時 UI 更新できる）
- `next_allowed_at`: 次回この店舗への投稿が可能になる日時（30分後）

#### エラーレスポンス例

```json
// 400 Bad Request（wait_level 不正）
{
  "error": {
    "code": "INVALID_WAIT_LEVEL",
    "message": "wait_level は 0〜4 の整数で指定してください",
    "status": 400,
    "field": "wait_level"
  }
}

// 400 Bad Request（comment 長すぎ）
{
  "error": {
    "code": "COMMENT_TOO_LONG",
    "message": "コメントは100文字以内で入力してください",
    "status": 400,
    "field": "comment"
  }
}

// 404 Not Found
{
  "error": {
    "code": "SHOP_NOT_FOUND",
    "message": "指定された店舗が見つかりません",
    "status": 404
  }
}

// 429 Too Many Requests（30分以内の重複投稿）
{
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "この店舗への投稿は30分以内に1回のみ可能です",
    "status": 429,
    "next_allowed_at": "2026-05-02T12:35:00.000Z",
    "retry_after": 1778
  }
}

// 429 Too Many Requests（レート制限超過）
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエストが多すぎます。しばらくしてから再試行してください",
    "status": 429,
    "retry_after": 60
  }
}
```

---

### 2-5. `GET /api/shops/:id/reports` — 直近の投稿一覧

店舗の直近30分以内の投稿を新しい順で取得する。

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `integer` | 必須 | 店舗ID |

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | バリデーション | 説明 |
|---|---|---|---|---|---|
| `limit` | `number` | 任意 | `20` | `1` 〜 `50` | 最大取得件数 |

#### リクエスト例

```
GET /api/shops/1/reports?limit=10
```

#### レスポンス例（200 OK）

```json
{
  "reports": [
    {
      "id": 1042,
      "shop_id": 1,
      "wait_level": 2,
      "wait_level_label": "6〜10人",
      "comment": "12時台はやはり混んでいます。列が建物の角まで延びています。",
      "created_at": "2026-05-02T12:05:22.000Z",
      "elapsed_minutes": 3
    },
    {
      "id": 1039,
      "shop_id": 1,
      "wait_level": 2,
      "wait_level_label": "6〜10人",
      "comment": null,
      "created_at": "2026-05-02T11:52:10.000Z",
      "elapsed_minutes": 16
    },
    {
      "id": 1035,
      "shop_id": 1,
      "wait_level": 1,
      "wait_level_label": "1〜5人",
      "comment": "開店直後は空いてました",
      "created_at": "2026-05-02T11:38:55.000Z",
      "elapsed_minutes": 29
    }
  ],
  "meta": {
    "shop_id": 1,
    "total": 3,
    "window_minutes": 30,
    "retrieved_at": "2026-05-02T12:08:15.000Z"
  }
}
```

---

### 2-6. `GET /api/health` — ヘルスチェック

サービスの稼働状態を確認する。監視ツール・ロードバランサー用。

#### リクエスト例

```
GET /api/health
```

#### レスポンス例（200 OK）

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-05-02T12:00:00.000Z",
  "services": {
    "d1": "ok",
    "kv": "ok"
  }
}
```

#### レスポンス例（503 Service Unavailable — D1 障害時）

```json
{
  "status": "degraded",
  "version": "1.0.0",
  "timestamp": "2026-05-02T12:00:00.000Z",
  "services": {
    "d1": "error",
    "kv": "ok"
  }
}
```

---

## 3. レート制限の方針

### 3-1. エンドポイントごとのレート制限値

| エンドポイント | 制限単位 | req/分 | req/時間 | 備考 |
|---|---|---|---|---|
| `GET /api/shops` | IP別 | 60 | 3,600 | 地図移動のたびに呼ばれることを想定 |
| `GET /api/shops/:id` | IP別 | 60 | 3,600 | — |
| `GET /api/shops/:id/status` | IP別 | 120 | 7,200 | 30秒ポーリング想定（2 req/分）× ユーザー数 |
| `GET /api/shops/:id/reports` | IP別 | 60 | 3,600 | — |
| `GET /api/health` | なし | 無制限 | 無制限 | 監視用 |

### 3-2. KV を使ったレート制限の実装方針

#### キー設計

```
# 一般レート制限（1分ウィンドウ）
ratelimit:{endpoint_key}:ip:{ip_hash}:{window_minute}

# 例: GET /api/shops のレート制限（2026-05-02 12:04 の1分間）
ratelimit:get_shops:ip:a3f9c1d2...:202605021204

# 投稿の重複防止（30分ウィンドウ）
spam:session:{session_id}:shop:{shop_id}
spam:ip:{ip_hash}:shop:{shop_id}
```

**window_minute の計算**

```javascript
// Workers 内での実装例
const now = new Date();
const windowMinute = `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}${String(now.getUTCHours()).padStart(2,'0')}${String(now.getUTCMinutes()).padStart(2,'0')}`;
const kvKey = `ratelimit:get_shops:ip:${ipHash}:${windowMinute}`;
```

#### TTL 設計

| キー | TTL | 理由 |
|---|---|---|
| `ratelimit:{key}:{window_minute}` | 120秒 | 1分ウィンドウ + 余裕60秒 |
| `spam:session:{id}:shop:{id}` | 1800秒（30分） | 投稿ブロック期間と一致 |
| `spam:ip:{hash}:shop:{id}` | 1800秒（30分） | 同上 |
| `status:shop:{id}` | 90秒 | バッチ実行間隔（60秒）+ 余裕30秒 |

#### 実装フロー

```
Workers での一般レート制限チェック:

1. ip_hash = SHA256(CF-Connecting-IP + IP_HASH_SALT)
2. key = `ratelimit:{endpoint_key}:ip:{ip_hash}:{window_minute}`
3. count = await KV.get(key)
4. if count == null:
       await KV.put(key, "1", { expirationTtl: 120 })
   else if parseInt(count) >= LIMIT:
       return 429 レスポンス（Retry-After ヘッダー付き）
   else:
       await KV.put(key, String(parseInt(count) + 1), { expirationTtl: 120 })
5. → 処理続行

注意: KV の書き込みは結果整合性のため、厳密に N req/分を保証するものではない。
      カウンターが一時的に制限値を超過する可能性があるが、スパム対策として実用的に機能する。
      厳密なレート制限が必要になった場合は Upstash Redis（原子的インクリメント）への移行を検討。
```

### 3-3. 制限超過時のレスポンス仕様

**429 Too Many Requests — ヘッダー**

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1746187200
```

**429 レスポンスボディ**

```json
// 一般レート制限超過
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエストが多すぎます。しばらくしてから再試行してください",
    "status": 429,
    "retry_after": 60
  }
}

// 投稿の重複制限超過
{
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "この店舗への投稿は30分以内に1回のみ可能です",
    "status": 429,
    "next_allowed_at": "2026-05-02T12:35:00.000Z",
    "retry_after": 1778
  }
}
```

---

## 4. エラーコード一覧

### 統一エラーレスポンス形式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けの日本語メッセージ",
    "status": 404,
    "field": "フィールド名（バリデーションエラー時のみ）",
    "retry_after": 60,
    "next_allowed_at": "2026-05-02T12:35:00.000Z"
  }
}
```

- `code`: エラー識別子（定数文字列）。クライアントの分岐処理に使用
- `message`: エンドユーザー向けの日本語メッセージ
- `status`: HTTP ステータスコード（ボディにも含めることでパースを容易にする）
- `field`: バリデーションエラーの場合のみ、対象フィールド名を含める
- `retry_after`: 再試行可能になるまでの秒数（レート制限時のみ）
- `next_allowed_at`: 次回投稿可能日時（重複投稿制限時のみ）

### エラーコード一覧

| HTTP ステータス | エラーコード | 説明 | 発生エンドポイント |
|---|---|---|---|
| 400 | `MISSING_REQUIRED_PARAMS` | 必須クエリパラメータが不足 | `GET /api/shops` |
| 400 | `INVALID_PARAM_VALUE` | クエリパラメータの値が範囲外または不正 | `GET /api/shops` |
| 400 | `INVALID_SHOP_ID` | 店舗IDが整数でない | `GET /api/shops/:id/*` |
| 404 | `SHOP_NOT_FOUND` | 指定された店舗IDが存在しない | `GET /api/shops/:id/*` |
| 404 | `ENDPOINT_NOT_FOUND` | 存在しない API パスへのアクセス | すべて |
| 405 | `METHOD_NOT_ALLOWED` | 許可されていない HTTP メソッド | すべて |
| 429 | `RATE_LIMIT_EXCEEDED` | IP ベースのレート制限超過 | すべて |
| 500 | `INTERNAL_SERVER_ERROR` | Workers 内の予期しないエラー | すべて |
| 500 | `DATABASE_ERROR` | D1 クエリエラー | すべて |
| 503 | `SERVICE_UNAVAILABLE` | D1 または KV に接続できない | `GET /api/health` |

### エラーレスポンス例

```json
// 400 MISSING_REQUIRED_PARAMS
{
  "error": {
    "code": "MISSING_REQUIRED_PARAMS",
    "message": "lat と lng は必須パラメータです",
    "status": 400
  }
}

// 400 INVALID_WAIT_LEVEL
{
  "error": {
    "code": "INVALID_WAIT_LEVEL",
    "message": "wait_level は 0〜4 の整数で指定してください",
    "status": 400,
    "field": "wait_level"
  }
}

// 404 SHOP_NOT_FOUND
{
  "error": {
    "code": "SHOP_NOT_FOUND",
    "message": "指定された店舗が見つかりません",
    "status": 404
  }
}

// 429 DUPLICATE_REPORT
{
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "この店舗への投稿は30分以内に1回のみ可能です",
    "status": 429,
    "next_allowed_at": "2026-05-02T12:35:00.000Z",
    "retry_after": 1778
  }
}

// 429 RATE_LIMIT_EXCEEDED
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエストが多すぎます。しばらくしてから再試行してください",
    "status": 429,
    "retry_after": 60
  }
}

// 500 INTERNAL_SERVER_ERROR
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバーエラーが発生しました。しばらくしてから再試行してください",
    "status": 500
  }
}
```

---

## Appendix: 実装上の注意事項

### A. Cloudflare Workers の Edge Runtime 制約

- `crypto.subtle.digest("SHA-256", ...)` は Workers でネイティブ利用可能（Node.js `crypto` モジュール不要）
- `Date.now()` は Workers で利用可能。`new Date()` も同様
- `fetch` は Workers でネイティブ利用可能（Node.js の `node-fetch` は不要）

### B. SvelteKit との統合

SvelteKit の API Routes は `src/routes/api/` 以下に配置する。

```
src/routes/api/
├── health/
│   └── +server.ts          # GET /api/health
├── shops/
│   ├── +server.ts          # GET /api/shops
│   └── [id]/
│       ├── +server.ts      # GET /api/shops/:id
│       ├── status/
│       │   └── +server.ts  # GET /api/shops/:id/status
│       └── reports/
│           └── +server.ts  # GET /api/shops/:id/reports（POST は削除済み）
```

### C. D1 の Prepared Statements（SQL インジェクション対策）

```typescript
// 正しい実装（バインドパラメータを使用）
const stmt = env.DB.prepare(
  "SELECT * FROM shops WHERE id = ?"
).bind(shopId);
const shop = await stmt.first();

// 禁止（文字列連結による SQL 組み立て）
// const sql = `SELECT * FROM shops WHERE id = ${shopId}`; // NG
```

### D. CORS 設定

MVP では同一オリジン（`jiromap.example.com`）からのリクエストのみ許可。
将来のネイティブアプリや外部連携が必要になった場合に追加する。

```
Access-Control-Allow-Origin: https://jiromap.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
