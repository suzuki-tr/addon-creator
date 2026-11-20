# 実装進捗

## 現在のフェーズ
Phase 4 — 高度エディタ（待機中）

## 完了済み
- [x] Phase 1: プロジェクト基盤構築 完了 (feature/phase-1-foundation → master)
  - Vite 8 + React 19 + TypeScript (strict) 初期化
  - Tailwind CSS v4 + デザイントークン設定
  - react-i18next + 3ロケール (en/ja/ja-kids)
  - Zustand 5 UIストア (locale/mode)
  - AppShell + Header (言語切り替え・モードトグル)
  - react-router-dom ベースルーティング

- [x] Phase 2: コア機能実装 完了 (feature/phase-2-core)
  - ホーム画面 (`/`): ヒーローセクション・CTA・最近のプロジェクトグリッド
  - ウィザード (`/wizard`): 3ステップ（種類選択 → 基本情報入力 → 確認&ダウンロード）
    - Step1: モブ/ブロック/アイテム種別選択カード
    - Step2: 表示名・ID入力（自動提案） + ベース選択（scratch/vanilla）
    - Step3: 確認サマリーテーブル + プレビュープレースホルダー + ダウンロード
  - エンティティエディタ シンプルモード (`/editor`):
    - 左サイドバー（プロジェクトナビ・ファイルツリー）
    - タブバー（特性 / ステータス / 外観）
    - トレイトカードグリッド（9種: hostile/flying/tameable/rideable/undead/aquatic/boss/breedable/slime）
  - i18n キー追加: home.* / wizard.step1-2.* / wizard.confirm.* / editor.* / entity.trait（5種追加）
  - AppShell noPadding プロップ追加（フルブリードレイアウト対応）

- [x] Phase 3: 追加エディタ・全体 i18n 対応 完了 (feature/phase-3-ux) — Phase 3 完了 (feature/phase-3-ux)
  - [x] Phase 2 非ブロッキング指摘 3件対応（`isValidId`/`toId` アンダースコアガード、テスト名修正、タブ ARIA 属性連結）
  - [x] エンティティエディタ — 詳細モード切り替えレイアウト（ComponentPanel・JsonPreviewPanel）
  - [x] エンティティエディタ — StateGraph タブ実装（状態グラフ SVG 表示）
  - [x] エンティティエディタ — AppearancePanel（テクスチャプリセット選択）
  - [x] 全 UI テキストの翻訳キー適用（ハードコード文字列の除去）
  - [x] ja-kids ロケール全画面対応（ホーム・ウィザード・エディタ）
  - [x] ウィザードテスト 17 → 19 件（isValidId/toId 修正対応）
  - [x] ビルド 0 エラー・テスト 19/19 合格

## 未解決の非ブロッキング指摘

- ~~E2E-NB1: `ja-kids.json` に Appearance パネル向け7キー（`appearance.slotsTitle` / `appearance.uvTitle` / `appearance.change` / `appearance.variantsTitle` / `appearance.variantAdvancedOnly` / `appearance.fileLabel` / `appearance.idLabel`）が未翻訳。fallbackLng（ja→en）で動作は壊れないが、テクスチャ/ジオメトリラベルが標準日本語表示になる。~~ ✅ **解決済み** (Phase 4 にて対応)

## 未解決の非ブロッキング指摘（Phase 3）

- ~~R3: `AppearancePanel` の UV ズームリセットボタンが `t('editor.stateGraph.reset')` を流用している。名前空間が不適切（stateGraph キーを appearance で流用）。`editor.appearance.texture.uvReset` のような専用キーに分離すること。  
  対象: `app/src/components/editor/AppearancePanel.tsx` L299~~ ✅ **解決済み** (Phase 4 にて対応)
- ~~R4: `MaterialPanel` / `TexturePanel` のセレクトオプション（UV / Triplanar / Back / Front / None / Alpha / Additive 等）が `t()` を通さずハードコードされている。詳細モード（`mode === 'advanced'`）限定だが、全ロケールファイルにキーを追加して `t()` 経由に統一すること。  
  対象: `app/src/components/editor/AppearancePanel.tsx`（MaterialPanel・TexturePanel 内）~~ ✅ **解決済み** (Phase 4 にて対応)

## 未解決の非ブロッキング指摘（Phase 4）

- ~~NB-P4-1: `attackDamage` のステップ値が `1` になっている（計画仕様は `0.5`）。半刻み精度が利用不可。~~ ✅ **解決済み** (`fix/phase4-nb-fixes` → v0.4.1-hotfix)
- ~~NB-P4-2: `movementSpeed` のアイコンが `👟`（計画仕様は `🏃`）。表示のみの差異。~~ ✅ **解決済み** (`fix/phase4-nb-fixes` → v0.4.1-hotfix)

## v1.0.1 リリース (fix/issues-v1.0.0 → master)

- issues_v1.0.0.md に記載の7件をすべて修正・検証済み
  1. `<title>` を "mc-addon-editor" に修正
  2. "既存のプロジェクトを開く" ファイルピッカー実装
  3. 言語切り替えの二重呼び出し解消（uiStore 一本化 + useSuspense:false）
  4. バニラエンティティ検索・選択（WizardStep2 + vanilla-entities.ts）
  5. バニラ選択未選択時の「次へ」ブロック（validateStep2 + エラー表示）
  6. ヘッダーロゴを `<Link to="/">` に変更・左寄せ
  7. E2E 3シナリオ追加（mob-creation.spec.ts）
- E2E テスト: **17/17 パス**、ユニットテスト: 212/212 パス、TS エラー: 0
- タグ: `v1.0.1`

## v1.0.3 リリース (fix/issues-v1.0.2 → master)

- issues_v1.0.2.md に記載の5件をすべて修正・検証済み
  1. プロジェクト保存をフォルダ出力に変更（File System Access API + ZIP 生成）
  2. JSONプレビュー領域の独立スクロール実装
  3. JSONプレビュー領域幅を ResizeHandle で可変に
  4. バニラ選択時に外観（テクスチャ・ジオメトリ）を自動適用
  5. Babylon.js 3Dプレビュー実装
- レビュー指摘 8件対応（`fix(review): address all 6 findings from v1.0.2 review` ほか）
- E2E テスト: **18/18 パス**
- タグ: `v1.0.3`

### 未解決の非ブロッキング指摘（v1.0.3）

- NB-v1.0.3-1: `atob()` で PNG 変換時に破損テクスチャ URL へのガードがない（部分的なディレクトリ出力になる可能性）
- NB-v1.0.3-2: `ResizeHandle` の `role="separator"` にキーボードハンドラがない（パネルリサイズがキーボード操作不可）

## v1.0.4 リリース (fix/issues-v1.0.3 → master)

- issues_v1.0.3.md に記載の4件をすべて修正・検証済み
- E2E テスト: **18/18 パス**
- タグ: `v1.0.4`

### ~~未解決の非ブロッキング指摘（v1.0.4）~~ ✅ すべて解決済み (v1.0.5 にて対応)

- ~~NB-v1.0.4-1: ItemEditor/BlockEditor の JSON プレビューがエンティティ JSON でなく異なる可能性~~ ✅ **解決済み** (B-1 にて対応)
- ~~NB-v1.0.4-2: ItemEditor/BlockEditor の JSON タブで `h-full` によるスクロール封入問題の可能性~~ ✅ **解決済み** (B-2 にて対応)
- ~~NB-v1.0.4-3: `vanillaShapeRef` コメントが誤記~~ ✅ **解決済み** (B-3 にて対応)
- ~~NB-v1.0.4-4: `fish` シェイプカテゴリが未使用~~ ✅ **解決済み** (B-4 にて対応)
- ~~NB-v1.0.4-5: `localStorage` キーがエディタ間で共有されている~~ ✅ **解決済み** (B-5 にて対応)
- ~~NB-v1.0.4-6: ItemEditor/BlockEditor パスの E2E カバレッジなし~~ ✅ **解決済み** (B-5 にて対応)

## v1.0.5 リリース (fix/issues-v1.0.4 → master)

- issues_v1.0.4.md に記載の5件をすべて修正・検証済み（B-1〜B-5）
  1. (B-1) ItemEditor/BlockEditor の JSON プレビューを各エディタ専用 JSON に修正
  2. (B-2) ItemEditor/BlockEditor の JSON プレビュー領域スクロール封入修正
  3. (B-3) `vanillaShapeRef` コメント誤記修正
  4. (B-4) `fish` シェイプカテゴリ削除（未使用）
  5. (B-5) `localStorage` キーをエディタ別に分離・ItemEditor/BlockEditor E2E カバレッジ追加
- E2E テスト: パス
- タグ: `v1.0.5`

### 未解決の非ブロッキング指摘（継続）

- NB-v1.0.3-1: `atob()` で PNG 変換時に破損テクスチャ URL へのガードがない（部分的なディレクトリ出力になる可能性）
- NB-v1.0.3-2: `ResizeHandle` の `role="separator"` にキーボードハンドラがない（パネルリサイズがキーボード操作不可）

## v1.0.6 リリース (fix/persistent-bugs → master)

- 持続的バグ3件を根本原因から修正
  1. JSON スクロール: AppShell `min-h-screen` → `h-screen overflow-hidden` に変更し、画面全体でなく JSON プレビュー領域のみがスクロールするよう修正
  2. ブロック JSON: `useMemo` の依存配列を完全対応し、ブロック設定変更が JSON プレビューに確実に反映されるよう修正
  3. 言語切り替え: `ja-kids.json` に視覚的に明確な差分を追加し、「かんたん日本語」と「日本語」の切り替えが確認できるよう修正
- テスト: **227 ユニットテストパス**
- タグ: `v1.0.6`

## v1.0.7 リリース (fix/i18n-reactivity → master)

- i18next v25 の `lowerCaseLng` 未設定で `ja-Kids` に正規化されリソース不一致が発生していた問題を修正
- テスト: **232 ユニットテストパス**
- タグ: `v1.0.7`

## v1.0.2 リリース (fix/issues-v1.0.1 → master)

- issues_v1.0.1.md に記載の7件をすべて修正・検証済み
  1. アイテム作成「バニラからカスタマイズ」リストがモブになっていた問題を修正（アイテムリストに切り替え）
  2. 「確認してダウンロードしよう」画面のボタン表記を「編集を始める」に統一（実装優先）
  3. トレイト有効化が JSON プレビューに反映されない問題を修正（trait トグル → JSON 連携実装）
  4. 体力(MAX)/初期値スライダーが操作不能だった問題を修正（インタラクティブスライダー実装）
  5. 外観の編集（ジオメトリ・テクスチャファイルアップロード）を実装
  6. バニラ選択時にビヘイビア初期値をバニラから読み込む機能を実装
  7. E2E フルフロー（バニラ牛 → 敵対的トレイト → 体力50 → ジオメトリ/テクスチャ読み込み → mcaddon エクスポート）を追加
- E2E テスト: **18/18 パス**、TS エラー: 0
- タグ: `v1.0.2`

## 次にやること（Phase 4）

### 優先
- [ ] レシピエディタ（Shaped / Shapeless / かまど）
- [ ] ルートテーブルエディタ（基本版）
- [ ] スポーンルールエディタ
- [ ] エンティティエディタ — ステータスタブ詳細実装（HP・攻撃力・速度・サイズ 数値入力）
- [ ] アニメーションコントローラーエディタ
- [ ] サウンド定義エディタ

### テスト
- [ ] ユニットテストカバレッジ > 80%
- [ ] 各エディタコンポーネントのユニットテスト追加

## 参照ドキュメント
- porting-plan.md: フェーズ定義・完了条件
- i18n-design.md: i18n 設計
- feature-toggle-design.md: モード切り替え設計
- wireframes/: 各画面ワイヤーフレーム

## コミット履歴（Phase 2）
- `cf81a9c` feat(home): implement home page
- `e33e341` feat(wizard): implement 3-step addon creation wizard
- `a8cfd9c` feat(editor): implement simple mode editor with trait card grid
- `598463c` fix: address phase2-review findings (all 5 issues resolved; verdict APPROVED)

## コミット履歴（Phase 3）
- `d9963b3` fix(wizard,editor): address 3 non-blocking Phase 2 findings
- `c415575` feat(editor): detail mode layout, StateGraph, AppearancePanel, JsonPreviewPanel (B-2 B-3 B-4)
- `de94ab6` feat(home,i18n): ja-kids home variant, full locale coverage (B-5 B-6)
