# 内部 API 一覧

## 認証方式

reply-watch が同一ホストのブリッジ用 Bearer トークンを検証する。トークンは実行環境から渡す。

## API一覧

| メソッド | パス | 処理概要 | 認証の有無 | 操作可能権限 | 詳細 |
| --- | --- | --- | --- | --- | --- |
| POST | `/internal/slack-events` | Slack 投稿の通知 | 〇 | Slack ブリッジ | [詳細](features/reply-tracking/API.md#post-internalslack-events) |
