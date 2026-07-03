/**
 * Cloudflare Workers 環境変数・バインディングの型定義。
 * wrangler.toml の [[d1_databases]] / [vars] / secrets と対応させること。
 */
export type Bindings = {
  /** D1 データベース（wrangler.toml の d1_databases.binding と一致させる） */
  DB: D1Database
  /** セッショントークン署名用シークレット（`wrangler secret put SERVER_SECRET` で設定） */
  SERVER_SECRET: string
  /** CORS で許可するオリジン（未設定時は http://localhost:3000 にフォールバック） */
  CORS_ORIGIN?: string
}
