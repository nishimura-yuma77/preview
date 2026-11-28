# 内部向けAPI一覧

## 目次

- [API一覧](#api一覧)
- [認証方式](#認証方式)
- [共通レスポンス](#共通レスポンス)
- [エラーコード一覧](#エラーコード一覧)

## API一覧

認証が必要なものを〇とする。

| メソッド | パス | 処理概要 | 認証の有無 | 操作可能権限 | 詳細 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | マーケターユーザーを認証し、認証CookieとCSRF Tokenを発行する | - | - | [マーケターログイン](features/auth/API.md#post-apiv1authlogin) |
| POST | `/api/v1/admin/auth/login` | 管理者ユーザーを認証し、認証CookieとCSRF Tokenを発行する | - | - | [管理者ログイン](features/auth/API.md#post-apiv1adminauthlogin) |
| GET | `/api/v1/auth/me` | 本人情報と有効な管理者・マーケターロールの有無を返す | 〇 | 認証済みユーザー | [本人情報](features/auth/API.md#get-apiv1authme) |
| POST | `/api/v1/auth/csrf` | 認証済みユーザーのCSRF Tokenを再発行する | 〇 | 認証済みユーザー | [CSRF再発行](features/auth/API.md#post-apiv1authcsrf) |
| POST | `/api/v1/auth/logout` | 認証CookieとCSRF Cookieを削除する | - | - | [ログアウト](features/auth/API.md#post-apiv1authlogout) |
| GET | `/api/v1/admin/users` | 自社ユーザーを20件ずつ取得する | 〇 | 管理者ユーザー | [ユーザー一覧](features/users/API.md#get-apiv1adminusers) |
| POST | `/api/v1/admin/users` | 自社の招待中ユーザーと招待リンクを作成してメールを送信する | 〇 | 管理者ユーザー | [新規招待](features/users/API.md#post-apiv1adminusers) |
| PATCH | `/api/v1/admin/users/{user_id}` | 自社ユーザーの表示名・保有ロールを部分更新する | 〇 | 管理者ユーザー | [ユーザー編集](features/users/API.md#patch-apiv1adminusersuser_id) |
| POST | `/api/v1/admin/users/{user_id}/suspensions` | 自社ユーザーを停止する | 〇 | 管理者ユーザー | [利用停止](features/users/API.md#post-apiv1adminusersuser_idsuspensions) |
| POST | `/api/v1/admin/users/{user_id}/reactivations` | 停止中の自社ユーザーを招待中へ戻し、登録案内を送信する | 〇 | 管理者ユーザー | [利用再開](features/users/API.md#post-apiv1adminusersuser_idreactivations) |
| POST | `/api/v1/admin/users/{user_id}/invitations` | 自社の招待中ユーザーへ新しい招待リンクを再送する | 〇 | 管理者ユーザー | [招待再送](features/users/API.md#post-apiv1adminusersuser_idinvitations) |
| POST | `/api/v1/invitation-acceptances` | 新規招待・利用再開のリンクからパスワードを設定する | - | - | [招待受諾](features/users/API.md#post-apiv1invitation-acceptances) |
| GET | `/api/v1/company-information` | 自社の企業情報を取得する | 〇 | マーケターユーザー | [企業情報の取得](features/company-information/API.md#get-apiv1company-information) |
| PUT | `/api/v1/company-information` | 自社の企業情報を初回登録または更新する | 〇 | マーケターユーザー | [企業情報の保存](features/company-information/API.md#put-apiv1company-information) |
| GET | `/api/v1/posts` | 自社の公開済み投稿を絞り込み・並び替え・意味検索して取得する | 〇 | マーケターユーザー | [公開済み投稿一覧](features/posts/API.md#get-apiv1posts) |
| GET | `/api/v1/metrics` | 自社の公開済み投稿の期間全体集計と施策別集計ページを取得する | 〇 | マーケターユーザー | [計測結果集計](features/metrics/API.md#get-apiv1metrics) |
| POST | `/api/v1/agent-sessions` | 本人所有の空のPrototype Sessionを作成する | 〇 | マーケターユーザー | [Session作成](features/chat/API.md#create-session) |
| GET | `/api/v1/agent-sessions` | 本人のPrototype Sessionを更新日時順でページングする | 〇 | マーケターユーザー | [一覧取得](features/chat/API.md#list-sessions) |
| GET | `/api/v1/agent-sessions/{session_id}` | 保存済み履歴と会話全体の実行状態を取得する | 〇 | マーケターユーザー | [履歴取得](features/chat/API.md#get-history) |
| POST | `/api/v1/agent-sessions/{session_id}/turns` | 初回入力または提示への回答を受け付け、同じPOSTでSSEを返す | 〇 | マーケターユーザー | [Turn実行](features/chat/API.md#execute-turn) |

Turn単体GET・SSE購読用GET・回答種別ごとのPOST・専用retryは設けない。Session配下の施策保存・X公開APIは現Prototypeへ公開しない。

## 認証方式

認証が必要なAPIでは、`hiromeru_session` Cookieの署名付きJWTを使う。

| 担当 | 責務 |
| --- | --- |
| [各APIの受付関数](../../backend/api/routers/) | 必要な認証・認可処理をFastAPIの`Depends`で指定する。 |
| [`backend/api/deps.py`](../../backend/api/deps.py) | JWTと必要なCSRFを検証し、`AuthService`を呼ぶ。 |
| [`AuthService`](features/auth/modules/AUTH_SERVICE.md) | DBで本人を照合し、必要なロールを確認する。 |

詳細は[認証API設計](features/auth/API.md#共通の認証と認可)を参照する。

## 共通レスポンス

HTTPステータスコードはHTTPレスポンスで伝える。成功時のステータスは各APIで定義し、エラー時は[エラーコード一覧](#エラーコード一覧)の対応を使用する。

### 成功レスポンス

#### JSON形式

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

#### 項目

| 項目 | 型 | 内容 |
| --- | --- | --- |
| success | boolean | true |
| data | 各APIで定義 | 処理結果。内容・型は各APIで定義する |
| error | null | 常にnull |

### エラーレスポンス

#### JSON形式

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "エラーコード",
    "message": "利用者向けの説明"
  }
}
```

#### 項目

| 項目 | 型 | 内容 |
| --- | --- | --- |
| success | boolean | false |
| data | null | 常にnull |
| error | object | エラー情報 |
| error.code | string | [エラーコード一覧](#エラーコード一覧)で定義する、失敗理由を識別するコード |
| error.message | string | 利用者へ表示する説明 |

### 例外からのレスポンス変換

共通例外ハンドラはFastAPIアプリケーションの生成時に一度登録し、各APIへ共通適用する。

| 例外 | HTTPステータス | エラー情報 |
| --- | --- | --- |
| 業務例外（AppError） | 例外のcodeに対応するステータス | 例外のcode・message |
| リクエスト入力検証エラー | 400 | INVALID_ARGUMENTと入力不備の説明 |
| 検索Embedding生成失敗（EmbeddingError） | 500 | EMBEDDING_FAILEDと利用者向けの共通メッセージ |
| 想定外の例外 | 500 | INTERNAL_ERRORと利用者向けの共通メッセージ |

WAFの応答とSSE開始後のイベントは共通JSON変換の対象から除外し、各APIの契約に従う。

## エラーコード一覧

| エラーコード | HTTPステータス | 意味 |
| --- | --- | --- |
| INVALID_ARGUMENT | 400 | 入力不備 |
| INVITATION_LINK_INVALID | 400 | 招待リンクを利用できない |
| INVALID_CREDENTIALS | 401 | ログイン認証失敗 |
| UNAUTHENTICATED | 401 | 本人認証が成立しない |
| CSRF_VALIDATION_FAILED | 403 | CSRF検証失敗 |
| ADMIN_FORBIDDEN | 403 | 管理者権限不足 |
| MARKETER_FORBIDDEN | 403 | マーケター権限不足 |
| ADMIN_USER_NOT_FOUND | 404 | 操作対象のユーザーを参照できない |
| AGENT_SESSION_NOT_FOUND | 404 | 操作対象の会話を参照できない |
| AGENT_PRESENTATION_NOT_FOUND | 404 | 回答対象の提示を参照できない |
| CAMPAIGN_NOT_FOUND | 404 | 操作対象の施策を参照できない |
| NOT_ACCEPTABLE | 406 | 要求された応答形式に対応できない |
| USER_INVITATION_CONFLICT | 409 | 招待先メールアドレスの競合 |
| USER_ROLE_CHANGE_FORBIDDEN | 409 | 管理者ロールの保持条件違反 |
| USER_SUSPENSION_FORBIDDEN | 409 | 利用停止が禁止された対象への操作 |
| USER_STATE_CONFLICT | 409 | ユーザーの利用状態と操作の競合 |
| AGENT_SESSION_ALREADY_STARTED | 409 | 初回入力が受付済み |
| TURN_IN_PROGRESS | 409 | 会話の実行中Turnとの競合 |
| AGENT_PRESENTATION_CONFLICT | 409 | 回答対象の提示と会話状態の競合 |
| INTERNAL_ERROR | 500 | 想定外の内部エラー |
| EMBEDDING_FAILED | 500 | 検索Embeddingの生成失敗 |
| AGENT_SESSION_SAVE_FAILED | 500 | 会話の作成結果の保存失敗 |
| INVITATION_SEND_FAILED | 502 | 設定案内メールの明確な送信失敗 |
| INVITATION_SEND_OUTCOME_UNKNOWN | 504 | 設定案内メールの送信結果不明 |
