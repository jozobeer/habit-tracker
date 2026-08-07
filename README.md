# 習慣トラッカー

毎日続けたい習慣をリストに登録し、実行した日はチェックを入れて記録する静的単一ページアプリ。習慣一覧とチェック状態はlocalStorageに保存され、リロードしても消えない。

## 公開URL

https://habit-tracker.jozo.beer

## 開発

[kojo](https://github.com/jozobeer/kojo)（1日1アプリ自動生成基盤）により生成されたリポジトリです。

初回セットアップ: `npm install`（Playwright ブラウザ未取得の環境では `npx playwright install chromium`）

- `npm test` — Playwright によるブラウザテスト
- `npm run verify` — 不変条件チェック（favicon / apps.jozo.beer フッター）
- `npm run deploy` — Cloudflare Workers へデプロイ

## 構成

- `public/index.html` — アプリ本体（CSS/JSインラインの単一ファイル）
- `PLAN.md` — 受け入れ条件付きの実装計画
