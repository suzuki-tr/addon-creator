# 技術スタック設計

## 1. 移植元（minecraft-creator-tools）の技術スタック

`C:\Git\minecraft\minecraft-creator-tools\app\package.json` より抽出。

### ランタイム要件

| 項目 | バージョン |
|------|-----------|
| Node.js | >= 22.0.0 |
| npm | >= 10.0.0 |

### 主要依存ライブラリ（dependencies）

| カテゴリ | パッケージ | バージョン | 用途 |
|---------|-----------|-----------|------|
| **UI フレームワーク** | react | 18.3.1 | UI コアライブラリ |
| | react-dom | 18.3.1 | DOM レンダリング |
| | @mui/material | 5.18.0 | UI コンポーネント |
| | @mui/icons-material | 5.18.0 | MUI アイコン |
| | @emotion/react | 11.14.0 | MUI スタイリング依存 |
| | @emotion/styled | 11.14.1 | MUI スタイリング依存 |
| **i18n** | react-intl | 6.8.9 | 国際化（FormatJS） |
| **状態管理** | —（React Context のみ） | — | — |
| **3D レンダリング** | babylonjs | 8.36.0 | 3D プレビュー |
| | babylonjs-gui | 8.36.0 | Babylon.js GUI |
| **コードエディタ** | monaco-editor | 0.48.0 | コードエディタ |
| | @monaco-editor/react | 4.6.0 | React バインディング |
| | @monaco-editor/loader | 1.4.0 | ローダー |
| **フロー図** | @xyflow/react | 12.8.2 | エンティティ状態グラフ |
| **バリデーション** | zod | 3.25.76 | スキーマバリデーション |
| | json-schema | 0.4.0 | JSON スキーマ検証 |
| **ビジュアルプログラミング** | blockly | 12.0.0 | ビジュアルスクリプト |
| | react-blockly | 9.0.0 | React バインディング |
| **ファイル処理** | jszip | 3.10.1 | .mcaddon 生成 |
| | file-saver | 2.0.5 | ブラウザダウンロード |
| **GitHub 連携** | @octokit/rest | 22.0.1 | GitHub API |
| **その他** | uuid | 9.0.0 | UUID 生成 |
| | axios | 1.15.0 | HTTP クライアント |
| | @fontsource/noto-sans | 5.0.22 | フォント |
| | @fortawesome/react-fontawesome | 0.2.2 | FontAwesome アイコン |
| | @modelcontextprotocol/sdk | 1.28.0 | MCP サーバー |
| | commander | 14.0.2 | CLI コマンド解析 |
| | ink | 5.0.1 | CLI UI |
| | leaflet | 1.7.1 | ワールドマップ |

### 開発依存ライブラリ（devDependencies）

| カテゴリ | パッケージ | バージョン |
|---------|-----------|-----------|
| **言語** | typescript | 5.7.3 |
| **ビルド** | vite | 7.3.5 |
| | @vitejs/plugin-react | 5.0.4 |
| | esbuild | 0.27.2 |
| | webpack | 5.102.1 |
| | gulp | 5.0.1 |
| **テスト（E2E）** | @playwright/test | 1.58.2 |
| | playwright | 1.58.2 |
| **テスト（ユニット）** | mocha | 10.1.0 |
| | ts-mocha | 10.0.0 |
| | chai | 4.3.7 |
| **Lint** | eslint | 8.57.1 |
| | @typescript-eslint/parser | 8.59.0 |
| **Minecraft** | @minecraft/bedrock-schemas | 1.26.40-beta.26 |
| | @minecraft/vanilla-data | 1.26.21 |
| | @minecraft/server | 2.7.0 |
| **デスクトップ** | electron | 42.4.0 |
| | @electron-forge/cli | 7.11.2 |
| **VS Code** | @vscode/vsce | 3.7.1 |

---

## 2. 移植先（minecraft-addon-creator）で採用する技術スタック

### 採用方針

1. **TypeScript strict モード必須**（移植元と同様）
2. **React / Vite / テストフレームワークは最新安定版を優先採用**
3. **UI コンポーネントライブラリ**: MUI + FluentUI の混在を解消し、Tailwind CSS v4 + Radix UI に統一
4. **状態管理**: React Context のみから Zustand 5 に移行（型安全・ミドルウェア対応）
5. **i18n**: react-intl から react-i18next に移行（日本語 primary 対応が容易）
6. **テスト**: ts-mocha から Vitest に移行（Vite ネイティブ、ESM 対応）
7. **スコープ外の依存を除外**: Electron・VS Code・MCP SDK・leaflet・ink・commander 等は含めない

### 移植先技術スタック一覧

#### ランタイム要件

| 項目 | バージョン | 変更理由 |
|------|-----------|---------|
| Node.js | >= 22.0.0 | 移植元と同じ（維持） |
| npm | >= 10.0.0 | 移植元と同じ（維持） |

#### 主要依存ライブラリ（dependencies）

| カテゴリ | パッケージ | 採用バージョン | 変更理由 |
|---------|-----------|-------------|---------|
| **UI フレームワーク** | react | **19.3.0** | 最新安定版。React Compiler 対応、Actions API |
| | react-dom | **19.3.0** | react と同バージョン合わせ |
| **スタイリング** | tailwindcss | **4.3.x** | MUI/FluentUI 混在を解消。CSS ファースト設定（v4）、Rust 製 Oxide エンジンで高速ビルド |
| | @tailwindcss/vite | **4.3.x** | Vite 統合プラグイン（v4 では独立） |
| **UI プリミティブ** | @radix-ui/react-dialog | **1.1.x** | アクセシビリティ対応ダイアログ（MUI の Dialog 代替） |
| | @radix-ui/react-select | **2.1.x** | アクセシビリティ対応セレクト |
| | @radix-ui/react-tabs | **1.1.x** | タブコンポーネント |
| | @radix-ui/react-tooltip | **1.1.x** | ツールチップ |
| | @radix-ui/react-switch | **1.1.x** | トグルスイッチ（UIモード切替に使用） |
| | @radix-ui/react-slider | **1.2.x** | スライダー |
| **アイコン** | lucide-react | **0.513.x** | FontAwesome の代替。Tree-shaking 対応・TypeScript 完全型定義 |
| **i18n** | react-i18next | **16.x** | react-intl から移行。日本語 primary、フック API が直感的 |
| | i18next | **24.x** | react-i18next のコアランタイム |
| | i18next-browser-languagedetector | **8.x** | ブラウザ言語自動検出 |
| **状態管理** | zustand | **5.0.x** | 軽量グローバルストア。React Context より型安全で DevTools 対応 |
| | immer | **10.x** | イミュータブル状態更新（トレイト選択・ドラフト編集に活用） |
| **バリデーション** | zod | **3.25.x** | 移植元と同バージョン帯。TypeScript 型推論と相性が良い |
| **3D レンダリング** | babylonjs | **8.36.0** | 移植元と同バージョン（3D プレビュー互換性維持） |
| | babylonjs-gui | **8.36.0** | 同上 |
| **コードエディタ** | monaco-editor | **0.48.0** | 移植元と同バージョン（詳細モードの JSON エディタ） |
| | @monaco-editor/react | **4.6.0** | 同上 |
| **フロー図** | @xyflow/react | **12.8.x** | エンティティ状態グラフ（詳細モードのみ表示） |
| **ファイル処理** | jszip | **3.10.x** | .mcaddon 生成（移植元と同バージョン帯） |
| | file-saver | **2.0.x** | ブラウザダウンロード |
| **IndexedDB** | dexie | **4.0.x** | プロジェクト永続化。Promise ベースで使いやすい |
| **その他** | uuid | **11.x** | UUID 生成（最新版で ESM 対応強化） |
| | @fontsource/noto-sans-jp | **5.x** | 日本語フォント（Noto Sans JP） |

#### 開発依存ライブラリ（devDependencies）

| カテゴリ | パッケージ | 採用バージョン | 変更理由 |
|---------|-----------|-------------|---------|
| **言語** | typescript | **5.8.x** | 最新安定版。conditional return type narrowing 等の改善 |
| **ビルド** | vite | **8.1.x** | 最新安定版。Rolldown 搭載で単一バンドラー化、高速ビルド |
| | @vitejs/plugin-react | **5.0.x** | React 19 対応版 |
| **テスト（ユニット）** | vitest | **3.x** | Vite ネイティブテストランナー。ts-mocha + chai を置き換え |
| | @vitest/ui | **3.x** | テスト UI |
| | @testing-library/react | **16.x** | React コンポーネントテスト |
| **テスト（E2E）** | @playwright/test | **1.58.x** | 移植元と同バージョン帯（維持） |
| **Lint** | eslint | **9.x** | 最新版（Flat Config 対応） |
| | @typescript-eslint/parser | **8.x** | TypeScript ESLint |
| | @typescript-eslint/eslint-plugin | **8.x** | TypeScript ESLint ルール |
| | eslint-plugin-react-hooks | **5.x** | React Hooks ルール |
| **フォーマッタ** | prettier | **3.x** | コード整形 |
| **型定義** | @types/react | **19.x** | React 19 型定義 |
| | @types/react-dom | **19.x** | ReactDOM 型定義 |
| | @types/node | **24.x** | Node.js 型定義 |
| | @types/file-saver | **2.0.x** | file-saver 型定義 |
| **Minecraft** | @minecraft/bedrock-schemas | **1.26.40-beta.26** | 移植元と同バージョン（スキーマ検証） |
| | @minecraft/vanilla-data | **1.26.21** | バニラデータ参照 |

---

## 3. 変更理由と互換性メモ

### React 18 → 19

- **理由**: React 19.3.0 が最新安定版（2025 年時点）。React Compiler (1.0.0 stable)、Actions API、`use()` フック等の新機能が利用可能
- **互換性**: React 19 は React 18 との後方互換性が高い。移植元の Class Component は一部 Function Component に書き換えが必要な場合あり（ContentWizard 等）
- **注意**: `@types/react` は `19.x` に揃える。MUI 5 は React 19 未サポートのため採用しない（Tailwind + Radix UI に置き換え）

### MUI 5 + FluentUI → Tailwind CSS v4 + Radix UI

- **理由**: 移植元は MUI と FluentUI NorthStar が混在しており UI 統一感が欠如。Tailwind CSS v4 はゼロランタイム・CSS ファースト設定でバンドルサイズを削減でき、Radix UI はヘッドレスコンポーネント（スタイルなし）でアクセシビリティ対応が済んでいる
- **互換性**: 移植元の MUI コンポーネント（`TextField`・`Slider`・`Button` 等）は Tailwind + Radix UI の対応コンポーネントに 1:1 で置き換える。Emotion（MUI の CSS-in-JS 依存）は不要になるためバンドル削減効果あり
- **注意**: Tailwind CSS v4 は v3 と設定方法が異なる（`tailwind.config.js` → CSS ファイル内 `@theme` ブロック）

### Vite 7 → Vite 8（Rolldown 搭載）

- **理由**: Vite 8.1 が最新安定版。内部バンドラーが Rollup から Rust 製 Rolldown に切り替わり、フルビルドが最大 5x 高速化
- **互換性**: 移植元の `vite.config.js` を `vite.config.ts`（TypeScript）に書き直す。`vite-plugin-node-polyfills` は Node.js 専用コード（CLI 向け）が不要になるため除外。`@vitejs/plugin-react` は最新版を使用
- **注意**: Webpack は移植先では不要（VS Code 拡張ビルドが不要なため）

### react-intl → react-i18next

- **理由**: react-intl は FormatJS 準拠のメッセージ形式（`{name, plural, ...}` 等）が複雑で、日本語 primary の新規プロジェクトに不向き。react-i18next はネストされた JSON キー・補間・複数形を簡潔に扱えるうえ、フックベース API（`useTranslation()`）が直感的
- **互換性**: 移植元 `locales/ja_JP.json` は FormatJS 形式のため、i18next 形式（`{{variable}}`）に変換が必要。変換スクリプトを `scripts/convert-locales.ts` として実装する
- **移植元で流用できるもの**: 訳語テキスト自体は `ja_JP.json` からほぼ流用可能

### ts-mocha + chai → Vitest

- **理由**: Vitest は Vite ネイティブで設定が最小限。ESM/TypeScript がそのまま動作し、Jest 互換 API でマイグレーションコストが低い。移植元の ts-mocha テストは構造を維持しつつ Vitest 形式に移行可能
- **互換性**: `describe()` / `it()` / `expect()` の API は Vitest と mocha でほぼ同一。chai アサーション（`assert.equal` 等）は Vitest の組み込み `expect` に置き換える

### React Context → Zustand 5

- **理由**: ContentWizard のドラフト状態が大きく（エンティティ / ブロック / アイテムすべての選択状態を保持）、Context の再レンダリング問題が起きやすい。Zustand はセレクタベースの購読で不要な再レンダリングを防ぐ
- **互換性**: 移植元に Zustand はなし。`zustand` + `immer` の組み合わせで `produce()` ベースの不変更新が書けるため、移植元の immer パターン（`addon-creator` リポジトリで確認済み）と相性が良い

### uuid 9 → uuid 11

- **理由**: 最新版では ESM ネイティブ対応が強化され、ブラウザの `crypto.randomUUID()` を優先使用する。移植元の UUID 生成コード（`generateUuid()` 等）はそのまま移植可能

---

## 4. 除外するパッケージ（スコープ外）

| パッケージ | 除外理由 |
|-----------|---------|
| electron・@electron-forge/* | デスクトップ版はスコープ外 |
| @vscode/vsce・@types/vscode | VS Code 拡張はスコープ外 |
| @modelcontextprotocol/sdk | MCP サーバーはスコープ外 |
| commander・ink・ink-* | CLI ツールはスコープ外 |
| leaflet・@types/leaflet | ワールドマップビューアはスコープ外 |
| waveform-playlist | オーディオ波形エディタは Phase 1 外 |
| @octokit/rest | GitHub Storage はスコープ外 |
| @resvg/resvg-js・pngjs・sharp | サーバーサイドレンダリングはスコープ外 |
| esbuild-wasm | Web 内 TypeScript コンパイルはスコープ外 |
| esprima-next | JavaScript 解析（スクリプト機能）は Phase 1 外 |
| obscenity | コンテンツフィルタリングは Phase 1 外 |
| pako | gzip 圧縮（Bedrock ワールド解析）は Phase 1 外 |
| webpack・gulp | 移植先では Vite のみでビルド |
