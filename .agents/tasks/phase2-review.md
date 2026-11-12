# Phase 2 コア機能（ラウンド3）— 全修正確認、追加指摘 3 件

ラウンド1・2 で指摘した計 10 件（ID ガード・WizardProgress 合計値・scale キー誤用・重複 import・ハードコード文字列、および `button` 内 `input` ネスト・Save 誤 alert・typeLabel ハードコード・viewAll 未無効化・テストなし）はすべて解消されており、最新コミット `d6dea3b` のビルドは `tsc -b && vite build — 0 TS errors, 70 modules`・`vitest run — 17/17 passed` と記録されている。3 画面の完了条件チェックリスト（ファイル存在・TypeScript エラーなし・3 ロケールキー揃い・progress.md 更新）はすべて満たしている。

**Watch for:**
- `toId('かっこいい モブ')` が `'_'`（単一アンダースコア）を返し `isValidId` を通過する。ID ガードは空文字列のみを弾くため、スペース入り日本語表示名から `_.mcaddon` という名前が自動提案される — **confirmed**
- `wizard.spec.ts` テスト名 `'returns empty string for mixed Japanese + spaces'` が `'_'` を assert しており、説明と期待値が一致しない — **confirmed**（テストは通るが誤解を招く）
- エディタタブ ARIA パターンが不完全（`role="tab"` に `id` なし、`role="tabpanel"` に `aria-labelledby` なし）— **possible**

**Verdict**: APPROVED

---

## High-level view

`toId` のアンダースコア出力が `isValidId` を通過するエッジケースがある。`'かっこいい モブ'`（スペース入り日本語）から `'_'` が生成され、ガードの `suggestedId ? ...` チェックを通過して ID フィールドに書き込まれる。`isValidId('_')` は `true` を返すため `validateStep2` も通過し、Step3 確認画面に `_.mcaddon` と表示される。Phase 2 では手動修正が可能なため非ブロッキングだが、Phase 3 でガードを `suggestedId && suggestedId !== '_'` に強化するか、`isValidId` に最小文字数チェックを追加することを推奨する。

エディタのタブウィジェットは `aria-label` による代替を使用しているが、WAI-ARIA tabs パターンの `id` / `aria-labelledby` 連結がない。Phase 3 で Status / Appearance タブを実装する際に対応すること。

---

<details>
<summary>Issues (3)</summary>

1. **`'_'` ID passes validation** — `toId('かっこいい モブ')` は `'_'` を返す。`'_'` は truthy なのでガードを通過して ID フィールドに書き込まれ、`isValidId('_')` = `true` なので Step3 まで進める。`_.mcaddon` という名前が生成される。ガードを `suggestedId && suggestedId !== '_'` に変更するか、`isValidId` に `id.length >= 2` 等の最小長チェックを追加すること。

2. **Misleading test description** — `wizard.spec.ts` の `'returns empty string for mixed Japanese + spaces'` が `expect(toId('かっこいい モブ')).toBe('_')` を assert しており、説明（empty string）と期待値（`'_'`）が一致しない。`'returns single underscore for Japanese text with spaces'` に修正すること。

3. **Tab ARIA linkage missing** — `EditorPage` の `role="tab"` ボタンに `id` 属性がなく、`role="tabpanel"` が `aria-labelledby` ではなく `aria-label` を使用している。WAI-ARIA tabs パターン完全準拠には各タブに `id="tab-{id}"` を付与し、タブパネルに `aria-labelledby="tab-{activeTab}"` を設定すること。Phase 3 の Status / Appearance タブ実装時に対応を推奨する。

</details>

<details>
<summary>Details</summary>

### `'_'` アンダースコア ID のガード漏れ

`toId` のアルゴリズムは次の順で処理する:

```
'かっこいい モブ'
→ lowercase: 変化なし
→ spaces → '_': 'かっこいい_モブ'
→ strip non-[a-z0-9_]: '_'
```

`handleDisplayNameChange` のガードは以下のみ:

```ts
const suggestedId = toId(displayName)
onChange({ displayName, ...(suggestedId ? { id: suggestedId } : {}) })
```

`'_'` は truthy なのでスキップされず ID フィールドに書き込まれる。`isValidId('_')` = `true`（`^[a-z0-9_]+$` にマッチ）なので `validateStep2` も通過し、Step3 確認画面には `_.mcaddon` と表示される。

この挙動を検証するテストは存在するが、テスト名が `'returns empty string for mixed Japanese + spaces'` と誤記されており（期待値は `'_'`）、ガードとの関係が読み取りにくい。

### タブ ARIA の不完全な実装

現在のマークアップ:

```tsx
<div role="tablist">
  <button role="tab" aria-selected={activeTab === tab.id}>
    {t(tab.labelKey)}
  </button>
</div>
<div
  role="tabpanel"
  aria-label={t(TABS.find(t => t.id === activeTab)?.labelKey)}
>
```

WAI-ARIA tabs パターンでは各 `role="tab"` に `id="tab-traits"` 等を付与し、`role="tabpanel"` から `aria-labelledby="tab-traits"` で参照する。`aria-label` は機能するが、スクリーンリーダーがタブとパネルを明示的に関連付けられない。また、現状ではタブ間の Arrow キーナビゲーションも実装されていない。Phase 2 プレースホルダーとしては許容範囲だが、Phase 3 でタブパネルに実コンテンツを追加する際に対応すること。

</details>

---

<details>
<summary>File map</summary>

| ファイル | 変更内容 |
|---|---|
| `app/src/App.tsx` | ルーティングをルートごとの AppShell インスタンスに再構成、EditorPage 追加 |
| `app/src/components/layout/AppShell.tsx` | `noPadding` プロパティ追加（エディタのフルブリードレイアウト用） |
| `app/src/pages/HomePage.tsx` | ヒーロー・CTA・最近のプロジェクトグリッド（TYPE_LABEL_KEYS による i18n 対応済み） |
| `app/src/pages/WizardPage.tsx` | 3 ステップウィザード状態管理・バリデーション（重複 import 解消済み） |
| `app/src/pages/EditorPage.tsx` | エディタ全体レイアウト（ハードコード文字列 i18n 化済み、save alert 除去済み） |
| `app/src/components/wizard/WizardProgress.tsx` | ステップドット・コネクタ線付きプログレスバー |
| `app/src/components/wizard/WizardStep1.tsx` | コンテンツタイプ選択カード |
| `app/src/components/wizard/WizardStep2.tsx` | 表示名・ID 入力 + div+role=radio バニラ選択肢（button→div 修正済み） |
| `app/src/components/wizard/WizardStep3.tsx` | 確認サマリーテーブル・プレビュープレースホルダー |
| `app/src/components/wizard/wizard.spec.ts` | `isValidId` / `toId` ユニットテスト 17 件 |
| `app/src/components/editor/TraitCard.tsx` | キーボード操作対応トレイトカード |
| `app/src/i18n/locales/en.json` | 全 Phase 2 i18n キー追加 |
| `app/src/i18n/locales/ja.json` | 同上（日本語） |
| `app/src/i18n/locales/ja-kids.json` | 同上（かんたん日本語）+ entity.status 追加 |
| `.agents/tasks/progress.md` | Phase 2 完了・Phase 3 TODO 記録 |
| `.agents/tasks/phase2-review.json` | このファイルと同時に更新 |

Full diff: `git -C c:/Git/minecraft/minecraft-addon-creator diff master...HEAD`

</details>
