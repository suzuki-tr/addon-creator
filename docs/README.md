# minecraft-addon-creator — プロジェクト概要

## 調査サマリー

### minecraft-creator-tools の現状

[minecraft-creator-tools](https://github.com/Mojang/minecraft-creator-tools)（公開 URL: mctools.dev）は Mojang AB 公式の Bedrock Edition アドオン作成・管理ツール。React 18 + TypeScript + MUI 5 で構築された Web アプリであり、CLI・Electron デスクトップ版・VS Code 拡張・MCP サーバーを単一 TypeScript コードベースから提供する。

| 観点 | 内容 |
|------|------|
| 言語 | TypeScript 5.7.3（strict モード） |
| UI フレームワーク | React 18.3.1 + MUI 5.18.0 + FluentUI NorthStar（混在） |
| ビルドツール | Vite 7.3.5 + esbuild 0.27.2 + Webpack 5.102.1 |
| 3D プレビュー | Babylon.js 8.36.0 |
| コードエディタ | Monaco Editor 0.48.0 |
| フロー図 | @xyflow/react 12.8.2 |
| i18n | react-intl 6.8.9（`app/src/locales/` に 25 言語、`ja_JP.json` 存在） |
| バリデーション | zod 3.25.76 + JSON Schema (`@minecraft/bedrock-schemas`) |
| テスト | Playwright 1.58.2（E2E）+ ts-mocha 10.0.0（ユニット） |
| ターゲット | Node.js >= 22.0.0 / npm >= 10.0.0 |

### 主要機能（実装済みエディタ）

`app/src/UX/editors/` に以下のビジュアルエディタが存在する。

| エディタ | ディレクトリ | 規模感 |
|---------|------------|------|
| エンティティエディタ | `entityType/` | 最大（状態グラフ・3D プレビュー・コンポーネントセット含む） |
| ブロックエディタ | `blockType/` | 大（パーミュテーション・ボクセルシェイプ） |
| アイテムエディタ | `itemType/` | 中 |
| バイオームエディタ | `biome/` | 中 |
| フィーチャーエディタ | `feature/` | 中（DAG パイプライン図） |
| ルートテーブルエディタ | `lootTable/` | 中 |
| レシピエディタ | `recipe/` | 中（Shaped / Shapeless） |
| スポーンルールエディタ | `spawnRules/` | 小〜中 |
| レンダーコントローラーエディタ | `renderController/` | 小〜中 |
| 取引テーブルエディタ | `tradeTable/` | 小〜中 |
| サウンド定義エディタ | `sound/` | 小 |
| ボクセルシェイプエディタ | `voxelShape/` | 中 |

### トレイトシステム

`app/src/minecraft/traits/` に 69 ファイル（エンティティ・ブロック・アイテム向け）が存在。これが ContentGenerator の核となる、ビヘイビアーの再利用可能なパターンライブラリ。

### JSON スキーマ処理

`app/src/minecraft/` 配下に `EntityTypeDefinition.ts`・`BlockTypeDefinition.ts`・`ItemTypeDefinition.ts` 等の TypeScript モデルクラスが存在。`@minecraft/bedrock-schemas 1.26.40-beta` を devDependencies に持ち、`src/info/projectGenerators/` の 30 種以上の検証ルールで活用している。

### minecraft-addon-creator の現状

`C:\Git\minecraft\minecraft-addon-creator` は **空のプロジェクト**（`docs/` ディレクトリのみ）。今回の設計書作成が移植の起点となる。

---

## プロジェクト概要

**minecraft-addon-creator** は minecraft-creator-tools のコア機能を日本語対応・初心者フレンドリーに再構築した Bedrock Edition アドオン作成 Web アプリ。  
主要ターゲットは **日本語話者の Minecraft アドオン初心者〜中級者**。

### スコープ

```
移植対象 (In Scope)
├── ContentGenerator（トレイトシステム含む）
├── エンティティ / ブロック / アイテム ウィザード UI
├── レシピエディタ（Shaped / Shapeless / かまど）
├── ルートテーブルエディタ（基本版）
├── バリデーション（主要ルール）
├── .mcaddon エクスポート（JSZip）
├── プロジェクト管理（作成・保存・読込、IndexedDB）
└── 3D プレビュー（Babylon.js）

スコープ外（将来フェーズ）
├── CLI ツール（Node.js CLI）
├── VS Code 拡張
├── MCP サーバー
├── Electron デスクトップ版
├── フィーチャー / フィーチャールール DAG エディタ
├── バイオームエディタ
├── ジグソー構造エディタ
├── パーティクルエディタ
├── アニメーションコントローラービジュアルエディタ
├── Bedrock Dedicated Server 連携
└── GitHub Storage 連携
```

---

## 3 つの改変要件の概要

### 1. 平易な日本語対応（i18n アーキテクチャ）

移植元は英語 UI のみ（`ja_JP.json` は存在するが UI は英語）。移植先では **日本語を primary locale** とし、英語も維持する。

- react-i18next を採用（移植元の react-intl から変更）
- `src/i18n/locales/ja.json`（日本語）・`src/i18n/locales/en.json`（英語）でリソース管理
- UI ラベル・エラーメッセージ・コンテンツ（トレイト名・説明文）をすべて翻訳キー経由で表示
- 移植元 `locales/ja_JP.json` の訳語を最大限流用

詳細: [i18n-design.md](./i18n-design.md)

### 2. 詳細機能の表示・非表示切り替え（UIモード）

- **シンプルモード**（デフォルト）: 初心者向け。高抽象トレイト選択・基本ステータス編集のみ表示
- **詳細モード**: 上級者向け。低レベルコンポーネント直接編集・JSON 生 プレビュー・すべてのプロパティを表示

Zustand グローバルストア（`uiModeStore`）で状態管理し、コンポーネント側で `useUiMode()` フックを使って分岐する。

詳細: [feature-toggle-design.md](./feature-toggle-design.md)

### 3. 簡易ウィザード

5 ステップのガイド付きフローでアドオンを作成できる。

```
Step 1: コンテンツ種別選択（モブ / ブロック / アイテム）
Step 2: ベース選択（バニラカタログ or ゼロから）
Step 3: トレイト選択（行動・属性パターン）
Step 4: カスタマイズ（名前・ステータス・外観）
Step 5: プレビュー → エクスポート
```

詳細: [wizard-design.md](./wizard-design.md)

---

## 移植元との差分概要

| 観点 | minecraft-creator-tools（移植元） | minecraft-addon-creator（移植先） |
|------|--------------------------------|--------------------------------|
| 主要言語 | 英語 | **日本語**（英語も維持） |
| ターゲット | 開発者・上級クリエイター | **初心者〜中級者** |
| UI フレームワーク | React 18 + MUI 5 + FluentUI | **React 19 + Tailwind CSS v4** |
| ビルドツール | Vite 7 + Webpack + esbuild | **Vite 8（Rolldown 搭載）** |
| 状態管理 | React Context + immer | **Zustand 5 + immer** |
| i18n | react-intl 6（英語 primary） | **react-i18next 16（日本語 primary）** |
| テスト | Playwright + ts-mocha | **Vitest + Playwright** |
| UIモード | なし | **シンプル / 詳細 切り替え** |
| ウィザード | ContentWizard（上級者向け） | **簡易ウィザード（初心者向け）** |
| 配布形態 | Web / CLI / Electron / VS Code | **Web アプリのみ（Phase 1）** |

---

## 参照ドキュメント

- [tech-stack.md](./tech-stack.md) — 技術スタック設計
- [architecture.md](./architecture.md) — アーキテクチャ設計
- [i18n-design.md](./i18n-design.md) — 国際化（i18n）設計
- [feature-toggle-design.md](./feature-toggle-design.md) — 機能表示切り替え設計
- [wizard-design.md](./wizard-design.md) — 簡易ウィザード設計
- [porting-plan.md](./porting-plan.md) — 移植実装計画

## 既存分析ドキュメント（addon-creator リポジトリ）

- `C:\Git\minecraft\addon-creator\docs\analysis-minecraft-creator-tools.md`
- `C:\Git\minecraft\addon-creator\docs\mccreator-vs-creator-tools.md`
