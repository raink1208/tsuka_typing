# デバッグ手順

## 1. バックエンド（Cloudflare Workers + D1）をローカルで動かす

### 1.1 準備

```bash
cd typing_backend
npm install
```

初回のみ、ローカルD1（Miniflareのシミュレーション）にスキーマを適用する。

```bash
npm run db:migrate:local
```

### 1.2 開発サーバー起動

```bash
npm run dev
```

`wrangler dev` が起動し、`http://127.0.0.1:8787` でリッスンする。

```
Your worker has access to the following bindings:
- D1 Databases:
  - DB: tsuka-typing-db (...) [simulated locally]
- Vars:
  - CORS_ORIGIN: "http://localhost:3000"
  - SERVER_SECRET: "(hidden)"
[wrangler:inf] Ready on http://127.0.0.1:8787
```

`SERVER_SECRET` / `CORS_ORIGIN` は [.dev.vars](../typing_backend/.dev.vars)（gitignore対象）から読み込まれる。
存在しない場合は以下の内容で作成する。

```
SERVER_SECRET=change-this-to-a-long-random-secret-key
CORS_ORIGIN=http://localhost:3000
```

### 1.3 動作確認

```bash
# ヘルスチェック
curl http://127.0.0.1:8787/health

# セッション開始（PowerShellの場合はInvoke-RestMethodを使用）
curl -X POST http://127.0.0.1:8787/api/game/start \
  -H "Content-Type: application/json" \
  -d "{\"difficulty\":\"normal\",\"gameMode\":\"normal\"}"

# ランキング取得
curl "http://127.0.0.1:8787/api/ranking?difficulty=normal&gameMode=normal"
```

PowerShellの場合:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8787/api/game/start" -Method POST `
  -Body (@{difficulty="normal"; gameMode="normal"} | ConvertTo-Json) `
  -ContentType "application/json"

Invoke-RestMethod -Uri "http://127.0.0.1:8787/api/ranking?difficulty=normal&gameMode=normal"
```

### 1.4 ローカルD1の中身を直接確認する

```bash
npx wrangler d1 execute tsuka-typing-db --local --command "SELECT * FROM rankings;"
```

### 1.5 型チェック

```bash
npx tsc --noEmit
```

### 1.6 ログの確認

`wrangler dev` 実行中のターミナルにリクエストログ（`<-- POST /api/game/start` など）がそのまま出力される。
エラー時は `console.error` の内容もここに表示される。詳細ログは
`%APPDATA%/xdg.config/.wrangler/logs/` (Windows) にも出力される。

---

## 2. よくあるハマりどころ

### 2.1 PowerShellで `npx` / `cd` が認識されないエラーが出る

```
npx : 用語 'npx' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。
```

ターミナルのカレントディレクトリが `typing_backend` になっていない、またはシェルの初期化が
完了する前にコマンドが実行された場合に発生することがある。ターミナルを開き直すか、
`Set-Location typing_backend` を先に単独実行してから `npx wrangler dev` を実行する。

### 2.2 `Missing entry-point to Worker script`

`wrangler dev` を `typing_backend` ディレクトリ以外（リポジトリルートなど）から実行すると発生する。
`wrangler.toml` がある `typing_backend/` 直下で実行すること。

### 2.3 `wrangler dev` が古いバージョンで警告が出る

```
▲ [WARNING] The version of Wrangler you are using is now out-of-date.
```

動作に支障はないが、最新化する場合は以下を実行する。

```bash
npm install --save-dev wrangler@4
```

メジャーバージョンアップ時は破壊的変更がある可能性があるため、更新後に
`npm run dev` と `db:migrate:local` が問題なく動くことを確認すること。

### 2.4 `SERVER_MISCONFIGURED` が返る

`.dev.vars`（ローカル）または `wrangler secret put SERVER_SECRET`（本番）で
`SERVER_SECRET` が未設定の場合に発生する。1.2節の手順で `.dev.vars` を作成する。

### 2.5 セッション関連エラー（`INVALID_TOKEN` / `SESSION_NOT_FOUND` / `ALREADY_SUBMITTED`）

- `INVALID_TOKEN`: トークンの署名不一致。`SERVER_SECRET` がstart時とsubmit時で異なる（環境を跨いでいる等）可能性
- `SESSION_NOT_FOUND`: D1にセッションが存在しない。ローカルDBをリセットした後に古いトークンを使っていないか確認
- `ALREADY_SUBMITTED`: 同一セッションで2回目のsubmitを行った（意図した動作）

---

## 3. フロントエンド（Nuxt）をローカルで動かす

```bash
cd tsuka_typing
npm install
npm run dev
```

`http://localhost:3000` で起動する。バックエンドAPIのURLは環境変数/設定でローカルWorkers
（`http://127.0.0.1:8787`）を指すようにしておくこと。

---

## 4. 共有データ（words.json / kana-map.json）を変更した場合

`shared-data/` を修正した後、以下を実行して両プロジェクトに同期する
（`predev`/`prebuild` フックで自動実行されるが、手動で行う場合）。

```bash
node shared-data/sync.mjs
```
