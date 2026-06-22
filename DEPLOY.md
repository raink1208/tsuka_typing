# Cloudflare Pages デプロイ手順

## ビルド設定

Cloudflare Pages の設定画面で以下を指定：

| 項目 | 値 |
|------|-----|
| Framework preset | None |
| Build command | `npm run generate` |
| Build output directory | `dist` |
| Node.js version | 20 |

## ローカル確認

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 静的ビルド（本番用）
npm run generate

# ビルド結果をプレビュー
npm run preview
```

## 画像ファイル配置

キャラクター立ち絵は以下に配置してください：

```
public/images/tsukasa/
├── idle.png    （通常立ち絵）
├── attack.png  （攻撃時立ち絵）
└── damage.png  （ダメージ時立ち絵）
```

画像がない場合はプレースホルダーが自動で表示されます。
