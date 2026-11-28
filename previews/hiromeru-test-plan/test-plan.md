# Hiromeru テスト変更案

一覧未承認・テスト未実行。提案82メソッド／297ケース、廃止15件。導出保留26項目は本数・ケース数から除外。未対応の設計行18項目。

- 旧#15/#16: 除外 — 旧revisionからの移行・空DBのスキーマ照合は、規約のテスト対象に該当しない。
- 旧#17/#18/#19/#20: 除外 — DBMLから独立した保存層・DB制約テストを追加する規定がない。公開API・公開メソッドの対象とも未対応。
- 旧#11: 除外 — marketer_writerの例外表は権限不足のみ。依存チェーンのCSRF順序を別メソッドとして増設する根拠がない。
- 旧#22/#25: 除外 — get_sessionの公開メソッド定義・戻り値契約が現設計に存在しない。
- 旧#34: 除外 — DI公開関数の定義とモデル・Runner・Taskの生成回数0の仕様がない。
- 旧#46: 除外 — 要求中の認可維持は共通仕様。独立したAPI呼び出しケースとして本数を増設する根拠がない。
- 旧#98/#100/#112/#114: 除外 — 初期空表示・読込表示の独立ケースを、項目定義から追加する規定がない。操作・エラー行に対応する結果として扱う。
- 旧#124/#125: 除外 — mainには終了コードの仕様があるが例外表がなく、終了コードごとの独立単体テストを導く規定がない。
- 旧#26: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#27: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#28: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#29: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#30: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#31: 導出保留 — APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。
- 旧#89: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#90: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#91: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#92: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#93: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#94: 導出保留 — 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。
- 旧#95: 導出保留 — Shellの表示項目はあるが提供操作行とAPI有無が未定義。表示条件だけからケースを追加しない。
- 旧#96: 導出保留 — Shellの表示項目はあるが提供操作行とAPI有無が未定義。表示条件だけからケースを追加しない。
- 旧#97: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#101: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#107: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#108: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#109: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#110: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#111: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#115: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#119: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#120: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#121: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#122: 導出保留 — 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。
- 旧#3/#4: 根拠修正 — ロール状態による2分割を撤回し、認証APIの関連ユースケース2行へ対応。
- 旧#12/#13/#14/#21/#23/#62/#63/#64/#65/#66/#67/#126/#127/#129/#130/#131/#132/#133: 検証境界修正 — 公開契約から導く単体テストへ修正。DBはFake/Mock、実DBでの独立スキーマ・SQL結果・原子性テストの追加を撤回。SQLの抽出・順序・集計結果はAPI結合の既定ケースで確認。
- 旧#137/#138: 追加対応 — 既存案で漏れていたConversation.listとTask.runの公開正常系各1本を対応づけ。
- 旧#40: 除外 — 会話一覧の「表示対象の分離」1行は旧 #039 に統合。同社・他社という入力差でメソッドを分割しない。
- 旧#72/#73/#74/#75/#76/#77/#78/#79/#80: 統合 — 同一公開メソッドの同じ例外型を旧 #72 の1メソッドへ統合。条件・コード・メッセージはケース側に保持。
- 旧#84/#85/#86/#87: 統合 — 同一公開メソッドの同じ例外型を旧 #84 の1メソッドへ統合。条件・コード・メッセージはケース側に保持。
- 旧#99/#113/#134/#135/#136: 行別対応 — 異なる画面の明示的な先頭操作行をそれぞれ1ケースへ対応。状態直積は作成しない。
- 旧#127/#128: 統合 — 同一公開メソッドの同じ例外型を旧 #127 の1メソッドへ統合。条件・コード・メッセージはケース側に保持。
- 旧#12/#13/#39/#44/#47/#48/#49/#56/#57/#71/#72/#84/#127/#131/#132: 再確認修正 — 共通fixtureの実DB記述、DTO保存値の混同、名前と準備のずれ、例外入力の曖昧さを修正。SQLの順序・同値境界は既定API正常メソッド内へ対応。

- 未対応: 検索語を入力する / docs/specs/features/posts/SCREEN_DESIGN.md:50 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 施策の候補を探す / docs/specs/features/posts/SCREEN_DESIGN.md:51 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 施策を選ぶ / docs/specs/features/posts/SCREEN_DESIGN.md:52 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 詳細条件を開閉する / docs/specs/features/posts/SCREEN_DESIGN.md:53 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 公開日の開始を入力する / docs/specs/features/posts/SCREEN_DESIGN.md:54 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 公開日の終了を入力する / docs/specs/features/posts/SCREEN_DESIGN.md:55 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 検索を押す / docs/specs/features/posts/SCREEN_DESIGN.md:56 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 並び順を変更する / docs/specs/features/posts/SCREEN_DESIGN.md:57 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 条件をクリアする / docs/specs/features/posts/SCREEN_DESIGN.md:58 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 施策未選択 / docs/specs/features/posts/SCREEN_DESIGN.md:91 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 期間不備 / docs/specs/features/posts/SCREEN_DESIGN.md:92 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 候補取得失敗 / docs/specs/features/posts/SCREEN_DESIGN.md:93 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 開始日を入力する / docs/specs/features/metrics/SCREEN_DESIGN.md:51 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 終了日を入力する / docs/specs/features/metrics/SCREEN_DESIGN.md:52 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 適用を押す / docs/specs/features/metrics/SCREEN_DESIGN.md:53 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 全期間を押す / docs/specs/features/metrics/SCREEN_DESIGN.md:54 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 期間不備 / docs/specs/features/metrics/SCREEN_DESIGN.md:101 — 旧案に対応漏れ。設計行との対応と具体的条件を確定してから1ケースを定義する。現在の提案本数・ケース数から除外。
- 未対応: 会話APIの既存ケースとの対応 / docs/specs/features/chat/API.md:91-636 — 旧案が扱わなかった正常ケース・既存エラーは、既存テストとの照合が未完了。対応未確認を新規追加件数とせず、未確認として管理。

## 利用者とロール
認証・一覧はUser101／Marketer301／Admin401／会社201。会話・デモはUser21／Marketer11／会社1。同社の別人User22、他社User23／会社2。登録状態は通常registered。固定UTC日時を使う。外部サービスはFakeまたはMock。

## R9：ロールの状態
N＝行なし、E＝有効、D＝無効。IDはadmin／marketerの順。
ID | admin / marketer | is_admin / is_marketer
NN | N / N | false / false
NE | N / E | false / true
ND | N / D | false / false
EN | E / N | true / false
EE | E / E | true / true
ED | E / D | true / false
DN | D / N | false / false
DE | D / E | false / true
DD | D / D | false / false

## P6：投稿・計測の共通データ
会社201の公開成功済み投稿。施策12はアーカイブ済み。日時は2026年10月のUTC。S＝投稿6・完了4・待ち1・失敗1・PV710・流入81・率81/710。 API結合の正常ケースには他社投稿・公開失敗投稿も置き、返却・集計からの除外を同じケースで確認する。 会社境界用に投稿901は会社202/施策202、902は投稿側201/施策側202、903は投稿側202/施策側201、904は会社201の公開失敗投稿を置く。全て返却・集計から除外。各ケースのデータは独立準備。
投稿 | 施策 | 公開日時 | 計測状態 | PV / 流入
101 | 12 | 10-01 00:00Z | completed | 10 / 1
102 | 12 | 10-02 00:00Z | completed | 100 / 10
103 | 12 | 10-02 00:00Z | completed | 100 / 20
104 | 12 | 10-03 00:00Z | pending | 部分値999 / 999
105 | 12 | 10-03 00:00Z | failed | 部分値999 / 999
106 | 13 | 10-04 00:00Z | completed | 500 / 50

## O4：参照不可の会話
認証済み本人はUser21、Session101、対象定義prototype。
ID | 条件 | 期待
same-company-owner22 | 同社User22が所有 | 参照拒否
other-company-owner23 | 他社User23が所有 | 同じ参照拒否
missing | Session101なし | 同じ参照拒否
research-owner21 | 本人所有だがresearch | 同じ参照拒否

## F3：チャットの権限不足
本人認証は成立させ、POSTには有効なOriginと本人用CSRFを与える。
ID | 状態 | 期待
no-role | 両ロールなし | 403 MARKETER_FORBIDDEN
admin-only | 有効adminだけ | 同上
disabled-marketer | marketer行が無効 | 同上

## Frontendの入力と通信境界
Vitest・jsdomで実画面を描画し、通信境界をMock。parser・controller単体テストや、新しいPlaywright画面結合テストは作らない。
集合 | 入力・応答
認証 | User2。M=/login → /api/v1/auth/login → /chat。A=/admin/login → /api/v1/admin/auth/login → /admin/users。next未指定。メールmarketer@example.testまたはadmin@example.test、パスワードExamplePassword1!。新応答にmarketer_idを含めない。
P：投稿 | 施策12、公開日2026-10-01〜10-31（日本時間）、公開日時降順、limit20。APIは09-30T15:00Z以上・10-31T15:00Z未満。初回101、続き102、復帰103。不透明cursor C-P / OLD-P。
T：計測 | 同じ公開期間、limit20。初回summary＝投稿3・PV1000・流入50・率0.05。更新summary＝投稿4・PV2000・流入120・率0.06。施策12、続き11。不透明cursor C-M / OLD-M。
server | 旧cursor付きURLを実async Pageから初期表示。
client | 正常先頭のnext_cursorを実画面の「次の20件」で送る。
復帰 | cursor付き400の後、cursorだけ除去して同条件の先頭を1回取得する。

## デモCLI単体の依存
DBセッション・接続設定・時計・投入先照合・保存処理はFake/Mock。実DBへの接続と別transactionでの行復元確認は対象外。User21はregistered、User999なし、別人User22。外部通信・実Taskなし。
依存 | 確認する契約
main | runをMockに差し替え、確定済み結果のJSON出力を確認。DB準備なし。
run | 入力・環境の検証、取得と削除・投入の委譲、identity照合後のcommit、例外時の開始済み操作のrollbackと終了。
seed_demo | 取得と保存をFakeに委譲。所有者User21、投入済みによる省略、契約どおりの戻り値・例外。自身でcommitしない。

## M4：計測の同PV境界
P6とは独立した会社201の公開成功済み投稿。201→施策13/completed/PV500/流入50、202→施策14/completed/210/21、203→施策12/completed/210/42、204→施策15/pending。全体は投稿4・完了3・待ち1・失敗0・PV920・流入113・率113/920。

## #1 test_マーケターログインは本人のユーザーIDを返す_User101とMarketer301なら200でuser_id101とメールとCSRF_Tokenを返す
対象: backend/tests/integration/test_auth.py
設計根拠: docs/specs/features/auth/API.md POST /auth/login：マーケターユーザーとしてログインする 行53
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: registered、有効marketer301、正しいパスワード。 → 200。user_id101・メール・CSRF Token、marketer_idなし。Cookie/JWT/本人束縛を維持。

## #2 test_管理者ログインは本人のユーザーIDを返す_User101とAdmin401なら200でuser_id101とis_admin_trueを返す
対象: backend/tests/integration/test_auth.py
設計根拠: docs/specs/features/auth/API.md POST /admin/auth/login：管理者ユーザーとしてログインする 行189
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: registered、有効admin401、正しいパスワード。 → 200。user_id101・メール・is_admin=true・CSRF Token、marketer_idなし。

## #3 test_GET_auth_meはマーケターログイン入口へ本人情報を返す_User101なら両ロールの有効状態に応じたbooleanを返す
対象: backend/tests/integration/test_auth.py
設計根拠: docs/specs/features/auth/API.md GET /auth/me：マーケターログイン画面での確認 行296
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 9
- NN: マーケターログイン入口から本人情報取得。R9のNN、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- NE: マーケターログイン入口から本人情報取得。R9のNE、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- ND: マーケターログイン入口から本人情報取得。R9のND、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- EN: マーケターログイン入口から本人情報取得。R9のEN、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- EE: マーケターログイン入口から本人情報取得。R9のEE、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- ED: マーケターログイン入口から本人情報取得。R9のED、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- DN: マーケターログイン入口から本人情報取得。R9のDN、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- DE: マーケターログイン入口から本人情報取得。R9のDE、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- DD: マーケターログイン入口から本人情報取得。R9のDD、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。

## #4 test_GET_auth_meは管理者ログイン入口へ本人情報を返す_User101なら両ロールの有効状態に応じたbooleanを返す
対象: backend/tests/integration/test_auth.py
設計根拠: docs/specs/features/auth/API.md GET /auth/me：管理者ログイン画面での確認 行297
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 9
- NN: 管理者ログイン入口から本人情報取得。R9のNN、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- NE: 管理者ログイン入口から本人情報取得。R9のNE、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- ND: 管理者ログイン入口から本人情報取得。R9のND、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- EN: 管理者ログイン入口から本人情報取得。R9のEN、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- EE: 管理者ログイン入口から本人情報取得。R9のEE、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- ED: 管理者ログイン入口から本人情報取得。R9のED、有効JWTのUser101。 → 200。user_id101・email・is_admin=true・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- DN: 管理者ログイン入口から本人情報取得。R9のDN、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。
- DE: 管理者ログイン入口から本人情報取得。R9のDE、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=trueの4項目。Browser要求では認証Cookie更新。
- DD: 管理者ログイン入口から本人情報取得。R9のDD、有効JWTのUser101。 → 200。user_id101・email・is_admin=false・is_marketer=falseの4項目。Browser要求では認証Cookie更新。

## #5 test_csrf_protectedは本人IDで検証する_User101がロールなしでも本人用Tokenが一致すれば同じ本人情報を返す
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md csrf_protected：正常 行147
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: User101、Roleなし、許可Origin、本人101用CSRFのCookieとHeader一致。 → 同じAuthenticatedUserを返す。Roleは要求しない。

## #6 test_csrf_protectedは検証できない要求を拒否する_OriginかTokenが不正ならCSRF_VALIDATION_FAILEDになる
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md csrf_protected：AppError 行153-157
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 6
- origin: 許可外Origin。 → CSRF_VALIDATION_FAILED
- cookie-missing: CSRF Cookie欠落。 → CSRF_VALIDATION_FAILED
- header-missing: CSRF Header欠落。 → CSRF_VALIDATION_FAILED
- token-mismatch: CookieとHeader不一致。 → CSRF_VALIDATION_FAILED
- other-user: User102用署名、CookieとHeader自体は一致。 → CSRF_VALIDATION_FAILED
- tampered: 署名改ざん、CookieとHeader自体は一致。 → CSRF_VALIDATION_FAILED

## #7 test_marketer_readerは取得済みロールで認可する_User101に有効Marketer301があれば同じ本人情報を返す
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md marketer_reader：正常 行244
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: User101、有効marketer301／会社201。 → 同じ本人情報を返す。本人IDとRole IDを混同せず再取得しない。

## #8 test_marketer_readerは権限不足を拒否する_marketerがNoneならMARKETER_FORBIDDENになる
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md marketer_reader：AppError 行250
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: 認証済み、marketer=None。 → MARKETER_FORBIDDEN

## #9 test_marketer_writerはCSRF通過後に認可する_User101に有効Marketer301があれば同じ本人情報を返す
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md marketer_writer：正常 行275
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: User101、有効marketer301、正規CSRF。 → CSRF通過後に認可し、同じ本人情報を返す。

## #10 test_marketer_writerは権限不足を拒否する_CSRF通過済みでもmarketerがNoneならMARKETER_FORBIDDENになる
対象: backend/tests/unit/api/test_auth_dependencies.py
設計根拠: docs/specs/modules/api/AUTH_DEPENDENCIES.md marketer_writer：AppError 行281
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: 正規CSRF、marketer=None。 → MARKETER_FORBIDDEN

## #12 test_create_company_with_responsibleは責任者を登録する_企業Aと本人名とhashならregisteredの本人と同社の有効な両ロールを返す
対象: backend/tests/unit/repositories/test_identity_repository.py
設計根拠: docs/specs/modules/IDENTITY_REPOSITORY.md create_company_with_responsible：正常 行165-213
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: DBセッションFake。企業A・責任者名・正規化メール・hash・固定now。Fakeがflush後のIDを供給。 → 返却IdentityRecordは本人名・registered・世代0・有効両Role・責任者=trueを持つ。共通nowは企業・本人・両Roleの作成/更新の保存値として依存へ渡す。DTOへの日時属性追加は対象外。自身でcommitしない。

## #13 test_IdentityRepositoryのcreate_company_with_responsibleは整合性違反を伝播する_DB依存のIntegrityErrorを同じ例外で送出する
対象: backend/tests/unit/repositories/test_identity_repository.py
設計根拠: docs/specs/modules/IDENTITY_REPOSITORY.md create_company_with_responsible：IntegrityError 行219-220
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 2
- email-unique: DB依存がメール一意制約のIntegrityError Eを送出。 → 同じIntegrityError Eを伝播。自身のcommitなし。rollbackによる実DB復元はこの単体テストの対象外。
- other-integrity: DB依存がメール以外のIntegrityError Eを送出。制約判定自体はDBの責務。 → 同じIntegrityError Eを伝播。自身のcommitなし。

## #14 test_IdentityRepositoryのcreate_company_with_responsibleはDB障害を伝播する_DB依存のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/repositories/test_identity_repository.py
設計根拠: docs/specs/modules/IDENTITY_REPOSITORY.md create_company_with_responsible：SQLAlchemyError 行221
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: 初期登録のDB依存をFakeにし、SQLAlchemyError Eを送出。 → 同一SQLAlchemyError Eを伝播。自身でcommitしない。実DBの復元結果を単体で検証しない。

## #21 test_AgentRecordRepositoryのcreate_sessionは本人IDを保存へ渡す_ロールなしUser21ならowner21の空Sessionを返す
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md RecordStore.create_session：空Sessionの作成 行724
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: DBセッションFake、meta.user_id21、定義prototype。Fakeが保存ID101と日時を供給。 → 保存依存へuser_id21を渡し、返却SessionRecord.user_id21・title=None。会社・Role照合なし。空作成でTurn/Item追加なし。

## #23 test_AgentRecordRepositoryのlist_sessionsは本人の条件を渡す_User21とprototypeとlimit20なら取得したSessionページを返す
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md RecordStore.list_sessions：指定ユーザーと定義のページ取得 行725
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: DB依存Fakeが本人User21のSession101・102と次位置を返す。meta21、prototype、limit20。 → 指定した本人・定義・件数・位置で取得を委譲し、Fakeのページ情報を返す。SQLによる絞込みと順序の実動作をFakeで証明したとは扱わない。

## #24 test_InmemoryAgentRecordRepositoryのcreate_sessionは会社なしで会話を作る_所有者User21なら空のprototypeを返す
対象: backend/tests/unit/harness/test_inmemory_agent_record_repository.py
設計根拠: docs/specs/harness/README.md RecordStore.create_session：空Sessionの作成 行724
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: owner21だけを登録、会社・marketer登録なし。 → user_id21、prototype、Turn/Itemなし。

## #26 導出保留：会話Service — 旧 #26
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / modify
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #27 導出保留：会話Service — 旧 #27
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / modify
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #28 導出保留：会話Service — 旧 #28
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / modify
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #29 導出保留：会話Service — 旧 #29
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / modify
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #30 導出保留：会話Service — 旧 #30
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / add
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #31 導出保留：会話Service — 旧 #31
対象: backend/tests/unit/test_agent_service.py
設計根拠: docs/specs/features/chat/API.md 認可・各API / docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール / O4：参照不可の会話
状態: derivation-pending / add
保留理由: APIに役割の記載はあるが、対象Serviceの公開メソッド定義・例外表との対応が未確定。APIの記述から単体テストを増設せず、正本の確認を待つ。

## #32 test_Conversationのnewはユーザー所有で保存する_User21とprototypeを渡せば同じ所有者と定義の空会話を返す
対象: backend/tests/unit/harness/test_conversation.py
設計根拠: docs/specs/harness/README.md Conversation.new：空Sessionを作成 行102
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: meta.user_id21、prototype。 → 返却・保存Session.user_id21、定義一致、Turn/Itemなし。

## #33 test_Taskのresumeは本人IDを回答ハンドラへ渡す_User21がdemo_actionを承認するとTerminalToolMetaも21になる
対象: backend/tests/unit/harness/test_task.py
設計根拠: docs/specs/harness/README.md Task.resume：保存済み提示への回答とMeta引継ぎ 行512-573
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / modify
ケース数: 1
- single: User21、Session101。保存済みdemo_action提示artifact.message=確認、reply={approved:true}。Runnerと記録先はFake。 → 回答ハンドラのTerminalToolMeta.user_id21・session_id101。成功回答結果を保存し、後続生成へ引き継ぐ。

## #35 test_POST_agent_sessionsは本人所有の空会話を作る_User21とMarketer11がBodyなしで送ると201でowner21を保存する
対象: backend/tests/integration/api/sessions/test_create_session.py
設計根拠: docs/specs/features/chat/API.md 空会話の作成 行95
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / modify
ケース数: 1
- single: 有効CSRF、Bodyなし。 → 201、owner21、prototype、title=None、Turn/Item0件。

## #36 test_POST_agent_sessionsは両ロールの本人を受け付ける_User21のadminとmarketerが有効なら201でowner21になる
対象: backend/tests/integration/api/sessions/test_create_session.py
設計根拠: docs/specs/features/chat/API.md 両ロールでの作成 行96
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 1
- single: 有効両Role、本人21。 → 同じ201、owner21。

## #37 test_POST_agent_sessionsはBodyを入力に使わない_messageとUser22と会社2を送っても本人21の空会話を返す
対象: backend/tests/integration/api/sessions/test_create_session.py
設計根拠: docs/specs/features/chat/API.md Bodyを使用しない 行97
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 1
- single: Bodyにmessage・user_id22・company_id2。 → Bodyを採用せず本人21の空会話。Turn/Item0件。

## #38 test_POST_agent_sessionsはマーケター権限を要求する_ロールなしかadminのみか無効marketerなら403でSessionを追加しない
対象: backend/tests/integration/api/sessions/test_create_session.py
設計根拠: docs/specs/features/chat/API.md MARKETER_FORBIDDEN 行186
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 3
- no-role: F3、有効JWT/Origin/CSRF：no-role → 403 MARKETER_FORBIDDEN。retryable=false、agent_turn_id=null、field_errors=[]。Session追加/runtime作成0。
- admin-only: F3、有効JWT/Origin/CSRF：admin-only → 403 MARKETER_FORBIDDEN。retryable=false、agent_turn_id=null、field_errors=[]。Session追加/runtime作成0。
- disabled-marketer: F3、有効JWT/Origin/CSRF：disabled-marketer → 403 MARKETER_FORBIDDEN。retryable=false、agent_turn_id=null、field_errors=[]。Session追加/runtime作成0。

## #39 test_GET_agent_sessionsは表示対象を分離する_同社か他社の別人会話が混在してもUser21のprototypeだけを返す
対象: backend/tests/integration/api/sessions/test_list_sessions.py
設計根拠: docs/specs/features/chat/API.md 表示対象の分離 行205
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / modify
ケース数: 2
- single: User21/同社22の会話。 本人User21のresearch会話も混在。 → User21のprototypeだけを返し、同社・他社の別人会話と本人researchを除外する。
- other-company-single: User21/他社23の会話。 本人User21のresearch会話も混在。 → User21のprototypeだけを返し、同社・他社の別人会話と本人researchを除外する。

## #41 test_GET_agent_sessionsはマーケター権限を要求する_ロールなしかadminのみか無効marketerなら403で一覧を取得しない
対象: backend/tests/integration/api/sessions/test_list_sessions.py
設計根拠: docs/specs/features/chat/API.md MARKETER_FORBIDDEN 行294
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 3
- no-role: F3、有効JWT：no-role → 403。空一覧で成功化せず、一覧呼出し0回。
- admin-only: F3、有効JWT：admin-only → 403。空一覧で成功化せず、一覧呼出し0回。
- disabled-marketer: F3、有効JWT：disabled-marketer → 403。空一覧で成功化せず、一覧呼出し0回。

## #42 test_GET_agent_sessionは参照不可を拒否する_User21に対し別人所有か不存在かresearchなら404で履歴と復旧を実行しない
対象: backend/tests/integration/api/sessions/test_get_history.py
設計根拠: docs/specs/features/chat/API.md AGENT_SESSION_NOT_FOUND 行430
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / modify
ケース数: 4
- same-company-owner22: 操作者User21は両Role有効。O4=same-company-owner22、存在する対象には331秒経過running。 → 404 AGENT_SESSION_NOT_FOUND。認可後の履歴・中断復旧0回、既存記録不変。
- other-company-owner23: 操作者User21は両Role有効。O4=other-company-owner23、存在する対象には331秒経過running。 → 404 AGENT_SESSION_NOT_FOUND。認可後の履歴・中断復旧0回、既存記録不変。
- missing: 操作者User21は両Role有効。O4=missing、存在する対象には331秒経過running。 → 404 AGENT_SESSION_NOT_FOUND。認可後の履歴・中断復旧0回、既存記録不変。
- research-owner21: 操作者User21は両Role有効。O4=research-owner21、存在する対象には331秒経過running。 → 404 AGENT_SESSION_NOT_FOUND。認可後の履歴・中断復旧0回、既存記録不変。

## #43 test_GET_agent_sessionはマーケター権限を要求する_ロールなしかadminのみか無効marketerなら403で履歴と復旧を実行しない
対象: backend/tests/integration/api/sessions/test_get_history.py
設計根拠: docs/specs/features/chat/API.md MARKETER_FORBIDDEN 行429
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 3
- no-role: F3、本人所有会話に331秒経過running：no-role → 403。履歴/復旧0回、Turnはrunning維持。
- admin-only: F3、本人所有会話に331秒経過running：admin-only → 403。履歴/復旧0回、Turnはrunning維持。
- disabled-marketer: F3、本人所有会話に331秒経過running：disabled-marketer → 403。履歴/復旧0回、Turnはrunning維持。

## #44 test_POST_agent_session_turnsは参照不可を拒否する_別人所有か不存在かresearchへ初回入力か回答を送ると404になる
対象: backend/tests/integration/api/sessions/test_execute.py
設計根拠: docs/specs/features/chat/API.md AGENT_SESSION_NOT_FOUND 行630
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / modify
ケース数: 8
- same-company-owner22-initial: same-company-owner22へinitialを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- same-company-owner22-reply: same-company-owner22へreplyを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- other-company-owner23-initial: other-company-owner23へinitialを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- other-company-owner23-reply: other-company-owner23へreplyを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- research-owner21-initial: research-owner21へinitialを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- research-owner21-reply: research-owner21へreplyを送信。 → 404共通JSON。実Serviceが拒否し、Task/復旧/SSE0回、Turn/Item不変。
- missing-initial: Session101なし、initialを送信。 → 404 AGENT_SESSION_NOT_FOUND。Task・復旧・SSE0回、保存追加なし。
- missing-reply: Session101なし、replyを送信。 → 404 AGENT_SESSION_NOT_FOUND。Task・復旧・SSE0回、保存追加なし。

## #45 test_POST_agent_session_turnsはマーケター権限を要求する_ロールなしかadminのみか無効marketerなら403でTurn受付とSSE開始を実行しない
対象: backend/tests/integration/api/sessions/test_execute.py
設計根拠: docs/specs/features/chat/API.md MARKETER_FORBIDDEN 行629
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / F3：チャットの権限不足
状態: planned / add
ケース数: 3
- no-role: F3、有効CSRF、本人会話：no-role → 403共通JSON。Task生成/Turn受付/復旧/SSE0回。
- admin-only: F3、有効CSRF、本人会話：admin-only → 403共通JSON。Task生成/Turn受付/復旧/SSE0回。
- disabled-marketer: F3、有効CSRF、本人会話：disabled-marketer → 403共通JSON。Task生成/Turn受付/復旧/SSE0回。

## #47 test_GET_postsは公開済み投稿の先頭を返す_会社201の条件に一致する投稿を指定順と上限で返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md GET posts：関連ユースケース 行19
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / modify
ケース数: 9
- default: P6、sort/order省略、limit2。 → 200、106・105、次cursorあり。
- published-asc: 公開日時asc、limit2。 → 101・102。
- pv-desc: PV desc、limit2。 → 106・103。
- pv-asc: PV asc、limit2。 → 101・102。
- campaign12: 施策12、limit2。 → 105・104、Archive表示あり、部分値null。
- half-open: 10月2日以上3日未満、limit2。 → 103・102、次cursorなし。
- limit50: limit50。 → 全6件、次cursorなし。
- empty: 2099年以降。 → 空配列、次cursorなし。
- pv-asc-unmeasured-last: P6、PV昇順、limit50。 → 101・102・103・106・105・104。未完了は末尾で公開日時/ID降順、次cursorなし。

## #48 test_GET_postsは値境界の続きを返す_前回の境界と今回のDB状態から後続投稿または空配列を返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md GET posts：関連ユースケース 行20
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / modify
ケース数: 9
- published-boundary: P6、施策12、公開日時降順、投稿103/2026-10-02T00:00Z境界をこのケース内で独立発行、limit2。 → 102・101。
- deleted-boundary: P6、施策12、公開日時降順、投稿103/2026-10-02T00:00Z境界をこのケース内で独立発行後、投稿103を削除、limit2。 → 102・101。元行存在不要。
- restore-pv-sort: P6、施策12、PV降順で発行したPV100・投稿103境界、limit2。続き要求ではsort/order省略。 → 102・101、次cursorあり。
- unmeasured-boundary: P6、施策12、PV降順、未完了投稿105・10月3日境界、limit2。 → 104、次cursorなし。
- end: 公開desc、10月1日・101境界。 → 空配列、次cursorなし。
- shared-and-no-expiry: P6、施策12、PV降順、投稿103/PV100/2026-10-02T00:00Zでlimit1のcursorをこのケース内で独立発行。同社別人が30分後にlimit2で使用。 → 102・101。
- live-values: P6、施策12、PV降順、投稿103/PV100/2026-10-02T00:00Zのcursorをこのケース内で独立発行後、102のPVを50、施策12名を変更しlimit2で続き取得。 → 最新PV/名前で102・101。
- published-asc-after102: P6、施策12、公開日時昇順、投稿102/2026-10-02T00:00Zで独立発行したcursor、limit2。 → 103・104、後続あり。
- pv-asc-unmeasured-after105: P6、施策12、PV昇順、未完了投稿105/2026-10-03T00:00Zで独立発行したcursor、limit2。 → 104だけ、次cursorなし。

## #49 test_GET_postsは意味検索の類似度順を返す_採用広報の検索ベクトルが投稿103と一致すれば103が先頭でnext_cursorはnullになる
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md GET posts：関連ユースケース 行21
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / modify
ケース数: 1
- single: query=採用広報、limit2。DBMLどおりの1536次元で、非ゼロベクトルe1=(1,0,…,0)をFakeEmbeddingと投稿103へ指定。他の対象投稿は直交するe2=(0,1,0,…,0)。 → 200、投稿103が類似度順先頭、similarity数値、next_cursor=null。

## #50 test_GET_postsは認証を要求する_Cookieがなければ401とUNAUTHENTICATEDを返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行203
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: Cookieなし。 → 401 UNAUTHENTICATED、共通エラー。

## #51 test_GET_postsはマーケター権限を要求する_有効なMarketerInfoがなければ403を返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行204
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: 本人認証成立、marketer無効。 → 403 MARKETER_FORBIDDEN。

## #52 test_GET_postsは入力不備を返す_不正引数か利用できないcursorなら400とINVALID_ARGUMENTを返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行205
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / modify
ケース数: 24
- limit0: limit=0 → 400 INVALID_ARGUMENT。共通エラー。
- limit51: limit=51 → 400 INVALID_ARGUMENT。共通エラー。
- limit-text: limit=abc → 400 INVALID_ARGUMENT。共通エラー。
- campaign0: campaign_id=0 → 400 INVALID_ARGUMENT。共通エラー。
- campaign-text: campaign_id=abc → 400 INVALID_ARGUMENT。共通エラー。
- date-text: published_from=invalid → 400 INVALID_ARGUMENT。共通エラー。
- date-no-tz: published_from=2026-10-01T00:00:00 → 400 INVALID_ARGUMENT。共通エラー。
- period-equal: from=to=10月2日 → 400 INVALID_ARGUMENT。共通エラー。
- period-reversed: from=10月3日、to=2日 → 400 INVALID_ARGUMENT。共通エラー。
- query-space: query=空白だけ → 400 INVALID_ARGUMENT。共通エラー。
- query1001: query=あ×1001 → 400 INVALID_ARGUMENT。共通エラー。
- query-cursor: queryと正規cursor併用 → 400 INVALID_ARGUMENT。共通エラー。
- query-sort: queryとsort併用 → 400 INVALID_ARGUMENT。共通エラー。
- query-order: queryとorder併用 → 400 INVALID_ARGUMENT。共通エラー。
- sort: sort=unknown → 400 INVALID_ARGUMENT。共通エラー。
- order: order=sideways → 400 INVALID_ARGUMENT。共通エラー。
- signature: 署名改ざん → 400 INVALID_ARGUMENT。共通エラー。
- legacy: 旧Snapshot形式 → 400 INVALID_ARGUMENT。共通エラー。
- company: 署名会社202と要求201 → 400 INVALID_ARGUMENT。共通エラー。
- resource: metrics種別を使用 → 400 INVALID_ARGUMENT。共通エラー。
- position: 署名済み投稿ID0 → 400 INVALID_ARGUMENT。共通エラー。
- filter: 施策条件変更 → 400 INVALID_ARGUMENT。共通エラー。
- cursor-sort: 明示sort不一致 → 400 INVALID_ARGUMENT。共通エラー。
- cursor-order: 明示order不一致 → 400 INVALID_ARGUMENT。共通エラー。

## #53 test_GET_postsは自社施策を要求する_不存在999999か他社の施策なら404とCAMPAIGN_NOT_FOUNDを返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行206
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 2
- missing999999: campaign_idで参照不可施策を指定：missing999999 → 404 CAMPAIGN_NOT_FOUND。
- other-company: campaign_idで参照不可施策を指定：other-company → 404 CAMPAIGN_NOT_FOUND。

## #54 test_GET_postsは検索生成失敗を通知する_EmbeddingErrorなら500とEMBEDDING_FAILEDを返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行207
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: query指定、Embedding生成を失敗させる。 → 500 EMBEDDING_FAILED。

## #55 test_GET_postsはDB障害を内部エラーにする_投稿取得のSQLAlchemyErrorなら500とINTERNAL_ERRORを返す
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md エラー一覧 行208
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: 認証後の投稿取得へDB障害。 → 500 INTERNAL_ERROR、内部情報を応答へ出さない。

## #56 test_GET_metricsは全体と先頭施策を返す_会社201の期間全体を集計して施策ページと同じ可視状態で返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md GET metrics：関連ユースケース 行19
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / modify
ケース数: 5
- mixed: P6、limit1。最初の業務データSELECTで読取可視状態を確定した直後、明細取得より前に別接続の計測値・施策名変更をcommitし、続行する。 → S、先頭施策13、次cursor。要求内の集計/明細/名前は同一可視状態。
- empty: 対象投稿なし。 → 6計数0、率null、空施策、次cursorなし。
- pending-only: 104だけが対象。 → 投稿1、待ち1、他計数0、率null、施策12あり。
- half-open: 10月2日以上3日未満。 → 投稿2、PV200、流入30、率0.15。
- same-pv-order: M4、limit2、cursorなし。 → 全体PV920・流入113、施策13・14、次cursorは施策14/PV210。同PV210ではID14が12より先。

## #57 test_GET_metricsは要求ごとに再集計する_値境界の続きが空でも今回の全体summaryを返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md GET metrics：関連ユースケース 行20
導出規則: Backend §14.2：APIの正常呼び出しケース行ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / modify
ケース数: 5
- continue: 施策13・PV500境界。 → S、施策12はPV210。
- live: 発行後101のPV10→50、施策12名変更。 → 全体PV750、施策12はPV250と新名。
- empty-page: 施策ID1・PV0境界。 → 空施策・次cursorなしでもsummary=S。
- shared-and-no-expiry: 施策13境界を同社別人が30分後、limit1→50で使用。 → 施策12、summary=S。
- same-pv-boundary: M4でこのケース内に独立発行した施策14/PV210境界、limit2。 → 施策12・15。PV0も含み、summaryは全体PV920・流入113。次cursorなし。

## #58 test_GET_metricsは認証を要求する_Cookieがなければ401とUNAUTHENTICATEDを返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md エラー一覧 行197
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / add
ケース数: 1
- single: Cookieなし。 → 401 UNAUTHENTICATED。

## #59 test_GET_metricsはマーケター権限を要求する_有効なMarketerInfoがなければ403を返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md エラー一覧 行198
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / add
ケース数: 1
- single: 本人認証成立、marketer無効。 → 403 MARKETER_FORBIDDEN。

## #60 test_GET_metricsは入力不備を返す_不正引数か利用できないcursorなら400とINVALID_ARGUMENTを返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md エラー一覧 行199
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / modify
ケース数: 14
- limit0: limit=0 → 400 INVALID_ARGUMENT。
- limit51: limit=51 → 400 INVALID_ARGUMENT。
- limit-text: limit=abc → 400 INVALID_ARGUMENT。
- date-text: 不正日時 → 400 INVALID_ARGUMENT。
- date-no-tz: TZなし日時 → 400 INVALID_ARGUMENT。
- period-equal: from=to → 400 INVALID_ARGUMENT。
- period-reversed: 期間逆転 → 400 INVALID_ARGUMENT。
- signature: 署名改ざん → 400 INVALID_ARGUMENT。
- legacy: 旧Snapshot形式 → 400 INVALID_ARGUMENT。
- company: 署名会社202と要求201 → 400 INVALID_ARGUMENT。
- resource: posts種別 → 400 INVALID_ARGUMENT。
- position: 署名済みcampaign_id=0 → 400 INVALID_ARGUMENT。
- sort-present: 署名済みmetrics cursorの内部にsort=published_atを指定（HTTPの未知queryではない）。 → 400 INVALID_ARGUMENT。
- period-hash: 公開期間Hash不一致 → 400 INVALID_ARGUMENT。

## #61 test_GET_metricsはDB障害を内部エラーにする_全体集計のSQLAlchemyErrorなら500とINTERNAL_ERRORを返す
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md エラー一覧 行200
導出規則: Backend §14.2：APIのエラーごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: planned / add
ケース数: 1
- single: 認証後の全体集計へDB障害。 → 500 INTERNAL_ERROR、内部情報なし。

## #62 test_PostRepositoryのlist_postsは取得行を返す_会社201とlimit2でDB依存が投稿105と104を返せば同順の2行を返す
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md list_posts：正常 行35-98
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB依存Fakeが施策12の投稿105・104に対応するPostRowを返す。会社201・公開desc・境界なし・limit2。 → 取得行105・104を契約どおり返す。FakeでSQLの絞込み・並び・件数制限を検証したとは扱わない。

## #63 test_PostRepositoryのlist_postsはDB障害を伝播する_取得のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md list_posts：SQLAlchemyError 行104
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB実行境界で例外E。 → 同一例外E。SQL文字列一致は禁止。

## #64 test_PostRepositoryのsummarize_totalは取得した集計を返す_PV710と流入81の集計行なら同じ計数と率81割る710を返す
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md summarize_total：正常 行106-143
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB依存FakeがP6の集計行（投稿6・完了4・待ち1・失敗1・PV710・流入81）を返す。 → MetricsSummaryは同じ計数・PV710・流入81・率81/710。SQL集計そのものはAPI結合で確認。

## #65 test_PostRepositoryのsummarize_totalはDB障害を伝播する_集計のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md summarize_total：SQLAlchemyError 行149
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB実行境界で例外E。 → 同一例外E。

## #66 test_PostRepositoryのlist_campaign_metricsは取得した施策集計を返す_DB依存が施策13と14の集計を返せば同順で返す
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md list_campaign_metrics：正常 行151-193
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB依存Fakeが(施策13,PV500)・(施策14,PV210)を返す。会社201、境界なし、limit2。 → 取得順で施策13・14と各MetricsSummaryを返す。SQLの集計・境界・limit判定をFakeで証明したとは扱わない。

## #67 test_PostRepositoryのlist_campaign_metricsはDB障害を伝播する_取得のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/repositories/test_post_repository.py
設計根拠: docs/specs/modules/POST_REPOSITORY.md list_campaign_metrics：SQLAlchemyError 行199
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: DB実行境界で例外E。 → 同一例外E。

## #68 test_issue_list_cursorは継続位置を署名する_会社201の投稿か計測の境界を同じ値として読み戻せる
対象: backend/tests/unit/services/test_list_cursor.py
設計根拠: docs/specs/modules/LIST_CURSOR.md issue_list_cursor：正常 行45-70
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 3
- post-pv100: 会社201、Hash a×64、posts、sort=x_pv_count/order=desc、投稿103/2026-10-02T00:00Z/PV100。 → 非空token。公開readで同値復元。
- post-unmeasured: 同じposts条件、投稿105/2026-10-03T00:00Z/PV=None。 → 非空token。公開readで同値復元。
- metrics-pv100: 会社201、Hash a×64、metrics、sort/order=None、施策12/PV100。 → 非空token。公開readで同値復元。

## #69 test_read_list_cursorは値境界を復元する_正規署名なら投稿日時をUTC化し計測の施策IDとPVを保持する
対象: backend/tests/unit/services/test_list_cursor.py
設計根拠: docs/specs/modules/LIST_CURSOR.md read_list_cursor：正常 行72-100
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 4
- post-jst-to-utc: 投稿103、2026-10-02T09:00+09:00、PV100。 → 正しいPostPosition、日時00:00Z。
- post-unmeasured: 投稿103、10月2日UTC、PV=None。 → 同値の未計測境界。
- metrics-pv100: 施策12、PV100、sort/orderなし。 → 同値MetricsPosition。
- metrics-pv0: 施策12、PV0。 → 0を正常復元。

## #70 test_read_list_cursorは利用できない継続位置を拒否する_署名か現在の型制約が不正ならINVALID_ARGUMENTになる
対象: backend/tests/unit/services/test_list_cursor.py
設計根拠: docs/specs/modules/LIST_CURSOR.md read_list_cursor：AppError 行106-112
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 38
- company-zero: 会社ID=0。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- company-bool: 会社ID=true。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- company-float: 会社ID=1.5。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- company-str: 会社ID="201"。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-id-zero: 投稿ID=0。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-id-bool: 投稿ID=true。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-id-float: 投稿ID=1.5。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-id-str: 投稿ID="103"。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- campaign-id-zero: 施策ID=0。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- campaign-id-bool: 施策ID=true。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- campaign-id-float: 施策ID=1.5。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- campaign-id-str: 施策ID="12"。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-pv-negative: post-pv=-1。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-pv-bool: post-pv=true。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-pv-float: post-pv=1.5。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-pv-str: post-pv="100"。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-pv-negative: metrics-pv=-1。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-pv-bool: metrics-pv=true。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-pv-float: metrics-pv=1.5。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-pv-str: metrics-pv="100"。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-pv-null: metrics-pv=null。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- hash-short: Hash=a×63。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- hash-nonhex: Hash=g×64。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- date-no-tz: TZなし日時。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- date-invalid: 不正日時。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-sort-invalid: posts sort=unknown。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-sort-null: posts sort=null。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-order-invalid: posts order=sideways。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- post-order-null: posts order=null。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-sort: metrics sortあり。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-order: metrics orderあり。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- empty: 空token。当該token自体に指定の署名・形式不備を与える。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- tampered: 署名改ざん。当該token自体に指定の署名・形式不備を与える。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- other-purpose: 別用途の署名。当該token自体に指定の署名・形式不備を与える。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- legacy: 旧形式。当該token自体に指定の署名・形式不備を与える。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- posts-to-metrics: postsをmetricsへ使用。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- metrics-to-posts: metricsをpostsへ使用。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。
- other-company: 署名202に要求201。その他は有効な署名fixture。 → AppError INVALID_ARGUMENT、cursor が正しくありません。

## #71 test_PostServiceのlistは表示ページを構成する_会社201とlimit2なら上限内の投稿と後続有無に応じたcursorを返し意味検索ではcursorなしになる
対象: backend/tests/unit/services/test_post_service.py
設計根拠: docs/specs/features/posts/modules/POST_SERVICE.md list：正常 行36-123
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 5
- rows0: Repository結果0件、limit2。 → 空、cursorなし。DB上限3、書込なし。
- rows2: 結果103・102、limit2。 → 全2件、cursorなし。
- rows3: 結果103・102・101、limit2。 → 103・102、返却末尾102のcursor。
- semantic-search: User101、会社201、query=" 採用広報 "、limit2。FakeEmbeddingとDB依存が類似度順の投稿103・102を返す。 → 前後空白を除いた採用広報でDB外のEmbedding生成後に取得し、103・102へ表示値変換、next_cursor=None。読み取り終了、書込なし。
- continue: User101、会社201。正常cursorは施策12・PV降順・投稿103/PV100の境界。sort/order省略、limit2。Fakeの後続行は102・101。 → cursorの並び順と境界を復元し、正規化条件を照合してDB依存へ渡す。後続102・101、次cursorなし。

## #72 test_PostServiceのlistは業務エラーを返す_権限か検索条件かcursorか施策が不正なら契約どおりのAppErrorになる
対象: backend/tests/unit/services/test_post_service.py
設計根拠: docs/specs/features/posts/modules/POST_SERVICE.md list：AppError 行129-147
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 25
- single: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：auth.marketer=None。 → AppError MARKETER_FORBIDDEN、この操作を行う権限がありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old73-space: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：query="   "。 → AppError INVALID_ARGUMENT、query が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old73-1001chars: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：query=あ×1001。 → AppError INVALID_ARGUMENT、query が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old74-with-cursor: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：query=検索、cursor=正規のposts cursor。 → AppError INVALID_ARGUMENT、query は cursor・sort・order と同時に指定できません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old74-with-sort: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：query=検索、sort=published_at。 → AppError INVALID_ARGUMENT、query は cursor・sort・order と同時に指定できません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old74-with-order: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：query=検索、order=desc。 → AppError INVALID_ARGUMENT、query は cursor・sort・order と同時に指定できません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old75-sort: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：sort=unknown。 → AppError INVALID_ARGUMENT、sort または order が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old75-order: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：order=sideways。 → AppError INVALID_ARGUMENT、sort または order が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old76-equal: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：published_from=2026-10-02T00:00Z、published_to=2026-10-02T00:00Z。 → AppError INVALID_ARGUMENT、published_from・published_to の範囲が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old76-reversed: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：published_from=2026-10-03T00:00Z、published_to=2026-10-02T00:00Z。 → AppError INVALID_ARGUMENT、published_from・published_to の範囲が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-signature: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorは署名の1文字を改ざん。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-legacy: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorは旧Snapshot形式。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-company: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorは会社202。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-resource: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorはmetrics種別。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-position: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorは投稿ID0。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-sort: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorはsort=unknown。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old77-order: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorはorder=sideways。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old78-sort-mismatch: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursor内sort=published_at/order=desc、明示sort=x_pv_count。 → AppError INVALID_ARGUMENT、cursor と異なる sort・order は指定できません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old78-order-mismatch: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursor内sort=published_at/order=desc、明示order=asc。 → AppError INVALID_ARGUMENT、cursor と異なる sort・order は指定できません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old79-campaign: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorの施策12を要求で13へ変更。 → AppError INVALID_ARGUMENT、cursor と一覧条件が一致しません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old79-from: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorのfrom=2026-10-01T00:00Zを要求で2026-10-02T00:00Zへ変更。 → AppError INVALID_ARGUMENT、cursor と一覧条件が一致しません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old79-to: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：cursorのto=2026-11-01T00:00Zを要求で2026-10-31T00:00Zへ変更。 → AppError INVALID_ARGUMENT、cursor と一覧条件が一致しません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old80-first: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：施策12は参照不可。cursorなし通常一覧。 → AppError CAMPAIGN_NOT_FOUND、施策が見つかりません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old80-continue: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：施策12は参照不可。正規cursorの続き。 → AppError CAMPAIGN_NOT_FOUND、施策が見つかりません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。
- old80-search: 有効なUser101/会社201、limit2。他項目は未指定か正規の値。正規cursorは施策12・期間2026-10-01T00:00Z以上11-01T00:00Z未満を基準とし変更項目以外を一致させる。変更点：施策12は参照不可。query=検索。 → AppError CAMPAIGN_NOT_FOUND、施策が見つかりません。 開始済み参照は終了、入力検証で拒否する場合はDB取得なし。

## #81 test_PostServiceのlistはEmbedding障害を伝播する_query検索のEmbeddingErrorを同じ例外で送出する
対象: backend/tests/unit/services/test_post_service.py
設計根拠: docs/specs/features/posts/modules/POST_SERVICE.md list：EmbeddingError 行148
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 1
- single: embedが例外E。 → 同一EmbeddingError E、DB開始前。ServiceでAppError化しない。

## #82 test_PostServiceのlistはDB障害時に参照を終了する_開始か取得のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/services/test_post_service.py
設計根拠: docs/specs/features/posts/modules/POST_SERVICE.md list：SQLAlchemyError 行149-151
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 4
- session-start: 指定段階でSQLAlchemyError E：session-start → 同一例外E、開始済みならrollbackと終了。未生成セッションの終了は要求しない。
- campaign-read: 指定段階でSQLAlchemyError E：campaign-read → 同一例外E、開始済みならrollbackと終了。未生成セッションの終了は要求しない。
- list-read: 指定段階でSQLAlchemyError E：list-read → 同一例外E、開始済みならrollbackと終了。未生成セッションの終了は要求しない。
- search-read: 指定段階でSQLAlchemyError E：search-read → 同一例外E、開始済みならrollbackと終了。未生成セッションの終了は要求しない。

## #83 test_MetricsServiceのreportは全体集計と表示施策を構成する_limit2ならsummaryを保持し最大2施策と返却末尾境界を返す
対象: backend/tests/unit/services/test_metrics_service.py
設計根拠: docs/specs/features/metrics/modules/METRICS_SERVICE.md report：正常 行36-115
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 3
- rows0: summary=S、施策候補0件。 → 空施策、S保持、cursorなし。依存へ同じREAD ONLY・REPEATABLE READトランザクションを使用する設定を渡す。実DBの同一可視状態そのものはAPI結合で確認。
- rows2: 候補(13,500),(12,210)。 → 全2施策、S、cursorなし。
- rows3: 候補(13,500),(12,210),(11,0)。 → 最初の2件と施策12/PV210境界。表示IDだけ参照、DB上限3。

## #84 test_MetricsServiceのreportは業務エラーを返す_権限か期間かcursorが不正なら契約どおりのAppErrorになる
対象: backend/tests/unit/services/test_metrics_service.py
設計根拠: docs/specs/features/metrics/modules/METRICS_SERVICE.md report：AppError 行121-130
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 12
- single: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：auth.marketer=None。 → AppError MARKETER_FORBIDDEN、この操作を行う権限がありません。 DB取得なし。
- old85-equal: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：from=2026-10-02T00:00Z、to=同日時。 → AppError INVALID_ARGUMENT、published_from・published_to の範囲が正しくありません。 DB取得なし。
- old85-reversed: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：from=2026-10-03T00:00Z、to=2026-10-02T00:00Z。 → AppError INVALID_ARGUMENT、published_from・published_to の範囲が正しくありません。 DB取得なし。
- old86-signature: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部の署名改ざん。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-legacy: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部の旧Snapshot形式。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-company: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部の会社202。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-resource: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部のposts種別。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-position: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部の施策ID0。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-sort-present: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部のsort=published_at。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old86-order-present: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：署名cursor内部のorder=desc。 → AppError INVALID_ARGUMENT、cursor が正しくありません。 DB取得なし。
- old87-from: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：要求fromだけ2026-10-02T00:00Zへ変更。 → AppError INVALID_ARGUMENT、cursor と一覧条件が一致しません。 DB取得なし。
- old87-to: User101/会社201、limit2。正規metrics cursorは施策13/PV500、期間2026-10-01T00:00Z以上11-01T00:00Z未満、sort/order=None。他項目は正規値。変更点：要求toだけ2026-10-31T00:00Zへ変更。 → AppError INVALID_ARGUMENT、cursor と一覧条件が一致しません。 DB取得なし。

## #88 test_MetricsServiceのreportはDB障害時に参照を終了する_開始か集計参照のSQLAlchemyErrorを同じ例外で送出する
対象: backend/tests/unit/services/test_metrics_service.py
設計根拠: docs/specs/features/metrics/modules/METRICS_SERVICE.md report：SQLAlchemyError 行131-134
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: planned / add
ケース数: 4
- transaction-start: 指定段階でSQLAlchemyError E：transaction-start → 同一例外E、開始済みならrollbackと終了。
- total: 指定段階でSQLAlchemyError E：total → 同一例外E、開始済みならrollbackと終了。
- campaign-page: 指定段階でSQLAlchemyError E：campaign-page → 同一例外E、開始済みならrollbackと終了。
- references: 指定段階でSQLAlchemyError E：references → 同一例外E、開始済みならrollbackと終了。

## #89 導出保留：Frontend認証 — 旧 #89
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #90 導出保留：Frontend認証 — 旧 #90
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #91 導出保留：Frontend認証 — 旧 #91
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #92 導出保留：Frontend認証 — 旧 #92
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #93 導出保留：Frontend認証 — 旧 #93
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #94 導出保留：Frontend認証 — 旧 #94
対象: frontend/features/auth/tests/authEntry.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/USECASE.md マーケター／管理者のログイン / docs/specs/SCREEN_INDEX.md ログイン・チャット

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 認証画面の提供操作一覧・エラー表示が未定義。USECASE・APIだけではFrontend §21.2の行別ケースを確定できない。

## #95 導出保留：Frontend共通領域 — 旧 #95
対象: frontend/features/shell/tests/roleNavigation.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/features/shell/SCREEN_DESIGN.md アカウント / docs/specs/features/shell/ADMIN_SCREEN_DESIGN.md 業務画面へ

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: Shellの表示項目はあるが提供操作行とAPI有無が未定義。表示条件だけからケースを追加しない。

## #96 導出保留：Frontend共通領域 — 旧 #96
対象: frontend/features/shell/tests/roleNavigation.integration.test.tsx
設計根拠: docs/specs/features/auth/API.md 認証・返却項目 / docs/specs/features/shell/SCREEN_DESIGN.md アカウント / docs/specs/features/shell/ADMIN_SCREEN_DESIGN.md 業務画面へ

共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: Shellの表示項目はあるが提供操作行とAPI有無が未定義。表示条件だけからケースを追加しない。

## #97 導出保留：Frontend投稿 — 旧 #97
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行59
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #99 test_投稿一覧の先頭へ操作は条件を保持する_非空の続きページからcursorだけを除去して投稿103を表示する
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 公開済み投稿一覧：先頭へを押す 行60
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: P+C-Pの非空続きページで「先頭へ」を押し、Pへの取得が投稿103を返す。 → cursorだけ除去し、施策・期間・sort/orderを保持。投稿103を表示し先頭へボタンを非表示。 通信境界でcursor未送信と適用条件の保持を確認。公開期間は2026-09-30T15:00Z以上・2026-10-31T15:00Z未満。

## #101 導出保留：Frontend投稿 — 旧 #101
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行223
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #102 test_投稿一覧はcursorなし入力不備を表示する_400なら条件確認と再試行を表示する
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 取得失敗：入力不備 行224
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: Pのcursorなし要求が400。 → 条件確認・再試行、自動復帰なし、空表示なし。

## #103 test_投稿一覧は参照不可施策を案内する_施策12が404なら条件変更を求める
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 取得失敗：施策参照不可 行225
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: Pで投稿取得404 CAMPAIGN_NOT_FOUND。補助の施策表示取得は正常。 → 指定施策の参照不可と条件変更。空表示にしない。

## #104 test_投稿一覧は意味検索失敗を表示する_採用広報の検索がEMBEDDING_FAILEDなら検索失敗と再試行を出す
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 取得失敗：意味検索失敗 行226
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: query=採用広報、cursor/sort/orderなし。500 EMBEDDING_FAILED。 → 検索失敗と再試行。成功空表示にしない。

## #105 test_投稿一覧は内部エラーを表示する_INTERNAL_ERRORなら取得失敗と再試行を出す
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 取得失敗：内部エラー 行227
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: P取得500 INTERNAL_ERROR。 → 投稿を読み込めませんでした。再試行、空表示なし。

## #106 test_投稿一覧は通信失敗を表示する_通信が失敗したら取得失敗と再試行を出す
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 取得失敗：通信失敗 行228
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: P取得を通信reject。 → 投稿を読み込めませんでした。再試行、空表示なし。

## #107 導出保留：Frontend投稿 — 旧 #107
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行229
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #108 導出保留：Frontend投稿 — 旧 #108
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行230
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #109 導出保留：Frontend投稿 — 旧 #109
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行231
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #110 導出保留：Frontend投稿 — 旧 #110
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 行別の条件確定待ち 行208
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #111 導出保留：Frontend計測 — 旧 #111
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行55
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #113 test_計測一覧の先頭へ操作は期間を保持する_非空続きページからcursorを除去して新summaryと施策12を表示する
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 計測結果一覧：先頭へを押す 行56
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: T+C-Mの非空続きページで先頭へ。応答は更新summaryと施策12。 → cursorだけ除去、期間保持、新summaryと施策12を表示。 通信境界でcursor未送信と適用条件の保持を確認。公開期間は2026-09-30T15:00Z以上・2026-10-31T15:00Z未満。

## #115 導出保留：Frontend計測 — 旧 #115
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行242
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #116 test_計測結果はcursorなし入力不備を表示する_400なら期間確認と再試行を出す
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 取得失敗：入力不備 行243
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: Tのcursorなし400。 → 期間確認・再試行、自動復帰なし、全体0へ置換しない。

## #117 test_計測結果は内部エラーを表示する_INTERNAL_ERRORなら取得失敗と再試行を出す
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 取得失敗：内部エラー 行244
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: T取得500 INTERNAL_ERROR。 → 計測結果を読み込めませんでした。再試行、成功0件にしない。

## #118 test_計測結果は通信失敗を表示する_通信が失敗したら取得失敗と再試行を出す
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 取得失敗：通信失敗 行245
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: T取得を通信reject。 → 計測結果を読み込めませんでした。再試行、成功0件にしない。

## #119 導出保留：Frontend計測 — 旧 #119
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行246
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #120 導出保留：Frontend計測 — 旧 #120
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行247
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #121 導出保留：Frontend計測 — 旧 #121
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行248
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #122 導出保留：Frontend計測 — 旧 #122
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 行別の条件確定待ち 行227
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: derivation-pending / add
保留理由: 対応する画面設計行はあるが、旧案の状態差・server/client・正常/復帰の複数条件から1ケースを選ぶ根拠が未確定。直積と代表条件の独断選択を撤回し、行別の条件確定を待つ。

## #123 test_mainは実行結果をJSON出力する_seedのUser21かUserIDなしclearなら結果を出力して正常終了する
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md main：正常 行30-60
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 2
- seed21: seed --user-id 21、runは確定済み投入結果を返す。 → 操作と21を渡し結果と等価なJSON、終了0。
- clear-none: clear、runは確定済み削除結果を返す。 → 操作とNoneを渡し結果と等価なJSON、終了0。

## #126 test_runは操作結果を確定する_User21へのseedかresetまたはUser照合なしclearなら操作別の結果を返す
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md run：正常 行64-132
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 5
- seed: DB・seed依存Fake、許可local設定。seed、User21。 → 検証後に12会話投入を委譲し、identity一致後commit。created=true・user_id21・sessions12件・identity_preserved=true。
- seed-existing: 同じ依存境界。seedが投入済み結果を返す。 → 追加省略を確定しcreated=false・user_id21・message・identity_preserved=true。
- reset: 依存Fake。reset、User21。 → 対象検証後に対象16表の削除・採番初期化・投入を委譲。identity一致後commit。created・user_id・sessions・removed・identity_preserved。
- clear-none: 依存Fake。clear、UserID=None。 → 投入先ユーザー照合なしで削除を委譲しcommit。removed・identity_preserved=true、user_idなし。
- clear999: 依存Fake。clear、UserID999。 → 999のユーザー照合なし。clear-noneと同じ削除結果。

## #127 test_runは入力と状態の不備を拒否する_操作かUserIDか登録状態か環境が不正ならValueErrorになる
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md run：ValueError 行138-144
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 13
- unknown-action: action=unknown、User21 → ValueError、操作が不正である旨。DB接続・commitなし。
- id-none: reset、UserID=None → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id0: reset、0 → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id-negative: reset、-1 → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id-string: reset、"21" → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id-float: reset、21.5 → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id-bool: reset、True → ValueError、正の整数のUserIDが必要である旨。DB接続・commitなし。
- id999: reset、User999なし → ValueError、登録済みの投入先ユーザーが必要である旨。開始済み操作はrollbackと終了を委譲、成功commitなし。
- invited: reset、User21がinvited → ValueError、登録済みの投入先ユーザーが必要である旨。開始済み操作はrollbackと終了を委譲、成功commitなし。
- suspended: reset、User21がsuspended → ValueError、登録済みの投入先ユーザーが必要である旨。開始済み操作はrollbackと終了を委譲、成功commitなし。
- old128-external-host: action=reset、user_id=21、registeredの対象あり。host=db.example.test。 → ValueError、ローカル開発DB専用のコマンドです。DB接続・commitなし。
- old128-missing-host: action=reset、user_id=21、registeredの対象あり。host=None。 → ValueError、ローカル開発DB専用のコマンドです。DB接続・commitなし。
- old128-vercel-preview: action=reset、user_id=21、registeredの対象あり。localhost、VERCEL_ENV=preview。 → ValueError、ローカル開発DB専用のコマンドです。DB接続・commitなし。

## #129 test_runはDB障害を伝播する_削除か投入の依存がSQLAlchemyErrorならrollbackして同じ例外を送出する
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md run：SQLAlchemyError 行145
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 2
- seed-partial: DB依存Fake。seed-partialの段階でSQLAlchemyError E。 → 同じ例外Eを伝播。開始済み操作のrollbackと終了を委譲し成功commitなし。実DBでの復元を確認したとは扱わない。
- reset-clear-and-partial: DB依存Fake。reset-clear-and-partialの段階でSQLAlchemyError E。 → 同じ例外Eを伝播。開始済み操作のrollbackと終了を委譲し成功commitなし。実DBでの復元を確認したとは扱わない。

## #130 test_runはidentity不一致を拒否する_resetで変更前後の指紋が異なればrollbackしてRuntimeErrorになる
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md run：RuntimeError 行146
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 1
- single: DB依存Fake。resetで変更前後のidentity指紋を異なる値として返す。 → RuntimeError、会社・認証情報が変化したため全変更を取り消す旨。rollbackと終了を委譲し成功commitなし。

## #131 test_seed_demoは登録済み本人への投入結果を返す_User21に未投入なら12会話を作り投入済みなら追加を省略する
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md seed_demo：正常 行148-179
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 2
- create: DB依存Fake。User21はregistered・Roleなし、本人への投入履歴なし。他人User22への投入履歴あり。 → 12会話と関連記録の保存をUser21で委譲しcreated=true・user_id21・sessions12件。自身のcommitなし。
- existing: DB依存Fake。registeredのUser21本人へ投入済み。 → 保存委譲なし、created=false・user_id21・message。自身のcommitなし。

## #132 test_seed_demoは投入不可のユーザーを拒否する_ID0か不存在999かinvitedかsuspendedならValueErrorで保存を委譲しない
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md seed_demo：ValueError 行185-187
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 4
- id0: DB依存Fakeで該当する不正状態：id0。 → ValueError。保存委譲・commitなし。呼出元の実DB rollback結果はこの単体対象外。
- id999: DB依存Fakeで該当する不正状態：id999。 → ValueError。保存委譲・commitなし。呼出元の実DB rollback結果はこの単体対象外。
- invited: DB依存Fakeで該当する不正状態：invited。 → ValueError。保存委譲・commitなし。呼出元の実DB rollback結果はこの単体対象外。
- suspended: DB依存Fakeで該当する不正状態：suspended。 → ValueError。保存委譲・commitなし。呼出元の実DB rollback結果はこの単体対象外。

## #133 test_seed_demoはDB障害を伝播する_対象照合か重複照合か一部保存で失敗したら元例外を送出する
対象: backend/tests/unit/scripts/test_demo_dataset.py
設計根拠: docs/specs/modules/DEMO_DATASET.md seed_demo：SQLAlchemyError 行188
導出規則: Backend §14.2：公開メソッド・公開関数の例外型ごとに1本
共通入力: 利用者とロール / デモCLI単体の依存
状態: planned / add
ケース数: 3
- user-read: DB依存Fakeのuser-readでSQLAlchemyError E。 → 同一例外Eを伝播し、自身のcommitなし。呼出元へrollbackを委ねる。
- duplicate-read: DB依存Fakeのduplicate-readでSQLAlchemyError E。 → 同一例外Eを伝播し、自身のcommitなし。呼出元へrollbackを委ねる。
- partial-save: DB依存Fakeのpartial-saveでSQLAlchemyError E。 → 同一例外Eを伝播し、自身のcommitなし。呼出元へrollbackを委ねる。

## r1 test_同じ会社でも他人の会話を参照できない_所有者11の会話を所有者12で取得するとreasonがSESSION_NOT_FOUNDになる
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約 / docs/specs/DATABASE.dbml 列・外部キー・一意制約・索引

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 記録層の所有者認可をService/APIへ移管。
対応項目: #30 / #31 / #42 / #44

## r2 test_所属会社の異なる認証情報では会話を参照できない_所有者11の所属が会社1でmetaが会社2ならreasonがSESSION_NOT_FOUNDになる
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約 / docs/specs/DATABASE.dbml 列・外部キー・一意制約・索引

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 記録層の会社認可を廃止。不整合meta受理テストへは置換しない。
対応項目: #21 / #30

## r3 test_実行者の所属会社照合_marketer_idが11の所属company_idが1なのにmetaのcompany_idが2ならRecordErrorでSession追加件数は0になる
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約 / docs/specs/DATABASE.dbml 列・外部キー・一意制約・索引

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 会社/Roleへの依存を廃止。
対応項目: #21

## r4 test_session_historyは他人の会話を取得できない_session_idが101の所有marketer_idが11で取得者が12ならreasonはSESSION_NOT_FOUNDになる
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約 / docs/specs/DATABASE.dbml 列・外部キー・一意制約・索引

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 所有者拒否はService/APIへ。
対応項目: #30 / #42

## r5 test_startは他人の会話へ初回入力を受け付けない_session_idが101の所有marketer_idが11で実行者が12ならreasonはSESSION_NOT_FOUNDでTurnとItemは増えない
対象: backend/tests/unit/repositories/test_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約 / docs/specs/DATABASE.dbml 列・外部キー・一意制約・索引

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 初回入力の認可はService/APIへ。
対応項目: #31 / #44

## r6 test_同じ会社でも他人の会話を参照できない_所有者11の会話を所有者12で取得するとreasonがSESSION_NOT_FOUNDになる
対象: backend/tests/unit/harness/test_inmemory_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 認可をService/APIへ。
対応項目: #30 / #42

## r7 test_所属会社の異なる認証情報では会話を参照できない_所有者11の所属が会社1でmetaが会社2ならreasonがSESSION_NOT_FOUNDになる
対象: backend/tests/unit/harness/test_inmemory_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 会社不要の正常記録へ置換。
対応項目: #24

## r8 test_初回受付の所有者照合_別所有者のSessionを指定すると記録を変更せず拒否する
対象: backend/tests/unit/harness/test_inmemory_agent_record_repository.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール
状態: retired / retire
廃止理由: 認可をService/APIへ。
対応項目: #31 / #44

## r9 test_Taskは別会社の実行者からの回答を拒否する_会社1と実行者1の提示へ会社2と実行者2で回答するとRecordErrorになりTurnと業務実行とClient開始は増えない
対象: backend/tests/unit/harness/test_task.py
設計根拠: docs/specs/harness/README.md 保存境界・共通型・公開契約

共通入力: 利用者とロール
状態: retired / retire
廃止理由: Task/runtimeの会社・所有者認可を廃止。
対応項目: #31 / #44

## r10 test_Snapshot_Page間で元データの追加除外順序と表示値が変わっても固定される
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md 正常ケース・取得規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: retired / retire
廃止理由: ページ間固定は保証対象外。最新値取得へ。
対応項目: #48

## r11 test_カーソルの取り違え_別の並び順のcursorのとき400
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md 正常ケース・取得規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: retired / retire
廃止理由: 同じエラーコードの検証へ統合。
対応項目: #52

## r12 test_Snapshotカーソル_条件変更改ざん別所有者期限切れを400で拒否する
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md 正常ケース・取得規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: retired / retire
廃止理由: 条件/署名検証を維持。本人限定/TTLは廃止。
対応項目: #48 / #52

## r13 test_Snapshotカーソル_一覧種別と位置が不正な署名済みcursorも400で拒否する
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md 正常ケース・取得規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: retired / retire
廃止理由: 種別・値境界へ置換。保存配列の位置を廃止。
対応項目: #52 / #70

## r14 test_SnapshotCleanup_先頭Pageで期限切れを100件まで削除しItemもCascadeする
対象: backend/tests/integration/api/posts/test_list_posts.py
設計根拠: docs/specs/features/posts/API.md 正常ケース・取得規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ
状態: retired / retire
廃止理由: Snapshot保存・cleanupを廃止。
対応項目: 機能自体を廃止

## r15 test_先頭Pageで期限切れSnapshotを100件まで削除する
対象: backend/tests/integration/api/metrics/test_get_metrics.py
設計根拠: docs/specs/features/metrics/API.md 正常ケース・集計規則・エラー

共通入力: 利用者とロール / P6：投稿・計測の共通データ / M4：計測の同PV境界
状態: retired / retire
廃止理由: Snapshot保存・cleanupを廃止。
対応項目: 機能自体を廃止

## #137 test_Conversationのlistは本人の検索条件を渡す_User21とprototypeとlimit20なら同じ条件でページを取得する
対象: backend/tests/unit/harness/test_conversation.py
設計根拠: docs/specs/harness/README.md Conversation.list：公開契約 行103
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: RecordStore Fake。meta.user_id21、prototype、limit20、after=None。 → 記録先へ同じ所有者・定義・limit20・after=Noneを渡し、Sessionページと次位置を返す。

## #138 test_Taskのrunは本人IDで初回入力を記録する_User21のSession101なら同じmetaでTurnを受付する
対象: backend/tests/unit/harness/test_task.py
設計根拠: docs/specs/harness/README.md Task.run：公開契約と実行Meta 行512-573
導出規則: Backend §14.2：公開メソッド・公開関数の正常系1本
共通入力: 利用者とロール
状態: planned / add
ケース数: 1
- single: Runner・RecordStore Fake。meta.user_id21、Session101、初回message=開始。 → 初回受付・生成へ同じUser21とSession101を引き継ぎ、TaskResultを返す。会社・Roleによる認可を追加しない。

## #134 test_続きなしの先頭へ操作は条件を保持する_空の続きページからcursorだけを除去して投稿103を表示する
対象: frontend/features/posts/tests/postList.integration.test.tsx
設計根拠: docs/specs/features/posts/SCREEN_DESIGN.md 続きなし：先頭へを押す 行146
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: P+C-Pの「続きの投稿はありません」から先頭へ。Pへの取得が投稿103を返す。 → cursorだけを除去し施策・期間・sort/order保持、投稿103を表示。 通信境界でcursor未送信と適用条件の保持を確認。公開期間は2026-09-30T15:00Z以上・2026-10-31T15:00Z未満。

## #135 test_計測の続きなしから先頭へ戻る_空の続きページからcursorだけを除去して新summaryと施策12を表示する
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 続きなし：先頭へを押す 行164
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: T+C-M、施策0件かつsummary.post_count>=1から先頭へ。応答は更新summaryと施策12。 → 同期間の先頭と新summary、施策12を表示。 通信境界でcursor未送信と適用条件の保持を確認。公開期間は2026-09-30T15:00Z以上・2026-10-31T15:00Z未満。

## #136 test_計測の全体0件から先頭へ戻る_cursor付き全体0件からcursorだけを除去して施策12を表示する
対象: frontend/features/metrics/tests/metricsReport.integration.test.tsx
設計根拠: docs/specs/features/metrics/SCREEN_DESIGN.md 対象期間の該当なし：先頭へを押す 行126
導出規則: Frontend §21.2：提供操作・エラー表示の1行につき1ケース
共通入力: Frontendの入力と通信境界
状態: planned / add
ケース数: 1
- single: T+C-M、summary.post_count=0から先頭へ。応答は更新summaryと施策12。 → 期間保持、cursor除去、新summaryと施策12を表示。 通信境界でcursor未送信と適用条件の保持を確認。公開期間は2026-09-30T15:00Z以上・2026-10-31T15:00Z未満。
