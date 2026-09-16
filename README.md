# 習慣トラッカー

毎日の習慣を登録し、今日やったかをチェック1つで記録する静的単一ページアプリ。日付ごとの実行記録は localStorage に残り、直近7日の履歴ドットと連続実行日数で継続状況を確認できる。

## 機能

- 習慣名を入力して追加（ボタンまたは Enter）。空文字・空白のみは追加されない
- 各習慣のチェックボックスで「今日実行済み」を記録（日付キー `YYYY-MM-DD` 単位）
- リロード後も習慣一覧と当日のチェック状態を復元
- 削除すると一覧と localStorage のチェック記録の両方から除去
- 日付が変わると当日チェックは未チェック表示になり、前日以前の記録は保持
- 各習慣に直近7日の履歴ドットと連続実行日数バッジを表示
- 履歴ドットを押して過去日のチェックを付け外しできる（記録し忘れの補完）
- 習慣が0件のときは空状態メッセージを表示

## 公開URL

https://habit-tracker.jozo.beer

## 開発

[kojo](https://github.com/jozobeer/kojo)（1日1アプリ自動生成基盤）により生成されたリポジトリです。

初回セットアップ: `npm install`（Playwright ブラウザ未取得の環境では `npx playwright install chromium`）

- `npm test` — Playwright によるブラウザテスト
- `npm run verify` — 不変条件チェック（favicon / apps.jozo.beer フッター）
- `npm run deploy` — Cloudflare Workers へデプロイ

## 構成

- `public/index.html` — アプリ本体（CSS/JSインラインの単一ファイル。状態キー `habit-tracker:v1`）
- `tests/app.spec.ts` — 受け入れ条件に対応する Playwright テスト（現状の正）
- `PLAN.md` — 初回実装時の計画（歴史的文書）
