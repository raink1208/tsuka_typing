#!/usr/bin/env node
/**
 * shared-data 配下の JSON（words.json / kana-map.json）を単一の情報源として、
 * フロントエンド（tsuka_typing）とバックエンド（typing_backend）にコピーする同期スクリプト。
 *
 * 単語やローマ字パターンを追加・修正する場合は、このディレクトリの JSON のみを編集し、
 * 以下のいずれかの方法で反映する。
 *   - `node shared-data/sync.mjs` を直接実行する
 *   - 各パッケージで `npm run dev` / `npm run build` を実行する（predev/prebuild で自動同期）
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FILES = ['words.json', 'kana-map.json']

const TARGET_DIRS = [
  join(__dirname, '../tsuka_typing/data'),
  join(__dirname, '../typing_backend/src/shared'),
]

for (const targetDir of TARGET_DIRS) {
  mkdirSync(targetDir, { recursive: true })
  for (const file of FILES) {
    const content = readFileSync(join(__dirname, file), 'utf-8')
    writeFileSync(join(targetDir, file), content)
    console.log(`synced shared-data/${file} -> ${targetDir}/${file}`)
  }
}
