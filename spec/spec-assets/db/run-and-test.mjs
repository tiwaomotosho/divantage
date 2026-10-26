// Runs migration 0002 in PGlite (real Postgres compiled to WASM) and checks the privacy rules.
// Usage: npm i @electric-sql/pglite && node spec-assets/db/run-and-test.mjs
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const db = new PGlite({ extensions: { citext, pgcrypto } });
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
await db.exec(fs.readFileSync(path.join(dir, '0002_accounts_profiles_postgres.sql'), 'utf8')); ok(true, 'migration runs');
// 1 an account needs no consent: all three switches off by default
await db.exec("INSERT INTO users (email, consent_version) VALUES ('a@x.test','v1')");
let r = (await db.query("SELECT consent_profile_at, consent_recommend, consent_trending FROM users")).rows[0];
ok(r.consent_profile_at === null && r.consent_recommend === false && r.consent_trending === false, 'all three consents off by default');
// 2 stars accept a kit
await db.exec("INSERT INTO stars (user_id, kind, slug) SELECT id,'kit','get-a-remote-job' FROM users"); ok(true, 'kit can be starred');
// 3 trending: 12 consenting users on one goal, 9 on another; floor of 10
await db.exec("INSERT INTO users (email, consent_version, consent_trending, created_at) SELECT 'u'||g||'@x.test','v1', true, now() - interval '3 days' FROM generate_series(1,12) g");
await db.exec("INSERT INTO activity (user_id, day, kind, slug, action) SELECT id, current_date, 'goal', 'get-a-remote-job', 'opened' FROM users WHERE consent_trending");
await db.exec("INSERT INTO activity (user_id, day, kind, slug, action) SELECT id, current_date, 'goal', 'rare-goal', 'opened' FROM (SELECT id FROM users WHERE consent_trending LIMIT 9) x");
await db.exec("INSERT INTO activity (user_id, day, kind, slug, action) SELECT id, current_date - 40, 'goal', 'old', 'opened' FROM users WHERE consent_trending LIMIT 1");
await db.query("SELECT refresh_trending(current_date - 6)");
const t = (await db.query("SELECT slug, users FROM trending_weekly ORDER BY slug")).rows;
ok(t.length === 1 && t[0].slug === 'get-a-remote-job' && Number(t[0].users) === 12, 'trending keeps only rows with 10 or more users');
// 4 retention
await db.query("SELECT purge_old_rows()");
ok((await db.query("SELECT 1 FROM activity WHERE slug='old'")).rows.length === 1, 'activity 40 days old is kept');
await db.exec("INSERT INTO activity (user_id, day, kind, slug, action) SELECT id, current_date - 100, 'goal', 'older', 'opened' FROM users LIMIT 1");
await db.query("SELECT purge_old_rows()");
ok((await db.query("SELECT 1 FROM activity WHERE slug='older'")).rows.length === 0, 'activity 100 days old is purged');
// 5 delete cascades
await db.exec("DELETE FROM users WHERE email='a@x.test'");
ok((await db.query("SELECT 1 FROM stars")).rows.length === 0, 'deleting a user deletes their stars');
process.exit(fail ? 1 : 0);
