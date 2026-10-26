-- RETIRED in V2.8 (D-083): this Cloudflare D1/SQLite migration is not used on Vercel. Part B of 0002 (event_counts) replaces it. Kept for history only.
-- Cloudflare D1 (SQLite) migration 0001 — aggregate analytics counters only.
-- No personal data. See 12_Security_and_Privacy_Plan.md §4 and spec-assets/analytics/events.json.
CREATE TABLE IF NOT EXISTS event_counts (
  day        TEXT    NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  event      TEXT    NOT NULL CHECK (length(event) <= 40),
  dims       TEXT    NOT NULL CHECK (length(dims) <= 300),   -- canonical JSON of allowed aggregate_by props, keys sorted
  count      INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (day, event, dims)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_event_counts_event_day ON event_counts (event, day);

-- Upsert used by POST /api/v1/events:
-- INSERT INTO event_counts (day, event, dims, count) VALUES (?1, ?2, ?3, 1)
--   ON CONFLICT (day, event, dims) DO UPDATE SET count = count + 1;

-- Retention jobs (scheduled Worker, daily 03:00 UTC):
-- DELETE FROM event_counts WHERE event = 'search_zero_results' AND day < date('now', '-90 days');
-- DELETE FROM event_counts WHERE day < date('now', '-25 months');

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO schema_migrations (version) VALUES (1);
