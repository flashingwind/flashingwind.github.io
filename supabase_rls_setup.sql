-- Supabase RLS ポリシー設定スクリプト
-- このスクリプトを Supabase ダッシュボード > SQL Editor で実行してください
-- 実行対象: flashingwind.github.io プロジェクト

--============================================================
-- STEP 1: RLS の有効化
--============================================================

-- works テーブルで RLS を有効化
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- RLS が有効になったか確認
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'works';


--============================================================
-- STEP 2: 既存ポリシーの削除（必要な場合）
--============================================================

-- 注: このセクションは最初の設定時には不要です
-- 既存のポリシーを削除したい場合のみ実行してください

-- DROP POLICY IF EXISTS \"Allow public select\" ON works;
-- DROP POLICY IF EXISTS \"Allow authenticated insert\" ON works;
-- DROP POLICY IF EXISTS \"Allow authenticated update\" ON works;
-- DROP POLICY IF EXISTS \"Allow authenticated delete\" ON works;


--============================================================
-- STEP 3: RLS ポリシーの作成
--============================================================

-- ポリシー 1: 全員読み取り可能
-- 説明: フロントエンドの公開ページで作品データを表示するために必要
CREATE POLICY \"Allow public select\" ON works
  FOR SELECT
  USING (true);

-- ポリシー 2: 認証ユーザーのみ作品追加可能
-- 説明: 管理画面から認証ユーザーが新規作品を追加
CREATE POLICY \"Allow authenticated insert\" ON works
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ポリシー 3: 認証ユーザーのみ作品編集可能
-- 説明: 管理画面から認証ユーザーが既存作品を編集
CREATE POLICY \"Allow authenticated update\" ON works
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ポリシー 4: 認証ユーザーのみ作品削除可能
-- 説明: 管理画面から認証ユーザーが作品を削除
CREATE POLICY \"Allow authenticated delete\" ON works
  FOR DELETE
  USING (auth.role() = 'authenticated');


--============================================================
-- STEP 4: ポリシーの確認
--============================================================

-- 作成したすべてのポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'works'
ORDER BY policyname;

-- 期待される出力:
-- ✓ Allow public select
-- ✓ Allow authenticated insert
-- ✓ Allow authenticated update
-- ✓ Allow authenticated delete


--============================================================
-- STEP 5: 認証設定の確認（オプション）
--============================================================

-- デフォルトロールが正しく設定されているか確認
-- SELECT * FROM auth.users LIMIT 1;


--============================================================
-- STEP 6: テスト用サンプルデータ（初回テスト用）
--============================================================

-- 注: 本番環境では削除してください
-- INSERT INTO works (title, description, tags, published_at)
-- VALUES (
--   'Test Work',
--   'This is a test work',
--   ARRAY['test', 'sample'],
--   NOW()
-- );


--============================================================
-- 注意事項
--============================================================

-- 1. RLS ポリシーが有効になると:
--    - 認証なしでは SELECT のみ可能
--    - INSERT/UPDATE/DELETE には認証が必須

-- 2. キャッシュのリセットが必要な場合:
--    NOTIFY pgrst, 'reload schema';

-- 3. ポリシーを削除する場合:
--    DROP POLICY \"ポリシー名\" ON works;

-- 4. すべてのポリシーを削除して RLS を無効化:
--    ALTER TABLE works DISABLE ROW LEVEL SECURITY;
