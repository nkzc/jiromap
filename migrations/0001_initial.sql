-- Migration 0001: Initial schema
-- H-1 (Window functions): PASS — ROW_NUMBER() OVER (PARTITION BY ...) supported
-- H-2 (Partial Index):     PASS — CREATE UNIQUE INDEX ... WHERE shop_id IS NOT NULL supported

-- ==============================================================
-- shops: 店舗マスタ
-- ==============================================================
CREATE TABLE IF NOT EXISTS shops (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    lat         REAL    NOT NULL,
    lng         REAL    NOT NULL,
    address     TEXT    NOT NULL,
    nearest_station TEXT,
    phone       TEXT,
    business_hours TEXT,
    closed_days TEXT,
    category    TEXT    NOT NULL DEFAULT 'jiro'
                        CHECK(category IN ('jiro', 'inspired')),
    tabelog_url TEXT,
    gurunavi_url TEXT,
    twitter_handle TEXT,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_shops_lat_lng ON shops(lat, lng);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);

-- ==============================================================
-- crowd_reports: 混雑投稿
-- ==============================================================
CREATE TABLE IF NOT EXISTS crowd_reports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    wait_level  INTEGER NOT NULL CHECK(wait_level IN (0, 1, 2, 3, 4)),
    comment     TEXT    CHECK(length(comment) <= 100),
    session_id  TEXT    NOT NULL,
    ip_hash     TEXT    NOT NULL CHECK(length(ip_hash) = 64),
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    is_deleted  INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_shop_created ON crowd_reports(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_created ON crowd_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_session_shop ON crowd_reports(session_id, shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_ip_shop ON crowd_reports(ip_hash, shop_id, created_at DESC);

-- ==============================================================
-- shop_statuses: 集計済みステータス（KVフォールバック用）
-- ==============================================================
CREATE TABLE IF NOT EXISTS shop_statuses (
    shop_id         INTEGER PRIMARY KEY REFERENCES shops(id) ON DELETE CASCADE,
    current_wait_level INTEGER CHECK(current_wait_level IS NULL OR current_wait_level IN (0, 1, 2, 3, 4)),
    report_count    INTEGER NOT NULL DEFAULT 0 CHECK(report_count >= 0),
    confidence      REAL    NOT NULL DEFAULT 0.0 CHECK(confidence >= 0.0 AND confidence <= 1.0),
    last_reported_at TEXT,
    aggregated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_shop_statuses_aggregated ON shop_statuses(aggregated_at DESC);

-- ==============================================================
-- spam_blocks: 重複投稿ブロック記録
-- H-2 PASS のため Partial Index を使用
-- ==============================================================
CREATE TABLE IF NOT EXISTS spam_blocks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier  TEXT    NOT NULL,
    id_type     TEXT    NOT NULL CHECK(id_type IN ('session', 'ip_hash')),
    shop_id     INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    blocked_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    expires_at  TEXT    NOT NULL,
    reason      TEXT    NOT NULL CHECK(reason IN ('duplicate_post', 'rate_limit'))
);
CREATE INDEX IF NOT EXISTS idx_spam_blocks_identifier ON spam_blocks(identifier, shop_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_spam_blocks_expires ON spam_blocks(expires_at);
-- H-2 PASS: Partial Index (WHERE shop_id IS NOT NULL) is supported
CREATE UNIQUE INDEX IF NOT EXISTS idx_spam_blocks_unique ON spam_blocks(identifier, id_type, shop_id)
    WHERE shop_id IS NOT NULL;
