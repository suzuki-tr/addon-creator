# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-14

### Added
- `app/CHANGELOG.md` および `app/README.md` を整備しリリース準備完了
- `coverage/` を `.gitignore` に追加（テストカバレッジ生成物を除外）
- Phase 4 エージェント作業ファイル（`.agents/tasks/phase4-editors/`）をコミット

---

## [0.4.1] - 2026-11-13

### Fixed
- movementSpeed のアイコンを 🏃 に修正
- attackDamage のスライダー step を `0.5` に修正

---

## [0.4.0] - 2026-11-13

### Added
- **レシピエディタ**（`/recipe`）: Shaped / Shapeless / Furnace の 3 タブ対応
- **ドロップテーブルエディタ**（`/loot-table`）: Pool accordion + Entry 管理
- **スポーンルールエディタ**（`/spawn-rules`）: バイオーム・難易度・時間帯フィルター
- **アニメーションコントローラーエディタ**（`/animation-controller`）: 3 ペイン状態グラフ、識別子・アニメーションリスト
- **サウンド定義エディタ**（`/sound`）: サウンドイベント + ファイルリスト
- **StatusPanel**: HP・攻撃力・速度・サイズのスライダーとリセット機能
- **StateGraph 拡張**: 変数・イベントトリガーセクション（詳細モード専用）
- ユニットテスト追加（`recipeUtils`・`lootTableUtils`・`StatusPanel`・`RecipeEditor`・`LootTableEditor`・`SpawnRulesEditor`）、カバレッジ 80% 超
- ホームページに「エディタツール」カードセクション（5 エディタへのリンク）追加

### Fixed
- Phase 3 非ブロッキング指摘解消: ja-kids.json Appearance キー追加、UV リセットキー名前空間修正、MaterialPanel / TexturePanel セレクトオプション i18n 化
- Phase 4 統合テスト指摘の解消

---

## [0.3.1] - 2026-11-13

### Added
- Playwright E2E テスト環境（Chromium）: ホーム・ウィザード・エディタフローをカバー
- エディタ シンプル / 詳細モードの 3 カラムレイアウトアサーション

### Fixed
- ワイヤーフレームと実装の差異を修正（複数箇所）
- E2E 非ブロッキング所見: ja-kids Appearance i18n を記録

---

## [0.3.0] - 2026-11-13

### Added
- **エディタ詳細モード**: StateGraph（状態遷移グラフ）・AppearancePanel（外観 / テクスチャ / マテリアル / ワイヤーフレーム）・JsonPreviewPanel
- **ja-kids ロケール**: ホーム画面変種（子ども向けひらがな表記）
- 3 言語フルカバレッジ（`en` / `ja` / `ja-kids`）

### Fixed
- エディタ i18n: ヘルスバー / スライダーラベル修正
- ja-kids ホームページ背景色修正
- Phase 2 非ブロッキング指摘 3 件解消

---

## [0.2.0] - 2026-11-12

### Added
- **ホームページ**: 最近のプロジェクト一覧・新規作成ボタン
- **3 ステップウィザード**: アドオン種別選択 → 名前入力 → 確認
- **エディタ シンプルモード**: トレイトカードグリッド（外観・AI・ステータス・サウンド）

---

## [0.1.0] - 2026-11-12

### Added
- Vite + React 19 + TypeScript プロジェクト初期セットアップ
- Tailwind CSS v4・React Router v7・Zustand・i18next 導入
- 3 言語 i18n 基盤（`en` / `ja` / `ja-kids`）: 英語・日本語・子ども向け日本語
- UI モード切替ストア（シンプル / 詳細）
- AppShell・Header レイアウトコンポーネント

[1.0.0]: https://github.com/example/minecraft-addon-creator/compare/v0.4.1-hotfix...v1.0.0
[0.4.1]: https://github.com/example/minecraft-addon-creator/compare/v0.4.0-phase4...v0.4.1-hotfix
[0.4.0]: https://github.com/example/minecraft-addon-creator/compare/v0.3.1-validated...v0.4.0-phase4
[0.3.1]: https://github.com/example/minecraft-addon-creator/compare/v0.3.0-phase3...v0.3.1-validated
[0.3.0]: https://github.com/example/minecraft-addon-creator/compare/v0.2.0-phase2...v0.3.0-phase3
[0.2.0]: https://github.com/example/minecraft-addon-creator/compare/v0.1.0-phase1...v0.2.0-phase2
[0.1.0]: https://github.com/example/minecraft-addon-creator/releases/tag/v0.1.0-phase1
