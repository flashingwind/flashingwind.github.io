# Git 履歴のクリーンアップガイド

## ⚠️ 重要: コミット履歴から `.env` ファイルを削除する

`.env` ファイルに含まれるAPIキーはすでに公開されているため、以下の手順で対応してください。

---

## 手順 1: Supabase APIキーのローテーション（最優先）

```bash
# 1. Supabase ダッシュボード にアクセス
# 2. Settings > API にアクセス
# 3. 以下のキーをローテーション:
#    - Anon (public) key
#    - Service role key
# 4. 新しいキーをコピー
```

**ダッシュボードURL**: https://app.supabase.com/projects

---

## 手順 2: GitHub Secrets を更新

```bash
# GitHub リポジトリの Settings > Secrets and variables > Actions
# 以下を新しいキーで更新:

# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY (新しい匿名キーに更新)
# VITE_SUPABASE_BUCKET
```

---

## 手順 3: ローカルリポジトリをクリーンアップ

### オプション A: 簡単な方法（推奨）

```bash
# 1. .env ファイルを削除
rm .env

# 2. .gitignore に追加されたか確認
cat .gitignore | grep -E "^\.env"

# 3. ステージングをリセット
git reset HEAD .env

# 4. コミット
git add .gitignore .env.example src/
git commit -m "Security fix: Remove .env and sensitive data, improve error handling"

# 5. プッシュ
git push origin master
```

### オプション B: 完全に履歴から削除（高度）

```bash
# git-filter-repo を使用（推奨）
# インストール: brew install git-filter-repo

git filter-repo --invert-paths --paths .env

# または BFG Repo-Cleaner を使用
# インストール: brew install bfg

bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin master --force-with-lease
```

**⚠️ 注意**: `--force-with-lease` は強制プッシュです。共同開発者がいる場合は事前に相談してください。

---

## 手順 4: ローカル環境を更新

```bash
# 1. 新しい .env ファイルを作成
cp .env.example .env

# 2. 新しいAPIキーを入力
# nano .env または vim .env で編集

VITE_SUPABASE_URL=https://gaspuxqbktnrdgavdvdr.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here
VITE_SUPABASE_BUCKET=portfolio-assets

# 3. .env が .gitignore に含まれていることを確認
git check-ignore .env  # 出力: .env

# 4. ローカルサーバーをテスト
npm run dev
```

---

## 手順 5: デプロイメントの確認

```bash
# GitHub Actions のワークフローが正常に実行されたか確認

# 1. https://github.com/flashingwind/flashingwind.github.io/actions
# 2. 最新の Deploy ワークフローをクリック
# 3. "Build" ステップで正常にビルドされたか確認
#    - Secrets から環境変数が正しく読み込まれているか
#    - エラーログがないか
```

---

## トラブルシューティング

### ビルドが失敗する場合

```bash
# 1. GitHub Secrets が正しく設定されているか確認
# 2. Secret の値の前後に空白がないか確認
# 3. ローカルでテスト
npm run build
```

### 古いキーが他のサービスで使用されている場合

```bash
# 1. 全グローバルサーチ
grep -r "your_supabase_anon_key" --include="*.js" --include="*.jsx"

# 2. 見つかったファイルがあれば確認（本来はない）
```

---

## セキュリティ確認チェックリスト

- [ ] Supabase でAPIキーをローテーション（新キー生成・古キー削除）
- [ ] GitHub Secrets を新しいキーで更新
- [ ] ローカル `.env` を削除
- [ ] `git filter-repo` または `bfg` でコミット履歴から削除
- [ ] `git push origin master --force-with-lease` でプッシュ
- [ ] GitHub Actions が正常に動作しているか確認
- [ ] https://flashingwind.github.io が正常に動作しているか確認
- [ ] GitHub リポジトリの Security タブでシークレットスキャンアラートを確認

---

## 参考リンク

- [Supabase API Key Management](https://supabase.com/docs/guides/api#api-url-and-keys)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**実施日**: 2026年5月12日
