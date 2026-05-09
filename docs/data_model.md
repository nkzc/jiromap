# 二郎マップ — データモデル設計書

> 作成日: 2026-05-02
> 作成者: architect サブエージェント
> ステータス: Draft（リーダーレビュー待ち）

---

## 前提

- DB: Cloudflare D1（SQLite 方言）
- ORM 不使用: Raw SQL（Prepared Statements）で実装
- 主キー: `INTEGER PRIMARY KEY AUTOINCREMENT`（自動採番）または `TEXT`（UUID v4）
- 日時型: SQLite に `DATETIME` 型がないため `TEXT`（ISO8601 形式: `2026-05-02T12:00:00.000Z`）で管理
- NULL 許容の明示: `NOT NULL` を原則とし、任意項目のみ `NULL` 許容

---

## 1. テーブル定義

### 1-1. `shops`（店舗マスタ）

店舗の基本情報を管理するマスタテーブル。
初期データは手動投入（管理画面は V1.5 以降）。

```sql
CREATE TABLE shops (
    -- サロゲートキー（自動採番）
    id          INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 店舗名（例: "ラーメン二郎 三田本店"）
    name        TEXT    NOT NULL,

    -- 店舗の緯度（WGS84。例: 35.6474）
    -- 小数点6桁まで保持（約0.1m精度）
    lat         REAL    NOT NULL,

    -- 店舗の経度（WGS84。例: 139.7399）
    lng         REAL    NOT NULL,

    -- 住所（例: "東京都港区三田2-16-4"）
    address     TEXT    NOT NULL,

    -- 最寄り駅情報（例: "都営三田線 三田駅 徒歩5分"）
    nearest_station TEXT,

    -- 電話番号（任意。例: "03-XXXX-XXXX"）
    phone       TEXT,

    -- 営業時間（テキスト形式。例: "11:00-14:00, 17:00-20:00"）
    -- 複雑なスケジュール管理は V2 以降。MVP はテキスト表示のみ
    business_hours TEXT,

    -- 定休日（テキスト形式。例: "月曜日・祝日"）
    closed_days TEXT,

    -- 店舗カテゴリ（'jiro': 直系二郎, 'inspired': インスパイア系）
    category    TEXT    NOT NULL DEFAULT 'jiro'
                        CHECK(category IN ('jiro', 'inspired')),

    -- 食べログURL（アフィリエイトリンク用。任意）
    tabelog_url TEXT,

    -- ぐるなびURL（アフィリエイトリンク用。任意）
    gurunavi_url TEXT,

    -- 公式X（Twitter）アカウント（例: "@jiro_mita"。任意）
    twitter_handle TEXT,

    -- 並び方・注文ルールに関するメモ（例: "食券制・券売機は入口右"。任意）
    -- 0003_shop_rules.sql で追加
    queue_notes TEXT,

    -- トッピング・コールに関するメモ（例: "ニンニク・ヤサイ・アブラ・カラメが選べます"。任意）
    -- 0003_shop_rules.sql で追加
    topping_notes TEXT,

    -- その他店舗固有ルール（例: "食べ残し厳禁・スマホ禁止"。任意）
    -- 0003_shop_rules.sql で追加
    shop_notes TEXT,

    -- レコード作成日時（ISO8601）
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- レコード更新日時（ISO8601）
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 周辺店舗検索（緯度・経度の範囲検索）に使用
-- Bounding Box フィルタリング用複合インデックス
CREATE INDEX idx_shops_lat_lng ON shops(lat, lng);

-- カテゴリフィルタリング用インデックス
CREATE INDEX idx_shops_category ON shops(category);
```

**設計メモ**

- SQLite には空間インデックス（PostGIS 等）がないため、緯度・経度の範囲（Bounding Box）でフィルタリング後、アプリ側でハバーサイン公式により正確な距離を計算する
- `business_hours`・`closed_days` は MVP ではテキスト表示。V2 以降で `shop_schedules` テーブルに切り出す

---

### 1-2. `crowd_reports`（混雑投稿）

ユーザーが投稿した混雑・待ち情報を記録するテーブル。
投稿は30分後に「失効」とみなし、集計から除外する（後述）。

```sql
CREATE TABLE crowd_reports (
    -- サロゲートキー（自動採番）
    id          INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 対象店舗ID（shops.id への外部キー）
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

    -- 待ちレベル（0〜4 の5段階）
    -- 0: 並びなし, 1: 1〜5人, 2: 6〜10人, 3: 11人以上, 4: 麺切れ/臨時休業
    wait_level  INTEGER NOT NULL
                CHECK(wait_level IN (0, 1, 2, 3, 4)),

    -- 任意コメント（最大100文字。個人特定情報は含めない）
    comment     TEXT    CHECK(length(comment) <= 100),

    -- スパム対策用：クライアントセッション ID（UUID v4）
    -- HttpOnly Cookie で管理。同一セッションの30分以内重複投稿をブロックするために使用
    session_id  TEXT    NOT NULL,

    -- スパム対策用：IPアドレスのハッシュ値（SHA-256）
    -- 生 IP は保存しない（requirements.md セクション5の方針）
    -- ハッシュ化後 HEX 文字列（64文字）
    ip_hash     TEXT    NOT NULL
                CHECK(length(ip_hash) = 64),

    -- 投稿日時（ISO8601）。鮮度判定の基準
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- 論理削除フラグ（モデレーション用。0: 有効, 1: 削除済み）
    is_deleted  INTEGER NOT NULL DEFAULT 0
                CHECK(is_deleted IN (0, 1))
);

-- 店舗別の最新投稿取得（最も頻繁に実行されるクエリ）
-- shop_id でフィルタし created_at 降順で並べる
CREATE INDEX idx_crowd_reports_shop_created ON crowd_reports(shop_id, created_at DESC);

-- 鮮度失効処理バッチ用：created_at でのレンジスキャン
CREATE INDEX idx_crowd_reports_created ON crowd_reports(created_at);

-- スパム防止：セッションID + 店舗の組み合わせで重複チェック
CREATE INDEX idx_crowd_reports_session_shop ON crowd_reports(session_id, shop_id, created_at DESC);

-- スパム防止：IP ハッシュ + 店舗の組み合わせで重複チェック
CREATE INDEX idx_crowd_reports_ip_shop ON crowd_reports(ip_hash, shop_id, created_at DESC);
```

**設計メモ**

- 生 IP アドレスの保存は `requirements.md` セクション5の方針（個人情報保護）に基づき禁止
- `session_id` と `ip_hash` を組み合わせてスパムを二重に防止する
- 30分以上経過した投稿は集計から除外するが、論理削除は行わない（統計分析のためデータは保持）
- `is_deleted` フラグでモデレーターによる手動削除に対応

---

### 1-3. `shop_statuses`（店舗ごとの集計済み最新ステータス）

Cloudflare KV キャッシュのバックアップ用テーブル。
30秒バッチ集計で `crowd_reports` を集計し、最新ステータスをここに upsert する。
KV が失効・再起動した場合のフォールバックとして機能する。

```sql
CREATE TABLE shop_statuses (
    -- 店舗ID（shops.id への外部キー。1店舗につき1レコード）
    shop_id         INTEGER PRIMARY KEY REFERENCES shops(id) ON DELETE CASCADE,

    -- 集計の基準となった投稿の中で最も多かった wait_level
    -- NULL の場合は有効な投稿が存在しないことを示す
    current_wait_level INTEGER
                    CHECK(current_wait_level IS NULL OR current_wait_level IN (0, 1, 2, 3, 4)),

    -- 集計に使用した投稿数（直近30分以内の有効投稿数）
    report_count    INTEGER NOT NULL DEFAULT 0
                    CHECK(report_count >= 0),

    -- 集計の信頼度スコア（0.0〜1.0）
    -- report_count が多いほど高い。フロントエンドでの表示に活用
    -- 例: 1件=0.3, 2件=0.6, 3件以上=1.0
    confidence      REAL    NOT NULL DEFAULT 0.0
                    CHECK(confidence >= 0.0 AND confidence <= 1.0),

    -- 最新の有効投稿の投稿日時（フロント表示用「最終更新〇分前」の計算に使用）
    last_reported_at TEXT,

    -- このレコードが最後に集計・更新された日時（ISO8601）
    -- バッチ集計の実行時刻を記録
    aggregated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- KV フォールバック時の全店舗ステータス一括取得
-- aggregated_at が新しいレコードを優先して取得する用途
CREATE INDEX idx_shop_statuses_aggregated ON shop_statuses(aggregated_at DESC);
```

**設計メモ**

- `PRIMARY KEY` を `shop_id` にすることで `INSERT OR REPLACE` による upsert を効率化
- KV は「最終整合性（Eventually Consistent）」のため、KV から取得できない場合に D1 の本テーブルをフォールバックとして参照する
- 集計ロジックは Workers の Cron Trigger（30秒間隔）で実行（後述）

---

### 1-4. `spam_blocks`（スパムブロック記録）

投稿制限中のセッション/IPのブロック情報を記録するテーブル。
KV でも同様の情報を管理するが、D1 に永続化することで KV 失効後も制限を維持できる。

```sql
CREATE TABLE spam_blocks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,

    -- ブロック対象のセッションID（UUID v4）または IP ハッシュ
    identifier  TEXT    NOT NULL,

    -- 識別子の種類（'session': セッションID, 'ip_hash': IPハッシュ）
    id_type     TEXT    NOT NULL
                CHECK(id_type IN ('session', 'ip_hash')),

    -- 対象店舗ID（特定店舗への投稿制限。NULL の場合は全店舗制限）
    shop_id     INTEGER REFERENCES shops(id) ON DELETE CASCADE,

    -- ブロック開始日時（ISO8601）
    blocked_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- ブロック終了日時（ISO8601。この時刻を過ぎたら制限解除）
    -- 通常は blocked_at + 30分
    expires_at  TEXT    NOT NULL,

    -- ブロック理由（'duplicate_post': 重複投稿, 'rate_limit': レート超過）
    reason      TEXT    NOT NULL
                CHECK(reason IN ('duplicate_post', 'rate_limit'))
);

-- ブロック状態の有効期限チェック用インデックス
CREATE INDEX idx_spam_blocks_identifier ON spam_blocks(identifier, shop_id, expires_at);

-- 期限切れブロックの削除バッチ用
CREATE INDEX idx_spam_blocks_expires ON spam_blocks(expires_at);

-- 同一識別子・店舗の重複ブロックを防ぐ
CREATE UNIQUE INDEX idx_spam_blocks_unique ON spam_blocks(identifier, id_type, shop_id)
    WHERE shop_id IS NOT NULL;
```

---

## 2. ER図（Mermaid erDiagram）

```mermaid
erDiagram
    shops {
        INTEGER id PK
        TEXT name
        REAL lat
        REAL lng
        TEXT address
        TEXT nearest_station
        TEXT phone
        TEXT business_hours
        TEXT closed_days
        TEXT category
        TEXT tabelog_url
        TEXT gurunavi_url
        TEXT twitter_handle
        TEXT queue_notes
        TEXT topping_notes
        TEXT shop_notes
        TEXT created_at
        TEXT updated_at
    }

    crowd_reports {
        INTEGER id PK
        INTEGER shop_id FK
        INTEGER wait_level
        TEXT comment
        TEXT session_id
        TEXT ip_hash
        TEXT created_at
        INTEGER is_deleted
    }

    shop_statuses {
        INTEGER shop_id PK_FK
        INTEGER current_wait_level
        INTEGER report_count
        REAL confidence
        TEXT last_reported_at
        TEXT aggregated_at
    }

    spam_blocks {
        INTEGER id PK
        TEXT identifier
        TEXT id_type
        INTEGER shop_id FK
        TEXT blocked_at
        TEXT expires_at
        TEXT reason
    }

    shops ||--o{ crowd_reports : "has many"
    shops ||--o| shop_statuses : "has one"
    shops ||--o{ spam_blocks : "blocks targeting"
```

---

## 3. 並び情報の更新フロー

### 3-1. ユーザー投稿から KV キャッシュ反映までの流れ

```
[ユーザー] → POST /api/shops/:id/reports
    |
    ▼
[Cloudflare Workers]
    1. リクエスト検証
       - CF-Connecting-IP を取得 → SHA-256 ハッシュ化
       - Cookie の session_id を取得（なければ新規 UUID を発行し Set-Cookie）
       - wait_level: 0〜4 のバリデーション
       - comment: 100文字以内のバリデーション
    |
    2. スパムチェック（KV 優先、フォールバックで D1）
       - KV key: `spam:session:{session_id}:shop:{shop_id}`
         → 存在すれば 429 Too Many Requests を返す
       - KV key: `spam:ip:{ip_hash}:shop:{shop_id}`
         → 存在すれば 429 Too Many Requests を返す
    |
    3. D1 に保存
       INSERT INTO crowd_reports (shop_id, wait_level, comment, session_id, ip_hash)
       VALUES (?, ?, ?, ?, ?)
    |
    4. KV にスパムブロック情報を書き込み（TTL: 1800秒 = 30分）
       - KV.put(`spam:session:{session_id}:shop:{shop_id}`, "1", { expirationTtl: 1800 })
       - KV.put(`spam:ip:{ip_hash}:shop:{shop_id}`, "1", { expirationTtl: 1800 })
    |
    5. KV のステータスキャッシュを削除（即時無効化）
       - KV.delete(`status:shop:{shop_id}`)
       ※ 次のポーリングリクエスト時に D1 から再計算される
    |
    ▼
[レスポンス 201 Created]
    - 投稿した wait_level を含む最新ステータスを返す
    - クライアントは即時 UI 更新（楽観的更新）

    ＊ D1 への write と KV 操作は Workers 内で直列に実行（Workers の CPU 時間制限 10ms に収まる軽量処理）
```

### 3-2. 30秒バッチ集計（Cloudflare Workers Cron Trigger）

`tech_decision.md` で言及した「30秒バッチ集計」の具体的な実装方針を示す。

**Cron Trigger の設定（wrangler.toml）**

```toml
[[triggers]]
crons = ["*/1 * * * *"]  # 1分ごとに実行（Cloudflare Cron は最短1分間隔）
```

> 注意: Cloudflare Workers Cron Trigger の最小間隔は1分。「30秒バッチ」は概念的な表現で、実装上は1分ごとに実行する。投稿直後のキャッシュ削除（3-1のステップ5）で実質的なリアルタイム更新を担保する。

**バッチ集計クエリ（Workers 内で実行）**

```sql
-- ステップ1: 直近30分以内の有効投稿を集計
-- 各店舗の wait_level 最頻値と投稿数・最終投稿日時を取得
WITH recent_reports AS (
    SELECT
        shop_id,
        wait_level,
        COUNT(*) AS level_count,
        MAX(created_at) AS last_reported_at
    FROM crowd_reports
    WHERE
        created_at >= datetime('now', '-30 minutes')
        AND is_deleted = 0
    GROUP BY shop_id, wait_level
),
ranked AS (
    SELECT
        shop_id,
        wait_level,
        level_count,
        last_reported_at,
        ROW_NUMBER() OVER (
            PARTITION BY shop_id
            ORDER BY level_count DESC, last_reported_at DESC
        ) AS rn
    FROM recent_reports
),
totals AS (
    SELECT shop_id, SUM(level_count) AS total_count
    FROM recent_reports
    GROUP BY shop_id
)
SELECT
    r.shop_id,
    r.wait_level     AS current_wait_level,
    t.total_count    AS report_count,
    r.last_reported_at,
    -- 信頼度スコア: 1件=0.3, 2件=0.6, 3件以上=1.0
    MIN(1.0, CAST(t.total_count AS REAL) / 3.0) AS confidence
FROM ranked r
JOIN totals t ON r.shop_id = t.shop_id
WHERE r.rn = 1;
```

**集計結果の反映**

```sql
-- ステップ2: shop_statuses を upsert
INSERT OR REPLACE INTO shop_statuses
    (shop_id, current_wait_level, report_count, confidence, last_reported_at, aggregated_at)
VALUES
    (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
```

**KV への書き込み**

集計結果を KV に書き込む（TTL: 90秒）。

```
KV.put(
    `status:shop:{shop_id}`,
    JSON.stringify({ wait_level, report_count, confidence, last_reported_at, aggregated_at }),
    { expirationTtl: 90 }
)
```

TTL を90秒に設定することで、バッチが1分ごとに実行される場合でも常に有効な KV エントリが存在する。

**KV 書き込み回数の試算**

```
アクティブな店舗数（昼ピーク時）: 約20店
バッチ実行回数/日: 60回/時 × 2時間（昼ピーク）+ 10回/時 × 10時間 = 220回/日
KV 書き込み: 最大 220回/日 × 20店 = 4,400 write/日

→ KV 無料枠（1,000 write/日）を超過する可能性がある。
→ 対策: 集計結果に変化がなければ KV を更新しない（差分チェック）。
         または Workers Paid プラン（$5/月）への移行で解決。
```

### 3-3. 投稿の「鮮度失効」処理

投稿から30分が経過したデータは集計から除外する。方式は2段階：

**方式A: クエリ時に動的除外（推奨・MVP 採用）**

集計クエリの WHERE 句に時刻フィルタを入れることで、古い投稿を常に除外する。

```sql
WHERE created_at >= datetime('now', '-30 minutes')
  AND is_deleted = 0
```

- メリット: D1 のデータ量が増えても集計精度は維持される。バッチ削除が不要
- デメリット: `idx_crowd_reports_created` インデックスを適切に使う必要がある

**方式B: 定期パージ（補助・日次実行）**

24時間以上経過した投稿を D1 から物理削除する日次バッチ。
統計分析目的で数日分は保持し、それ以上は削除してストレージを節約する。

```sql
-- Cron Trigger（日次）で実行
DELETE FROM crowd_reports
WHERE created_at < datetime('now', '-7 days');
```

- 7日分のデータを保持することで、過去の曜日・時間帯別傾向グラフ（V2 機能）のデータ源にもなる

**spam_blocks の期限切れレコード削除**

```sql
-- 日次バッチで期限切れレコードを削除
DELETE FROM spam_blocks
WHERE expires_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
```

---

## 4. セキュリティ方針

### 4-1. Cloudflare D1 の RLS 代替手段（Workers レイヤーのアクセス制御）

Cloudflare D1 は PostgreSQL の Row Level Security（RLS）を持たないため、
**Workers の API レイヤーで以下のアクセス制御を実装する**。

| 操作 | 制御方針 |
|---|---|
| `shops` の READ | 全ユーザーに許可（パブリック API） |
| `shops` の INSERT/UPDATE/DELETE | Workers 内部処理のみ（パブリック API は非公開）。将来の管理画面は内部トークン認証 |
| `crowd_reports` の INSERT | 匿名ユーザーに許可。スパムチェック通過後のみ D1 に書き込む |
| `crowd_reports` の SELECT | 直近30分以内・非削除レコードのみ返す（Workers クエリで制限） |
| `crowd_reports` の UPDATE（論理削除） | Workers 内部処理のみ（モデレーション用） |
| `shop_statuses` の READ | KV キャッシュ経由。D1 直接クエリは Workers 内部のみ |
| `spam_blocks` | Workers 内部処理のみ（パブリック API 非公開） |

**実装方針**

1. D1 へのクエリは必ず Workers 経由とし、フロントエンドから D1 に直接アクセスする経路を作らない
2. Workers 内で Prepared Statements を使用（SQL インジェクション対策）
3. クエリはパラメータバインドのみ許可し、動的 SQL 文字列連結は禁止
4. Workers の Bindings（wrangler.toml）で D1・KV へのアクセスを必要最小限に制限

### 4-2. スパム対策の DB/KV レベル実装方針

**二重チェック構成**

```
リクエスト受信
    │
    ├─ [KV チェック 1] spam:session:{session_id}:shop:{shop_id}
    │       TTL: 1800秒（30分）
    │       存在すれば → 429 を返す（高速・KV は低レイテンシ）
    │
    ├─ [KV チェック 2] spam:ip:{ip_hash}:shop:{shop_id}
    │       TTL: 1800秒（30分）
    │       存在すれば → 429 を返す
    │
    ├─ [D1 フォールバック] KV miss 時（KV 失効・障害時）
    │       SELECT COUNT(*) FROM crowd_reports
    │       WHERE session_id = ? AND shop_id = ?
    │         AND created_at >= datetime('now', '-30 minutes')
    │         AND is_deleted = 0
    │       COUNT > 0 → 429 を返す
    │
    └─ → 投稿処理へ
```

**KV のキー設計**

| キー | 値 | TTL | 用途 |
|---|---|---|---|
| `spam:session:{uuid}:shop:{shop_id}` | `"1"` | 1800秒 | セッションベース重複防止 |
| `spam:ip:{sha256_hex}:shop:{shop_id}` | `"1"` | 1800秒 | IP ベース重複防止 |
| `status:shop:{shop_id}` | JSON（後述） | 90秒 | 混雑ステータスキャッシュ |
| `ratelimit:ip:{sha256_hex}` | カウント数（文字列） | 60秒 | IP レート制限（/分） |

**レート制限の実装（KV カウンター）**

```
KV.get(`ratelimit:ip:{ip_hash}`)
    → NULL: KV.put(key, "1", { expirationTtl: 60 })  # 初回
    → "N":  N >= 10 なら 429 を返す（1分間に10回以上の投稿は制限）
              N < 10 なら KV.put(key, String(N+1), { expirationTtl: 60 })
```

### 4-3. 個人情報（IP アドレス）の保存方針

`requirements.md` セクション5の方針に基づき、以下を厳守する。

| 項目 | 方針 |
|---|---|
| 生 IP アドレス | D1・KV のいずれにも**保存しない** |
| IP の利用目的 | スパム判定のみ。投稿処理完了後は Workers のメモリ上から破棄 |
| IP のハッシュ化 | `CF-Connecting-IP` ヘッダー値を Workers 内で `SHA-256`（+ ソルト）でハッシュ化。HEX 文字列64文字として保存 |
| ソルトの管理 | Cloudflare Workers の Environment Variables（Secrets）に `IP_HASH_SALT` として設定。ソースコードに含めない |
| KV の IP 関連キー | `spam:ip:{sha256_hex}:shop:{shop_id}` 形式。元 IP の復元は不可能 |
| ユーザー位置情報 | ブラウザ上のみで処理。サーバーには**送信・保存しない**（`requirements.md` 方針通り） |
| プライバシーポリシー | MVP 時点でページを用意し、IP ハッシュの利用目的・保存期間（最大7日）を明示 |

---
