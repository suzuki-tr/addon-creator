# 実装進捗

## 現在のフェーズ
Phase 3 — 追加エディタ・全体 i18n 対応（待機中）

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

## 次にやること（Phase 3）

### 優先
- [ ] レシピエディタ（Shaped / Shapeless / かまど）
- [ ] ルートテーブルエディタ（基本版）
- [ ] エンティティエディタ — ステータスタブ実装（HP・攻撃力・速度・サイズ）
- [ ] エンティティエディタ — 外観タブ実装（テクスチャプリセット）
- [ ] 詳細モード対応（ComponentPanel・JsonPreviewPanel の表示切り替え）
- [ ] 全 UI テキストの翻訳キー適用（ハードコード文字列の除去）

### テスト
- [ ] ウィザード E2E テスト（wizard.spec.ts）
- [ ] ユニットテストカバレッジ > 80%

## 参照ドキュメント
- porting-plan.md: フェーズ定義・完了条件
- i18n-design.md: i18n 設計
- feature-toggle-design.md: モード切り替え設計
- wireframes/: 各画面ワイヤーフレーム

## コミット履歴（Phase 2）
- `cf81a9c` feat(home): implement home page
- `e33e341` feat(wizard): implement 3-step addon creation wizard
- `a8cfd9c` feat(editor): implement simple mode editor with trait card grid
