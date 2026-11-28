# クラス一覧

| クラス名 | 責務 | 関連ドメイン | 利用するクラス | 詳細 |
| --- | --- | --- | --- | --- |
| CompanyInformationService | 会社共通の説明の参照と登録・更新を担い、今回の保存を確定する | [企業情報](DOMAIN_TERMS.md#企業情報) | ServiceContext、CompanyInformationRepository | [詳細](features/company-information/modules/COMPANY_INFORMATION_SERVICE.md) |
| CompanyInformationRepository | 企業に一つだけ属する説明の取得と永続化を担う | [企業情報](DOMAIN_TERMS.md#企業情報) | AsyncSession、CompanyInformation | [詳細](features/company-information/modules/COMPANY_INFORMATION_REPOSITORY.md) |
| PostService | 自社の公開済み投稿の一覧取得と意味検索を担う | [投稿](DOMAIN_TERMS.md#投稿) | ServiceContext、PostRepository、CampaignRepository、EmbeddingClient | [詳細](features/posts/modules/POST_SERVICE.md) |
| MetricsService | 自社の期間全体と施策別の計測結果の参照を担う | [指標・計測記録](DOMAIN_TERMS.md#指標計測記録) | ServiceContext、PostRepository、CampaignRepository | [詳細](features/metrics/modules/METRICS_SERVICE.md) |
| PostRepository | 自社の公開済み投稿と計測結果の参照・集計を担う | [投稿](DOMAIN_TERMS.md#投稿)、[指標・計測記録](DOMAIN_TERMS.md#指標計測記録) | AsyncSession、Post、PostMetric、ApiIdempotencyRequest | [詳細](modules/POST_REPOSITORY.md) |
