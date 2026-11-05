# 📚 セキュリティドキュメント構成

このプロジェクトのセキュリティ関連ドキュメントの構成と使い方を説明します。

---

## 📖 ドキュメント一覧

### 1. 🔍 **[SECURITY_REPORT.md](SECURITY_REPORT.md)**

**目的**: セキュリティ監査の結果報告書

**内容**:

- 🔴 発見されたセキュリティ問題（Critical, High, Medium）
- ✅ 実施した修正内容
- 📋 チェックリスト

**対象者**: 全員（セキュリティ意識の共有）

**更新頻度**: 3ヶ月ごと

---

### 2. 🛠️ **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)**

**目的**: Supabase のセキュアな設定方法

**内容**:

- 🔐 Row Level Security (RLS) ポリシーの設定手順
- ⏱️ Rate Limiting の有効化方法
- 🧪 設定の検証方法
- 📊 テストスクリプト

**対象者**: 管理者、開発者

**実装時期**: 今すぐ（Supabase デプロイ時）

**手順**:

```bash
1. Supabase ダッシュボードで SQL Editor を開く
2. SUPABASE_SETUP_GUIDE.md の SQL コマンドを実行
3. 検証セクションのテストを実行
4. 本番環境にデプロイ
```

---

### 3. 🧹 **[GIT_CLEANUP_GUIDE.md](GIT_CLEANUP_GUIDE.md)**

**目的**: コミット履歴から機密情報を削除

**内容**:

- ⚠️ APIキーローテーション手順
- 🔧 GitHub Secrets の更新方法
- 🧹 Git 履歴クリーンアップ（git-filter-repo, BFG）

**対象者**: リポジトリ管理者

**実装時期**: **緊急**（すぐに実施が必要）

**手順**:

```bash
1. Supabase で新しいAPIキーを生成
2. 古いAPIキーを削除
3. GitHub Secrets を更新
4. git filter-repo でコミット履歴をクリーン
5. 強制プッシュ
```

---

## 🚀 クイックスタート

### 初回セットアップ（今すぐ実施）

```bash
# 1. Git クリーンアップ（最優先）
cd flashingwind.github.io
bash GIT_CLEANUP_GUIDE.md  # 手順に従う

# 2. Supabase 設定
# Supabase ダッシュボードで:
# - SUPABASE_SETUP_GUIDE.md の SQL を実行
# - Rate Limiting を有効化
# - テストを実行

# 3. ローカルテスト
npm run build
npm run dev
```

### 定期監査（3ヶ月ごと）

```bash
1. npm audit でセキュリティチェック
2. Supabase ダッシュボードで RLS ポリシーを確認
3. ログを確認（異常なアクセスがないか）
4. バックアップが正常に作成されているか確認
5. セキュリティレポートを更新
```

---

## 📋 チェックリスト

### デプロイ前に確認すること

- [ ] Git クリーンアップが完了
    - [ ] `.env` がコミット履歴から削除
    - [ ] APIキーがローテーション
    - [ ] GitHub Secrets が更新
- [ ] Supabase RLS ポリシーが設定
    - [ ] "Allow public select" が有効
    - [ ] "Allow authenticated insert" が有効
    - [ ] "Allow authenticated update" が有効
    - [ ] "Allow authenticated delete" が有効
- [ ] Rate Limiting が有効
    - [ ] Sign Up Rate Limiting: ON
    - [ ] Password Reset Rate Limiting: ON
    - [ ] Token Refresh Rate Limiting: ON
- [ ] テストが完了
    - [ ] 公開ページで作品が表示される
    - [ ] 認証後に管理操作ができる
    - [ ] 認証なしで管理操作ができない
    - [ ] GitHub Actions のデプロイが成功

---

## 🔐 セキュリティポリシー

### 重大度レベル

| レベル      | 説明                                 | 対応期限           |
| ----------- | ------------------------------------ | ------------------ |
| 🔴 Critical | システムの機密情報漏洩、認証回避など | 即座（24時間以内） |
| 🟠 High     | セキュリティ機能の不十分な実装       | 1週間以内          |
| 🟡 Medium   | セキュリティのベストプラクティス違反 | 2週間以内          |
| 🟢 Low      | 推奨事項、改善提案                   | 1ヶ月以内          |

### 報告とエスカレーション

1. **問題を発見**
    - SECURITY_REPORT.md に記録
    - 社内チャットで報告

2. **対応を実施**
    - 該当するガイドドキュメントを参照
    - 修正を実装
    - テストを実行

3. **レビューと承認**
    - Pull Request でレビュー
    - マージ前に検証

4. **本番環境へのデプロイ**
    - GitHub Actions で自動デプロイ
    - 本番環境で動作確認

---

## 📞 サポートとリファレンス

### 公式ドキュメント

- [Supabase Security Documentation](https://supabase.com/docs/guides/security)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### よくある質問

**Q: Git 履歴から削除したファイルが復活した**

- 強制プッシュが成功したか確認してください
- `git log --all` で確認

**Q: RLS ポリシーが反映されない**

- `NOTIFY pgrst, 'reload schema';` を実行してキャッシュをクリア

**Q: Rate Limiting が効いていない**

- Supabase ダッシュボードで設定が有効になっているか確認
- 数分待機（キャッシュの同期待機）

---

## 🔄 更新履歴

| 日付       | 内容                                                           | 作成者         |
| ---------- | -------------------------------------------------------------- | -------------- |
| 2026-05-12 | 初版作成：セキュリティ監査、RLS ポリシー、Rate Limiting ガイド | Security Audit |

---

## 📮 フィードバック

セキュリティに関する質問や改善提案は以下にお願いします：

- GitHub Issues（プライベートリポジトリ）
- 社内チャット

---

**最終更新**: 2026年5月12日
