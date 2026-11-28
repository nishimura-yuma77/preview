# 外部 API 一覧

## 認証方式

nginx が HTTPS で Basic 認証を行う。

## API一覧

| メソッド | パス | 処理概要 | 認証の有無 | 操作可能権限 | 詳細 |
| --- | --- | --- | --- | --- | --- |
| GET | `/task/api/pending` | 返信待ち一覧の取得 | 〇 | 一覧閲覧者 | [詳細](features/reply-tracking/API.md#get-taskapipending) |
