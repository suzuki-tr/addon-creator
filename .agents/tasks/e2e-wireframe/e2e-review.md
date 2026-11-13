# E2E テストレビュー

**対象コミット**: `41f9d0b` (HEAD → master)  
**テスト実行結果（コミット記録）**: 14 passed / 14 total, 0 failed  
**レビュー日**: 2026-11-13

---

## playwright.config.ts 確認

| 要件 | 設定値 | 判定 |
|---|---|---|
| Chromium のみ | `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]` | ✓ |
| baseURL | `http://localhost:5173` | ✓ |
| webServer (Vite 自動起動) | `command: 'npm run dev'`, `url: 'http://localhost:5173'`, `reuseExistingServer: !process.env.CI` | ✓ |
| タイムアウト | `timeout: 30000` (テスト), `webServer.timeout: 120000` | ✓ |

---

## 要求テストシナリオ カバレッジ

### home.spec.ts (4/4)

| シナリオ | テスト名 | 判定 |
|---|---|---|
| ホーム画面表示 | `ホーム画面が表示される（h1 またはメインコンテンツが visible）` | ✓ |
| ja-kids レイアウト切り替え（bg #FFFBEB・ボタンサイズ確認） | `言語セレクタで「かんたん日本語」を選択すると ja-kids レイアウトに切り替わる` | ✓ |
| シンプル/詳細トグル非表示（ja-kids 時） | `シンプル/詳細モードトグルが ja-kids 選択時に非表示になる` | ✓ |
| 「新しいアドオンを作る」→ /wizard 遷移 | `「新しいアドオンを作る」ボタンクリックで /wizard に遷移する` | ✓ |

**実装との対応確認:**
- AppShell.tsx: `locale === 'ja-kids'` → `bg-[#FFFBEB]`。CSS プロパティ `rgb(255, 251, 235)` と一致。
- Header.tsx: `{locale !== 'ja-kids' && <div role="group" ...>}` でモードトグルが DOM から除去されるため `not.toBeVisible()` が正常に通る。
- KidsHomeLayout: ボタンに `min-h-[64px]` → boundingBox.height ≥ 60px の検証が対応。
- ボタン名のロケータ `/新しいアドオンを作る/`（ja.json `home.newAddon` = `"＋ 新しいアドオンを作る"`）はプレフィックス絵文字を含むためリテラル一致ではなく正規表現を使用している点が適切。

### wizard.spec.ts (5/5)

| シナリオ | テスト名 | 判定 |
|---|---|---|
| アドオン種類選択（Mob/Block/Item） | `Step1 でアドオン種類（Mob/Block/Item）を選択できる` | ✓ |
| 日本語表示名入力 → ID フィールド非空（isValidId ガード） | `Step2 で日本語のみの表示名を入力した場合 ID フィールドが空にならない` | ✓ |
| Step3 確認サマリー | `Step3 で確認サマリーが表示される` | ✓ |
| 戻るボタン動作 | `戻るボタンで前ステップに戻れる` | ✓ |
| 言語切替でラベル変化 | `言語を切り替えるとウィザードのラベルが変わる` | ✓ |

**実装との対応確認:**
- WizardStep1.tsx ボタンに `aria-pressed={isSelected}` → aria-pressed 属性チェックが機能する。
- WizardStep2.tsx `toId('テスト')` → `''` (falsy) → `onChange` に id を含めない実装と、テストの「ID が `test_mob` のまま」アサーションが一致する。
- `getByRole('heading', ...)` を使用して WizardProgress ステッパースパンとの strict-mode 衝突を回避（コミットメッセージに修正経緯あり）。
- en.json の `wizard.step1.title = "What do you want to create?"` → 言語切替テストのアサーションと一致。

### editor.spec.ts (5/5)

| シナリオ | テスト名 | 判定 |
|---|---|---|
| エディタ画面表示 | `/editor に遷移してエディタ画面が表示される` | ✓ |
| シンプルモード 3カラムグリッド | `シンプルモードではトレイトカードグリッドのみ表示（カード要素が可視）` | ✓ |
| 詳細モード 3カラム + JSON プレビュー | `詳細モードに切り替えると JSON プレビューパネルと追加タブが表示される` | ✓ |
| 外観タブ切替（ジオメトリ/テクスチャ） | `外観タブでジオメトリ/テクスチャサブタブが切り替わる` | ✓ |
| 状態グラフ SVG ノード | `状態グラフタブで SVG ノードが表示される` | ✓ |

**実装との対応確認:**
- TraitCard.tsx: `role="checkbox"` → `getByRole('checkbox')` が 9 件ヒット。
- EditorPage.tsx: `lg:grid-cols-3` → Desktop Chrome (1280px) で列 3 のレイアウト確立。バウンディングボックス判定（同行 ±5px、次行 20px 超）は実用的な許容差。
- `mode === 'advanced'` 時のみ `<JsonPreviewPanel>` レンダリング → シンプルモードで DOM に存在しないため `not.toBeVisible()` 成立。
- AppearancePanel.tsx: `role="tablist"` + `aria-selected` により `haveAttribute` チェックが機能。TexturePanel の "テクスチャスロット" テキストが確認できる。
- StateGraph.tsx: 5 ノード（idle/walk/attack/hurt/death）各 1 つの `<rect>` = 合計 5 件。`tabpanel-stateGraph` ID はタブパネルの `id={'tabpanel-' + activeTab}` から生成される。

---

## テスト通過エビデンス

| コミット | メッセージ | 結果 |
|---|---|---|
| `c647246` | `test(e2e): add Playwright E2E tests for home, wizard, editor flows` | 14 total, 14 passed, 0 failed |
| `41f9d0b` | `fix(e2e): add 3-column layout assertions to editor simple/advanced mode tests` | 14 total, 14 passed, 0 failed |

---

## セレクタ品質

| 観点 | 評価 |
|---|---|
| ARIA ロールによるロケータ | `role="tab"`, `role="tablist"`, `role="checkbox"`, `role="button"` を使用 — 実装詳細（CSS クラス）に依存しない ✓ |
| 厳密モード回避 | `getByRole('heading', ...)` で WizardProgress スパンとの重複回避 ✓ |
| i18n との整合 | すべてのテキストは ja.json / en.json の翻訳値と一致 ✓ |
| レイアウト検証 | バウンディングボックスによる列配置確認は Desktop Chrome 固定ビューポートで妥当 ✓ |
| localStorage 注入 | `addInitScript` によるストア初期化でテスト間の環境汚染を防止 ✓ |

---

## 非ブロッキング所見

1. **`setupLocale` 関数の重複** (`home.spec.ts`, `wizard.spec.ts`, `editor.spec.ts`): 共有ヘルパーファイル（例: `e2e/helpers.ts`）に切り出すとメンテナンスが容易になる。
2. **迷子のスペックファイル** `src/components/wizard/wizard.spec.ts`: `testDir: './e2e'` により Playwright の実行対象外だが、混乱を避けるため削除を推奨。

---

## 総合判定

**APPROVED** — 要求された全 14 テストシナリオが実装されており、playwright.config.ts の要件もすべて満たしている。コミット記録により最新コードで 14/14 通過が確認できる。上記の非ブロッキング所見は将来の保守性向上のための提案であり、現在の合否には影響しない。
