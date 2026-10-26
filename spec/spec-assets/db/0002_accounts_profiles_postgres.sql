-- PostgreSQL 15+ migration 0002 (V2.6) — optional accounts, profiles, stars, progress, outcomes, activity and trending.
-- Target: Postgres on Vercel (Neon via the Vercel Marketplace). 0001 (Cloudflare D1/SQLite) is superseded for the Vercel build by part B below.
-- Privacy: see 12_Security_and_Privacy_Plan.md §9 and 24 §7. Everything keyed by user_id is deleted by DELETE FROM users WHERE id = $1 (ON DELETE CASCADE).
-- Nothing here stores free-text from the public site; the only free text is the user's own outcome/output notes (<= 280 chars).

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;

-- ===== Part A: accounts =====
CREATE TABLE users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              citext UNIQUE,                         -- null only for a deleted-then-anonymised row (never kept)
  email_verified_at  timestamptz,
  display_name       text CHECK (char_length(display_name) <= 60),
  market             text NOT NULL DEFAULT 'other' CHECK (market IN ('ng','africa','other')),
  intents            text[] NOT NULL DEFAULT '{}' CHECK (intents <@ ARRAY['compete','grow','scale']),
  consent_profile_at timestamptz,                           -- switch 1, optional, off until chosen (FR-086): save my progress. NULL = an account with an email only
  consent_recommend  boolean NOT NULL DEFAULT false,        -- switch 2, optional, never pre-ticked: use my profile to recommend
  consent_recommend_at timestamptz,
  consent_version    text NOT NULL,                         -- version of the privacy text shown
  consent_trending   boolean NOT NULL DEFAULT false,        -- switch 3, optional, never pre-ticked: count my activity in 'popular this week'
  consent_trending_at timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  last_seen_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_codes (                                    -- one-time email codes (hashed); 10-minute life
  email       citext NOT NULL,
  code_hash   text   NOT NULL,
  expires_at  timestamptz NOT NULL,
  attempts    smallint NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, created_at)
);
CREATE INDEX idx_auth_codes_expiry ON auth_codes (expires_at);

CREATE TABLE sessions (
  id          text PRIMARY KEY,                              -- random 256-bit, stored hashed
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- ===== profile =====
CREATE TABLE user_identities (                               -- "Who are you?" picks, up to 3
  user_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  identity  text NOT NULL CHECK (identity ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position  smallint NOT NULL CHECK (position BETWEEN 1 AND 3),
  PRIMARY KEY (user_id, identity),
  UNIQUE (user_id, position)
);

CREATE TABLE stars (                                         -- starred items (D-079)
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('skill','tool','goal','helper','kit')),
  slug       text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, slug)
);

CREATE TABLE skill_state (                                   -- starred is separate; this is learning / can_do
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('skill','tool')),
  slug       text NOT NULL,
  state      text NOT NULL CHECK (state IN ('learning','can_do')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, slug)
);

CREATE TABLE module_progress (                               -- "I can do this" ticks
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_slug text NOT NULL,
  done_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_slug)
);

CREATE TABLE helper_progress (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_slug text NOT NULL,
  for_label   text CHECK (char_length(for_label) <= 40),     -- "helping someone else": optional label
  stage_done  smallint[] NOT NULL DEFAULT '{}',
  steps_done  text[] NOT NULL DEFAULT '{}',                  -- "stage.step" keys
  started_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, helper_slug)
);

CREATE TABLE stage_outputs (                                 -- "save what you made" (FR-084) — the user's own note or link
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_slug text NOT NULL,
  stage_n     smallint NOT NULL,
  note        text CHECK (char_length(note) <= 280),
  link        text CHECK (char_length(link) <= 300 AND link ~ '^https://'),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_stage_outputs_user ON stage_outputs (user_id, helper_slug);

CREATE TABLE outcomes (                                      -- "What changed for you?" (FR-085) — the owner's real success measure
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  helper_slug text,
  stage_n     smallint,
  kind        text NOT NULL CHECK (kind IN ('got_customer','saved_time','learned_something','earned_money','nothing_yet','other')),
  note        text CHECK (char_length(note) <= 280),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reco_feedback (                                 -- "Not for me" (FR-089)
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('skill','tool','goal','helper','module')),
  slug       text NOT NULL,
  action     text NOT NULL CHECK (action IN ('not_for_me','already_know')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, slug)
);

-- ===== activity (feeds recommendations and trending); distinct user-day-item; deleted after 90 days =====
CREATE TABLE activity (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     date NOT NULL,
  kind    text NOT NULL CHECK (kind IN ('skill','profession','goal','tool','helper')),
  slug    text NOT NULL,
  action  text NOT NULL CHECK (action IN ('opened','started','completed','selected')),
  PRIMARY KEY (user_id, day, kind, slug, action)
);
CREATE INDEX idx_activity_day ON activity (day, kind, slug);

-- ===== trending (D-081): aggregate only; no user ids; rows below the privacy floor are never stored =====
CREATE TABLE trending_weekly (
  week_start date NOT NULL,                                  -- first day of the 7-day window (rolling; the job passes current_date - 6)
  kind       text NOT NULL CHECK (kind IN ('skill','profession','goal','tool')),
  action     text NOT NULL CHECK (action IN ('opened','started','completed','selected')),
  slug       text NOT NULL,
  users      integer NOT NULL CHECK (users >= 10),           -- privacy floor k = 10 (config: trending.min_users)
  PRIMARY KEY (week_start, kind, action, slug)
);

-- Daily job (Vercel Cron, 03:00 Africa/Lagos): SELECT refresh_trending(current_date - 6); rebuilds the rolling 7-day figures
-- (window = p_week_start .. p_week_start + 6) from consenting users only; then SELECT purge_old_rows(); (V2.8).
-- Only counts users with consent_trending = true and account age >= 24 h (see 24 §9). Idempotent.
CREATE OR REPLACE FUNCTION refresh_trending(p_week_start date) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  DELETE FROM trending_weekly WHERE week_start = p_week_start;
  INSERT INTO trending_weekly (week_start, kind, action, slug, users)
  SELECT p_week_start, a.kind, a.action, a.slug, count(DISTINCT a.user_id)
  FROM activity a JOIN users u ON u.id = a.user_id
  WHERE a.day >= p_week_start AND a.day < p_week_start + 7
    AND u.consent_trending AND u.created_at <= now() - interval '24 hours'
    AND a.kind <> 'helper'
  GROUP BY a.kind, a.action, a.slug
  HAVING count(DISTINCT a.user_id) >= 10;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- Daily retention job (V2.8, checklist 6.7): delete raw activity older than 90 days and trending snapshots older than 14 days.
-- Schedule: Vercel Cron, same 03:00 call as refresh_trending. Aggregates in trending_weekly keep no user ids.
CREATE OR REPLACE FUNCTION purge_old_rows() RETURNS integer LANGUAGE plpgsql AS $$
DECLARE a integer; t integer;
BEGIN
  DELETE FROM activity WHERE day < current_date - 90;           GET DIAGNOSTICS a = ROW_COUNT;
  DELETE FROM trending_weekly WHERE week_start < current_date - 14; GET DIAGNOSTICS t = ROW_COUNT;
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 day';
  RETURN a + t;
END $$;

-- ===== Part B: anonymous aggregate analytics counters (replaces D1 migration 0001 on Vercel) =====
CREATE TABLE event_counts (
  day    date    NOT NULL,
  event  text    NOT NULL CHECK (char_length(event) <= 40),
  dims   text    NOT NULL CHECK (char_length(dims) <= 300),  -- canonical JSON of the allowed aggregate_by props, keys sorted
  count  integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (day, event, dims)
);
CREATE INDEX idx_event_counts_event_day ON event_counts (event, day);

-- Rate limiting (V2.8, checklist 3.8): hashed-IP counters; no raw IP is stored. Rows older than 1 day are deleted by purge_old_rows().
CREATE TABLE rate_limits (
  bucket       text NOT NULL CHECK (char_length(bucket) <= 80),   -- e.g. 'corrections:' || sha256(ip || RATE_LIMIT_SALT)
  window_start timestamptz NOT NULL,
  hits         integer NOT NULL DEFAULT 1 CHECK (hits >= 0),
  PRIMARY KEY (bucket, window_start)
);
COMMIT;
