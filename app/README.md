# Minecraft Addon Creator

Minecraft Bedrock Edition 向けアドオンを GUI で作成・編集できる Web アプリケーションです。
テクスチャ・レシピ・エンティティ挙動などのリソースを、コードを書かずにビジュアルに編集し JSON として出力できます。

---

## 機能一覧

### 3 言語対応（i18n）
- **英語**（`en`）・**日本語**（`ja`）・**子ども向け日本語**（`ja-kids`、ひらがな表記）
- ヘッダーのロケール切替ボタンでリアルタイム切替

### UI モード
- **シンプルモード**: トレイトカードグリッドで主要設定に絞った簡易表示
- **詳細モード**: StatusPanel・StateGraph・AppearancePanel 等フル機能を展開

### ウィザード
- 3 ステップで新規アドオンを作成（種別選択 → 名前入力 → 確認）

### エンティティエディタ（`/editor`）
- **外観タブ**: テクスチャ・ジオメトリ・マテリアル・UV マッピング・ワイヤーフレーム
- **ステータスタブ**: HP・攻撃力・移動速度・サイズのスライダー入力（StatusPanel）
- **State Graph タブ**: 状態遷移グラフ（詳細モードで変数・イベントトリガー追加）
- **JSON プレビュー**: リアルタイムで生成 JSON を確認

### 高度エディタツール
| エディタ | パス | 説明 |
|---------|------|------|
| レシピエディタ | `/recipe` | Shaped / Shapeless / Furnace の 3 種類 |
| ドロップテーブルエディタ | `/loot-table` | Pool accordion + Entry 管理 |
| スポーンルールエディタ | `/spawn-rules` | バイオーム・難易度・時間帯フィルター |
| アニメーションコントローラーエディタ | `/animation-controller` | 3 ペイン状態グラフ・識別子・アニメーションリスト |
| サウンド定義エディタ | `/sound` | サウンドイベント・ファイルリスト・3D / ループ設定 |

---

## 開発環境セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバ起動（http://localhost:5173）
npm run dev
```

---

## ビルド

```bash
# プロダクションビルド（出力: dist/）
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## テスト

```bash
# ユニットテスト（vitest）
npm test

# E2E テスト（Playwright / Chromium）
npx playwright test

# テストカバレッジレポート生成
npx vitest run --coverage
```

ユニットテストは `src/**/*.spec.ts` として配置しています。
E2E テストは `e2e/` ディレクトリにあります。

---

## 技術スタック

| カテゴリ | ライブラリ / ツール | バージョン |
|--------|-------------------|----------|
| フレームワーク | React | 19 |
| 言語 | TypeScript | ^5.8 |
| ビルドツール | Vite | ^8.1 |
| スタイリング | Tailwind CSS | ^4.3 |
| ルーティング | React Router | ^7.0 |
| 状態管理 | Zustand | ^5.0 |
| 国際化 | i18next / react-i18next | ^25 / ^16 |
| UI コンポーネント | @radix-ui/react-switch | ^1.1 |
| アイコン | lucide-react | ^0.513 |
| ユニットテスト | Vitest + Happy DOM + @testing-library/react | ^3.0 |
| E2E テスト | Playwright | ^1.65 |
| リンター | ESLint + TypeScript ESLint | ^9 / ^8 |
| フォーマッター | Prettier | ^3.0 |

---

## ディレクトリ構成

```
app/
├── src/
│   ├── components/
│   │   ├── editor/        # エディタパネルコンポーネント群
│   │   ├── layout/        # AppShell, Header
│   │   └── wizard/        # ウィザードステップコンポーネント
│   ├── i18n/
│   │   └── locales/       # en.json / ja.json / ja-kids.json
│   ├── pages/             # ページコンポーネント（ルート単位）
│   ├── stores/            # Zustand ストア（UI モードなど）
│   ├── utils/             # 純粋関数ユーティリティ（recipeUtils, lootTableUtils）
│   └── test/              # テストセットアップ（vitest mock）
├── e2e/                   # Playwright E2E テスト
├── dist/                  # ビルド出力（.gitignore 対象）
└── coverage/              # カバレッジレポート（.gitignore 対象）
```

---

## ライセンス

MIT
