# アーキテクチャ設計

## 1. ディレクトリ構成（提案）

```
minecraft-addon-creator/
├── docs/                          # 設計書（本ドキュメント群）
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── main.tsx                   # Vite エントリーポイント
│   ├── App.tsx                    # ルートコンポーネント（ルーティング）
│   │
│   ├── i18n/                      # 国際化設定
│   │   ├── index.ts               # i18next 初期化・エクスポート
│   │   └── locales/
│   │       ├── ja.json            # 日本語（primary）
│   │       └── en.json            # 英語
│   │
│   ├── store/                     # Zustand グローバルストア
│   │   ├── uiModeStore.ts         # シンプル / 詳細 モード
│   │   ├── projectStore.ts        # プロジェクト管理
│   │   └── wizardStore.ts         # ウィザード状態（ドラフト）
│   │
│   ├── components/                # 汎用 UI コンポーネント
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # ヘッダー・サイドバー・メインの骨格
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── modals/
│   │   │   ├── ConfirmModal.tsx
│   │   │   └── ErrorModal.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── ModeToggle.tsx     # シンプル / 詳細 切り替えボタン
│   │       └── LocalePicker.tsx   # 言語切り替え
│   │
│   ├── features/                  # 機能モジュール（ドメイン単位）
│   │   ├── wizard/                # 簡易ウィザード
│   │   │   ├── WizardShell.tsx    # ステップナビゲーション・進捗バー
│   │   │   ├── steps/
│   │   │   │   ├── Step1ContentType.tsx   # コンテンツ種別選択
│   │   │   │   ├── Step2BaseSelection.tsx # ベース選択
│   │   │   │   ├── Step3TraitSelection.tsx # トレイト選択
│   │   │   │   ├── Step4Customize.tsx     # カスタマイズ
│   │   │   │   └── Step5Preview.tsx       # プレビュー・エクスポート
│   │   │   └── hooks/
│   │   │       └── useWizardNavigation.ts
│   │   │
│   │   ├── entityEditor/          # エンティティエディタ
│   │   │   ├── EntityEditorPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TraitPanel.tsx          # トレイト選択（シンプルモード）
│   │   │   │   ├── ComponentPanel.tsx      # 低レベルコンポーネント（詳細モード）
│   │   │   │   ├── StatusPanel.tsx         # HP・攻撃力等
│   │   │   │   ├── StateGraphPanel.tsx     # 状態グラフ（詳細モード, @xyflow/react）
│   │   │   │   └── PreviewPanel.tsx        # Babylon.js 3D プレビュー
│   │   │   └── hooks/
│   │   │       └── useEntityDraft.ts       # immer ドラフト管理
│   │   │
│   │   ├── blockEditor/           # ブロックエディタ
│   │   │   ├── BlockEditorPage.tsx
│   │   │   └── components/
│   │   │       ├── TraitPanel.tsx
│   │   │       ├── ShapePanel.tsx          # 形状選択（スラブ/階段/フェンス等）
│   │   │       ├── PermutationPanel.tsx    # パーミュテーション（詳細モード）
│   │   │       └── PreviewPanel.tsx
│   │   │
│   │   ├── itemEditor/            # アイテムエディタ
│   │   │   ├── ItemEditorPage.tsx
│   │   │   └── components/
│   │   │       ├── TraitPanel.tsx
│   │   │       ├── ComponentPanel.tsx
│   │   │       └── PreviewPanel.tsx
│   │   │
│   │   ├── recipeEditor/          # レシピエディタ
│   │   │   ├── RecipeEditorPage.tsx
│   │   │   └── components/
│   │   │       ├── CraftingGrid.tsx        # 3x3 クラフトグリッド
│   │   │       └── SmeltingForm.tsx        # かまどレシピ
│   │   │
│   │   ├── lootTableEditor/       # ルートテーブルエディタ
│   │   │   ├── LootTableEditorPage.tsx
│   │   │   └── components/
│   │   │       └── PoolEditor.tsx
│   │   │
│   │   ├── projectDashboard/      # プロジェクト管理画面
│   │   │   ├── DashboardPage.tsx
│   │   │   └── components/
│   │   │       ├── ProjectCard.tsx
│   │   │       └── NewProjectModal.tsx
│   │   │
│   │   └── export/                # エクスポート機能
│   │       ├── ExportService.ts   # .mcaddon 生成（JSZip）
│   │       └── ManifestGenerator.ts
│   │
│   ├── minecraft/                 # Minecraft 固有ロジック（移植元から移植）
│   │   ├── traits/                # トレイトシステム（69 ファイル）
│   │   │   ├── EntityTraits/
│   │   │   ├── BlockTraits/
│   │   │   └── ItemTraits/
│   │   ├── definitions/           # TypeScript 定義クラス
│   │   │   ├── EntityTypeDefinition.ts
│   │   │   ├── BlockTypeDefinition.ts
│   │   │   └── ItemTypeDefinition.ts
│   │   ├── ContentGenerator.ts    # コンテンツ生成コア
│   │   ├── IContentMetaSchema.ts  # メタスキーマ型定義
│   │   └── validation/
│   │       ├── Validator.ts       # バリデーション実行
│   │       └── rules/             # 個別検証ルール（主要 10 種）
│   │
│   ├── storage/                   # ファイルシステム抽象化
│   │   ├── IStorage.ts            # ストレージインターフェース
│   │   ├── BrowserStorage.ts      # IndexedDB（Dexie）実装
│   │   └── MemoryStorage.ts       # テスト用インメモリ実装
│   │
│   ├── types/                     # 共通 TypeScript 型定義
│   │   ├── UIMode.ts
│   │   ├── Project.ts
│   │   └── Wizard.ts
│   │
│   └── utils/                     # ユーティリティ関数
│       ├── uuid.ts
│       ├── fileUtils.ts
│       └── jsonUtils.ts
│
├── tests/                         # テストファイル
│   ├── unit/
│   │   ├── minecraft/
│   │   │   ├── ContentGenerator.test.ts
│   │   │   └── Validator.test.ts
│   │   └── store/
│   │       └── wizardStore.test.ts
│   └── e2e/
│       └── wizard.spec.ts
│
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md                      # プロジェクト開発 README
```

---

## 2. コンポーネント設計方針

### レイヤー構成

```
App
 ├── AppShell（ヘッダー・ナビゲーション・ModeToggle）
 │    └── ページルーティング（React Router v7）
 │         ├── DashboardPage       — プロジェクト一覧・新規作成
 │         ├── WizardShell         — 簡易ウィザード（5 ステップ）
 │         ├── EntityEditorPage    — エンティティエディタ
 │         ├── BlockEditorPage     — ブロックエディタ
 │         ├── ItemEditorPage      — アイテムエディタ
 │         ├── RecipeEditorPage    — レシピエディタ
 │         └── LootTableEditorPage — ルートテーブルエディタ
 │
 └── ストア層（Zustand）
      ├── uiModeStore  — シンプル / 詳細モード（永続化）
      ├── projectStore — プロジェクト一覧・選択中プロジェクト
      └── wizardStore  — ウィザードドラフト・ステップ進捗
```

### コンポーネント分類

| 種別 | 配置場所 | 説明 |
|------|---------|------|
| ページコンポーネント | `features/*/Page.tsx` | ルーティング単位の最上位コンポーネント |
| フィーチャーコンポーネント | `features/*/components/` | 特定機能に特化した UI |
| 共通コンポーネント | `components/shared/` | 複数フィーチャーで共用する汎用 UI |
| レイアウトコンポーネント | `components/layout/` | AppShell・ヘッダー・サイドバー |

### UIモードによるコンポーネント切り替えパターン

```tsx
// ModeToggle の使用例
import { useUiMode } from '@/store/uiModeStore';

export const EntityEditorPage: React.FC = () => {
  const { mode } = useUiMode();
  return (
    <div>
      <TraitPanel />         {/* シンプル / 詳細モード両方 */}
      <StatusPanel />        {/* シンプル / 詳細モード両方 */}
      {mode === 'advanced' && (
        <>
          <ComponentPanel /> {/* 詳細モードのみ */}
          <StateGraphPanel /> {/* 詳細モードのみ */}
        </>
      )}
    </div>
  );
};
```

---

## 3. 移植する機能のモジュール分割

### Phase 1 — 基盤（`src/minecraft/` + `src/store/` + `src/i18n/`）

| 移植元ファイル | 移植先ファイル | 変更点 |
|-------------|-------------|------|
| `app/src/minecraft/traits/*.ts` | `src/minecraft/traits/` | ほぼそのまま移植。MUI 依存を除去 |
| `app/src/minecraft/ContentGenerator.ts` | `src/minecraft/ContentGenerator.ts` | UI 依存部分を切り離し、純粋なロジック層に |
| `app/src/minecraft/IContentMetaSchema.ts` | `src/minecraft/IContentMetaSchema.ts` | そのまま移植 |
| `app/src/minecraft/EntityTypeDefinition.ts` | `src/minecraft/definitions/EntityTypeDefinition.ts` | そのまま移植 |
| `app/src/minecraft/BlockTypeDefinition.ts` | `src/minecraft/definitions/BlockTypeDefinition.ts` | そのまま移植 |
| `app/src/minecraft/ItemTypeDefinition.ts` | `src/minecraft/definitions/ItemTypeDefinition.ts` | そのまま移植 |
| `app/src/storage/BrowserStorage.ts` | `src/storage/BrowserStorage.ts` | Dexie v4 に対応させる |
| `app/src/locales/ja_JP.json` | `src/i18n/locales/ja.json` | キー形式を i18next 形式に変換 |
| `app/src/locales/en_US.json` | `src/i18n/locales/en.json` | 同上 |

### Phase 2 — コア機能（`src/features/`）

| 移植元ファイル | 移植先ファイル | 変更点 |
|-------------|-------------|------|
| `app/src/UX/home/EntityWizard.tsx` | `src/features/wizard/steps/Step3TraitSelection.tsx` 等 | 5 ステップウィザードに統合、Tailwind CSS に書き換え |
| `app/src/UX/home/ContentWizard.tsx` | `src/features/wizard/WizardShell.tsx` | 同上 |
| `app/src/UX/editors/entityType/` | `src/features/entityEditor/` | MUI → Tailwind/Radix UI に書き換え |
| `app/src/UX/editors/blockType/` | `src/features/blockEditor/` | 同上 |
| `app/src/UX/editors/itemType/` | `src/features/itemEditor/` | 同上 |
| `app/src/UX/editors/recipe/` | `src/features/recipeEditor/` | 同上 |
| `app/src/UX/editors/lootTable/` | `src/features/lootTableEditor/` | 同上（基本版のみ） |
| `app/src/babylon/` | `src/features/*/components/PreviewPanel.tsx` | Babylon.js シーン管理をフィーチャー内に統合 |

### Phase 3 — 改変要件（3 つの改変要件の実装）

| 機能 | 実装場所 | 内容 |
|------|---------|------|
| i18n（日本語対応） | `src/i18n/` + 全コンポーネント | `useTranslation()` フック適用 |
| UIモード切り替え | `src/store/uiModeStore.ts` + 各エディタ | Zustand ストア + 条件レンダリング |
| 簡易ウィザード | `src/features/wizard/` | 5 ステップフロー実装 |

---

## 4. 移植しない機能（スコープ外）の明示

以下の機能は **Phase 1 〜 3 では実装しない**。将来フェーズで検討する。

### Web アプリのスコープ外（配布形態の問題）

| 機能 | 理由 |
|------|------|
| CLI ツール（`npx mct`） | Node.js 実行環境が必要。Web アプリのスコープ外 |
| VS Code 拡張 | VS Code 拡張 API が必要。Web アプリのスコープ外 |
| Electron デスクトップ版 | 別途 Electron 設定が必要。Phase 1 外 |
| MCP サーバー | AI ツール統合用。Phase 1 外 |
| Bedrock Dedicated Server 連携 | サーバーインフラが必要。Phase 1 外 |
| GitHub Storage | OAuth 認証が必要。Phase 1 外 |

### 高複雑度のビジュアルエディタ（後期フェーズ）

| 機能 | 移植元ファイル | 後期フェーズでの方針 |
|------|-------------|------------------|
| フィーチャー / フィーチャールール DAG エディタ | `UX/editors/feature/` | Phase 4 で @xyflow/react 活用 |
| バイオームエディタ | `UX/editors/biome/` | Phase 4 で実装 |
| アニメーションコントローラービジュアルエディタ | TypeScript モデルのみ | Phase 4 で @xyflow/react 活用 |
| レンダーコントローラーエディタ | `UX/editors/renderController/` | Phase 4 で実装 |
| 取引テーブルエディタ | `UX/editors/tradeTable/` | Phase 3 後半または Phase 4 |
| ジグソー構造エディタ | TypeScript モデルのみ | スコープ外（後日検討） |
| パーティクルエディタ | TypeScript モデルのみ | スコープ外（後日検討） |
| ワールドマップビューア | Leaflet | スコープ外（後日検討） |
| ボクセルシェイプエディタ | `UX/editors/voxelShape/` | Phase 4 で実装 |
| サウンド定義エディタ | `UX/editors/sound/` | Phase 4 で実装 |
| スポーンルールエディタ | `UX/editors/spawnRules/` | Phase 3 後半で基本版 |

---

## 5. データフロー

### コンテンツ生成フロー（移植元と同様）

```
ユーザー入力（ウィザード / エディタ）
  ↓
wizardStore / entityDraft（Zustand + immer ドラフト）
  ↓
IMinecraftContentDefinition（メタスキーマ定義）
  ↓
ContentGenerator.generate()（トレイト展開・ファイル生成）
  ↓
IGeneratedContent（生成済みファイルセット）
  ↓
Validator.validate()（バリデーション）
  ↓
ExportService.export()（JSZip で .mcaddon 生成）
  ↓
file-saver（ブラウザダウンロード）
```

### プロジェクト永続化フロー

```
projectStore（Zustand）
  ↓ 保存
BrowserStorage（Dexie / IndexedDB）
  ↓ 読込
projectStore（起動時に復元）
```

---

## 6. TypeScript 設定方針

```json
// tsconfig.json（要点）
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // 絶対インポートパス (@/store/uiModeStore 等)
    }
  }
}
```

### 型安全設計の方針

- すべての関数に戻り値型を明示する
- `any` 型は禁止。Union 型または `unknown` を使用する
- 外部 JSON（生成ファイル）の読み込みは zod スキーマで型検証する
- エラー処理は `Result<T, E>` パターン（`{ ok: true, value: T } | { ok: false, error: E }`）を使用する
