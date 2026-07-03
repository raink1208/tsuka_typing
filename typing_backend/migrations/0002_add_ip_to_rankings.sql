-- rankings テーブルにスコア送信元 IP アドレスを保存するカラムを追加
-- game_sessions には既に ip_address (ゲーム開始時の IP) があるが、
-- ランキング登録時点の IP も別途保存する。
-- 適用: `npm run db:migrate:local`（開発）/ `npm run db:migrate:remote`（本番）

ALTER TABLE rankings ADD COLUMN ip_address TEXT;