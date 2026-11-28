# 内部 API 一覧

## 認証方式

reply-watch が同一ホストのブリッジ用 Bearer トークンを検証する。トークンは実行環境から渡す。

## API一覧

| メソッド | パス | 処理概要 | 認証の有無 | 操作可能権限 | 詳細 |
| --- | --- | --- | --- | --- | --- |
| PUT | `/internal/reply/{source_id}/pending` | 用件を返信待ちにする | 〇 | ブリッジ | [詳細](features/reply-tracking/API.md#返信待ちの登録) |
| PUT | `/internal/reply/{source_id}/done` | 用件を完了にする | 〇 | ブリッジ | [詳細](features/reply-tracking/API.md#完了の登録) |
