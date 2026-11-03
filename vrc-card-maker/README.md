# VRC IDENTITY GEN

VRChat 用の自己紹介カード画像を作る Web ツール。写真とプロフィールを入れるだけで、X や Discord に貼れる PNG (1920×1080 / 1080×1920) を書き出せます。

## 機能

- テンプレート 3 種 (STREET / POP / ID CARD) × 横・縦 × テキスト / 写真モード
- 配色プリセットと自由なカラー設定
- メイン写真の位置・ズーム調整 (プレビュー上でドラッグも可)
- プレイタグの追加・編集・削除と ◎○△× の凡例
- VRChat 名 / X / いる時間 / 好きなもの欄、マイク音量表示
- 入力内容と写真をブラウザ (IndexedDB) に自動保存
- 画像処理はすべて端末内で完結 (サーバーへの送信なし)

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## 公開

`main` に push すると GitHub Actions (`.github/workflows/deploy.yml`) が静的書き出しして GitHub Pages に公開します。
リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく必要があります。

## 構成

- `app/page.tsx` — 画面全体 (プレビュー・保存・自動保存)
- `components/editor/` — 編集パネル
- `components/card/` — カードのテンプレート (`StreetCard` / `PopCard` / `IdCard`) と共通部品
- `lib/card.ts` — データ型・初期値・テンプレートと配色の定義
- `lib/image.ts` — 写真の縮小読み込みと PNG 書き出し (使用文字だけの Web フォント埋め込み)
- `lib/storage.ts` — IndexedDB への保存
