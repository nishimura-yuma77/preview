# reply-watch

Slack で Bot が最終回答を送ったあと、人からの返信を待っているスレッドを一覧にする。たとえば `#butler` で `@Bot` に依頼すると、最終回答の投稿成功後に一覧へ `#butler` とその回答へのリンクが現れる。同じスレッドで誰かが返信すると、次の更新でその行が消える。

## 利用方法（設計）

`https://jkdv1.net/task` に Basic 認証でアクセスする。一覧は5秒ごとに更新され、リンクを開くと Slack で回答を確認できる。Slack 側での閲覧には、そのチャンネルへのアクセス権が必要となる。

```text
ブラウザ → nginx ── 静的画面 (public/)
                └─ 読取 API ─┐
Slack ↔ ブリッジ → 内部 API ──┴→ reply-watch アプリ層 → SQLite
```

## 設計書

| 読みたい内容 | 参照先 |
| --- | --- |
| 何を返信待ちと呼ぶか | [ドメイン用語](docs/spec/DOMAIN_TERMS.md)・[ユースケース](docs/spec/features/reply-tracking/USECASE.md) |
| どこで状態を判断するか | [アーキテクチャ](docs/spec/ARCHITECTURE.md)・[データベース設計](docs/spec/DATABASE.dbml) |
| どこから何を呼べるか | [外部 API 一覧](docs/spec/EXTERNAL_API_INDEX.md)・[内部 API 一覧](docs/spec/INTERNAL_API_INDEX.md)・[API 詳細](docs/spec/features/reply-tracking/API.md) |
