# reply-watch

返信待ちの用件を一覧にする。ブリッジは連携元ID（`source_id`）を指定して「返信待ち」または「完了」を登録する。reply-watch は初回だけ用件ID（`id`）を自動採番し、以降は同じ `source_id` の用件を更新する。

Slack 連携では、ブリッジが `@Bot` 宛ての依頼を識別する。たとえば `#butler` への最終回答が投稿できたら、ブリッジが用件を返信待ちにして、一覧に `#butler` と回答へのリンクが現れる。同じスレッドで誰かが返信したらブリッジが完了を登録し、次の更新でその行が消える。

## 利用方法（設計）

`https://jkdv1.net/task` に Basic 認証でアクセスする。一覧は5秒ごとに更新され、リンクを開くと Slack で回答を確認できる。Slack 側での閲覧には、そのチャンネルへのアクセス権が必要となる。

```text
ブラウザ → nginx ── 静的画面 (public/)
                └─ 読取 API ─┐
Slack ↔ ブリッジ → 内部 API ──┴→ reply-watch アプリ層 → SQLite
```

## 開発環境

`reply-watch/` で実行する。

```sh
nvm install
nvm use
node --version  # v24.22.2
```

## 設計書

| 読みたい内容 | 参照先 |
| --- | --- |
| 何を返信待ちと呼ぶか | [ドメイン用語](docs/spec/DOMAIN_TERMS.md)・[ユースケース](docs/spec/features/reply-tracking/USECASE.md) |
| どこで状態を判断するか | [アーキテクチャ](docs/spec/ARCHITECTURE.md)・[データベース設計](docs/spec/DATABASE.dbml) |
| どこから何を呼べるか | [外部 API 一覧](docs/spec/EXTERNAL_API_INDEX.md)・[内部 API 一覧](docs/spec/INTERNAL_API_INDEX.md)・[API 詳細](docs/spec/features/reply-tracking/API.md) |
