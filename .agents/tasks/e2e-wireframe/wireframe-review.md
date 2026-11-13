# ワイヤーフレーム差異レポート レビュー（第2パス）

レビュー日時: 2025-07-06（v2 — 前パス CHANGES_REQUESTED への対応確認）  
対象: `.agents/tasks/wireframe-diff-report.md` および `app/src/` 実装  
前パス: 同ファイル（CHANGES_REQUESTED、3件のブロッキング所見）

**Verdict**: APPROVED

Watch for: ja-kids.json の appearance パネル向け i18n キー 7 件が未翻訳（possible／非ブロッキング）。i18n の `fallbackLng: { 'ja-kids': ['ja', 'en'] }` が設定されているため機能は壊れないが、テクスチャ・ジオメトリタブのラベルが簡易日本語でなく標準日本語で表示される。

---

## High-level view

前パスの 3 件のブロッキング所見はすべて解消された。モードトグルラベルの短縮（「かんたんモード」→「かんたん」）が `修正した差異` セクションに記録され、ja.json・en.json・ja-kids.json への適用も確認できた。StateGraph 右パネルの「変数」「イベントトリガー」省略は `実装を優先した差異` に追記されて根拠が明確になり、`要確認` セクションの「差異なし」も正確になった。

唯一残る懸念は ja-kids.json の appearance パネルカバレッジ不足。ja-kids ユーザーはモードトグルを持たないため外観タブを開いた場合でも常にシンプルモードで動作するが、テクスチャ・ジオメトリタブのセクション見出し（`slotsTitle`, `uvTitle` 等）やボタンラベル（`change`）が fallback 経由で標準日本語になる。Phase 4 以降で ja-kids に外観編集を本格提供する際には翻訳の追加が必要。

---

<details>
<summary>Issues (1)</summary>

1. **ja-kids appearance パネル i18n 未翻訳** — `editor.appearance.texture.slotsTitle`, `uvTitle`, `change`, `variantsTitle`, `variantAdvancedOnly`, `editor.appearance.geometry.fileLabel`, `idLabel` の 7 キーが ja-kids.json に存在しない。fallback で ja.json の標準日本語が使われるため表示は壊れないが、テクスチャ / ジオメトリタブを開いた ja-kids ユーザーには簡易化されていないラベルが混在する。Phase 4 以降で統一が必要。

</details>

---

<details>
<summary>Details</summary>

### 前パスのブロッキング所見への対応（confirmed）

**モードトグルラベルの短縮**: ja.json に `app.mode.simple = "かんたん"` / `app.mode.advanced = "くわしい"` を確認。en.json・ja-kids.json も同様に短縮済み。差異レポートの `修正した差異` セクション末尾に「全画面 / Header.tsx — モードトグルボタンラベルの短縮（ワイヤーフレーム一致）」として記録されている。

**StateGraph 右パネルの変数・イベントトリガー省略**: 差異レポートの `実装を優先した差異` セクションに追記済み。StateGraph 自体が詳細モード専用タブであるため、現ユーザーへの機能影響はなく、Phase 3（projectStore 完成後）対応という根拠も妥当。

### ja-kids appearance パネル i18n（possible）

`app/src/i18n/index.ts` のコメント "ja-kids is a strict subset of ja — missing keys fall back to ja" と `fallbackLng: { 'ja-kids': ['ja', 'en'] }` 設定により、欠落キーは ja.json に自動フォールバックする。ja-kids ユーザーはテクスチャパネルで `variantAdvancedOnly` のメッセージを見ることになるが、そのキーは ja.json から「テクスチャバリアントは詳細モードで確認できます。右上の「くわしい」ボタンを押してください。」として表示される。ja-kids にはモードトグルがないため「くわしい」への誘導が機能しない内容になっている点は文脈的なわずかな矛盾だが、フォールバック自体は設計通り。

</details>

---

## ファイルマップ

<details>
<summary>確認対象ファイル</summary>

| ファイル | 確認内容 |
|---|---|
| `.agents/tasks/wireframe-diff-report.md` | 前パス所見を受け、モードトグルラベル短縮を修正した差異に、StateGraph右パネル省略を実装優先に追記済み |
| `app/src/pages/EditorPage.tsx` | advancedTabs 4タブ・タブリセット useEffect |
| `app/src/components/layout/Header.tsx` | モードトグルアクティブ色・ja-kids 言語セレクタスタイル |
| `app/src/components/editor/StateGraph.tsx` | 状態削除ボタン・キャンバスヒント・ズームコントロール |
| `app/src/components/editor/AppearancePanel.tsx` | 2ペインレイアウト・UV ペイン切替・テクスチャバリアント・詳細モード限定ボタン |
| `app/src/i18n/locales/ja.json` | 追加キー 8 件（stateGraph.deleteState/zoom 等）|
| `app/src/i18n/locales/ja-kids.json` | appearance パネル向け 7 キーが未翻訳（fallback 設定あり）|
| `app/src/i18n/index.ts` | `fallbackLng: { 'ja-kids': ['ja', 'en'] }` 設定 |

</details>
