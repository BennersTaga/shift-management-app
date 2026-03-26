# shift-management-app

従業員向けのシフト入力アプリです。  
この改修により、フロントエンドから Google Apps Script (GAS) を直接呼び出さず、サーバー API 経由で通信する構成に変更しています。

## セキュリティ改善の概要

- フロントコードに埋め込まれていた GAS `/exec` URL を削除
- ブラウザは `/api/employees`, `/api/shifts` のみを呼び出し
- GAS URL はサーバー環境変数 `GAS_WEB_APP_URL` から取得
- 従業員一覧レスポンスを必要最低限フィールドへ絞って返却

> 注意: この修正でフロントからの URL 露出は防げますが、Apps Script 側の公開範囲・認証設定の見直しは引き続き必要です。

## 必要環境変数

`.env.example` をコピーして `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

設定項目:

- `GAS_WEB_APP_URL`: GAS Web App の `/exec` URL

## ローカル開発

```bash
npm install
npm run dev
```

ブラウザから `http://localhost:5173` を開きます。

## API エンドポイント

- `GET /api/employees`: 従業員情報取得（サーバー→GAS）
- `POST /api/shifts`: シフト提出（サーバー→GAS）

どちらもクライアントには GAS URL を返しません。

## デプロイ時の注意

- ホスティング先（例: Vercel）の環境変数に `GAS_WEB_APP_URL` を必ず設定
- `.env`, `.env.local` の実値はコミットしない
- GAS 側は「アクセス可能なユーザー」「実行ユーザー」「レスポンス項目」を最小権限で再確認

## 検証コマンド

```bash
npm run build
```

必要に応じて、デプロイ先で `/api/employees` と `/api/shifts` の疎通確認を行ってください。
