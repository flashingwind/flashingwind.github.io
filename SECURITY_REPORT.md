# セキュリティ監査レポート

**実施日**: 2026年5月12日  
**プロジェクト**: flashingwind.github.io  
**ステータス**: ✅ **重大な問題を修正しました**

---

## 🔴 発見された問題と修正内容

### 1. **CRITICAL: APIキーがリポジトリに公開されている**

**問題内容:**

- `.env` ファイルが実際の Supabase APIキーとURLとともにGitHubリポジトリにコミットされていた
- `.env.example` にも実際のAPIキー値が含まれていた

**修正内容:**

- ✅ `.env` を `.gitignore` に追加
- ✅ `.env.example` をプレースホルダー値に更新

**⚠️ 今すぐ実施が必要:**

```
Supabase ダッシュボードで以下の操作をしてください:
1. 現在のAPIキーをローテーション（新しいキーを生成）
2. 古いキーを削除
3. 環境変数を GitHub Secrets に設定
```

**参考**: `.github/workflows/deploy.yml` ではすでに GitHub Secrets を使用しており、正しい設定がされています。

---

### 2. **HIGH: エラーメッセージが機密情報を漏洩する可能性**

**問題内容:**

- Login.jsx、App.jsx、AdminWorks.jsx で Supabase からのエラーメッセージをそのまま表示
- 内部情報や SQL エラーなどが露出する可能性

**修正内容:**

- ✅ ユーザー向けエラーメッセージを汎用的なものに変更
- ✅ 詳細なエラーログはコンソールに出力（開発・デバッグ用）

**変更ファイル:**

- [src/pages/Login.jsx](src/pages/Login.jsx) - メールとGitHub両方のログイン処理
- [src/App.jsx](src/App.jsx) - 作品データ読み込み時
- [src/pages/admin/AdminWorks.jsx](src/pages/admin/AdminWorks.jsx) - 作品の取得・削除時
- [src/components/WorkForm.jsx](src/components/WorkForm.jsx) - フォーム保存時

---

### 3. **MEDIUM: 環境変数ファイルの不適切な管理**

**問題内容:**

- `.env.example` が最新の実際の設定値を含んでいた
- 開発者が参考にする際にセキュリティリスク

**修正内容:**

- ✅ `.env.example` を適切なプレースホルダー値に更新
- ✅ `.gitignore` に `.env`, `.env.local`, `.env.*.local` を追加

---

## ✅ セキュリティベストプラクティスの遵守状況

### 良い点 ✓

- GitHub Secrets を使用した CI/CD パイプライン（`deploy.yml`）
- 適切な CORS 設定（`rel="noreferrer"` の使用）
- パスワード入力フィールドの正しい設定（`type="password"`, `autoComplete="current-password"`）

### 推奨改善事項

#### 1. 🔐 Row Level Security (RLS) の設定

✅ **実装ガイド**: [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) を参照してください。

**設定内容:**

- ✅ 'works' テーブルは全員が読み取り可能
- ✅ 認証ユーザーのみが作品の作成・編集・削除が可能
- ✅ Row Level Security を有効化

**必要なポリシー:**

```sql
-- 1. 全員読み取り可能
CREATE POLICY "Allow public select" ON works
  FOR SELECT USING (true);

-- 2. 認証ユーザーのみ追加可能
CREATE POLICY "Allow authenticated insert" ON works
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. 認証ユーザーのみ編集可能
CREATE POLICY "Allow authenticated update" ON works
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. 認証ユーザーのみ削除可能
CREATE POLICY "Allow authenticated delete" ON works
  FOR DELETE USING (auth.role() = 'authenticated');
```

**設定方法**: Supabase ダッシュボード > SQL Editor で上記のポリシーを実行

#### 2. 🔑 JWT トークンの検証

現在、anonymous キーを使用していますが、管理操作にはサービスロールキーの使用を検討してください。

**改善案:**

```javascript
// 管理操作専用のクライアント（バックエンド実装推奨）
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY, {
	auth: { autoRefreshToken: false, persistSession: false },
});
```

#### 3. 🛡️ Rate Limiting の設定

✅ **実装ガイド**: [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md#2-⏱️-rate-limiting-の設定) を参照してください。

**必要な設定:**

- ✅ Rate limit for token refreshes: 30 per 5 minutes per IP
- ✅ Rate limit for token verifications: 30 per 5 minutes per IP
- ✅ Rate limit for anonymous users: 30 per hour per IP

**設定方法**: Supabase ダッシュボード > Authentication > Rate Limiting で有効化

#### 4. 📝 Content Security Policy (CSP)

`index.html` に CSP ヘッダーを追加することを検討してください。

```html
<meta
	http-equiv="Content-Security-Policy"
	content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self' https://gaspuxqbktnrdgavdvdr.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  font-src 'self';
"
/>
```

#### 5. 🔍 依存関係の脆弱性チェック

定期的に実行してください:

```bash
npm audit
npm audit fix
```

---

## 📋 チェックリスト

必ず実施してください:

- [ ] Supabase ダッシュボードで APIキーをローテーション
- [ ] GitHub リポジトリの `.env` ファイルをコミット履歴から削除
    ```bash
    git rm --cached .env
    git commit -m "Remove .env file from history (security fix)"
    ```
- [ ] GitHub Secrets に正しい環境変数を設定
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_SUPABASE_BUCKET`
- [ ] Supabase RLS ポリシーを確認・設定
- [ ] `npm audit` を実行して依存関係をチェック

---

## 🔧 修正ファイル一覧

| ファイル                         | 修正内容                                             |
| -------------------------------- | ---------------------------------------------------- |
| `.gitignore`                     | 環境変数ファイルを追加                               |
| `.env.example`                   | 実際のキーをプレースホルダーに変更                   |
| `src/pages/Login.jsx`            | エラーメッセージを汎用化、ログをコンソール出力に変更 |
| `src/App.jsx`                    | エラーハンドリングを追加                             |
| `src/pages/admin/AdminWorks.jsx` | エラーメッセージを汎用化                             |
| `src/components/WorkForm.jsx`    | エラーメッセージを汎用化                             |

---

## 📞 サポート

セキュリティ関連の質問がある場合は、以下のリソースを参照してください:

- [Supabase Security Documentation](https://supabase.com/docs/guides/security)
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**更新日**: 2026年5月12日  
**次回監査予定**: 3ヶ月後
