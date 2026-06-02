# Work Time Viewer

Google Calendar の iCal URL から稼働時間を取得・集計・可視化するビューアアプリです。

## 機能

- iCal (`.ics`) フィードの取得・パース
- 複数勤務先の一括管理
- タイトル別の稼働時間集計
- 週別・日別の積み上げ棒グラフ（タイトル別色分け）
- 累積稼働時間チャート
- GitHub 風アクティビティヒートマップ
- 作業内容ワードクラウド（イベント description から生成）
- 請求書用サマリー出力
- CSV エクスポート
- すべてのデータはブラウザ (localStorage) で管理 — サーバー側にユーザーデータを保存しません

## 技術スタック

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Recharts** (グラフ描画)
- **ical.js** (iCal パース)
- **date-fns** / **date-fns-tz** (日付処理・JST 対応)
- **Geist** フォント
- **Docker** 対応

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 でアクセスできます。

### Docker

```bash
docker compose up --build
```

http://localhost:3000 でアクセスできます。

## 使い方

1. トップページで勤務先を追加（名前・iCal URL・テーマカラーを設定）
2. ダッシュボード (`/dashboard`) で稼働時間を確認
3. デモモード: 勤務先未登録時はサンプルデータが表示されます

## ライセンス

MIT
