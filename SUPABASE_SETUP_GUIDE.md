# Supabase セットアップガイド

**Row Level Security (RLS) ポリシーと Rate Limiting の設定**

---

## 📋 概要

このガイドでは、`flashingwind.github.io` プロジェクトの Supabase インスタンスに対して、Row Level Security (RLS) ポリシーと Rate Limiting を設定する手順を説明します。

---

## 1. 🔐 Row Level Security (RLS) ポリシーの設定

### 1.1 RLS の有効化

1. Supabase ダッシュボード: <https://app.supabase.com>
2. プロジェクトを選択
3. **SQL Editor** に移動
4. **New query** をクリック
5. 以下の SQL を実行してRLSを有効化

```sql
-- RLS を有効化
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを確認（必要に応じて削除）
SELECT * FROM pg_policies WHERE tablename = 'works';
```

### 1.2 RLS ポリシーの作成

#### ポリシー 1: 全員読み取り可能（SELECT）

```sql
-- works テーブル - 全員が読み取り可能
CREATE POLICY "Allow public select" ON works
  FOR SELECT
  USING (true);
```

**説明**:

- 認証なしでも全員が作品データを読み取り可能
- フロントエンドの公開ページに必要

---

#### ポリシー 2: 認証ユーザーのみ追加可能（INSERT）

```sql
-- works テーブル - 認証ユーザーのみが作品を追加可能
CREATE POLICY "Allow authenticated insert" ON works
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

**説明**:

- ログイン済みのユーザーのみが新規作品を追加可能
- 管理画面から使用

---

#### ポリシー 3: 認証ユーザーのみ編集可能（UPDATE）

```sql
-- works テーブル - 認証ユーザーが編集可能
CREATE POLICY "Allow authenticated update" ON works
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

**説明**:

- ログイン済みのユーザーのみが作品を編集可能
- 管理画面から使用

---

#### ポリシー 4: 認証ユーザーのみ削除可能（DELETE）

```sql
-- works テーブル - 認証ユーザーが削除可能
CREATE POLICY "Allow authenticated delete" ON works
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

**説明**:

- ログイン済みのユーザーのみが作品を削除可能
- 管理画面から使用

---

### 1.3 ポリシーの確認

```sql
-- 作成したポリシーを確認
SELECT
  schemaname,
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'works'
ORDER BY policyname;
```

**期待される結果:**

```
┌───────────┬───────────┬─────────────────────────┬──────┬────────┐
│ schemaname│ tablename │ policyname              │ qual │with_chk│
├───────────┼───────────┼─────────────────────────┼──────┼────────┤
│ public    │ works     │ Allow public select     │ true │        │
│ public    │ works     │ Allow authenticated ... │ ...  │ ...    │
│ public    │ works     │ Allow authenticated ... │ ...  │ ...    │
│ public    │ works     │ Allow authenticated ... │ ...  │ ...    │
└───────────┴───────────┴─────────────────────────┴──────┴────────┘
```

---

## 2. ⏱️ Rate Limiting の設定

Rate Limiting は、API へのリクエスト数を制限し、ブルートフォース攻撃やDoS攻撃を防止します。

### 2.1 認証の Rate Limiting を有効化

1. Supabase ダッシュボード: <https://app.supabase.com>
2. プロジェクトを選択
3. **Authentication** > **Rate Limiting** に移動
4. 以下の設定を有効化

#### Rate limit for token refreshes

- **有効**: ✅ ON
- **Requests**: `30` per 5 minutes per IP
- **説明**: Sessions that can be refreshed in a 5 minute interval per IP address

#### Rate limit for token verifications

- **有効**: ✅ ON
- **Requests**: `30` per 5 minutes per IP
- **説明**: OTP/Magic link verifications that can be made in a 5 minute interval per IP address

#### Rate limit for anonymous users

- **有効**: ✅ ON
- **Requests**: `30` per hour per IP
- **説明**: Anonymous sign-ins that can be made per hour per IP address

---

### 2.2 API Gateway での Rate Limiting（ビジネスプランの場合）

ビジネスプラン以上の場合、API Gateway で追加のレート制限が可能です。

1. **API Gateway** に移動（オプション）
2. **Rate Limiting** タブをクリック
3. 以下を設定

```yaml
# API Gateway Rate Limiting 推奨設定

Default Limit: 1000 requests/minute per IP

# エンドポイント別の設定例
/rest/v1/works:
    - Method: GET
      Limit: 100 requests/minute per IP

    - Method: POST
      Limit: 10 requests/minute per IP

    - Method: PUT/PATCH
      Limit: 10 requests/minute per IP

    - Method: DELETE
      Limit: 5 requests/minute per IP

/auth/v1/signup:
    - Limit: 5 requests/hour per IP

/auth/v1/token:
    - Limit: 10 requests/minute per IP
```

---

## 3. 🧪 設定の検証

### 3.1 RLS ポリシーのテスト

**前提条件**: 環境変数を設定してください:

```bash
# オプション 1: .env ファイルから読み込む
source .env

# または

# オプション 2: 直接設定（推奨）
export SUPABASE_URL="https://gaspuxqbktnrdgavdvdr.supabase.co"
export SUPABASE_ANON_KEY="your_supabase_anon_key"  # .env から実際のキーをコピー

# 確認
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

#### テスト 1: 認証なしで SELECT（成功するはず）

**方法 A: 環境変数を使用する場合**

```bash
curl -X GET "$SUPABASE_URL/rest/v1/works" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

**方法 B: 直接実行する場合**

```bash
curl -X GET "https://gaspuxqbktnrdgavdvdr.supabase.co/rest/v1/works" \
  -H "apikey: your_supabase_anon_key"
```

期待される結果: `200 OK` - 作品リストが返される

---

#### テスト 2: 認証なしで INSERT（失敗するはず）

**方法 A: 環境変数を使用**

```bash
curl -X POST "$SUPABASE_URL/rest/v1/works" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d '{
    "title": "Test Work",
    "description": "Test",
    "tags": ["test"],
    "urls": ["https://example.com"]
  }'
```

**方法 B: 直接実行**

```bash
curl -X POST "https://gaspuxqbktnrdgavdvdr.supabase.co/rest/v1/works" \
  -H "Content-Type: application/json" \
  -H "apikey: your_supabase_anon_key" \
  -d '{
    "title": "Test Work",
    "description": "Test",
    "tags": ["test"],
    "urls": ["https://example.com"]
  }'
```

期待される結果: `403 Forbidden` - RLS ポリシーにより拒否

---

#### テスト 3: 認証ありで INSERT（成功するはず）

**前提**: ログイン後のアクセストークン（JWT）が必要です

**JWT トークン取得方法**:

**方法 1: localStorage から取得（最も簡単）**

1. ブラウザで <https://flashingwind.github.io/admin> を開く
2. ログインする
3. ブラウザコンソール (F12) で以下を実行:

    ```javascript
    // localStorage から Supabase セッションを確認
    const session = JSON.parse(
    	localStorage.getItem("sb-gaspuxqbktnrdgavdvdr-auth-token"),
    );
    console.log(session.session.access_token);
    ```

4. 出力されたトークン（`eyJhbGc...` で始まる長い文字列）をコピー

**方法 2: Supabase ダッシュボードから確認**

1. <https://app.supabase.com> を開く
2. プロジェクトを選択
3. **SQL Editor** > **New query** でテストユーザーセッションを確認：

    ```sql
    SELECT id, email, last_sign_in_at FROM auth.users LIMIT 1;
    ```

4. 別途、アプリケーション内で新規 JWT を生成し、コピー

**方法 3: curl で認証して取得（Supabase API から直接取得）**

```bash
# .env から認証情報を取得して実行
SUPABASE_URL="https://gaspuxqbktnrdgavdvdr.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
EMAIL="your-email@example.com"
PASSWORD="your-password"

# ログイン API を呼び出し
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }' | jq '.access_token'
```

**方法 A: 環境変数を使用**

```bash
# 上記で取得したトークンを設定
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 実行
curl -X POST "$SUPABASE_URL/rest/v1/works" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -d '{
    "title": "Test Work",
    "description": "Test",
    "tags": ["test"],
    "urls": ["https://example.com"]
  }'
```

**方法 B: 直接実行**

```bash
curl -X POST "https://gaspuxqbktnrdgavdvdr.supabase.co/rest/v1/works" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "apikey: your_supabase_anon_key" \
  -d '{
    "title": "Test Work",
    "description": "Test",
    "tags": ["test"],
    "urls": ["https://example.com"]
  }'
```

期待される結果: `201 Created` - 新規作品が作成される

---

### 3.2 フロントエンドでのテスト

#### 公開ページの作品読み込みテスト

1. <https://flashingwind.github.io> を開く
2. ブラウザコンソール（F12）を開く
3. Network タブで API リクエストを確認
4. `/rest/v1/works` リクエストが `200 OK` で返ることを確認

```javascript
// コンソールで手動実行
import { supabase } from "./src/lib/supabase";

const { data, error } = await supabase
	.from("works")
	.select("*")
	.order("published_at", { ascending: false });

console.log("Data:", data);
console.log("Error:", error);
```

---

#### 管理画面のテスト

1. <https://flashingwind.github.io/admin> にアクセス
2. ログイン
3. "作品を追加" ボタンをクリック
4. 新規作品を追加してみる
5. コンソール確認: 403 エラーが出ないことを確認

---

### 3.3 Rate Limiting のテスト

```bash
#!/bin/bash
# Rate Limiting テストスクリプト

# 環境変数を確認して設定
if [ -z "$SUPABASE_URL" ]; then
  export SUPABASE_URL="https://gaspuxqbktnrdgavdvdr.supabase.co"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  export SUPABASE_ANON_KEY="your_supabase_anon_key"  # .env から取得した値に置き換え
fi

echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY"

# 短時間に大量リクエストを送信
for i in {1..20}; do
  echo "Request $i..."
  curl -s -X GET "$SUPABASE_URL/rest/v1/works?select=id" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -w "HTTP Status: %{http_code}\n"
  sleep 0.5
done
```

期待される動作:

- 最初はすべて `200 OK`
- 一定数を超えると `429 Too Many Requests` が返される

---

## 4. 📊 ポリシー設定チェックリスト

実装時に確認事項:

- [ ] RLS が works テーブルで有効になっている
- [ ] "Allow public select" ポリシーが作成されている
- [ ] "Allow authenticated insert" ポリシーが作成されている
- [ ] "Allow authenticated update" ポリシーが作成されている
- [ ] "Allow authenticated delete" ポリシーが作成されている
- [ ] 公開ページで作品が表示される
- [ ] 管理ページで認証後に作品を追加・編集・削除できる
- [ ] 認証なしで管理操作ができない
- [ ] Rate limit for token refreshes が有効（30 per 5 minutes）
- [ ] Rate limit for token verifications が有効（30 per 5 minutes）
- [ ] Rate limit for anonymous users が有効（30 per hour）

---

## 5. 🚀 本番環境への推奨設定

### Production チェックリスト

- [ ] Row Level Security が有効化されている
- [ ] すべての RLS ポリシーが適切に設定されている
- [ ] Rate Limiting がすべて有効化されている
- [ ] 定期的なセキュリティ監査を実施する計画がある
- [ ] エラーログを監視している
- [ ] バックアップが定期的に作成されている
- [ ] ホワイトリスト IP が設定されている（必要に応じて）

---

## 6. 📚 参考リンク

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Rate Limiting](https://supabase.com/docs/guides/api/rate-limiting)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [REST API Authentication](https://supabase.com/docs/guides/api/rest/authentication)

---

## 7. ⚠️ トラブルシューティング

### RLS ポリシーが反映されない

```sql
-- キャッシュをクリア
NOTIFY pgrst, 'reload schema';

-- または SQL エディタで新しいクエリを実行して確認
SELECT * FROM works;
```

---

### Rate Limiting の確認が難しい場合

```bash
# curl で詳細なヘッダーを表示
curl -i -X GET "$SUPABASE_URL/rest/v1/works" \
  -H "apikey: $SUPABASE_ANON_KEY"

# レスポンスヘッダから以下を確認:
# - RateLimit-Limit: 制限数
# - RateLimit-Remaining: 残りリクエスト数
# - RateLimit-Reset: リセット時刻
```

---

## 8. 次のステップ

1. このガイドの手順に従って RLS ポリシーを作成
2. Rate Limiting を有効化
3. テストスクリプトで動作確認
4. 本番環境にデプロイ
5. 定期的に [SECURITY_REPORT.md](SECURITY_REPORT.md) に基づいて監査

---

**作成日**: 2026年5月12日  
**最終更新**: 2026年5月12日
