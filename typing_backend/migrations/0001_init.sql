-- Cloudflare D1 初期スキーマ
-- 適用: `npm run db:migrate:local`（開発）/ `npm run db:migrate:remote`（本番）

CREATE TABLE IF NOT EXISTS game_sessions (
  id          TEXT    PRIMARY KEY,
  difficulty  TEXT    NOT NULL CHECK(difficulty IN ('easy', 'normal', 'hard')),
  game_mode   TEXT    NOT NULL CHECK(game_mode  IN ('normal', 'ra-na')),
  word_seed   INTEGER NOT NULL,
  token_hash  TEXT    NOT NULL,
  started_at  INTEGER NOT NULL,
  submitted   INTEGER NOT NULL DEFAULT 0,
  ip_address  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS rankings (
  id                  TEXT    PRIMARY KEY,
  session_id          TEXT    NOT NULL UNIQUE REFERENCES game_sessions(id),
  player_name         TEXT    NOT NULL DEFAULT 'anonymous',
  score               INTEGER NOT NULL,
  play_time           REAL    NOT NULL,
  total_keystrokes    INTEGER NOT NULL,
  correct_keystrokes  INTEGER NOT NULL,
  miss_count          INTEGER NOT NULL,
  accuracy            REAL    NOT NULL,
  kps                 REAL    NOT NULL,
  max_combo           INTEGER NOT NULL,
  words_completed     INTEGER NOT NULL,
  difficulty          TEXT    NOT NULL,
  game_mode           TEXT    NOT NULL,
  verified            INTEGER NOT NULL DEFAULT 1,
  played_at           TEXT    NOT NULL,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings(difficulty, game_mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON game_sessions(created_at);
