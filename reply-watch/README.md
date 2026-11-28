# reply-watch

返信待ちの用件を一覧にする。ブリッジは連携元ID（`source_id`）を指定して「返信待ち」または「完了」を登録する。reply-watch は初回だけ用件ID（`id`）を自動採番し、以降は同じ `source_id` の用件を更新する。

Slack 連携では、ブリッジが `@Bot` 宛ての依頼を識別する。たとえば `#butler` への最終回答が投稿できたら、ブリッジが用件を返信待ちにして、一覧に `#butler` と回答へのリンクが現れる。同じスレッドで誰かが返信したらブリッジが完了を登録し、次の更新でその行が消える。

## 利用方法

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

## 配置

1. 初回のみ `reply-watch/` で `mkdir -p data` を実行し、`sqlite3 data/tasks.sqlite < migrations/001-init.sql` でDBを準備する。
2. 十分に長いランダムな `REPLY_WATCH_TOKEN` を生成し、同じ値を `reply-watch/runtime.env` とブリッジの `opencode-slack/secrets.env` に設定する。両ファイルの権限は `600`。ブリッジはトークン設定後に受理したメンションから追跡する。
3. Slack アプリを対象チャンネルに参加させ、`app_mention` と対応する `message.channels` / `message.groups` を購読する。チャンネル名取得用の `channels:read` / `groups:read` と、対象会話を受信する履歴権限も付与する。
4. ルートで `htpasswd -cB nginx/reply-watch.htpasswd <閲覧者名>` を実行する（初回のみ）。`docker compose --profile reply-watch up -d reply-watch nginx` で起動し、更新したブリッジを通常の再起動手順で反映する。nginx と API は Linux のホストネットワークを使い、API は `127.0.0.1:8787` だけで待ち受ける。既存のホスト設定に統合する場合は他のマウント・location を保持する。

## 設計書

| 読みたい内容 | 参照先 |
| --- | --- |
| 何を返信待ちと呼ぶか | [ドメイン用語](docs/spec/DOMAIN_TERMS.md)・[ユースケース](docs/spec/features/reply-tracking/USECASE.md) |
| どこで状態を判断するか | [アーキテクチャ](docs/spec/ARCHITECTURE.md)・[データベース設計](docs/spec/DATABASE.dbml) |
| どこから何を呼べるか | [外部 API 一覧](docs/spec/EXTERNAL_API_INDEX.md)・[内部 API 一覧](docs/spec/INTERNAL_API_INDEX.md)・[API 詳細](docs/spec/features/reply-tracking/API.md) |
