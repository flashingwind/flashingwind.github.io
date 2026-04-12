# Munenori IIDA Portfolio

React + Vite + GitHub Pages で動くポートフォリオです。作品データは Supabase を軸に管理し、画像は Supabase Storage か Cloudinary に寄せる構成です。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## 公開設定

1. GitHub Pages の Source を GitHub Actions に設定します。
2. Supabase で `supabase/migrations/001_init.sql` を実行します。
3. `.env.example` を参考に、ローカル環境に `.env` を作成します。
4. `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定します。
5. `VITE_SUPABASE_BUCKET` は必要なら変更します。
6. `master` へ push すると GitHub Actions が `dist` を公開します。

## 使う主なサービス

- フロント: React + Vite + GitHub Pages
- バックエンド: Supabase
- 画像の保存とプレビュー: Supabase Storage か Cloudinary
- 連絡先メール: Resend か SendGrid、暫定なら Gmail SMTP
- 自動公開: GitHub Actions

## 作品データ

作品は `published_at` の降順で自動整列します。YouTube、Instagram、GitHub、Web、メールは作品カードの URL 欄に入れるだけで追加できます。
