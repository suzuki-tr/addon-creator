# Review: fix/issues-v1.0.1

**Branch:** `fix/issues-v1.0.1`  
**Base:** `master`  
**Commits reviewed:** 6 (`e481cf3` → `ad4bc6b`)  
**Build evidence (all commits):** `tsc -b && vite build (0 errors); Tests: 212 passed (unit)`

---

## Checklist Findings

### Issue 1 — バニラデータ不足

**PASS**

- `VanillaEntity` interface now has optional `defaultComponents?: { health?, attackDamage?, movementSpeed? }`. (`vanilla-entities.ts` L6-10)
- `VANILLA_ITEMS` (12 entries) and `VANILLA_BLOCKS` (12 entries) added and exported.
- `WizardStep2` accepts `contentType: ContentType` prop; `filteredEntities` memo switches source list by `contentType === 'item' ? VANILLA_ITEMS : contentType === 'block' ? VANILLA_BLOCKS : VANILLA_MOBS`. (`WizardStep2.tsx` L38-44)
- `WizardStep3` performs the same list switch when looking up `vanillaEntity` for display. (`WizardStep3.tsx` L23-28)
- `WizardPage` passes `contentType ?? 'mob'` to `WizardStep2`. (`WizardPage.tsx` L143)

---

### Issue 2 — Step3ボタンラベル

**PASS**

All three locales updated; each key references editing, not downloading.

| Locale | `title` | `subtitle` | `validationOk` | `proceed` |
|--------|---------|-----------|----------------|-----------|
| en     | "Review and Start Editing" | "…click Start Editing to open the editor." | "…Ready to start editing." | "Start Editing" (unchanged) |
| ja     | "確認して編集を始めよう" | "…「編集を始める」ボタンを押してエディタへ進みましょう。" | "…エディタに進めます。" | "編集を始める" (unchanged) |
| ja-kids | "たしかめて へんしゅうをはじめよう" | "…「編集を始めましょう」ボタンをおしてね。" | "…へんしゅうできます。" | **"編集を始めましょう"** ✓ |

---

### Issue 3 — トレイット→JSON

**PASS**

- `projectStore` exports `updateTraits(traits: string[]): void`; updates `project.selectedTraits` in the Zustand store. (`projectStore.ts` L53-57)
- `EditorPage.handleToggleTrait` builds `next` from local `selectedTraits` state, calls `setSelectedTraits(next)` and `updateTraits([...next])`. Both local render state and global store stay in sync. (`EditorPage.tsx` L129-139)
- `JsonPreviewPanel` now calls `useProjectStore()` and passes `project` to `buildTokens`. `buildTokens` reads `project?.selectedTraits` and conditionally inserts component entries (`minecraft:attack`, `minecraft:rideable`, `minecraft:navigation.fly`, `minecraft:burn_in_daylight`, `minecraft:underwater_movement`, `minecraft:boss`, `minecraft:tameable`, `minecraft:breedable`) for the matching traits. (`JsonPreviewPanel.tsx` L19-100)

---

### Issue 4 — スライダー

**PASS**

- `SliderRow` (visual-only `div`-based component) removed entirely.
- `ComponentPanel` uses `useProjectStore` to read initial `project?.status.health`. Local `healthMax` state is wired to a real `<input type="range" min={1} max={2048}>` and companion `<input type="number">`, both calling `updateStatus('health', v)` on every change. (`ComponentPanel.tsx` L67-104)

---

### Issue 5 — 外観

**PASS**

**GeometryPanel (`AppearancePanel.tsx` L341-401):**
- `<input type="file" … data-testid="geometry-file-input" className="hidden">` present. `useRef` triggers click on Browse button. `FileReader.readAsText` → `updateGeometry({ fileName, content })`.

**TextureSlotPanel (`AppearancePanel.tsx` L462-550):**
- `<input type="file" … data-testid="texture-file-input" className="hidden">` present. Default-slot Change button triggers click. `FileReader.readAsDataURL` → `updateTexture({ fileName, dataUrl })`.

**projectStore:**
- `updateGeometry` and `updateTexture` actions added; handle `null` to clear. `ProjectData` has optional `geometry?: {fileName,content}` and `texture?: {fileName,dataUrl}`. Underscore-prefixed destructure satisfies `exactOptionalPropertyTypes`.

**mcaddonGenerator (`mcaddonGenerator.ts` L113-131):**
- Conditional: if `project.geometry?.content` is truthy, adds `rpFolder/models/entity/${entityId}.geo.json` with the text content.
- Conditional: if `project.texture?.dataUrl` is truthy, strips the `data:…;base64,` prefix and adds `rpFolder/textures/entity/${entityId}.png` with `{ base64: true }`.

---

### Issue 6 — バニラ初期値

**PASS**

- All 20 `VANILLA_MOBS` entries have `defaultComponents` populated with real Minecraft values (e.g., cow: health=10, attackDamage=0, movementSpeed=0.25; wolf: health=8, attackDamage=4, movementSpeed=0.3).
- `handleProceedToEditor` resolves the correct list by `contentType`, finds `vanillaEntity`, then:
  ```typescript
  health: vanillaEntity?.defaultComponents?.health ?? vanillaEntity?.defaultHealth ?? 20,
  attackDamage: vanillaEntity?.defaultComponents?.attackDamage ?? 3,
  movementSpeed: vanillaEntity?.defaultComponents?.movementSpeed ?? 0.25,
  ```
  Three-level fallback ensures backwards compatibility and correct vanilla defaults. (`WizardPage.tsx` L96-125)

---

### Issue 7 — E2E

**PASS**

`app/e2e/mob-creation-full.spec.ts` exists (100 lines) and covers the full scenario:

1. Home → Wizard (URL change verified)
2. Select Mob type → next
3. Search for "牛", click `data-testid="vanilla-entity-minecraft:cow"`, fill display name + ID → next
4. Assert heading "確認して編集を始めよう" (ja.json title matches)
5. Click "編集を始める" → waitForURL editor
6. Switch to advanced mode
7. Toggle hostile trait via `role=checkbox`; assert `aria-checked=true`
8. Assert `pre` element contains `"minecraft:attack"` (live JSON preview)
9. Components tab: `input[type=range]` fill '50', assert `.toHaveValue('50')`
10. Appearance → Geometry sub-tab: `setInputFiles(cow-geometry.geo.json)`
11. Appearance → Texture sub-tab: `setInputFiles(cow-texture.png)`
12. Click Export, `waitForEvent('download')`, assert filename matches `/\.mcaddon$/`

Fixture files confirmed present:
- `app/e2e/fixtures/cow-geometry.geo.json` (354 bytes, valid 1.12.0 format)
- `app/e2e/fixtures/cow-texture.png` (67 bytes, minimal 1×1 PNG)

---

## TypeScript Correctness

- No `any` introduced. All new props/state/store fields are explicitly typed.
- `contentType ?? 'mob'` correctly narrows `ContentType | null` to `ContentType` for the `WizardStep2` prop.
- `contentType!` non-null assertion in `handleProceedToEditor` is safe — step 3 is only reachable via `handleNext` which guards `contentType !== null`.
- Underscore-prefix destructure (`const { geometry: _g, ...rest }`) correctly satisfies `exactOptionalPropertyTypes` when clearing optional fields.
- `updateStatus`, `updateTraits`, `updateGeometry`, `updateTexture` all return `void`; Zustand `set` callbacks return `{}` as valid `Partial<ProjectStore>`.
- `tsc -b (0 errors)` recorded in all 6 commits.

---

## Verdict

**APPROVED** — All 7 checklist items are addressed correctly. No reachable correctness, type, or security failures found.
