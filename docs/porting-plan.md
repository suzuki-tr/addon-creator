# 移植実装計画

## 1. 移植元主要コンポーネントと移植先ファイルの対応表

### 移植元: `app/src/minecraft/`（コアロジック）

| 移植元ファイル / ディレクトリ | 移植先ファイル | 移植方針 |
|--------------------------|------------|--------|
| `minecraft/ContentGenerator.ts` | `src/minecraft/ContentGenerator.ts` | ほぼそのまま移植。MUI / React 依存がある場合は除去 |
| `minecraft/IContentMetaSchema.ts` | `src/minecraft/IContentMetaSchema.ts` | そのまま移植 |
| `minecraft/ContentMetaSchemaZod.ts` | `src/minecraft/ContentMetaSchemaZod.ts` | そのまま移植（zod スキーマ） |
| `minecraft/EntityTypeDefinition.ts` | `src/minecraft/definitions/EntityTypeDefinition.ts` | そのまま移植 |
| `minecraft/BlockTypeDefinition.ts` | `src/minecraft/definitions/BlockTypeDefinition.ts` | そのまま移植 |
| `minecraft/ItemTypeDefinition.ts` | `src/minecraft/definitions/ItemTypeDefinition.ts` | そのまま移植 |
| `minecraft/traits/*.ts`（69 ファイル） | `src/minecraft/traits/` | そのまま移植。UI 依存なし |
| `minecraft/ContentWizardTemplates.ts` | `src/minecraft/ContentWizardTemplates.ts` | そのまま移植 |
| `minecraft/components/` | `src/minecraft/components/` | そのまま移植 |
| `minecraft/BiomeBehaviorDefinition.ts` | Phase 4 以降 | スコープ外 |
| `minecraft/AnimationBehaviorDefinition.ts` | Phase 4 以降 | スコープ外 |

### 移植元: `app/src/info/`（バリデーション）

| 移植元ファイル | 移植先ファイル | 移植方針 |
|-------------|------------|--------|
| `info/projectGenerators/PackManifestValidator.ts` | `src/minecraft/validation/rules/PackManifestValidator.ts` | 移植（主要ルール） |
| `info/projectGenerators/FormatVersionValidator.ts` | `src/minecraft/validation/rules/FormatVersionValidator.ts` | 移植 |
| `info/projectGenerators/ScriptModuleValidator.ts` | `src/minecraft/validation/rules/ScriptModuleValidator.ts` | 移植 |
| `info/projectGenerators/TextureListValidator.ts` | `src/minecraft/validation/rules/TextureListValidator.ts` | 移植 |
| `info/projectGenerators/LanguageFileValidator.ts` | `src/minecraft/validation/rules/LanguageFileValidator.ts` | 移植 |
| その他 25 種以上のバリデーター | Phase 3 後半以降 | 段階的に追加 |

### 移植元: `app/src/UX/editors/`（ビジュアルエディタ）

| 移植元ディレクトリ | 移植先ディレクトリ | 移植方針 |
|----------------|---------------|--------|
| `UX/editors/entityType/` | `src/features/entityEditor/` | MUI → Tailwind/Radix UI に書き換え |
| `UX/editors/blockType/` | `src/features/blockEditor/` | 同上 |
| `UX/editors/itemType/` | `src/features/itemEditor/` | 同上 |
| `UX/editors/recipe/` | `src/features/recipeEditor/` | 同上（基本版） |
| `UX/editors/lootTable/` | `src/features/lootTableEditor/` | 同上（基本版） |
| `UX/editors/biome/` | Phase 4 以降 | スコープ外 |
| `UX/editors/feature/` | Phase 4 以降 | スコープ外 |
| `UX/editors/tradeTable/` | Phase 3 後半以降 | スコープ外（暫定） |
| `UX/editors/renderController/` | Phase 4 以降 | スコープ外 |
| `UX/editors/spawnRules/` | Phase 3 後半 | 基本版のみ |
| `UX/editors/sound/` | Phase 4 以降 | スコープ外 |
| `UX/editors/voxelShape/` | Phase 4 以降 | スコープ外 |

### 移植元: `app/src/UX/home/`（ウィザード）

| 移植元ファイル | 移植先ファイル | 移植方針 |
|-------------|------------|--------|
| `UX/home/EntityWizard.tsx` | `src/features/wizard/steps/Step3TraitSelection.tsx` 等 | 5 ステップウィザードに統合し完全書き換え |
| `UX/home/ContentWizard.tsx` | `src/features/wizard/WizardShell.tsx` | 同上 |
| `UX/home/WizardFrame.tsx` | `src/features/wizard/WizardShell.tsx` | 統合 |

### 移植元: `app/src/storage/`（ストレージ抽象化）

| 移植元ファイル | 移植先ファイル | 移植方針 |
|-------------|------------|--------|
| `storage/IStorage.ts` | `src/storage/IStorage.ts` | そのまま移植 |
| `storage/BrowserStorage.ts` | `src/storage/BrowserStorage.ts` | Dexie v4 に対応させる |
| `storage/NodeStorage.ts` | 除外 | Node.js / CLI 不要 |
| `storage/GitHubStorage.ts` | 除外 | GitHub Storage 不要 |

### 移植元: `app/src/locales/`（ローカライゼーション）

| 移植元ファイル | 移植先ファイル | 移植方針 |
|-------------|------------|--------|
| `locales/ja_JP.json` | `src/i18n/locales/ja.json` | キー形式を i18next 形式に変換（`scripts/convert-locales.ts` で自動変換） |
| `locales/en_US.json` | `src/i18n/locales/en.json` | 同上 |

---

## 2. 実装フェーズ分割

### Phase 1: 基盤（2〜3 週間）

**目標**: ビルドが通り、空のアプリが起動する。コアロジックのユニットテストが通る。

#### 1-1. プロジェクト初期化

| タスク | ファイル | 内容 |
|------|---------|------|
| Vite + React 19 プロジェクト作成 | `package.json` `vite.config.ts` | `npm create vite@latest` から開始 |
| TypeScript strict 設定 | `tsconfig.json` | strict: true + 追加設定 |
| Tailwind CSS v4 セットアップ | `src/index.css` | `@import "tailwindcss"` + カスタムテーマ |
| ESLint / Prettier 設定 | `.eslintrc.ts` `.prettierrc` | TypeScript + React Hooks ルール |
| Vitest セットアップ | `vitest.config.ts` | Vite ネイティブテスト設定 |

#### 1-2. コアロジック移植

| タスク | ファイル | 内容 |
|------|---------|------|
| Minecraft 定義クラス移植 | `src/minecraft/definitions/` | EntityTypeDefinition 等 3 ファイル |
| トレイトシステム移植 | `src/minecraft/traits/` | 69 ファイルをそのまま移植 |
| ContentGenerator 移植 | `src/minecraft/ContentGenerator.ts` | UI 依存を除去して移植 |
| IContentMetaSchema 移植 | `src/minecraft/IContentMetaSchema.ts` | そのまま移植 |
| バリデーション基本版 | `src/minecraft/validation/` | 主要 5 ルール |
| ストレージ抽象化 | `src/storage/` | IStorage + BrowserStorage（Dexie） |

#### 1-3. グローバルストア実装

| タスク | ファイル | 内容 |
|------|---------|------|
| UIモードストア | `src/store/uiModeStore.ts` | Zustand + persist |
| プロジェクトストア | `src/store/projectStore.ts` | プロジェクト一覧・選択管理 |
| ウィザードストア | `src/store/wizardStore.ts` | ウィザードドラフト（immer） |

#### 1-4. i18n セットアップ

| タスク | ファイル | 内容 |
|------|---------|------|
| react-i18next 初期化 | `src/i18n/index.ts` | 日本語 primary 設定 |
| ロケールファイル変換 | `src/i18n/locales/ja.json` `en.json` | 移植元から変換スクリプトで生成 |
| TypeScript 型定義 | `src/types/i18next.d.ts` | 型安全な翻訳キー |

**Phase 1 完了条件**:
- `npm run build` が成功する
- `npm run test` で ContentGenerator・Validator のユニットテストが通る（カバレッジ > 70%）
- 起動すると空のアプリ画面が日本語で表示される

---

### Phase 2: コア機能（3〜4 週間）

**目標**: ウィザード経由でモブ / ブロック / アイテムを作成し、`.mcaddon` をエクスポートできる。

#### 2-1. 共通コンポーネント実装

| タスク | ファイル | 内容 |
|------|---------|------|
| AppShell・ヘッダー | `src/components/layout/` | ナビゲーション・ModeToggle・LocalePicker |
| 汎用 UI コンポーネント | `src/components/shared/` | Button・Card・Badge・ModeToggle 等 |
| モーダル | `src/components/modals/` | ConfirmModal・ErrorModal（Radix UI Dialog） |

#### 2-2. プロジェクト管理画面

| タスク | ファイル | 内容 |
|------|---------|------|
| ダッシュボードページ | `src/features/projectDashboard/DashboardPage.tsx` | プロジェクト一覧・新規作成 |
| プロジェクトカード | `src/features/projectDashboard/components/ProjectCard.tsx` | 保存済みプロジェクト表示 |

#### 2-3. 簡易ウィザード実装

| タスク | ファイル | 内容 |
|------|---------|------|
| WizardShell | `src/features/wizard/WizardShell.tsx` | ステップナビゲーション・進捗バー |
| Step 1: 種別選択 | `src/features/wizard/steps/Step1ContentType.tsx` | カード形式 3 択 |
| Step 2: ベース選択 | `src/features/wizard/steps/Step2BaseSelection.tsx` | バニラカタロググリッド |
| Step 3: トレイト選択 | `src/features/wizard/steps/Step3TraitSelection.tsx` | トレイトカード複数選択 |
| Step 4: カスタマイズ | `src/features/wizard/steps/Step4Customize.tsx` | フォーム（種別別） |
| Step 5: プレビュー | `src/features/wizard/steps/Step5Preview.tsx` | 3D + サマリー + エクスポート |
| ウィザードナビゲーション | `src/features/wizard/hooks/useWizardNavigation.ts` | ステップ進行ガード |

#### 2-4. エクスポート機能

| タスク | ファイル | 内容 |
|------|---------|------|
| エクスポートサービス | `src/features/export/ExportService.ts` | JSZip で .mcaddon 生成 |
| マニフェスト生成 | `src/features/export/ManifestGenerator.ts` | UUID 自動生成・format_version 設定 |
| lang ファイル生成 | `src/features/export/LangFileGenerator.ts` | ja_JP.lang / en_US.lang 生成 |

#### 2-5. Babylon.js 3D プレビュー

| タスク | ファイル | 内容 |
|------|---------|------|
| Babylon.js シーン管理 | `src/features/wizard/steps/Step5Preview.tsx`（内部） | 移植元の babylon/ 層を参考に実装 |

**Phase 2 完了条件**:
- ウィザードで「モブ」「ブロック」「アイテム」をそれぞれ作成し、`.mcaddon` をダウンロードできる
- ダウンロードした `.mcaddon` を Minecraft に読み込んで動作確認できる
- シンプルモード / 詳細モードの切り替えが動作する
- 日本語・英語の切り替えが動作する
- E2E テスト（wizard.spec.ts）が通る

---

### Phase 3: 改変要件の完成 + 追加エディタ（3〜4 週間）

**目標**: 3 つの改変要件（i18n・UIモード・ウィザード）を完全実装し、追加エディタを実装する。

#### 3-1. 改変要件の完成

| タスク | ファイル | 内容 |
|------|---------|------|
| 全 UI ラベルの翻訳キー適用 | 全 `.tsx` ファイル | ハードコード文字列を `t()` に置き換え |
| トレイト名・説明の翻訳 | `src/i18n/locales/ja.json` | 69 種全トレイトの日本語化 |
| エラーメッセージの日本語化 | `src/i18n/locales/ja.json` | バリデーションエラーの平易な日本語 |
| 詳細モード全エディタ実装 | `src/features/*/` | ComponentPanel・JsonPreviewPanel・StateGraphPanel |
| ウィザード自然言語サマリー | `src/features/wizard/steps/Step5Preview.tsx` | 設定内容を日本語文に変換 |

#### 3-2. 追加エディタ実装

| タスク | ファイル | 優先度 | 内容 |
|------|---------|------|------|
| レシピエディタ | `src/features/recipeEditor/` | 高 | Shaped / Shapeless / かまど |
| ルートテーブルエディタ（基本版） | `src/features/lootTableEditor/` | 高 | ドロッププール・確率設定 |
| スポーンルールエディタ（基本版） | `src/features/spawnRuleEditor/` | 中 | バイオーム・時間帯詳細設定 |

#### 3-3. バリデーション強化

| タスク | ファイル | 内容 |
|------|---------|------|
| 追加バリデーションルール | `src/minecraft/validation/rules/` | TextureList・LanguageFile・PackIcon 等 |
| インラインリアルタイムバリデーション | Step 4 フォーム | 入力中に即座にエラー表示 |
| 修正ジャンプ機能 | Step 5 | エラーカードから Step 4 の該当セクションへジャンプ |

**Phase 3 完了条件**:
- すべての UI テキストが日本語で表示される（英語切り替えも動作）
- シンプルモードで不要な UI 要素がすべて非表示になる
- 詳細モードで追加 UI 要素（JSON エディタ等）が表示される
- レシピエディタ・ルートテーブルエディタが動作する
- 全体のユニットテストカバレッジ > 80%

---

### Phase 4: 高度エディタ（将来フェーズ、スコープ外）

| タスク | 内容 |
|------|------|
| バイオームエディタ | `UX/editors/biome/` を移植 |
| フィーチャー DAG エディタ | `UX/editors/feature/` を移植（@xyflow/react） |
| アニメーションコントローラービジュアルエディタ | 新規実装（@xyflow/react） |
| ボクセルシェイプエディタ | `UX/editors/voxelShape/` を移植 |
| 取引テーブルエディタ | `UX/editors/tradeTable/` を移植 |
| サウンド定義エディタ | `UX/editors/sound/` を移植 |
| bedrock-schemas 完全統合 | スキーマレベルバリデーションの全面展開 |

---

## 3. 各フェーズの完了条件まとめ

| フェーズ | 期間 | 完了条件 |
|--------|------|---------|
| **Phase 1: 基盤** | 2〜3 週間 | ビルド成功。コアロジックのユニットテスト通過。空のアプリが日本語で起動 |
| **Phase 2: コア機能** | 3〜4 週間 | ウィザードで 3 種別の `.mcaddon` を生成できる。E2E テスト通過 |
| **Phase 3: 改変要件完成** | 3〜4 週間 | 全 UI 日本語化。UIモード切り替え動作。追加エディタ動作。テストカバレッジ > 80% |
| **Phase 4: 高度エディタ** | 未定 | バイオーム・フィーチャー等の高度エディタ動作 |

---

## 4. 移植時の注意事項

### MUI コンポーネントの置き換え対応表

移植元 UI で使われている MUI コンポーネントを Tailwind CSS + Radix UI に置き換える。

| 移植元（MUI） | 移植先（Tailwind + Radix） |
|-------------|--------------------------|
| `<TextField>` | `<input className="...">` + バリデーション表示 |
| `<Slider>` | `<Slider>` from Radix UI |
| `<Select>` | `<Select>` from Radix UI |
| `<Dialog>` | `<Dialog>` from Radix UI |
| `<Tabs>` | `<Tabs>` from Radix UI |
| `<Switch>` | `<Switch>` from Radix UI |
| `<Tooltip>` | `<Tooltip>` from Radix UI |
| `<Button>` | `<button>` with Tailwind classes |
| `<Card>` | `<div className="rounded-lg shadow ...">` |
| `<Checkbox>` | `<input type="checkbox">` + Tailwind |
| `<CircularProgress>` | Tailwind CSS アニメーション |

### react-intl → react-i18next の変換パターン

```tsx
// 移植元（react-intl）
import { useIntl } from 'react-intl';
const intl = useIntl();
const label = intl.formatMessage({ id: 'wizard.step1.title' });
// JSX 内: <FormattedMessage id="wizard.step1.title" />

// 移植先（react-i18next）
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
const label = t('wizard.step1.title');
// JSX 内: {t('wizard.step1.title')}
```

変数補間の変換:
```tsx
// 移植元: { id: 'export.success', values: { name: fileName } }
// 移植先: t('export.success', { name: fileName })
// ja.json: "success": "「{{name}}.mcaddon」をダウンロードしました"
```

### 移植元のクラスコンポーネント → 関数コンポーネント変換

移植元の一部コンポーネント（`ContentWizard.tsx` 等）は `extends Component` のクラスコンポーネント。React 19 でもクラスコンポーネントは動作するが、移植先では関数コンポーネント + フックに書き直す。

```tsx
// 移植元（クラスコンポーネント）
class ContentWizard extends Component<Props, State> {
  state = { currentStep: 1 };
  // ...
}

// 移植先（関数コンポーネント + Zustand）
const WizardShell: React.FC = () => {
  const { currentStep, nextStep } = useWizardStore();
  // ...
};
```

---

## 5. 開発環境セットアップ手順（予定）

```bash
# リポジトリのクローン
git clone <repo-url> minecraft-addon-creator
cd minecraft-addon-creator

# 依存インストール
npm install

# 開発サーバー起動
npm run dev      # http://localhost:5173

# テスト実行
npm test         # Vitest（ユニット）
npm run test:e2e # Playwright（E2E）

# ビルド
npm run build

# リント
npm run lint
npm run lint:fix
```

---

## 6. ブランチ戦略

| ブランチ | 用途 |
|--------|------|
| `main` | 安定版。リリース時にのみ更新 |
| `develop` | 開発の統合ブランチ |
| `feature/phase1-foundation` | Phase 1 作業ブランチ |
| `feature/phase2-wizard` | Phase 2 作業ブランチ |
| `feature/phase3-i18n` | Phase 3 i18n 作業ブランチ |
| `fix/*` | バグ修正 |

各フェーズ完了後に `develop` へ PR を出してレビュー → マージし、その後 `main` にリリースタグを切る。
