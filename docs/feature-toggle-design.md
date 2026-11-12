# 機能表示切り替え設計

## 1. シンプルモード / 詳細モードの定義

### シンプルモード（デフォルト）

**対象ユーザー**: Minecraft アドオン初心者・小中学生・非エンジニア

初心者が迷わずアドオンを作れることを目的とする。技術的な専門用語・低レベル設定項目・JSON 生データを隠し、高抽象化されたトレイト選択と基本ステータス編集のみを表示する。

| 特徴 | 内容 |
|------|------|
| ウィザード主体 | 5 ステップウィザードで順を追って作成 |
| トレイトで操作 | 「敵対的」「飛行」等の高抽象パターンを選択 |
| 基本ステータムのみ | HP・攻撃力・名前・外観等の必須項目のみ |
| JSON 非表示 | 生成される JSON ファイルは表示しない |
| エラーは平易な日本語 | 「名前を入力してください」等のわかりやすい表現 |

### 詳細モード

**対象ユーザー**: アドオン開発経験者・TypeScript/JSON に慣れた中上級者

移植元（minecraft-creator-tools）の機能に近い表示にする。すべてのコンポーネント・プロパティ・生成 JSON をそのまま表示し、細かい制御を可能にする。

| 特徴 | 内容 |
|------|------|
| フルプロパティ表示 | 移植元の全コンポーネント・全プロパティが編集可能 |
| JSON プレビュー | 生成される Behavior Pack / Resource Pack の JSON をリアルタイム表示 |
| 状態グラフ | エンティティの AnimationController 状態グラフ（@xyflow/react） |
| Monaco エディタ | JSON を直接編集できる Monaco コードエディタ |
| バリデーション詳細 | 技術的なエラーコード・警告を含むフル検証結果 |
| スポーンルール設定 | 詳細なバイオームタグ・重み・時間帯設定 |

---

## 2. 機能・UI 要素の表示モード一覧

### エンティティエディタ

| UI 要素 / 機能 | シンプル | 詳細 | 備考 |
|--------------|:------:|:----:|------|
| トレイト選択パネル | ✅ | ✅ | 高抽象（Hostile, Passive 等） |
| 基本ステータス（HP・攻撃力・速度・サイズ） | ✅ | ✅ | |
| 表示名・名前入力 | ✅ | ✅ | |
| 外観選択（テクスチャプリセット） | ✅ | ✅ | |
| .bbmodel インポート | ✅ | ✅ | |
| 3D プレビュー | ✅ | ✅ | |
| スポーン設定（バイオーム・時間帯・重み） | ✅（簡易） | ✅（全項目） | シンプルは重要項目のみ |
| ドロップアイテム設定 | ✅（最大 5 件） | ✅（全プール） | |
| テイム・騎乗設定 | ✅ | ✅ | |
| 低レベルコンポーネント直接編集 | ❌ | ✅ | Behavior Pack の component 一覧 |
| 状態グラフ（AnimationController） | ❌ | ✅ | @xyflow/react 使用 |
| JSON プレビュー / Monaco エディタ | ❌ | ✅ | |
| バリデーション詳細コード | ❌ | ✅ | シンプルは平易な日本語のみ |
| Resource Pack の render_controllers 設定 | ❌ | ✅ | |

### ブロックエディタ

| UI 要素 / 機能 | シンプル | 詳細 | 備考 |
|--------------|:------:|:----:|------|
| トレイト選択（光る・硬い・燃える等） | ✅ | ✅ | |
| 形状選択（フルキューブ・スラブ・階段・ドア等） | ✅（アイコン選択） | ✅（詳細設定） | |
| 採掘時間・爆発耐性・発光レベル | ✅ | ✅ | |
| 表示名・名前 | ✅ | ✅ | |
| テクスチャ設定 | ✅（プリセット） | ✅（全面個別設定） | |
| パーミュテーション設定 | ❌ | ✅ | |
| カスタムコンポーネント直接追加 | ❌ | ✅ | |
| JSON プレビュー / Monaco エディタ | ❌ | ✅ | |
| ボクセルシェイプエディタ（将来） | ❌ | ✅ | Phase 4 実装予定 |

### アイテムエディタ

| UI 要素 / 機能 | シンプル | 詳細 | 備考 |
|--------------|:------:|:----:|------|
| トレイト選択（食べ物・武器・防具等） | ✅ | ✅ | |
| スタック数・耐久値・攻撃力 | ✅ | ✅ | |
| 食べ物設定（栄養・満腹度） | ✅ | ✅ | |
| 表示名・名前 | ✅ | ✅ | |
| テクスチャ設定 | ✅（プリセット） | ✅（カスタム） | |
| Attachable（装着物）設定 | ❌ | ✅ | |
| カスタムコンポーネント直接追加 | ❌ | ✅ | |
| JSON プレビュー / Monaco エディタ | ❌ | ✅ | |

### レシピエディタ

| UI 要素 / 機能 | シンプル | 詳細 | 備考 |
|--------------|:------:|:----:|------|
| Shaped / Shapeless クラフトグリッド | ✅ | ✅ | |
| かまどレシピ | ✅ | ✅ | |
| JSON プレビュー | ❌ | ✅ | |
| スモーカー・焚き火・石切り台 | ❌ | ✅ | |

### プロジェクト管理・エクスポート

| UI 要素 / 機能 | シンプル | 詳細 | 備考 |
|--------------|:------:|:----:|------|
| バリデーション結果（平易な表現） | ✅ | ✅ | |
| バリデーション結果（技術的詳細） | ❌ | ✅ | |
| .mcaddon エクスポート | ✅ | ✅ | |
| パック UUID の表示・変更 | ❌ | ✅ | |
| format_version の手動変更 | ❌ | ✅ | |
| 生成ファイルツリー表示 | ❌ | ✅ | |

---

## 3. 状態管理方法

### Zustand グローバルストア（`uiModeStore`）

UIモードはアプリ全体で共有する設定であるため、Zustand のグローバルストアで管理する。`localStorage` に永続化し、次回起動時も選択を維持する。

```typescript
// src/store/uiModeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIMode = 'simple' | 'advanced';

interface UIModeState {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
  isAdvanced: () => boolean;
}

export const useUiModeStore = create<UIModeState>()(
  persist(
    (set, get) => ({
      mode: 'simple',  // デフォルトはシンプルモード
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'simple' ? 'advanced' : 'simple',
        })),
      isAdvanced: () => get().mode === 'advanced',
    }),
    {
      name: 'ui-mode',  // localStorage のキー名
    }
  )
);
```

### 使用パターン

```tsx
// コンポーネントでの使用例
import { useUiModeStore } from '@/store/uiModeStore';

export const EntityEditorPage: React.FC = () => {
  const { mode, isAdvanced } = useUiModeStore();

  return (
    <div>
      {/* 両モードで表示 */}
      <TraitPanel />
      <StatusPanel />

      {/* 詳細モードのみ表示 */}
      {isAdvanced() && (
        <>
          <ComponentPanel />
          <JsonPreviewPanel />
          <StateGraphPanel />
        </>
      )}
    </div>
  );
};
```

### カスタムフック（再利用パターン）

```typescript
// src/hooks/useUiMode.ts
import { useUiModeStore, UIMode } from '@/store/uiModeStore';

export function useUiMode(): {
  mode: UIMode;
  isSimple: boolean;
  isAdvanced: boolean;
  toggle: () => void;
} {
  const { mode, toggleMode } = useUiModeStore();
  return {
    mode,
    isSimple: mode === 'simple',
    isAdvanced: mode === 'advanced',
    toggle: toggleMode,
  };
}
```

---

## 4. UX 設計（切り替え UI の位置・操作方法）

### 切り替えボタンの位置

**ヘッダー右上**（言語切り替えボタンの隣）に常時表示する。

```
┌─────────────────────────────────────────────────────┐
│  🎮 アドオンクリエイター     [かんたん|くわしい] [日本語] │
└─────────────────────────────────────────────────────┘
```

### ModeToggle コンポーネント

Radix UI の `Switch` プリミティブを使用し、現在のモードを視覚的に表示する。

```tsx
// src/components/shared/ModeToggle.tsx
import { Switch } from '@radix-ui/react-switch';
import { useTranslation } from 'react-i18next';
import { useUiMode } from '@/hooks/useUiMode';

export const ModeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { isAdvanced, toggle } = useUiMode();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {isAdvanced ? t('app.mode.advanced') : t('app.mode.simple')}
      </span>
      <Switch
        checked={isAdvanced}
        onCheckedChange={toggle}
        aria-label={
          isAdvanced
            ? t('app.mode.toggleToSimple')
            : t('app.mode.toggleToAdvanced')
        }
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus-visible:outline-none focus-visible:ring-2
          ${isAdvanced ? 'bg-green-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isAdvanced ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </Switch>
    </div>
  );
};
```

### モード切り替え時の UX

| ケース | 挙動 |
|------|------|
| シンプル → 詳細 | 即座に追加パネルが展開する（アニメーション付き）。ドラフトデータは失わない |
| 詳細 → シンプル | 追加パネルを非表示にする。詳細モードで編集した詳細設定はメモリに保持する（再度詳細モードに切り替えると復元） |
| ページ遷移 | Zustand ストアはグローバルなので遷移先でもモードを維持する |
| 再起動（リロード） | `localStorage` に永続化しているため、前回の選択を復元する |

### アニメーション

Tailwind CSS の `transition` ユーティリティクラスで展開アニメーションを実装する。詳細パネルは `max-h-0 overflow-hidden → max-h-[1000px] overflow-visible` の CSS トランジションで表示する（`hidden / block` の切り替えではアニメーションが効かないため）。

---

## 5. シンプルモードのデフォルト値設計

シンプルモードでは非表示になるプロパティにも適切なデフォルト値が設定されている必要がある。ContentGenerator に渡すメタスキーマの各フィールドのデフォルト値を `src/minecraft/defaults/` に定義する。

```typescript
// src/minecraft/defaults/EntityDefaults.ts
import type { IMinecraftContentDefinition } from '../IContentMetaSchema';

export const DEFAULT_ENTITY_DEFINITION: Partial<IMinecraftContentDefinition> = {
  formatVersion: '1.21.0',
  baseGameVersion: '1.21.0',
  // シンプルモードで設定しないがデフォルトが必要なプロパティ
  renderControllers: ['controller.render.default'],
  animationScripts: [],
};
```
