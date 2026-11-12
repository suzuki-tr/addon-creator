# 簡易ウィザード設計

## 1. ウィザードでカバーするフロー

**目的**: アドオン初心者が「何を作りたいか」から始めて、5 ステップで `.mcaddon` ファイルを生成できるようにする。

移植元（ContentWizard + EntityWizard）の多段フローを参考に、シンプルモード向けに整理・統合したフロー。

```
Step 1: コンテンツ種別選択
        「モブ（生き物）」「ブロック」「アイテム」から 1 つ選ぶ
            ↓
Step 2: ベース選択
        バニラカタログから選ぶ（カスタマイズのベースにする）
        または「ゼロから作る」を選ぶ
            ↓
Step 3: トレイト（特性）選択
        コンテンツ種別に応じたトレイトを複数選択
            ↓
Step 4: カスタマイズ
        名前・表示名・ステータス（HP 等）・外観（テクスチャ）を設定
            ↓
Step 5: プレビュー → エクスポート
        3D プレビュー確認 → バリデーション → .mcaddon ダウンロード
```

---

## 2. 各ステップの詳細

### Step 1: コンテンツ種別選択

**ファイル**: `src/features/wizard/steps/Step1ContentType.tsx`

#### 入力項目

| 項目 | 種別 | 説明 |
|------|------|------|
| コンテンツ種別 | ラジオ（カード形式） | モブ / ブロック / アイテムの 3 択 |

#### UI レイアウト

```
┌────────────────────────────────────────────────────┐
│  何を作りますか？                                      │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  🐾 モブ  │  │ 🧱 ブロック │  │ ⚔️ アイテム│        │
│  │          │  │          │  │          │        │
│  │ 生き物を  │  │ 世界に置く │  │ 道具・食べ │        │
│  │  作れます  │  │  ブロック  │  │ 物を作れます│        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
│                              [ 次へ → ]             │
└────────────────────────────────────────────────────┘
```

#### 遷移条件

- 種別を選択した状態でのみ「次へ」が有効になる

---

### Step 2: ベース選択

**ファイル**: `src/features/wizard/steps/Step2BaseSelection.tsx`

#### 入力項目

| 項目 | 種別 | 説明 |
|------|------|------|
| 作成方法 | タブ切り替え | 「バニラからカスタマイズ」/ 「ゼロから作る」 |
| バニラ選択（カスタマイズ時） | グリッド選択 | Step 1 の種別に対応するバニラカタログ |
| 検索フィルター（カスタマイズ時） | テキスト入力 | 名前でフィルタリング |

#### バニラカタログ表示数の目安

| 種別 | カタログ数 |
|------|----------|
| モブ（エンティティ） | 42 種 |
| ブロック | 47 種 |
| アイテム | 46 種 |

#### UI レイアウト（バニラカスタマイズタブ）

```
┌────────────────────────────────────────────────────┐
│  ベースを選んでください                                │
│  [バニラからカスタマイズ] [ゼロから作る]               │
│                                                    │
│  🔍 名前で検索...                                   │
│                                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 🐮   │ │ 🐷   │ │ 🐔   │ │ 🐑   │ │ 🐺   │  │
│  │ウシ  │ │ブタ  │ │ニワトリ│ │ヒツジ│ │オオカミ│  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                    │
│  ← 戻る                           [ 次へ → ]        │
└────────────────────────────────────────────────────┘
```

#### 遷移条件

- 「バニラからカスタマイズ」: バニラ項目を 1 つ選択した状態でのみ「次へ」が有効
- 「ゼロから作る」: 選択不要で「次へ」が有効

---

### Step 3: トレイト（特性）選択

**ファイル**: `src/features/wizard/steps/Step3TraitSelection.tsx`

#### 入力項目

| 項目 | 種別 | 説明 |
|------|------|------|
| トレイト | チェックカード（複数選択） | 種別に応じたトレイト一覧（後述） |

#### モブ（エンティティ）のトレイト一覧（シンプルモード）

移植元の `app/src/minecraft/traits/` より、初心者向けに厳選した主要 10 種を表示。

| トレイト ID | 日本語表示名 | 説明 |
|-----------|-----------|------|
| `hostile` | 敵対的 | プレイヤーを攻撃します |
| `passive` | 友好的 | プレイヤーを攻撃しません |
| `flying` | 飛行 | 空を飛びます |
| `tameable` | テイム可能 | アイテムでなつかせられます |
| `rideable` | 騎乗可能 | 乗ることができます |
| `undead` | アンデッド | 昼間に燃えます（ゾンビ系） |
| `aquatic` | 水中生活 | 水中で生活します |
| `boss` | ボス | 体力バーが画面上部に表示されます |
| `breedable` | 繁殖可能 | アイテムで繁殖できます |
| `slime` | スライム | 倒すと小さい個体が出現します |

詳細モードでは全 69 種のトレイトが表示される。

#### ブロックのトレイト一覧（シンプルモード）

| トレイト ID | 日本語表示名 | 説明 |
|-----------|-----------|------|
| `lightSource` | 光る | 光を放ちます |
| `craftingStation` | 作業台 | クラフトに使えます |
| `door` | ドア | 開閉できます |
| `slab` | スラブ | 半ブロックの形状になります |
| `stairs` | 階段 | 階段の形状になります |
| `fence` | フェンス | フェンスの形状になります |
| `flammable` | 燃えやすい | 炎や溶岩で燃えます |
| `slippery` | 滑る | 氷のように滑ります |

#### アイテムのトレイト一覧（シンプルモード）

| トレイト ID | 日本語表示名 | 説明 |
|-----------|-----------|------|
| `food` | 食べ物 | 食べると腹が膨れます |
| `sword` | 剣 | 近接攻撃できます |
| `pickaxe` | ツルハシ | 石・鉱石を採掘できます |
| `axe` | 斧 | 木を採掘できます |
| `shovel` | シャベル | 土・砂を採掘できます |
| `armor` | 防具（よろい） | ダメージを軽減します |
| `throwable` | 投げられる | 投げることができます |
| `stackable` | 大量持ち運び | 1 スタック 64 個まで |

#### UI レイアウト

```
┌────────────────────────────────────────────────────┐
│  特性を選んでください（複数選べます）                   │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ ✅ 🗡️ 敵対的  │  │  🕊️ 友好的    │               │
│  │ プレイヤーを  │  │  プレイヤーを  │               │
│  │  攻撃します   │  │  攻撃しません  │               │
│  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐               │
│  │   🦅 飛行     │  │  💙 テイム可能  │               │
│  │  空を飛びます  │  │ なつかせられます│               │
│  └──────────────┘  └──────────────┘               │
│                                                    │
│  ← 戻る                           [ 次へ → ]        │
└────────────────────────────────────────────────────┘
```

#### トレイト競合チェック

一部トレイトは同時選択できない（例: `hostile` と `passive`）。競合時はインラインで警告を表示する。

```
⚠️ 「敵対的」と「友好的」は同時に選べません
```

競合定義は `src/minecraft/traits/TraitConflicts.ts` で管理する。

---

### Step 4: カスタマイズ

**ファイル**: `src/features/wizard/steps/Step4Customize.tsx`

#### 入力項目（モブ）

| セクション | 項目 | 型 | 制約 |
|----------|------|----|----|
| **基本情報** | ID（内部名） | テキスト | 英数字・アンダースコアのみ。例: `my_mob` |
| | 表示名 | テキスト | 自由入力。例: `かっこいいモブ` |
| **外観** | テクスチャ | グリッド選択 | プリセット 40 種 / .bbmodel インポート |
| | 色カスタマイズ | カラーピッカー | テクスチャプリセット選択時のみ |
| **ステータス** | 体力（HP） | スライダー | 1〜500（デフォルト: 20） |
| | 攻撃力 | スライダー | 0〜50（デフォルト: 2、友好モブは 0） |
| | 移動速度 | スライダー | 0.1〜1.0（デフォルト: 0.25） |
| | サイズ | スライダー | 0.1〜5.0（デフォルト: 1.0） |
| **スポーン設定** | スポーンするか | トグル | デフォルト: ON |
| | スポーンバイオーム | タグ選択 | 草原・森林・砂漠・海洋・雪原 等 |
| | スポーン時間帯 | チェック | 昼 / 夜 / 両方 |
| **ドロップ** | ドロップアイテム | リスト（最大 5 件） | アイテム名 + 確率 |

#### 入力項目（ブロック）

| セクション | 項目 | 型 | 制約 |
|----------|------|----|----|
| **基本情報** | ID | テキスト | 英数字・アンダースコアのみ |
| | 表示名 | テキスト | 自由入力 |
| **外観** | テクスチャ | グリッド選択 | プリセット / カスタム |
| | 形状 | アイコン選択 | フルキューブ / スラブ / 階段 / ドア / フェンス 等 |
| **属性** | 採掘時間 | スライダー | 0〜30（デフォルト: 1.5） |
| | 爆発耐性 | スライダー | 0〜3600（デフォルト: 3.0） |
| | 発光レベル | スライダー | 0〜15（デフォルト: 0） |
| | 採掘ツール | 選択 | 手 / ツルハシ / 斧 / シャベル 等 |

#### 入力項目（アイテム）

| セクション | 項目 | 型 | 制約 |
|----------|------|----|----|
| **基本情報** | ID | テキスト | 英数字・アンダースコアのみ |
| | 表示名 | テキスト | 自由入力 |
| **外観** | テクスチャ | グリッド選択 | プリセット / カスタム |
| **属性** | スタック数 | 数値入力 | 1〜64（デフォルト: 64） |
| | 耐久値 | 数値入力 | 0〜1000（0 は無限） |
| | 攻撃力 | スライダー | 0〜30 |
| | グロー | トグル | 光るエフェクト |
| **食べ物** | 栄養 | スライダー | 0〜20（食べ物トレイト選択時のみ表示） |
| | 満腹度 | スライダー | 0.0〜5.0（食べ物トレイト選択時のみ） |

#### リアルタイムバリデーション

入力中に即座に検証し、フォームの横にエラー / 警告を表示する。

```
❌ 名前を入力してください
⚠️ ID に使えるのは英数字・アンダースコアのみです（例: my_cool_mob）
```

---

### Step 5: プレビュー → エクスポート

**ファイル**: `src/features/wizard/steps/Step5Preview.tsx`

#### 表示内容

| エリア | 内容 |
|------|------|
| 3D プレビュー | Babylon.js でエンティティ / ブロック / アイテムを描画 |
| 完成サマリー | 自然言語による設定内容の説明（日本語） |
| バリデーション結果 | エラー / 警告の一覧（平易な日本語） |
| エクスポートボタン | エラーがない場合に有効化 |

#### 完成サマリーの自然言語生成

設定内容を自動で日本語文に組み立てて表示する（ユーザーが設定を見直しやすくする）。

```
あなたが作ったもの：
森林・草原に昼間スポーンする HP=30 の敵対的なモブです。
攻撃力は 5、移動速度は 0.25 です。
骨（確率 50%）をドロップします。
```

#### エクスポートフロー

```
1. 「アドオンをダウンロード」ボタンを押す
2. バリデーション実行（Validator.validate()）
3. エラーがあれば一覧表示して停止
4. エラーがなければ ContentGenerator.generate() 実行
5. JSZip で .mcaddon ファイルを生成
6. file-saver でブラウザダウンロード開始
7. 「「○○.mcaddon」をダウンロードしました」の成功メッセージ表示
```

---

## 3. ステップ遷移ロジック

### 状態管理（wizardStore）

```typescript
// src/store/wizardStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ContentType = 'entity' | 'block' | 'item';
export type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  // 現在のステップ
  currentStep: WizardStep;

  // ドラフトデータ
  contentType: ContentType | null;
  baseSelection: string | null;    // バニラ ID または 'scratch'
  selectedTraits: string[];
  customization: EntityCustomization | BlockCustomization | ItemCustomization | null;

  // ナビゲーション
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // ドラフト更新
  setContentType: (type: ContentType) => void;
  setBaseSelection: (selection: string) => void;
  toggleTrait: (traitId: string) => void;
  updateCustomization: (updates: Partial<EntityCustomization | BlockCustomization | ItemCustomization>) => void;
}

export const useWizardStore = create<WizardState>()(
  immer((set) => ({
    currentStep: 1,
    contentType: null,
    baseSelection: null,
    selectedTraits: [],
    customization: null,

    goToStep: (step) => set((state) => { state.currentStep = step; }),
    nextStep: () => set((state) => {
      if (state.currentStep < 5) state.currentStep += 1;
    }),
    prevStep: () => set((state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    }),
    reset: () => set((state) => {
      state.currentStep = 1;
      state.contentType = null;
      state.baseSelection = null;
      state.selectedTraits = [];
      state.customization = null;
    }),

    setContentType: (type) => set((state) => {
      state.contentType = type;
      state.selectedTraits = []; // 種別変更時にトレイトをリセット
    }),
    setBaseSelection: (selection) => set((state) => {
      state.baseSelection = selection;
    }),
    toggleTrait: (traitId) => set((state) => {
      const idx = state.selectedTraits.indexOf(traitId);
      if (idx === -1) {
        state.selectedTraits.push(traitId);
      } else {
        state.selectedTraits.splice(idx, 1);
      }
    }),
    updateCustomization: (updates) => set((state) => {
      state.customization = { ...state.customization, ...updates } as typeof state.customization;
    }),
  }))
);
```

### ステップの進行ガード

各ステップに「次へ進める条件」を定義する。条件を満たさない限り「次へ」ボタンを無効化する。

```typescript
// src/features/wizard/hooks/useWizardNavigation.ts
import { useWizardStore } from '@/store/wizardStore';

export function useWizardNavigation() {
  const state = useWizardStore();

  const canProceed = (): boolean => {
    switch (state.currentStep) {
      case 1: return state.contentType !== null;
      case 2: return state.baseSelection !== null;
      case 3: return true; // トレイト選択は任意（0 でも進める）
      case 4: return validateCustomization(state.customization);
      case 5: return false; // Step 5 はエクスポートのみ（次へなし）
    }
  };

  return { canProceed: canProceed() };
}

function validateCustomization(
  customization: WizardState['customization']
): boolean {
  if (!customization) return false;
  const id = (customization as { id?: string }).id ?? '';
  return /^[a-z0-9_]+$/.test(id) && id.length > 0;
}
```

### ステップ間のデータ継承

| ステップ変更 | データの扱い |
|----------|-----------|
| 1 → 2 | contentType が確定。種別に応じたバニラカタログを読み込む |
| 2 → 3 | baseSelection が確定。バニラ選択の場合はデフォルトトレイトを設定 |
| 3 → 4 | selectedTraits が確定。トレイトに応じたデフォルトステータスを設定 |
| 4 → 5 | customization が確定。ContentGenerator.generate() の引数として使用 |
| 戻る操作 | 前ステップのデータは保持する（上書きされない） |

---

## 4. ウィザード完了後の出力

### 生成されるファイル・データ

ContentGenerator.generate() が生成する `IGeneratedContent` から .mcaddon をパッケージする。

#### モブ（エンティティ）の場合

```
<my_addon>.mcaddon
├── <name>_behavior/              # Behavior Pack
│   ├── manifest.json             # パック定義（UUID 自動生成）
│   ├── entities/
│   │   └── my_mob.json           # エンティティ定義（コンポーネント展開済み）
│   ├── spawn_rules/
│   │   └── my_mob.json           # スポーンルール（バイオーム・時間帯）
│   └── loot_tables/
│       └── entities/my_mob.json  # ドロップテーブル
└── <name>_resource/              # Resource Pack
    ├── manifest.json
    ├── entity/
    │   └── my_mob.entity.json    # クライアントエンティティ定義
    ├── textures/entity/
    │   └── my_mob.png            # テクスチャ（プリセットから生成）
    ├── geometry/
    │   └── geometry.my_mob.json  # ジオメトリ（バニラベース or カスタム）
    └── texts/
        ├── ja_JP.lang            # 日本語表示名
        └── en_US.lang            # 英語表示名
```

#### ブロックの場合

```
<my_addon>.mcaddon
├── <name>_behavior/
│   ├── manifest.json
│   └── blocks/
│       └── my_block.json
└── <name>_resource/
    ├── manifest.json
    ├── textures/blocks/
    │   └── my_block.png
    ├── blocks.json               # テクスチャマッピング
    └── texts/
        ├── ja_JP.lang
        └── en_US.lang
```

#### アイテムの場合

```
<my_addon>.mcaddon
├── <name>_behavior/
│   ├── manifest.json
│   └── items/
│       └── my_item.json
└── <name>_resource/
    ├── manifest.json
    ├── textures/items/
    │   └── my_item.png
    ├── textures/item_texture.json  # テクスチャリスト
    └── texts/
        ├── ja_JP.lang
        └── en_US.lang
```

### 生成後の画面遷移

エクスポート成功後、ウィザードは「プロジェクトを続けて編集する」「新しいコンテンツを追加する」「ホームに戻る」の 3 択を提示する。

```
✅ ダウンロード完了！

「あなたのモブ.mcaddon」をダウンロードしました。
Minecraft を開いて、設定 → ストレージ → インポートからファイルを選択してください。

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────┐
│  続けて編集する        │  │  新しいコンテンツを追加  │  │ ホームへ │
│  （エディタを開く）    │  │  （ウィザードを再起動）  │  │          │
└──────────────────────┘  └──────────────────────┘  └──────────┘
```

---

## 5. ウィザードナビゲーション UI

### WizardShell コンポーネント

```
┌──────────────────────────────────────────────────────────┐
│  🎮 アドオンクリエイター    [かんたん|くわしい]  [日本語]  ×  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ●─────○─────○─────○─────○                            │
│  種別   ベース  特性  設定  完成                           │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1 / 5 ステップ      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │           現在のステップの内容                        │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [ ← 戻る ]                            [ 次へ → ]       │
└──────────────────────────────────────────────────────────┘
```

### キーボードナビゲーション

| キー | 操作 |
|------|------|
| `Enter` | 「次へ」と同等（有効な場合） |
| `Escape` | ウィザードを閉じる確認ダイアログ |
| `Tab` | フォーカス移動（標準アクセシビリティ） |

すべての操作は `aria-label` と `role` を適切に設定し、スクリーンリーダー対応とする。
