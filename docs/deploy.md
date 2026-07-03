# デプロイ手順

このプロジェクトは以下の2つを別々にデプロイする。

| コンポーネント | パス | デプロイ先 |
|---|---|---|
| フロントエンド | `tsuka_typing/` | Cloudflare Pages |
| バックエンド | `typing_backend/` | Cloudflare Workers + D1 |

---

## 1. バックエンド（Cloudflare Workers + D1）

### 1.1 初回セットアップ

```bash
cd typing_backend
npm install
```

D1データベースをまだ作成していない場合は作成する。

```bash
npx wrangler d1 create tsuka-typing-db
```

実行すると `database_id` が発行されるので、[wrangler.toml](../typing_backend/wrangler.toml) の
`database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"` を発行された値に置き換える。

### 1.2 シークレットの設定

`SERVER_SECRET`（セッショントークン署名用）はリポジトリに含めないため、本番環境には
`wrangler secret put` で設定する。

```bash
npx wrangler secret put SERVER_SECRET
```

プロンプトが表示されたら、十分に長いランダム文字列を入力する。

`CORS_ORIGIN` は非機密情報のため [wrangler.toml](../typing_backend/wrangler.toml) の `[vars]` に直接記載する
（フロントエンドの本番URLに合わせて更新すること）。

### 1.3 スキーマ（マイグレーション）の適用

```bash
# ローカル（wrangler dev用シミュレーションDB）
npm run db:migrate:local

# 本番（リモートD1）
npm run db:migrate:remote
```

マイグレーションSQLは [migrations/0001_init.sql](../typing_backend/migrations/0001_init.sql) にある。
スキーマを変更する場合はこのファイルに追記し、両方の環境で再実行する。

### 1.4 デプロイ

```bash
npm run deploy
```

内部的に `predeploy` フックで共有データ（`shared-data/`）の同期→`wrangler deploy` が実行される。
デプロイ後、Workers のURL（`https://tsuka-typing-backend.<subdomain>.workers.dev`）が表示される。

### 1.5 デプロイ後の確認

```bash
curl https://<workers-url>/health
```

`{"status":"ok","time":"..."}` が返ればOK。

---

## 2. フロントエンド（Cloudflare Pages）

### 2.1 ビルド設定（Cloudflare Pages 管理画面）

| 項目 | 値 |
|------|-----|
| Framework preset | None |
| Build command | `npm run generate` |
| Build output directory | `dist` |
| Node.js version | 20 |
| Root directory | `tsuka_typing` |

### 2.2 環境変数

バックエンドのAPI URLをフロントエンドに渡す環境変数を、Cloudflare Pages側で設定する
（`nuxt.config.ts` の `runtimeConfig`/`public` 設定に合わせること）。バックエンドをデプロイし直した際は
URLが変わらないことを確認する（カスタムドメイン推奨）。

### 2.3 ローカルビルド確認（デプロイ前チェック）

```bash
cd tsuka_typing
npm install
npm run generate
npm run preview
```

### 2.4 画像ファイル配置

キャラクター立ち絵は以下に配置する（未配置の場合はプレースホルダーが表示される）。

```
public/images/tsukasa/
├── idle.png    （通常立ち絵）
├── attack.png  （攻撃時立ち絵）
└── damage.png  （ダメージ時立ち絵）
```

---

## 3. デプロイ順序の注意

1. 先にバックエンド（Workers）をデプロイし、URLを確定させる
2. フロントエンドの環境変数にそのURLを設定してからデプロイする
3. バックエンドのCORS設定（`CORS_ORIGIN`）にフロントエンドの本番URLを設定する

バックエンドのスキーマ変更を伴うデプロイでは、`db:migrate:remote` を **先に** 実行してから
`npm run deploy` すること（新しいコードが未作成のテーブル/カラムを参照するのを防ぐため）。
