-- rankings テーブルに「ランキングへ掲載するか」のフラグを追加
-- /api/game/submit ではスコア検証と保存のみを行い published = 0 で登録する。
-- プレイヤーがリザルト画面で登録ボタンを押した時点で /api/game/publish が
-- published = 1 に更新し、初めてランキングに掲載される。
-- 既存レコードは掲載済みとして扱う。
-- 適用: `npm run db:migrate:local`（開発）/ `npm run db:migrate:remote`（本番）

ALTER TABLE rankings ADD COLUMN published INTEGER NOT NULL DEFAULT 0;

UPDATE rankings SET published = 1;

CREATE INDEX IF NOT EXISTS idx_rankings_published_score
  ON rankings(difficulty, game_mode, published, score DESC);