# Phase 3 実装計画

Branch: `feature/phase-3-ux`  
Worktree: `c:/Git/minecraft/minecraft-addon-creator/`  
Build command: `npm run build` (from `app/`)  
Test command: `npm test` (from `app/` — script already includes `--silent`, never pass `--silent` again)  
Baseline: `npm test` → 17/17 pass, `tsc -b && vite build` → 0 errors, 70 modules

---

## Implementation Plan

- [ ] 1. **B-1a — isValidId/toId アンダースコア単独ガード**  
  `isValidId` のregexを `/^[a-z0-9_]*[a-z0-9][a-z0-9_]*$/` に変更して少なくとも1文字の英数字を必須化する。`WizardStep2.handleDisplayNameChange` のガードを `if (suggestedId && isValidId(suggestedId))` に変更して underscore-only の自動提案を防ぐ。`wizard.spec.ts` にテストを2件追加する。  
  Files: `app/src/components/wizard/WizardStep2.tsx`, `app/src/components/wizard/wizard.spec.ts`  
  Verify: `npm test` → 19/19 pass (`isValidId('_')` が `false`、`isValidId('___')` が `false`)

- [ ] 2. **B-1b — wizard.spec.ts テスト名タイポ修正**  
  `'returns empty string for mixed Japanese + spaces'` を `'returns single underscore for Japanese text with spaces'` に変更する（phase2-review.md 推奨の表記）。  
  Files: `app/src/components/wizard/wizard.spec.ts`  
  Verify: `npm test` → テスト名が修正されていること（全テストはパスのまま）

- [ ] 3. **B-1c — EditorPage タブ ARIA 連結修正**  
  各 `role="tab"` ボタンに `id={"tab-" + tab.id}` と `aria-controls={"tabpanel-" + tab.id}` を追加。`role="tabpanel"` の `<div>` に `id={"tabpanel-" + activeTab}` と `aria-labelledby={"tab-" + activeTab}` を設定する。`aria-label` は削除する。  
  Files: `app/src/pages/EditorPage.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 4. **B-2/B-3/B-4 — 新規 i18n キーを全ロケールに追加**  
  `editor.tabs.components`、`editor.tabs.stateGraph`、`editor.jsonPreview.*`、`editor.validation.*`、`editor.stateGraph.*`、`editor.appearance.*`、`editor.components.*` キーを `ja.json` に追加する（型定義の基準）。同一キーを `en.json` に英語訳で追加。`ja-kids.json` には子ども向け書き換えが必要なキーのみ追加する（大半は `ja` にフォールバックで問題ない）。  
  Files: `app/src/i18n/locales/ja.json`, `app/src/i18n/locales/en.json`, `app/src/i18n/locales/ja-kids.json`  
  Verify: `npm run build` → `tsc -b` が0エラー（型チェック通過）

- [ ] 5. **B-2 — JsonPreviewPanel コンポーネント作成**  
  `app/src/components/editor/JsonPreviewPanel.tsx` を新規作成する。props: `entityName: string`。暗色背景のシンタックスハイライト付き JSON プレビュー（`<span>` ベース、外部ライブラリ不要）、バリデーション OK バッジ、3D プレビュープレースホルダーの3セクションを含む。  
  Files: `app/src/components/editor/JsonPreviewPanel.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 6. **B-2 — ComponentPanel コンポーネント作成**  
  `app/src/components/editor/ComponentPanel.tsx` を新規作成する。`minecraft:health`（展開済み、スライダー表示）、`minecraft:attack`、`minecraft:movement`、`minecraft:behavior.melee_attack`（折りたたみ）のアコーディオンリスト、末尾に「＋ コンポーネントを追加」ボタン。ハードコードのサンプルデータ。  
  Files: `app/src/components/editor/ComponentPanel.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 7. **B-3 — StateGraph コンポーネント作成**  
  `app/src/components/editor/StateGraph.tsx` を新規作成する。左パネル（状態一覧）+ SVG キャンバス（ノード＋矢印、外部ライブラリ不使用）+ 右パネル（選択状態の詳細）の3ペインレイアウト。SVG はワイヤーフレーム #08 の通り: `<defs><marker>` で矢印、`<rect>+<text>` でノード、`<line marker-end>` で遷移。初期状態は `idle/walk/attack/hurt/death` の5ノード。選択ノードは緑ハイライト。  
  Files: `app/src/components/editor/StateGraph.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 8. **B-4 — AppearancePanel コンポーネント作成**  
  `app/src/components/editor/AppearancePanel.tsx` を新規作成する。サブタブ `geometry | texture | material`。ジオメトリ: ファイルパス・識別子フィールド＋ボーンツリー（静的サンプル）。テクスチャ: スロットリスト（default/damage）＋UV マッピング SVG（ワイヤーフレーム #10 のボーン別カラーブロック、外部ライブラリ不使用）。マテリアル: `mode === 'advanced'` のときのみ内容表示、シンプルモードでは案内メッセージ。モード切り替えで material タブがアクティブなら geometry に自動戻し (`useEffect`)。  
  Files: `app/src/components/editor/AppearancePanel.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 9. **B-2 — EditorPage を3カラムレイアウトに更新**  
  `useUiStore()` で `mode` を読む。`mode === 'advanced'` のとき右パネル（`<JsonPreviewPanel>`）を表示するフレックスレイアウトに変更（左20% 最小180px 最大240px、中央flex-1、右30% 最小220px 最大360px）。タブセット変更: simple → `traits/status/appearance`; advanced → `traits/status/components/stateGraph/appearance`。各タブのコンテンツを対応コンポーネントに差し替え（`ComponentPanel`・`StateGraph`・`AppearancePanel`）。  
  Files: `app/src/pages/EditorPage.tsx`  
  Verify: `npm run build` → ビルドエラーなし、`npm test` → 全テストパス

- [ ] 10. **B-5 — ja-kids ホームページバリアント**  
  `app/src/i18n/locales/ja-kids.json` に kids 向けホームキー（`home.newAddon`: "✨ あたらしくつくる"、`home.openProject`: "📂 まえにつくったものをひらく"、`home.recentProjects`: "このまえつくったもの"、`home.project.edit`: "つづきをつくる →"）を追加。`HomePage.tsx` を `locale === 'ja-kids'` のとき kids レイアウトに分岐（大きなフォント、縦スタック CTA ボタン min-h-[64px]、縦スタックプロジェクトリスト、warm 背景 `bg-[#FFFBEB]`）。`Header.tsx` で `locale === 'ja-kids'` のときモードトグルを非表示にする。  
  Files: `app/src/i18n/locales/ja-kids.json`, `app/src/pages/HomePage.tsx`, `app/src/components/layout/Header.tsx`  
  Verify: `npm run build` → ビルドエラーなし

- [ ] 11. **B-6 — 全ロケールカバレッジ: ハードコード文字列の除去**  
  全 `.tsx` ファイルを対象にハードコードされた UI 文字列を検出し `t()` に置き換える。残課題: `HomePage.tsx` の `PLACEHOLDER_PROJECTS` 内 `daysAgo` フィールド（`'2日前'`等）を `t()` に変換（キー `home.project.daysAgo2` 等を追加）。新規コンポーネント（JsonPreviewPanel/ComponentPanel/StateGraph/AppearancePanel）が全テキストを `t()` で取得していることを確認する。  
  Files: `app/src/pages/HomePage.tsx`, `app/src/i18n/locales/ja.json`, `app/src/i18n/locales/en.json`, `app/src/i18n/locales/ja-kids.json`  
  Verify: `npm run build` → ビルドエラーなし、`npm test` → 全テストパス

- [ ] 12. **B-7 — ビルド＋テスト最終確認**  
  `npm run build`（`tsc -b && vite build`）と `npm test` をどちらも `app/` ディレクトリから実行し、ゼロエラー・全テストパスを確認する。エラーがあれば修正してから完了とする。  
  Files: なし（確認のみ）  
  Verify: `npm run build` exit 0、`npm test` exit 0

- [ ] 13. **B-8 — progress.md を Phase 3 完了に更新**  
  `.agents/tasks/progress.md` の「現在のフェーズ」を `Phase 4 — 高度エディタ（待機中）` に変更、Phase 3 完了済みタスクをすべて `[x]` にする。コミットメッセージ: `docs: mark Phase 3 complete`。  
  Files: `.agents/tasks/progress.md`  
  Verify: `git diff HEAD --stat` でファイル変更が1件だけであること

---

## Digest

### Files this plan touches

| ファイル | 変更ブロック | カバーテスト |
|---|---|---|
| `app/src/components/wizard/WizardStep2.tsx` | `isValidId()` regex（L7）、`handleDisplayNameChange` ガード（L31） | `wizard.spec.ts` describe isValidId/toId |
| `app/src/components/wizard/wizard.spec.ts` | テスト名L67、新テストL36-L38追加 | 自己テスト（新規2件含む計19件） |
| `app/src/pages/EditorPage.tsx` | tab `id/aria-controls` (L71-78)、tabpanel `id/aria-labelledby` (L82-83)、3カラムレイアウト全体 | `npm run build` tsc型チェック |
| `app/src/i18n/locales/ja.json` | `editor.tabs.*`・`editor.jsonPreview.*`・`editor.stateGraph.*`・`editor.appearance.*`・`home.project.*` キー追加 | tsc（`i18next.d.ts` 型チェック）|
| `app/src/i18n/locales/en.json` | 同キーの英語訳 | tsc |
| `app/src/i18n/locales/ja-kids.json` | `home.*` kids overrides | tsc |
| `app/src/components/editor/JsonPreviewPanel.tsx` | 新規作成 | `npm run build` |
| `app/src/components/editor/ComponentPanel.tsx` | 新規作成 | `npm run build` |
| `app/src/components/editor/StateGraph.tsx` | 新規作成 | `npm run build` |
| `app/src/components/editor/AppearancePanel.tsx` | 新規作成 | `npm run build` |
| `app/src/pages/HomePage.tsx` | kids分岐レイアウト、daysAgo i18n | `npm run build` |
| `app/src/components/layout/Header.tsx` | `locale === 'ja-kids'` のときモードトグル非表示 | `npm run build` |
| `.agents/tasks/progress.md` | Phase 3 完了記録 | 目視確認 |

### Verified today
- Build: `tsc -b && vite build` → 0 errors (baseline)
- Tests: `npm test` → 17/17 pass (baseline)
- `isValidId('_')` currently returns `true` (bug confirmed)
- Test name `'returns empty string for mixed Japanese + spaces'` currently asserts `'_'` (typo confirmed)
- Tab buttons lack `id` and `aria-controls` attributes (confirmed in EditorPage.tsx L71-78)
- `npm test -- --silent` causes vitest double-flag error — always use `npm test` (not `npm test -- --silent`)
