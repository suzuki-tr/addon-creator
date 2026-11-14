# Phase 4 実装計画 — 高度エディタ

ブランチ: `feature/phase-4-editors`（作業開始時点のベース: `b8b71cc`）  
ベースライン: ビルド exit 0、テスト 19/19 合格  
コミット単位: FEAT ごとに 1 コミット（計 4 コミット）

---

## スコープ

| # | 内容 | FEAT |
|---|------|------|
| E2E-NB1 | ja-kids.json に Appearance パネル向け 7 キー追加 | 001 |
| R3 | AppearancePanel UV リセットキーの名前空間修正 | 001 |
| R4 | MaterialPanel / TexturePanel セレクトオプションの i18n 化 | 001 |
| ステータスタブ | HP・攻撃力・速度・サイズの数値入力（StatusPanel 新規作成） | 001 |
| StateGraph 拡張 | 右パネルに変数・イベントトリガーセクション追加（詳細モード専用） | 001 |
| レシピエディタ | Shaped / Shapeless / Furnace の 3 タブ（RecipeEditorPage 新規） | 002 |
| ルートテーブルエディタ | Pool accordion + Entry 管理（LootTableEditorPage 新規） | 002 |
| スポーンルールエディタ | バイオーム・難易度・時間帯フィルター（SpawnRulesEditorPage 新規） | 002 |
| アニメーションコントローラーエディタ | 3 ペイン状態グラフ + 識別子・複数アニメーション（新規） | 003 |
| サウンド定義エディタ | サウンドイベント + ファイルリスト（SoundEditorPage 新規） | 003 |
| テストカバレッジ | ユニットテスト > 80%（vitest happy-dom 環境追加） | 004 |

---

## FEAT-001: Phase 3 非ブロッキング指摘の解消 + 既存エディタ強化

> **既存ファイルの修正のみ。** 新規ページ・ルートなし。

- [ ] 1. **E2E-NB1 — ja-kids Appearance 7 キー追加**  
  `app/src/i18n/locales/ja-kids.json` の `editor.appearance.texture` と `editor.appearance.geometry` に以下を追加する:

  | キー | ja-kids 訳語 | 判断根拠 |
  |-----|-------------|---------|
  | `editor.appearance.texture.slotsTitle` | `"テクスチャのスロット"` | 「スロット」はカタカナ OK |
  | `editor.appearance.texture.uvTitle` | `"UV マッピング"` | UV はゲーム内技術用語、そのまま |
  | `editor.appearance.texture.change` | `"かえる"` | 変(4年)・更(6年) → 平仮名に |
  | `editor.appearance.texture.variantsTitle` | `"テクスチャのバリアント"` | バリアント = katakana OK |
  | `editor.appearance.texture.variantAdvancedOnly` | `"テクスチャのバリアントはくわしいモードでみられます。右上の「くわしい」ボタンをおしてください。"` | 右(2年)・上(1年)は OK |
  | `editor.appearance.geometry.fileLabel` | `"ファイルのパス"` | 「の」を加えて自然に |
  | `editor.appearance.geometry.idLabel` | `"Geometry（ジオメトリ）のID"` | 識(5年)・別(4年)→ID に |

  ファイル: `app/src/i18n/locales/ja-kids.json`  
  Verify: `npm test`（TypeScript 型チェックが ja.json を参照するため ja-kids にないキーはエラーにならない；ビルドが通ることで確認）

- [ ] 2. **R3 — UV リセットキーの名前空間修正**  
  `app/src/i18n/locales/ja.json` と `en.json` に `editor.appearance.texture.uvReset` を追加する:  
  ja: `"↺ リセット"` / en: `"↺ Reset"`  
  `app/src/components/editor/AppearancePanel.tsx` の UvPane コンポーネント内、リセットボタンの `t('editor.stateGraph.reset')` を `t('editor.appearance.texture.uvReset')` に変更する（L299 付近）。  
  ファイル: `app/src/i18n/locales/ja.json`、`en.json`、`app/src/components/editor/AppearancePanel.tsx`  
  Verify: `npm run build`（型エラーなし）

- [ ] 3. **R4 — MaterialPanel / TexturePanel セレクトオプション i18n 化**  
  3 ロケールすべてに以下キーを追加する（advanced mode 専用のため ja-kids は ja と同値で可）:

  ```
  editor.appearance.texture.mappingTypeUV      ja: "UV"            en: "UV"
  editor.appearance.texture.mappingTypeTriplanar ja: "Triplanar"  en: "Triplanar"
  editor.appearance.material.cullingBack        ja: "Back"          en: "Back"
  editor.appearance.material.cullingFront       ja: "Front"         en: "Front"
  editor.appearance.material.cullingNone        ja: "なし"          en: "None"
  editor.appearance.material.blendNone          ja: "なし"          en: "None"
  editor.appearance.material.blendAlpha         ja: "Alpha"         en: "Alpha"
  editor.appearance.material.blendAdditive      ja: "Additive"      en: "Additive"
  ```

  `AppearancePanel.tsx` の TexturePanel（mapping type select）と MaterialPanel（culling / blend select）の各 `<option>` のハードコード文字列を `{t('...')}` に置き換える。Minecraft API 識別子（`entity_alphatest` 等）は変更しない。  
  ファイル: `app/src/i18n/locales/ja.json`、`en.json`、`ja-kids.json`、`app/src/components/editor/AppearancePanel.tsx`  
  Verify: `npm run build`

- [ ] 4. **StatusPanel 新規作成**  
  `app/src/components/editor/StatusPanel.tsx` を新規作成する。エンティティエディタのシンプルモード用ステータスタブのコンテンツ。

  コンポーネント構造:
  ```tsx
  // 4 ステータス行（health, attackDamage, movementSpeed, scale）
  // 各行: { icon, labelKey, min, max, step, defaultValue, unit }
  // 状態: useState<number> x 4
  // 各行のレンダリング: emoji + t(labelKey) + input[type='range'] + input[type='number']（同期） + Reset ボタン
  // Reset ボタン = t('editor.status.resetDefault') でデフォルト値に戻す
  ```

  デフォルト値と範囲:
  | ステータス | emoji | labelKey | min | max | step | default |
  |----------|-------|----------|-----|-----|------|---------|
  | health | ❤️ | entity.status.health | 1 | 2048 | 1 | 20 |
  | attackDamage | ⚔️ | entity.status.attackDamage | 0 | 50 | 0.5 | 3 |
  | movementSpeed | 🏃 | entity.status.movementSpeed | 0.01 | 1.0 | 0.01 | 0.25 |
  | scale | 📐 | entity.status.scale | 0.1 | 5.0 | 0.1 | 1.0 |

  新規 i18n キー（3 ロケールに追加）:
  ```
  editor.status.heading  ja: "ステータスを設定してください"  en: "Set Status Values"
  editor.status.resetDefault  ja: "デフォルト"  en: "Default"
  ```
  ja-kids.json（`editor.status.heading` のみ変更）:
  ```
  editor.status.heading  → "ステータスをきめてください"
  editor.status.resetDefault  → "もとにもどす"
  ```

  ファイル: `app/src/components/editor/StatusPanel.tsx`（新規）、`app/src/i18n/locales/ja.json`、`en.json`、`ja-kids.json`  
  Verify: `npm run build`

- [ ] 5. **EditorPage — status タブに StatusPanel を接続**  
  `app/src/pages/EditorPage.tsx` の status タブパネル内のプレースホルダー（`<p>{t('common.label.loading')}</p>`）を `<StatusPanel />` に差し替える。`StatusPanel` を import する。  
  ファイル: `app/src/pages/EditorPage.tsx`  
  Verify: `npm run build`

- [ ] 6. **StateGraph — 変数・イベントトリガーセクション追加（詳細モード）**  
  `app/src/components/editor/StateGraph.tsx` を修正する。右パネルの末尾（transitions セクションの下）に 2 セクションを追加する。`useUiStore` を import し `mode` を取得する。

  **(a) Variables セクション** `mode === 'advanced'` のときのみ表示:
  ```tsx
  // state: variables: Array<{id:string; name:string; defaultValue:number}>
  // 各行: name input (font-mono) | defaultValue input[type='number'] | ✕ ボタン
  // Add ボタン (border-dashed)
  ```

  **(b) Event Triggers セクション** `mode === 'advanced'` のときのみ表示:
  ```tsx
  // state: events: Array<{id:string; eventType:'entry'|'exit'; action:string}>
  // on_entry サブリスト + on_exit サブリスト（eventType でフィルタ）
  // 各行: action input (font-mono) | ✕ ボタン
  // 各サブリストに Add ボタン
  ```

  新規 i18n キー（3 ロケールに追加、ja-kids は ja と同値のため不要）:
  ```
  editor.stateGraph.variables           ja: "変数"              en: "Variables"
  editor.stateGraph.variablesName       ja: "変数名"            en: "Variable Name"
  editor.stateGraph.variablesDefault    ja: "初期値"            en: "Default Value"
  editor.stateGraph.addVariable         ja: "＋ 変数を追加"     en: "+ Add Variable"
  editor.stateGraph.eventTriggers       ja: "イベントトリガー"  en: "Event Triggers"
  editor.stateGraph.onEntry             ja: "on_entry（開始時）"en: "on_entry (on enter)"
  editor.stateGraph.onExit              ja: "on_exit（終了時）" en: "on_exit (on exit)"
  editor.stateGraph.addEvent            ja: "＋ 追加"           en: "+ Add"
  ```

  ファイル: `app/src/components/editor/StateGraph.tsx`、`app/src/i18n/locales/ja.json`、`en.json`  
  Verify: `npm run build && npm test`（19/19 合格）

- [ ] 7. **FEAT-001 コミット**  
  `git add app/src/i18n/locales/ja.json app/src/i18n/locales/en.json app/src/i18n/locales/ja-kids.json app/src/components/editor/AppearancePanel.tsx app/src/components/editor/StateGraph.tsx app/src/components/editor/StatusPanel.tsx app/src/pages/EditorPage.tsx`  
  `git commit -m "fix(editor,i18n): address Phase 3 non-blocking findings, add status panel and state graph variables"`

---

## FEAT-002: レシピ・ルートテーブル・スポーンルールエディタ

> **新規ファイルのみ。** 既存ファイルは App.tsx・HomePage.tsx・locale ファイルのみ変更。

- [ ] 8. **i18n キー追加 — recipe.* / lootTable.* / spawnRules.* / home.tools.*（3 ロケール）**  
  `ja.json` → `en.json` → `ja-kids.json` の順で追加する。

  **ja.json に追加するキー:**
  ```json
  "recipe": {
    "pageTitle": "レシピエディタ",
    "tabs": { "shaped": "クラフト（形あり）", "shapeless": "クラフト（形なし）", "furnace": "かまど" },
    "result": "完成品", "resultCount": "個数",
    "pattern": "パターン（3×3）", "keys": "材料の対応",
    "addKey": "＋ 追加", "deleteKey": "削除",
    "ingredients": "材料", "addIngredient": "＋ 材料を追加",
    "input": "入力アイテム", "output": "出力アイテム",
    "cookTime": "加熱時間（tick）", "experience": "経験値",
    "slot": "スロット", "empty": "（空）", "itemId": "アイテム ID"
  },
  "lootTable": {
    "pageTitle": "ドロップテーブルエディタ", "pools": "プール一覧", "pool": "プール",
    "rolls": "ドロップ回数", "rollsMin": "最小", "rollsMax": "最大",
    "entries": "エントリー", "addEntry": "＋ エントリーを追加",
    "addPool": "＋ プールを追加", "deletePool": "プールを削除",
    "entryType": "種類", "entryName": "アイテム ID",
    "entryWeight": "重み", "entryCount": "個数",
    "typeItem": "アイテム", "typeLootTable": "別のテーブル"
  },
  "spawnRules": {
    "pageTitle": "スポーンルールエディタ", "entityId": "エンティティ ID",
    "populationControl": "出現設定",
    "onSurface": "地上に出現", "underground": "地下に出現", "inLava": "溶岩に出現",
    "conditions": "条件", "weight": "重み",
    "groupSizeMin": "グループ最小", "groupSizeMax": "グループ最大",
    "biomeFilter": "バイオームフィルター", "addBiomeTag": "＋ タグを追加", "deleteBiomeTag": "削除",
    "difficultyFilter": "難易度フィルター",
    "lightLevel": "明るさレベル", "lightMin": "最小", "lightMax": "最大",
    "timeOfDay": "時間帯",
    "timeDawn": "夜明け", "timeDay": "昼", "timeDusk": "夕暮れ", "timeNight": "夜"
  },
  "home": { "tools": {
    "title": "エディタツール",
    "recipe": "レシピエディタ",
    "lootTable": "ドロップテーブルエディタ",
    "spawnRules": "スポーンルールエディタ"
  }}
  ```

  **en.json の対応キー（概略）:**
  - recipe.pageTitle='Recipe Editor', tabs: Shaped Crafting / Shapeless Crafting / Furnace
  - result='Result Item', resultCount='Count', pattern='Pattern (3×3)', keys='Key Mapping'
  - addKey='+ Add Key', deleteKey='Delete', ingredients='Ingredients', addIngredient='+ Add Ingredient'
  - input='Input Item', output='Output Item', cookTime='Cook Time (ticks)', experience='Experience'
  - slot='Slot', empty='(Empty)', itemId='Item ID'
  - lootTable.pageTitle='Loot Table Editor', pools='Pools', pool='Pool', rolls='Roll Count'
  - rollsMin='Min', rollsMax='Max', entries='Entries', addEntry='+ Add Entry'
  - addPool='+ Add Pool', deletePool='Delete Pool', entryType='Type', entryName='Item ID'
  - entryWeight='Weight', entryCount='Count', typeItem='Item', typeLootTable='Loot Table'
  - spawnRules.pageTitle='Spawn Rules Editor', entityId='Entity ID', populationControl='Population Control'
  - onSurface='Spawns on surface', underground='Spawns underground', inLava='Spawns in lava'
  - conditions='Conditions', weight='Weight', groupSizeMin='Min group size', groupSizeMax='Max group size'
  - biomeFilter='Biome Filter', addBiomeTag='+ Add Tag', deleteBiomeTag='Delete'
  - difficultyFilter='Difficulty Filter', lightLevel='Light Level', lightMin='Min', lightMax='Max'
  - timeOfDay='Time of Day', timeDawn='Dawn', timeDay='Day', timeDusk='Dusk', timeNight='Night'
  - home.tools.title='Editor Tools', recipe='Recipe Editor', lootTable='Loot Table Editor', spawnRules='Spawn Rules Editor'

  **ja-kids.json に追加（ja と異なる部分のみ）:**
  ```json
  "recipe": {
    "tabs": { "shaped": "クラフト（かたちあり）", "shapeless": "クラフト（かたちなし）" },
    "result": "できるもの", "resultCount": "こすう",
    "ingredients": "ざいりょう", "addIngredient": "＋ ざいりょうをついか",
    "empty": "（から）", "itemId": "アイテムのID"
  },
  "lootTable": {
    "addPool": "＋ プールをついか",
    "addEntry": "＋ エントリーをついか"
  },
  "home": { "tools": {
    "lootTable": "Loot（ドロップ）テーブルエディタ",
    "spawnRules": "Spawn（スポーン）ルールエディタ"
  }}
  ```

  ファイル: `app/src/i18n/locales/ja.json`、`en.json`、`ja-kids.json`  
  Verify: `npm run build`

- [ ] 9. **RecipeEditor コンポーネント新規作成**  
  `app/src/components/editor/RecipeEditor.tsx`

  型定義（ファイル内）:
  ```ts
  type RecipeType = 'shaped' | 'shapeless' | 'furnace'
  ```

  **ShapedRecipePanel**（内部サブコンポーネント）:
  - `useState<string[]>(Array(9).fill(''))` — 9 スロット
  - `useState<Array<{letter:string; itemId:string}>>` — キーマッピング
  - `useState<string>('')` / `useState<number>(1)` — 結果アイテム・個数
  - 3×3 CSS グリッド（`grid grid-cols-3 gap-1 w-fit`）
  - 各スロットは `<button>`: `t('recipe.empty')` または itemId を表示（`font-mono text-xs`）
  - クリックで `selectedSlot` を設定 → スロット下部に `<input type='text'>` を表示（Enter/blur で確定）
  - 右側にスペースを挟んで Result スロット + Count `<input type='number'>`
  - Keys セクション: 各行 letter `<input>` (1文字、w-8) + Item ID `<input>` + ✕ 削除ボタン

  **ShapelessRecipePanel**（内部サブコンポーネント）:
  - `useState<string[]>([''])` — 材料リスト（max 9）
  - 各行: `<input type='text'>` (font-mono) + ✕ ボタン
  - Add ボタン（上限 9 を超えると disabled）
  - Result スロット + Count

  **FurnaceRecipePanel**（内部サブコンポーネント）:
  - 4 フィールド: input / output (string input) + cookTime / experience (number input)
  - cookTime デフォルト 200 / experience デフォルト 0.7

  **RecipeEditor** (export):
  - タブバー（`role='tablist'`、3 タブ、ARIA パターン）
  - `{recipeType === 'shaped' && <ShapedRecipePanel />}` etc.

  Tailwind クラスのポイント:
  - グリッドスロット: `w-16 h-16 border-2 border-gray-200 rounded-md text-xs hover:border-[#5D9C3B] transition-colors`
  - 選択中スロット: `border-[#5D9C3B] bg-[#F0F8EA]`

  ファイル: `app/src/components/editor/RecipeEditor.tsx`（新規）  
  Verify: `npm run build`

- [ ] 10. **RecipeEditorPage 新規作成**  
  `app/src/pages/RecipeEditorPage.tsx`

  EditorPage.tsx のレイアウト骨格をそのまま踏襲する:
  ```
  flex flex-1 overflow-hidden min-h-0
  ├── <aside> w-60 (FileTreeItem 'recipe.json')
  └── <main> flex-1 flex-col
       ├── タイトルバー (bg-white border-b, h1 = t('recipe.pageTitle'))
       ├── flex-1 overflow-y-auto p-6
       │    └── <RecipeEditor />
       └── アクションバー (border-t, 💾 保存 + ⬇️ エクスポート)
  ```

  ファイル: `app/src/pages/RecipeEditorPage.tsx`（新規）  
  Verify: `npm run build`

- [ ] 11. **LootTableEditor コンポーネント新規作成**  
  `app/src/components/editor/LootTableEditor.tsx`

  型定義:
  ```ts
  interface LootEntry { id: string; type: 'item' | 'loot_table'; name: string; weight: number; count: number }
  interface LootPool { id: string; rollsMin: number; rollsMax: number; entries: LootEntry[]; expanded: boolean }
  ```

  初期状態: 1 プール（rollsMin=1, rollsMax=2）、1 エントリー（type='item', name='minecraft:diamond', weight=1, count=1）

  各プール → accordion（ComponentPanel.tsx のパターンを踏襲）:
  ```
  ヘッダー行: 'プール N (ロール: min-max)' + ▼/▲ 展開トグル + ✕ 削除
  展開時:
    └── rolls min/max <input type='number'>
    └── entries テーブル
         各行: type <select> (lootTable.typeItem / typeLootTable) | name <input> | weight <input> | count <input> | ✕
    └── [＋ エントリーを追加] ボタン
  ```

  Add Pool ボタン（border-dashed）はリスト下部。

  ファイル: `app/src/components/editor/LootTableEditor.tsx`（新規）  
  Verify: `npm run build`

- [ ] 12. **LootTableEditorPage 新規作成**  
  `app/src/pages/LootTableEditorPage.tsx`  
  RecipeEditorPage と同じレイアウト。サイドバーに `'loot_table.json'` FileTreeItem。タイトル `t('lootTable.pageTitle')`。

  ファイル: `app/src/pages/LootTableEditorPage.tsx`（新規）  
  Verify: `npm run build`

- [ ] 13. **SpawnRulesEditor コンポーネント新規作成**  
  `app/src/components/editor/SpawnRulesEditor.tsx`

  State（すべて useState）:
  ```ts
  entityId: string = 'myaddon:my_mob'
  onSurface: boolean = true
  underground: boolean = false
  inLava: boolean = false
  weight: number = 100
  groupMin: number = 1
  groupMax: number = 3
  biomeTags: string[] = ['plains']
  newBiomeTag: string = ''   // 入力欄
  difficulties: Set<string> = new Set(['easy', 'normal', 'hard'])
  lightMin: number = 0
  lightMax: number = 7
  ```

  レイアウト（1 カラム、`max-w-2xl mx-auto flex flex-col gap-4`、各セクションは `border rounded-lg p-4`）:

  セクション 1: Entity ID — `<input type='text'>` font-mono  
  セクション 2: 出現設定 — 3 `<input type='checkbox'>` + label  
  セクション 3: 条件 — weight `<input type='number'>` + groupMin/groupMax `<input type='number'>`  
  セクション 4: バイオームフィルター — タグ chips（各タグ: `<span> + ✕ ボタン`）+ テキスト入力（Enter で追加）  
  セクション 5: 難易度フィルター — 3 `<input type='checkbox'>` (easy/normal/hard)  
  セクション 6: 明るさレベル — lightMin / lightMax `<input type='number'>`  
  セクション 7（advanced モードのみ）: 時間帯 — 4 `<input type='checkbox'>` (Dawn/Day/Dusk/Night)

  ファイル: `app/src/components/editor/SpawnRulesEditor.tsx`（新規）  
  Verify: `npm run build`

- [ ] 14. **SpawnRulesEditorPage 新規作成**  
  `app/src/pages/SpawnRulesEditorPage.tsx`  
  サイドバーに `'spawn_rules.json'` FileTreeItem。タイトル `t('spawnRules.pageTitle')`。

  ファイル: `app/src/pages/SpawnRulesEditorPage.tsx`（新規）  
  Verify: `npm run build`

- [ ] 15. **App.tsx — 3 ルート追加**  
  `app/src/App.tsx` に import を追加し、3 ルートを追加する:
  ```tsx
  <Route path="/recipe" element={<AppShell noPadding><RecipeEditorPage /></AppShell>} />
  <Route path="/loot-table" element={<AppShell noPadding><LootTableEditorPage /></AppShell>} />
  <Route path="/spawn-rules" element={<AppShell noPadding><SpawnRulesEditorPage /></AppShell>} />
  ```

  ファイル: `app/src/App.tsx`  
  Verify: `npm run build`

- [ ] 16. **HomePage — ツールカードセクション追加**  
  `app/src/pages/HomePage.tsx` の最近のプロジェクトセクションの下に「エディタツール」セクションを追加する。3 カードを `grid grid-cols-1 sm:grid-cols-3 gap-3` で横並び表示。各カードは `react-router-dom` の `<Link>` を使用。i18n キー `home.tools.*` を使用。カードデザイン: `border rounded-lg p-4 hover:border-[#5D9C3B] transition-colors` + アイコン（🍳 レシピ、📋 ルートテーブル、🌿 スポーン）。

  ファイル: `app/src/pages/HomePage.tsx`  
  Verify: `npm run build && npm test`（19/19 合格）

- [ ] 17. **FEAT-002 コミット**  
  `git commit -m "feat(recipe,loot,spawn): add recipe editor, loot table editor, spawn rules editor pages"`

---

## FEAT-003: アニメーションコントローラー・サウンド定義エディタ

> **新規ファイルのみ。** App.tsx・HomePage.tsx・locale ファイルを追加変更。

- [ ] 18. **i18n キー追加 — animationController.* / sound.* / home.tools.* 追加分（3 ロケール）**  
  `ja.json` → `en.json` → `ja-kids.json` の順で追加する。

  **ja.json に追加するキー:**
  ```json
  "animationController": {
    "pageTitle": "アニメーションコントローラーエディタ",
    "identifier": "識別子",
    "states": "状態一覧", "addState": "＋ 状態を追加", "initialState": "初期状態",
    "stateName": "状態名",
    "animations": "アニメーション一覧",
    "addAnimation": "＋ アニメーションを追加", "deleteAnimation": "削除",
    "transitions": "遷移条件", "addTransition": "＋ 遷移を追加",
    "variables": "変数", "addVariable": "＋ 変数を追加",
    "variablesName": "変数名", "variablesDefault": "初期値",
    "onEntry": "on_entry（開始時）", "onExit": "on_exit（終了時）", "addEvent": "＋ 追加",
    "canvasHint": "ノードをドラッグして配置できます（実装予定）"
  },
  "sound": {
    "pageTitle": "サウンド定義エディタ",
    "identifier": "サウンド ID",
    "category": "カテゴリ", "volume": "音量", "pitch": "ピッチ",
    "is3D": "3D サウンド", "loop": "ループ再生",
    "files": "サウンドファイル", "addFile": "＋ ファイルを追加",
    "filePath": "ファイルパス", "fileVolume": "音量", "filePitch": "ピッチ",
    "deleteFile": "削除",
    "categories": {
      "entity": "entity", "neutral": "neutral", "ambient": "ambient",
      "block": "block", "player": "player", "music": "music", "weather": "weather"
    }
  },
  "home": { "tools": {
    "animationController": "アニメーションコントローラーエディタ",
    "sound": "サウンド定義エディタ"
  }}
  ```

  **en.json の対応キー（概略）:**
  - animationController.pageTitle='Animation Controller Editor', identifier='Identifier'
  - states='States', addState='+ Add State', initialState='Initial State', stateName='State Name'
  - animations='Animations', addAnimation='+ Add Animation', deleteAnimation='Delete'
  - transitions='Transitions', addTransition='+ Add Transition'
  - variables='Variables', addVariable='+ Add Variable', variablesName='Variable Name', variablesDefault='Default Value'
  - onEntry='on_entry (on enter)', onExit='on_exit (on exit)', addEvent='+ Add'
  - canvasHint='Drag nodes to reposition (coming soon)'
  - sound.pageTitle='Sound Definition Editor', identifier='Sound ID', category='Category'
  - volume='Volume', pitch='Pitch', is3D='3D Sound', loop='Loop'
  - files='Sound Files', addFile='+ Add File', filePath='File Path', fileVolume='Volume', filePitch='Pitch', deleteFile='Delete'
  - sound.categories: all same as ja (API identifiers)
  - home.tools.animationController='Animation Controller Editor', home.tools.sound='Sound Definition Editor'

  **ja-kids.json の追加:** animationController と sound は advanced-mode 寄りのため ja にフォールバックで可（追加不要）。`home.tools.sound = 'サウンドエディタ'`（短縮形のみ）。

  ファイル: `app/src/i18n/locales/ja.json`、`en.json`、`ja-kids.json`  
  Verify: `npm run build`

- [ ] 19. **AnimationControllerEditor コンポーネント新規作成**  
  `app/src/components/editor/AnimationControllerEditor.tsx`

  StateGraph.tsx の 3 ペインレイアウトと SVG キャンバス実装を**同一パターンで新規実装**する（コピーではなく同等実装）。

  **StateGraph.tsx との主な差異:**

  (1) ヘッダーバー追加（高さ 48px、`bg-gray-50 border-b`）: 識別子 `<input type='text'>` を配置（デフォルト: `'controller.animation.my_mob.general'`、font-mono）。

  (2) 右パネルの animations フィールドをリストに拡張:
  ```tsx
  // 各状態は animations: string[] を持つ
  // 右パネルで stateName の下に animationsList を表示
  // 各行: animation文字列 input (font-mono) + ✕ 削除ボタン
  // Add ボタン: + アニメーションを追加
  ```

  (3) Variables セクション・Event Triggers セクション: StateGraph.tsx（FEAT-001 で追加）と同一構造だが、AnimationControllerEditor では常時表示（advanced mode 限定でなく）。

  初期状態: 3 ノード（`default`, `walk`, `attack`）+ 2 遷移。各ノードは animations フィールドを持つ（例: `['animation.my_mob.idle']`）。

  SVG 部分: StateGraph.tsx と同じ `NODE_W=110`, `NODE_H=40`, `rectBorderPoint` ヘルパー, 同じドット背景, 同じ arrowhead marker, 同じ node/transition レンダリングロジック。

  ファイル: `app/src/components/editor/AnimationControllerEditor.tsx`（新規）  
  Verify: `npm run build`

- [ ] 20. **AnimationControllerEditorPage 新規作成**  
  `app/src/pages/AnimationControllerEditorPage.tsx`

  サイドバー: `'animation_controller.json'` FileTreeItem。  
  タイトルバー: `t('animationController.pageTitle')`。  
  コンテンツ: StateGraph タブと同じフルブリードパターン（`flex-1 -m-6 overflow-hidden` ラッパー）で `<AnimationControllerEditor />` を表示する。

  ファイル: `app/src/pages/AnimationControllerEditorPage.tsx`（新規）  
  Verify: `npm run build`

- [ ] 21. **SoundEditor コンポーネント新規作成**  
  `app/src/components/editor/SoundEditor.tsx`

  型定義:
  ```ts
  type SoundCategory = 'entity' | 'neutral' | 'ambient' | 'block' | 'player' | 'music' | 'weather'
  interface SoundFile { id: string; path: string; volume: number; pitch: number }
  ```

  State（すべて useState）:
  ```ts
  identifier: string = 'mob.entity.my_mob.ambient'
  category: SoundCategory = 'neutral'
  volume: number = 1.0
  pitch: number = 1.0
  is3D: boolean = true
  loop: boolean = false
  files: SoundFile[] = [{ id: '1', path: 'sounds/mob/my_mob/idle.ogg', volume: 1.0, pitch: 1.0 }]
  ```

  レイアウト（1 カラム、`max-w-2xl mx-auto flex flex-col gap-4`）:

  セクション 1: `sound.identifier` label + `<input type='text'>` font-mono  
  セクション 2: `sound.category` label + `<select>` (SoundCategory の各値を option で並べる、`t('sound.categories.xxx')` を表示ラベルとして使用) + `sound.volume` + `<input type='number' min=0 max=1 step=0.1>` + `sound.pitch` + `<input type='number' min=0.5 max=2.0 step=0.1>`  
  セクション 3: `is3D` toggle（`@radix-ui/react-switch` の `Switch` コンポーネントを使用）+ `loop` toggle  
  セクション 4: `sound.files` heading + ファイルリスト（各行: path input + volume input + pitch input + ✕ 削除ボタン）+ Add ボタン（border-dashed）

  `@radix-ui/react-switch` は既に `package.json` にあるので `npm install` 不要。  
  Switch の使用パターン: `<Switch.Root checked={is3D} onCheckedChange={setIs3D} aria-label={t('sound.is3D')}>`

  ファイル: `app/src/components/editor/SoundEditor.tsx`（新規）  
  Verify: `npm run build`

- [ ] 22. **SoundEditorPage 新規作成**  
  `app/src/pages/SoundEditorPage.tsx`  
  サイドバー: `'sound_definitions.json'` FileTreeItem。タイトル: `t('sound.pageTitle')`。

  ファイル: `app/src/pages/SoundEditorPage.tsx`（新規）  
  Verify: `npm run build`

- [ ] 23. **App.tsx — 2 ルート追加**  
  ```tsx
  <Route path="/animation-controller" element={<AppShell noPadding><AnimationControllerEditorPage /></AppShell>} />
  <Route path="/sound" element={<AppShell noPadding><SoundEditorPage /></AppShell>} />
  ```

  ファイル: `app/src/App.tsx`  
  Verify: `npm run build`

- [ ] 24. **HomePage — ツールカード 2 件追加**  
  FEAT-002 で追加したツールカードグリッドに `animationController`（🎬）と `sound`（🔊）の 2 カードを追加する。

  ファイル: `app/src/pages/HomePage.tsx`  
  Verify: `npm run build && npm test`（19/19 合格）

- [ ] 25. **FEAT-003 コミット**  
  `git commit -m "feat(anim,sound): add animation controller and sound definition editor pages"`

---

## FEAT-004: ユニットテストカバレッジ > 80%

- [ ] 26. **vitest DOM 環境設定**  
  `app/` ディレクトリで `npm install -D happy-dom` を実行する。  
  `app/vite.config.ts` の `test` セクションに `environment: 'happy-dom'` を追加する。  
  `app/src/test/setup.ts` を新規作成し、`vi.mock('react-i18next', ...)` と `vi.mock('@/stores/uiStore', ...)` の標準モックを定義する。`vite.config.ts` の `test.setupFiles` に `['./src/test/setup.ts']` を追加する。  
  ファイル: `app/vite.config.ts`、`app/src/test/setup.ts`（新規）  
  Verify: `npm test`（既存 19 テスト合格）

- [ ] 27. **recipeUtils.ts 抽出**  
  `app/src/utils/recipeUtils.ts` を新規作成する。RecipeEditor.tsx の内部ロジックとして実装した純粋関数を抽出（またはここで先に実装して RecipeEditor から import）する:
  ```ts
  export const isValidItemId = (id: string): boolean
  // 'namespace:name' 形式（英数字・_ のみ、コロン 1 個）→ true
  
  export const buildShapedRecipeJson = (
    slots: string[], keys: Array<{letter: string; itemId: string}>,
    resultItem: string, resultCount: number
  ): Record<string, unknown>
  // Bedrock Edition shaped recipe JSON を返す

  export const buildFurnaceRecipeJson = (
    input: string, output: string, cookTime: number, experience: number
  ): Record<string, unknown>
  // Bedrock furnace recipe JSON を返す
  ```

  ファイル: `app/src/utils/recipeUtils.ts`（新規）  
  Verify: `npm run build`

- [ ] 28. **recipeUtils.spec.ts**  
  `app/src/utils/recipeUtils.spec.ts` を新規作成する（最低 8 テストケース）:
  - `isValidItemId('minecraft:planks')` → `true`
  - `isValidItemId('')` → `false`
  - `isValidItemId('no_namespace')` → `false`（コロンなし）
  - `isValidItemId('a:b:c')` → `false`（コロン 2 個以上）
  - `isValidItemId('minecraft:oak_log')` → `true`
  - `buildShapedRecipeJson(...)` の出力オブジェクトに `format_version`・`minecraft:recipe_shaped` フィールドがある
  - `buildShapedRecipeJson(...)` の `result.item` が指定した `resultItem` と一致する
  - `buildFurnaceRecipeJson(...)` の出力に `minecraft:recipe_furnace` フィールドがある

  ファイル: `app/src/utils/recipeUtils.spec.ts`（新規）  
  Verify: `npm test`

- [ ] 29. **lootTableUtils.ts 抽出**  
  `app/src/utils/lootTableUtils.ts` を新規作成する:
  ```ts
  export interface LootEntry { weight: number; count: number; name: string; type: 'item' | 'loot_table' }
  export interface LootPool { rollsMin: number; rollsMax: number; entries: LootEntry[] }

  export const totalWeight = (entries: LootEntry[]): number
  export const entryProbability = (entryWeight: number, totalW: number): number
  // パーセント（0-100）を返す。totalW が 0 の場合は 0 を返す。
  export const buildLootTableJson = (pools: LootPool[]): Record<string, unknown>
  // Bedrock loot table JSON を返す
  ```

  ファイル: `app/src/utils/lootTableUtils.ts`（新規）  
  Verify: `npm run build`

- [ ] 30. **lootTableUtils.spec.ts**  
  `app/src/utils/lootTableUtils.spec.ts` を新規作成する（最低 6 テストケース）:
  - `totalWeight([{weight:1,...},{weight:2,...},{weight:3,...}])` → `6`
  - `totalWeight([])` → `0`
  - `entryProbability(2, 6)` → `expect(...).toBeCloseTo(33.33)`
  - `entryProbability(0, 0)` → `0`（ゼロ除算ガード）
  - `buildLootTableJson([pool])` の出力に `pools` 配列フィールドがある
  - `buildLootTableJson([pool]).pools[0].rolls` が `{min:pool.rollsMin, max:pool.rollsMax}` と一致する

  ファイル: `app/src/utils/lootTableUtils.spec.ts`（新規）  
  Verify: `npm test`

- [ ] 31. **StatusPanel.spec.ts**  
  `app/src/components/editor/StatusPanel.spec.ts` を新規作成する（最低 4 テストケース、`@testing-library/react` 使用）:
  - `renders without crashing` — `render(<StatusPanel />)` がエラーなく完了する
  - `renders 4 stat rows` — `screen.getAllByRole('slider').length` が `4` である
  - `health slider has default value 20` — health の slider の `value` が `'20'` である
  - `reset button restores default` — slider の値を変更後、Reset ボタンをクリックするとデフォルト値に戻る（`fireEvent.change` + `fireEvent.click` を使用）

  ファイル: `app/src/components/editor/StatusPanel.spec.ts`（新規）  
  Verify: `npm test`

- [ ] 32. **RecipeEditor.spec.ts**  
  `app/src/components/editor/RecipeEditor.spec.ts` を新規作成する（最低 4 テストケース）:
  - `renders shaped tab selected by default` — shaped タブの `aria-selected` が `'true'`
  - `renders 9 slot buttons` — スロットボタンが 9 個ある（`getAllByRole('button')` で数を確認）
  - `shapeless tab renders ingredient list` — shapeless タブクリック後に Add ボタンが表示される
  - `furnace tab renders cook time field` — furnace タブクリック後に cookTime ラベルが表示される

  ファイル: `app/src/components/editor/RecipeEditor.spec.ts`（新規）  
  Verify: `npm test`

- [ ] 33. **LootTableEditor.spec.ts と SpawnRulesEditor.spec.ts**  
  各ファイルを新規作成する（各最低 3 テストケース）:

  `LootTableEditor.spec.ts`:
  - `renders initial pool` — pool accordion が 1 件ある
  - `add pool button is present` — Add Pool ボタンが存在する
  - `pool can be expanded` — ヘッダーをクリックすると entries が表示される

  `SpawnRulesEditor.spec.ts`:
  - `renders entity id input` — Entity ID input が存在する
  - `surface spawn checkbox is checked by default` — `onSurface` checkbox が checked である
  - `biome filter section is present` — バイオームフィルターセクションが表示される

  ファイル: `app/src/components/editor/LootTableEditor.spec.ts`（新規）、`app/src/components/editor/SpawnRulesEditor.spec.ts`（新規）  
  Verify: `npm test`（全テスト合格）

- [ ] 34. **FEAT-004 コミット**  
  `git commit -m "test: add unit tests for Phase 4 editors, >80% coverage"`

---

## Digest

### 変更ファイル一覧

| ファイル | 変更内容 | FEAT | 該当テスト |
|--------|---------|------|----------|
| `app/src/i18n/locales/ja.json` | E2E-NB1 解消・R3・R4・StatusPanel・StateGraph・FEAT-002/003 新規キー追加 | 001-003 | ビルド型チェック |
| `app/src/i18n/locales/en.json` | 同上（英語版） | 001-003 | ビルド型チェック |
| `app/src/i18n/locales/ja-kids.json` | E2E-NB1 解消・R3 除外・StatusPanel・FEAT-002 一部 | 001-002 | ビルド型チェック |
| `app/src/components/editor/AppearancePanel.tsx` | uvReset キー差し替え（L299）、R4 select option t() 化 | 001 | npm run build |
| `app/src/components/editor/StateGraph.tsx` | Variables + Event Triggers セクション追加（右パネル末尾） | 001 | npm run build |
| `app/src/components/editor/StatusPanel.tsx` | **新規** — 4 stat rows、controlled range/number inputs | 001 | StatusPanel.spec.ts |
| `app/src/pages/EditorPage.tsx` | status タブを StatusPanel に差し替え | 001 | npm run build |
| `app/src/components/editor/RecipeEditor.tsx` | **新規** — Shaped/Shapeless/Furnace タブ | 002 | RecipeEditor.spec.ts |
| `app/src/pages/RecipeEditorPage.tsx` | **新規** | 002 | npm run build |
| `app/src/components/editor/LootTableEditor.tsx` | **新規** — Pool accordion + Entry 管理 | 002 | LootTableEditor.spec.ts |
| `app/src/pages/LootTableEditorPage.tsx` | **新規** | 002 | npm run build |
| `app/src/components/editor/SpawnRulesEditor.tsx` | **新規** — バイオーム・難易度・時間帯フィルター | 002 | SpawnRulesEditor.spec.ts |
| `app/src/pages/SpawnRulesEditorPage.tsx` | **新規** | 002 | npm run build |
| `app/src/App.tsx` | /recipe /loot-table /spawn-rules /animation-controller /sound を追加 | 002-003 | npm run build |
| `app/src/pages/HomePage.tsx` | ツールカードセクション追加（5 カード） | 002-003 | npm run build |
| `app/src/components/editor/AnimationControllerEditor.tsx` | **新規** — 3 ペイン + 識別子 + animations リスト | 003 | npm run build |
| `app/src/pages/AnimationControllerEditorPage.tsx` | **新規** | 003 | npm run build |
| `app/src/components/editor/SoundEditor.tsx` | **新規** — Radix Switch + ファイルリスト | 003 | npm run build |
| `app/src/pages/SoundEditorPage.tsx` | **新規** | 003 | npm run build |
| `app/vite.config.ts` | test.environment = 'happy-dom', test.setupFiles 追加 | 004 | npm test |
| `app/src/test/setup.ts` | **新規** — vi.mock react-i18next / uiStore | 004 | npm test |
| `app/src/utils/recipeUtils.ts` | **新規** — isValidItemId、buildShapedRecipeJson、buildFurnaceRecipeJson | 004 | recipeUtils.spec.ts |
| `app/src/utils/recipeUtils.spec.ts` | **新規** — 最低 8 テストケース | 004 | npm test |
| `app/src/utils/lootTableUtils.ts` | **新規** — totalWeight、entryProbability、buildLootTableJson | 004 | lootTableUtils.spec.ts |
| `app/src/utils/lootTableUtils.spec.ts` | **新規** — 最低 6 テストケース | 004 | npm test |
| `app/src/components/editor/StatusPanel.spec.ts` | **新規** — 最低 4 テストケース | 004 | npm test |
| `app/src/components/editor/RecipeEditor.spec.ts` | **新規** — 最低 4 テストケース | 004 | npm test |
| `app/src/components/editor/LootTableEditor.spec.ts` | **新規** — 最低 3 テストケース | 004 | npm test |
| `app/src/components/editor/SpawnRulesEditor.spec.ts` | **新規** — 最低 3 テストケース | 004 | npm test |

### ベースライン確認済み
- ビルドコマンド: `npm run build` (from `app/`) — 現時点で exit 0
- テストコマンド: `npm test` (from `app/`) — 現時点で 19/19 合格
- 既存テストファイル: `app/src/components/wizard/wizard.spec.ts`（isValidId / toId 純粋関数テスト）

### FEAT 間の依存関係
- FEAT-001 ← 依存なし（独立）
- FEAT-002 ← FEAT-001 と独立（新規ファイルのみ）
- FEAT-003 ← FEAT-002 のパターンを参照するが独立（新規ファイルのみ）
- FEAT-004 ← FEAT-001〜003 のすべてが完了してから実施（テスト対象が存在することが前提）

### コミット計画
1. `fix(editor,i18n): address Phase 3 non-blocking findings, add status panel and state graph variables` (FEAT-001)
2. `feat(recipe,loot,spawn): add recipe editor, loot table editor, spawn rules editor pages` (FEAT-002)
3. `feat(anim,sound): add animation controller and sound definition editor pages` (FEAT-003)
4. `test: add unit tests for Phase 4 editors, >80% coverage` (FEAT-004)
