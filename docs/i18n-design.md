# 国際化（i18n）設計

## 1. 採用ライブラリと選定理由

### 採用: react-i18next 16.x + i18next 24.x

| ライブラリ | バージョン | 役割 |
|-----------|-----------|------|
| `i18next` | 24.x | コアランタイム（言語切り替え・補間・複数形） |
| `react-i18next` | 16.x | React 統合（`useTranslation()` フック等） |
| `i18next-browser-languagedetector` | 8.x | ブラウザ言語自動検出（`navigator.language` 参照） |

### 移植元（react-intl 6）からの変更理由

1. **日本語 primary 対応が容易**: react-i18next はキーベースの翻訳（`t('wizard.step1.title')`）で日本語を first class に扱える。react-intl の FormatJS メッセージ形式（`<FormattedMessage id="..." />`）より記述量が少ない
2. **フック API の直感性**: `const { t } = useTranslation()` の 1 行で翻訳関数を取得できる
3. **ネストキー対応**: `ja.json` の JSON 構造をネストして管理できる（移植元の `en_US.json` はフラットキー形式）
4. **移植元の訳語資産を流用可能**: `app/src/locales/ja_JP.json` の訳語テキストを変換スクリプトで i18next 形式に変換する

---

## 2. ロケール一覧

本アプリは以下の **3 ロケール** をサポートする。

| ロケール | 表示ラベル | 対象ユーザー | 文体ガイドライン |
|---------|-----------|------------|----------------|
| `en` | English | 英語圏ユーザー全般 | 標準的な英語。技術語彙（namespace, export, behavior pack など）使用可。丁寧だが簡潔に。 |
| `ja` | 日本語 | 日本語ユーザー全般（中学生以上を想定） | 漢字・専門語彙使用可。丁寧語（「〜ください」「〜します」調）。技術語は必要に応じてカタカナ表記。 |
| `ja-kids` | かんたん日本語 | 小学生低学年（6〜8 歳）向け | **小学1・2年生で習う漢字は使用可能**。3年生以上の漢字は使わない。ゲーム内用語は「英語（カタカナ）」の併記（例: Entity（エンティティ）、Block（ブロック））。固有名詞（Creeper、Zombie 等）は英語のみ。日本語訳が一般的でない用語は英語・カタカナのまま使う。**丁寧語（〜ます・〜です）を使う**。口語表現（「〜だよ」「〜してね」「〜しよう」等）は不可。 |

---

## 3. i18next 初期化設定

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ja from './locales/ja.json';
import jaKids from './locales/ja-kids.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['ja', 'ja-kids', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      // ja-kids は ja の完全な部分集合のため、未翻訳キーは ja にフォールバックする
      'ja-kids': { translation: jaKids },
      en: { translation: en },
    },
    fallbackLng: {
      // ja-kids に未翻訳キーがある場合は ja へ、それでもなければ en へフォールバック
      'ja-kids': ['ja', 'en'],
      default: ['ja', 'en'],
    },
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,       // React は XSS エスケープを自動で行う
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // 言語選択を localStorage に保存
    },
  });

export default i18n;
```

```tsx
// src/main.tsx — エントリーポイントで初期化を import
import './i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root')!;
createRoot(root).render(<App />);
```

---

## 4. リソースファイル構造

### ファイル配置

```
src/i18n/
├── index.ts              # i18next 初期化
└── locales/
    ├── en.json           # 英語
    ├── ja.json           # 日本語（primary）
    └── ja-kids.json      # かんたん日本語（小学生低学年向け）
```

### キー命名規則

**ドット区切りのネスト構造**を使用する。第 1 セグメントは「スコープ（画面 / 機能）」、第 2 セグメント以降は「要素」。

```
{スコープ}.{要素}.{詳細}

例:
common.button.cancel        → 「キャンセル」（汎用）
wizard.step1.title          → ウィザード Step1 タイトル
wizard.step3.trait.hostile  → トレイト名「敵対的」
entity.trait.hostile.desc   → トレイト説明文
error.validation.nameEmpty  → バリデーションエラー「名前を入力してください」
```

### ja.json の構造例

```json
{
  "common": {
    "button": {
      "cancel": "キャンセル",
      "confirm": "確認",
      "save": "保存",
      "export": "エクスポート",
      "next": "次へ",
      "back": "戻る",
      "close": "閉じる"
    },
    "label": {
      "loading": "読み込み中...",
      "error": "エラー",
      "warning": "警告",
      "required": "必須"
    }
  },
  "app": {
    "name": "マインクラフト アドオン クリエイター",
    "mode": {
      "simple": "かんたんモード",
      "advanced": "くわしいモード",
      "toggleToAdvanced": "くわしいモードに切り替える",
      "toggleToSimple": "かんたんモードに切り替える"
    }
  },
  "wizard": {
    "title": "新しいコンテンツを作る",
    "progress": "{{current}} / {{total}} ステップ",
    "step1": {
      "title": "何を作りますか？",
      "mob": "モブ（生き物）",
      "mobDesc": "敵・友好・ボスなどの生き物を作れます",
      "block": "ブロック",
      "blockDesc": "世界に置けるオリジナルブロックを作れます",
      "item": "アイテム",
      "itemDesc": "食べ物・武器・ツールなどを作れます"
    },
    "step2": {
      "title": "ベースを選んでください",
      "fromScratch": "ゼロから作る",
      "fromVanilla": "バニラからカスタマイズ",
      "searchPlaceholder": "名前で検索..."
    },
    "step3": {
      "title": "特性を選んでください",
      "subtitle": "複数選べます"
    },
    "step4": {
      "title": "カスタマイズ",
      "name": "名前",
      "namePlaceholder": "例: my_cool_mob",
      "displayName": "表示名",
      "displayNamePlaceholder": "例: かっこいいモブ"
    },
    "step5": {
      "title": "完成！",
      "preview": "プレビュー",
      "export": "アドオンをダウンロード"
    }
  },
  "entity": {
    "trait": {
      "hostile": "敵対的",
      "hostileDesc": "プレイヤーを攻撃します",
      "passive": "友好的",
      "passiveDesc": "プレイヤーを攻撃しません",
      "flying": "飛行",
      "flyingDesc": "空を飛びます",
      "tameable": "テイム可能",
      "tameableDesc": "アイテムを使ってなつかせることができます",
      "rideable": "騎乗可能",
      "rideableDesc": "乗ることができます"
    },
    "status": {
      "health": "体力 (HP)",
      "attackDamage": "攻撃力",
      "movementSpeed": "移動速度",
      "scale": "サイズ"
    }
  },
  "block": {
    "trait": {
      "lightSource": "光る",
      "lightSourceDesc": "光を放出します",
      "craftingStation": "作業台",
      "craftingStationDesc": "クラフトに使えます",
      "door": "ドア",
      "doorDesc": "開閉できます",
      "slab": "スラブ",
      "slabDesc": "半ブロックの形状になります"
    },
    "status": {
      "hardness": "硬さ（破壊時間）",
      "blastResistance": "爆発耐性",
      "lightEmission": "発光レベル"
    }
  },
  "item": {
    "trait": {
      "food": "食べ物",
      "foodDesc": "食べると腹が膨れます",
      "weapon": "武器",
      "weaponDesc": "敵を攻撃できます",
      "armor": "防具",
      "armorDesc": "ダメージを軽減します",
      "tool": "ツール",
      "toolDesc": "ブロックを効率よく壊せます"
    },
    "status": {
      "stackSize": "スタック数",
      "attackDamage": "攻撃力",
      "durability": "耐久値",
      "nutrition": "栄養",
      "saturationModifier": "満腹度"
    }
  },
  "error": {
    "validation": {
      "nameEmpty": "名前を入力してください",
      "nameInvalidChars": "名前に使えるのは英数字・アンダースコアのみです（例: my_mob）",
      "namespaceMissing": "名前空間が必要です（例: myaddon:my_mob）",
      "exportFailed": "エクスポートに失敗しました: {{message}}"
    },
    "storage": {
      "loadFailed": "プロジェクトの読み込みに失敗しました",
      "saveFailed": "プロジェクトの保存に失敗しました"
    }
  },
  "export": {
    "success": "「{{name}}.mcaddon」をダウンロードしました",
    "validating": "確認中...",
    "generating": "ファイルを生成中..."
  }
}
```

### en.json の構造例（同一キー、英語訳）

```json
{
  "common": {
    "button": {
      "cancel": "Cancel",
      "confirm": "Confirm",
      "save": "Save",
      "export": "Export",
      "next": "Next",
      "back": "Back",
      "close": "Close"
    }
  },
  "app": {
    "name": "Minecraft Addon Creator",
    "mode": {
      "simple": "Simple Mode",
      "advanced": "Advanced Mode",
      "toggleToAdvanced": "Switch to Advanced Mode",
      "toggleToSimple": "Switch to Simple Mode"
    }
  }
}
```

---

## 5. ja と ja-kids の書き分け基準

`ja-kids` ロケールは `ja` の**完全な部分集合**として管理する。  
未翻訳キーは自動的に `ja` にフォールバックするため、`ja-kids.json` には子ども向けに書き換えが必要なキーのみ記載すればよい。

### 5-1. 漢字使用可否

| ロケール | 漢字 | 備考 |
|---------|------|------|
| `ja` | ✅ 使用可 | 一般的な漢字を使用。難解な専門用語はカタカナ併記推奨 |
| `ja-kids` | ✅ 一部可 | 小1・小2で習う漢字のみ使用可（例: 山、川、一、日、月、花、学、年 等）。3年生以上の漢字は使わない。固有名詞（Minecraft 等）はそのまま |

### 5-2. 文末表現

| ロケール | 文末パターン | 例 |
|---------|------------|-----|
| `ja` | 「〜ください」「〜します」「〜できます」 | 「名前を入力してください」 |
| `ja-kids` | 「〜ます」「〜です」「〜ください」（丁寧語） | 「なまえをいれてください」 |

### 5-3. NG 語彙リストと言い換え例（最低 10 語）

| ja（標準語） | ja-kids（言い換え） | 備考 |
|------------|------------------|------|
| 実装 | つくる / できるようにする | 「機能を実装する」→「きのうをつくる」 |
| 確認 | たしかめる / チェックする | 「確認してください」→「たしかめてください」 |
| 選択 | えらぶ | 「項目を選択」→「こうもくをえらぶ」 |
| 設定 | きめる / セットする | 「設定を変更する」→「きめてかえる」 |
| エクスポート | ダウンロード / とりだす | 「アドオンをエクスポート」→「アドオンをダウンロード」 |
| バリデーション | チェック | 「バリデーションエラー」→「チェックがうまくいきませんでした」 |
| ネームスペース | グループのなまえ（グループ名） | 説明文で補足: 「`myaddon` のような グループのなまえのこと」 |
| カスタマイズ | じぶんでかえる / アレンジする | 「カスタマイズする」→「じぶんでかえてください」 |
| キャンセル | やめる / もどる | 「キャンセル」→「やめる」 |
| エラー | うまくいきませんでした | 「エラーが発生しました」→「うまくいきませんでした」 |
| インポート | よみこむ | 「ファイルをインポート」→「ファイルをよみこむ」 |
| プロジェクト | さくひん / つくりかけ | 「プロジェクトを開く」→「さくひんをひらく」 |
| エディタ | へんしゅう（画面） | 「エンティティエディタ」→「せいぶつのへんしゅうがめん」 |

### 5-4. 文字数制限の考慮

- ボタンラベルは **10 文字以内** を目標とする（UIレイアウトの破綻を防ぐため）
- 説明文は **40 文字以内** を推奨（1 行に収まる長さ）
- ウィザードのステップタイトルは **15 文字以内** を推奨
- 長くなる場合は文を分割して 2 行表示を許容する

### 5-5. ゲーム内用語の表記方針（`ja-kids` 専用）

| 種別 | 方針 | 例 |
|-----|------|-----|
| ゲーム内に出てくる短い単語（トレイト名・コンポーネント名等） | 英語 + カタカナの併記 | Entity（エンティティ）、Block（ブロック）、Item（アイテム） |
| 固有名詞（キャラクター・生き物の名前） | 英語表記のみ（カタカナ読みを添えない） | Creeper、Zombie、Steve |
| 日本語訳が一般的でないゲーム用語 | 英語またはカタカナのまま（無理に日本語訳しない） | behavior pack、addon、trait |

**補足**:
- `ja`（標準語）ロケールでは従来通り日本語訳を優先する。
- `ja-kids` の場合のみ、上記の「英語 + カタカナ」方針を適用する。
- 「Entity（エンティティ）」のような併記は、子どもがゲーム内のUIや英語テキストと照合できるようにするための配慮。
- 「Creeper」「Zombie」等の固有名詞はゲーム内でそのまま表示されているため、カタカナ読みを添える必要はない。

---

## 6. ja-kids.json の構造例

`ja-kids.json` は `ja.json` と**同一のキー構造**を持つ。  
書き換えが不要なキー（固有名詞・ロック済みキーなど）は省略し、i18next のフォールバック機能で `ja.json` から補完する。

```json
{
  "common": {
    "button": {
      "cancel": "やめる",
      "confirm": "きめる",
      "save": "セーブする",
      "export": "ダウンロード",
      "next": "つぎへ",
      "back": "もどる",
      "close": "とじる"
    },
    "label": {
      "loading": "よみこんでいます...",
      "error": "うまくいきませんでした",
      "warning": "きをつけてください",
      "required": "かならずいれてください"
    }
  },
  "app": {
    "name": "マインクラフト アドオン クリエイター",
    "mode": {
      "simple": "かんたんモード",
      "advanced": "くわしいモード",
      "toggleToAdvanced": "くわしいモードにきりかえる",
      "toggleToSimple": "かんたんモードにきりかえる"
    }
  },
  "wizard": {
    "title": "あたらしいものをつくります",
    "progress": "{{current}} / {{total}} ステップ",
    "step1": {
      "title": "なにをつくりますか？",
      "mob": "モブ（いきもの）",
      "mobDesc": "てきや なかまの いきものをつくれます",
      "block": "ブロック",
      "blockDesc": "せかいにおける オリジナルブロックをつくれます",
      "item": "アイテム",
      "itemDesc": "たべもの・ぶき・どうぐなどをつくれます"
    },
    "step2": {
      "title": "ベースをえらんでください",
      "fromScratch": "ゼロからつくる",
      "fromVanilla": "バニラからアレンジする",
      "searchPlaceholder": "なまえでさがす..."
    },
    "step3": {
      "title": "とくせいをえらんでください",
      "subtitle": "いくつでもえらべます"
    },
    "step4": {
      "title": "カスタマイズしてください",
      "name": "なまえ（えいご）",
      "namePlaceholder": "れい: my_cool_mob",
      "displayName": "みせる なまえ",
      "displayNamePlaceholder": "れい: かっこいいモブ"
    },
    "step5": {
      "title": "できあがりました！",
      "preview": "みてみる",
      "export": "アドオンをダウンロード"
    }
  },
  "error": {
    "validation": {
      "nameEmpty": "なまえをいれてください",
      "nameInvalidChars": "なまえにつかえるのは えいすう字と _ だけです（れい: my_mob）",
      "namespaceMissing": "グループのなまえがひつようです（れい: myaddon:my_mob）",
      "exportFailed": "ダウンロードがうまくいきませんでした: {{message}}"
    },
    "storage": {
      "loadFailed": "さくひんをよみこめませんでした",
      "saveFailed": "さくひんをセーブできませんでした"
    }
  },
  "export": {
    "success": "「{{name}}.mcaddon」をダウンロードしました",
    "validating": "チェックしています...",
    "generating": "ファイルをつくっています..."
  }
}
```

> **注意**: `ja-kids.json` に存在しないキーは `ja.json` に自動フォールバックする（i18next の `fallbackLng` 設定による）。  
> そのため `entity.trait.*`、`block.trait.*`、`item.trait.*` などの詳細なトレイト名は、`ja-kids.json` に専用訳語を追加するまで `ja` のテキストが表示される。  
> 段階的に `ja-kids.json` を充実させていく運用で問題ない。

---

## 7. 翻訳対象キーの分類方針

### カテゴリ分類

| カテゴリ | スコープ例 | 内容 | ja キー数 | ja-kids 優先度 |
|---------|----------|------|---------|--------------|
| **UI ラベル** | `common.*` `app.*` | ボタン・ヘッダー・ナビゲーション | ~100 | 🔴 最優先 |
| **ウィザード UI** | `wizard.*` | ステップタイトル・説明文・選択肢 | ~80 | 🔴 最優先 |
| **トレイト名・説明** | `entity.trait.*` `block.trait.*` `item.trait.*` | 69 種のトレイト名と説明 | ~140 | 🟡 優先 |
| **ステータスラベル** | `entity.status.*` `block.status.*` `item.status.*` | HP・攻撃力等のラベル | ~40 | 🟡 優先 |
| **エラーメッセージ** | `error.*` | バリデーション・ストレージエラー | ~30 | 🔴 最優先 |
| **エクスポート** | `export.*` | 完了メッセージ・進捗表示 | ~15 | 🔴 最優先 |
| **詳細モード UI** | `advanced.*` | コンポーネント名・JSON エディタラベル | ~60 | 🟢 任意 |
| **合計** | — | — | **~465** | — |

> `ja-kids` の最優先キー（約 230）を先にそろえれば、ウィザードと基本操作は完全に子ども向けテキストで動作する。

### 翻訳対象外（Locked）

移植元の `_*.comment` フィールドに `{Locked}` マーカーがあるキー（ブランド名・技術名）は翻訳しない。

```
Minecraft, Mojang, GitHub, UUID, JSON, TypeScript, UUID,
.mcaddon, .mcworld, .mcpack, .mcproject, Bedrock Edition,
format_version, behavior_pack, resource_pack
```

---

## 8. 移植元コードから翻訳が必要な箇所の抽出方針

### ステップ 1: 移植元ロケールファイルの変換

移植元 `app/src/locales/en_US.json` および `ja_JP.json` から、コメントキー（`_*.comment`）を除いたエントリーを抽出し、i18next のネスト JSON 形式に変換する。

```typescript
// scripts/convert-locales.ts（移植作業用の変換スクリプト）
// 実行: npx tsx scripts/convert-locales.ts

import sourceEn from '../path/to/minecraft-creator-tools/app/src/locales/en_US.json';
import sourceJa from '../path/to/minecraft-creator-tools/app/src/locales/ja_JP.json';

type FlatLocale = Record<string, string>;

function convertToNested(flat: FlatLocale): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (key.startsWith('_')) continue; // コメントキーをスキップ
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}
```

### ステップ 2: 移植元 TSX ファイルの翻訳漏れスキャン

移植元コードで翻訳されていない日本語文字列（ハードコードされた英語 UI ラベル）を検出する。

対象パターン:
- JSX の中に直接書かれた英語文字列: `<Button>Create Project</Button>`
- プロパティの英語文字列: `placeholder="Enter name..."`
- `aria-label` 等のアクセシビリティ属性

grep コマンドで検出:
```bash
# 移植元で翻訳されていない直接文字列を検出
grep -r ">[A-Z][a-z]" app/src/UX/ --include="*.tsx" | grep -v "intl.formatMessage"
```

### ステップ 3: トレイト名・説明文の翻訳

`app/src/minecraft/traits/` の 69 ファイルにある `traitId` と説明文を日本語化する。

各トレイトクラスに `displayNameKey` と `descriptionKey` を追加し、`t()` 経由で表示名を取得する設計にする。

```typescript
// src/minecraft/traits/EntityTraits/HostileEntityTrait.ts の例
export class HostileEntityTrait extends EntityTraitBase {
  static readonly traitId = 'hostile';
  static readonly displayNameKey = 'entity.trait.hostile';
  static readonly descriptionKey = 'entity.trait.hostile.description';
  // ...
}
```

### ステップ 4: 新規追加するコンテンツの翻訳キー管理

新規実装するウィザード・エディタ UI のすべての文字列を `wizard.*` / `editor.*` スコープのキーとして `ja.json` に先に登録し、実装中にハードコード文字列を発生させない運用にする。  
`ja-kids.json` への追加は、同キーを `ja.json` に登録した後に行う。

---

## 9. 言語切り替え UI

言語切り替えは `components/shared/LocalePicker.tsx` として実装し、ヘッダー右上に配置する。  
3 ロケール対応のため `<select>` ベースのセレクタを採用する（ボタングループは横幅が不足するため）。

```tsx
// src/components/shared/LocalePicker.tsx
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n';

const LOCALE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  ja: '日本語',
  'ja-kids': 'かんたん日本語',
};

export const LocalePicker: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    void i18n.changeLanguage(event.target.value as SupportedLanguage);
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      aria-label="言語を選ぶ / Select language"
      className="locale-picker"
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.875rem',
        cursor: 'pointer',
      }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {LOCALE_LABELS[lang]}
        </option>
      ))}
    </select>
  );
};
```

> **表示ラベル一覧**:  
> `en` → `English` / `ja` → `日本語` / `ja-kids` → `かんたん日本語`

---

## 10. 型安全な翻訳キー

react-i18next は TypeScript の型推論で翻訳キーの typo を検出できる。`i18next.d.ts` に型定義を追加する。

```typescript
// src/types/i18next.d.ts
import type ja from '../i18n/locales/ja.json';

// ja.json を型の基準とする。
// ja-kids は ja の完全な部分集合のため、型定義は ja のみで十分。
// ja-kids に未翻訳キーがある場合は ja にフォールバックすることをi18nextが保証する。
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof ja;
    };
  }
}
```

これにより、`t('wizard.step1.unknownKey')` はコンパイルエラーになる。  
`ja-kids.json` のキーが `ja.json` に存在しないキーを含む場合はビルド時にエラーにはならないが、フォールバック先の `ja.json` にキーがあるかどうかを CI で確認するスクリプトを追加することを推奨する。
