# Implementation Plan — issues_v1.0.0

> Authoritative source: `issues/issues_v1.0.0.md`. All 7 items addressed in 5 sequential features.
> FEAT artifacts live at `.agents/tasks/fix-issues-v1.0.0/features/FEAT-00N.json`.

---

## Root-cause analysis per issue

### Issue 1 — Browser tab title is 'app'
**File / line:** `app/index.html` line 7 — `<title>app</title>` was never changed from the Vite scaffold default.  
**Fix:** One-character change: `<title>mc-addon-editor</title>`.

### Issue 2 — 'Open existing project' does nothing
**File / line:** `app/src/pages/HomePage.tsx` — `handleOpenProject` body is a comment: `// Phase 3: open file picker / project browser`.  
**Fix:** Implement using a hidden `<input type="file" accept=".json">` with a React ref; on change, call `loadProjectFile(file)` → `setProject(data)` → `navigate('/editor')`. Requires new `projectStore`, `projectFile.ts`.

### Issue 3 — Language switcher: selector changes but UI text doesn't update
**Root cause (exact):**  
`handleLocaleChange` in `Header.tsx` (lines 20-26) calls **`i18n.changeLanguage` twice** — once indirectly via `setLocale(nextLocale)` (uiStore line 15: `void i18n.changeLanguage(locale)`) and once directly on the next line (`void i18n.changeLanguage(nextLocale)`). With i18next v25, the second in-flight `changeLanguage` call before the first resolves can suppress the `languageChanged` event that react-i18next's `useTranslation` subscription relies on to trigger a re-render, leaving the UI with stale translation strings while the select element (driven by zustand state, which updates synchronously) already shows the new value.  
Additionally, i18n is initialized without `react: { useSuspense: false }`, which can interfere with language-change re-renders when react-i18next tries to handle suspended state internally.  
**Fix:**  
1. Remove `void i18n.changeLanguage(nextLocale)` from `handleLocaleChange` — `setLocale` is the single source of truth.  
2. Remove the now-unused `import i18n from '@/i18n'` from Header.tsx.  
3. Add `react: { useSuspense: false }` to `i18n/index.ts` init options.

### Issue 4 — Vanilla search input shows no results
**File / line:** `WizardStep2.tsx` — `handleVanillaSearch` updates `formData.vanillaSearch` but nothing reads it; no entity list exists anywhere.  
**Fix:** Create `app/src/data/vanilla-entities.ts` with ~20 common mobs. In WizardStep2, render a filtered `ul` of entity buttons below the search input. Each button has `data-testid="vanilla-entity-{id}"` and `role="option"` for accessible selection. Add `selectedVanillaId: string | null` to `WizardFormData`.

### Issue 5 — Next button not blocked on vanilla with no entity selected
**File / line:** `WizardPage.tsx` `validateStep2` (lines 46-57) — only validates `displayName` and `id`; no check for `baseType === 'vanilla' && !selectedVanillaId`.  
**Fix:** Add `vanillaEntityError` state; in `validateStep2` add: `if (formData.baseType === 'vanilla' && !formData.selectedVanillaId) { setVanillaEntityError(...); valid = false; }`.

### Issue 6 — Header logo is a plain `<div>` with no navigation link
**File / line:** `Header.tsx` lines 29-33 — the logo block is wrapped in `<div className="flex items-center gap-2 flex-shrink-0">`.  
**Fix:** Import `Link` from `react-router-dom`. Replace the outer `<div>` with `<Link to="/" className="flex items-center gap-2 flex-shrink-0 no-underline">`.

### Issue 7 — Core features are placeholders; E2E scenarios fail
**Current state:**
- `WizardPage.handleDownload`: shows `alert()` and navigates to `'/'` — traits never get selected before download.
- `EditorPage.handleExport`: shows `alert(t('export.generating'))` — no actual file created.
- `EditorPage.handleSave`: empty function.
- No `projectStore` exists; EditorPage and StatusPanel hold all data in local `useState`.
- `jszip` is NOT in `package.json` or `node_modules`.

**Fix (3 scenarios require this complete pipeline):**
1. Install `jszip@3.10.1`.
2. Create `projectStore.ts` (zustand, no persist) holding `ProjectData` (entity metadata + traits + status).
3. Create `lib/mcaddonGenerator.ts` using JSZip to produce a real `.mcaddon` blob.
4. Create `lib/projectFile.ts` for save (`Blob` → `<a download>`) and load (`FileReader` → `ProjectData`).
5. WizardPage step 3: change "Download" to "Start Editing" → `setProject(data)` → `navigate('/editor')`. Traits are added in EditorPage.
6. EditorPage: read initial traits from `projectStore`; `handleExport` → `downloadMcaddon`; `handleSave` → `saveProjectFile`.
7. StatusPanel: add optional `initialValues` prop (for loaded projects); write slider changes back to `projectStore` via `updateStatus` so `handleExport` reads the latest health value.
8. HomePage: implement open-project file picker.

---

## New files to create

| File | Purpose |
|------|---------|
| `app/src/data/vanilla-entities.ts` | Static list of ~20 vanilla mobs with Japanese/English names and default stats |
| `app/src/stores/projectStore.ts` | Zustand store for current project (entity id, traits, status) |
| `app/src/lib/mcaddonGenerator.ts` | JSZip-based .mcaddon file generator |
| `app/src/lib/projectFile.ts` | Save project as JSON / load project from JSON |
| `app/e2e/fixtures/chicken-project.json` | Pre-built chicken project fixture for E2E scenario (c) |
| `app/e2e/mob-creation.spec.ts` | Playwright E2E spec for all three scenarios |

---

## Files to modify

| File | What changes |
|------|-------------|
| `app/index.html` | `<title>` text |
| `app/src/components/layout/Header.tsx` | Add `Link` for logo; remove duplicate `changeLanguage`; remove `i18n` import |
| `app/src/i18n/index.ts` | Add `react: { useSuspense: false }` to init options |
| `app/src/pages/WizardPage.tsx` | Add `selectedVanillaId`; `vanillaEntityError`; vanilla validation; `handleProceedToEditor`; save to store |
| `app/src/components/wizard/WizardStep2.tsx` | Show filtered entity list; selection; error display |
| `app/src/components/wizard/WizardStep3.tsx` | Show selected entity name from `VANILLA_MOBS` lookup |
| `app/src/pages/EditorPage.tsx` | Read from `projectStore`; real export and save |
| `app/src/components/editor/StatusPanel.tsx` | Accept `initialValues` prop; write to `projectStore.updateStatus` |
| `app/src/pages/HomePage.tsx` | Implement `handleOpenProject` with file input |
| `app/src/i18n/locales/ja.json` | Add `error.validation.vanillaEntityRequired`, `wizard.confirm.proceed` |
| `app/src/i18n/locales/ja-kids.json` | Same new keys |
| `app/src/i18n/locales/en.json` | Same new keys |
| `app/package.json` | Add `jszip@3.10.1` to dependencies |

---

## Implementation order

Implemented as five sequential FEATs (each leaves the codebase buildable):

1. **FEAT-001** — Issues 1 + 6: title, header link
2. **FEAT-002** — Issue 3: i18n double-call fix
3. **FEAT-003** — Issues 4 + 5: vanilla entity data + wizard search/validation
4. **FEAT-004** — Issues 2 + 7 core: projectStore, generators, EditorPage wiring, open project
5. **FEAT-005** — Issue 7 E2E: fixture + three Playwright scenarios

FEAT-001 and FEAT-002 both touch `Header.tsx` so they must run sequentially (FEAT-001 adds the Link import; FEAT-002 removes the i18n import).  
FEAT-003 and FEAT-004 are independent of each other but FEAT-004 depends on `selectedVanillaId` added in FEAT-003.  
FEAT-005 depends on all prior FEATs being functional.

---

## Commit plan (one per FEAT)

```
fix(ui): change tab title to mc-addon-editor, wrap header logo in Link
fix(i18n): remove double changeLanguage call, add useSuspense:false
feat(wizard): add vanilla entity search and selection with validation
feat(editor): implement projectStore, mcaddon export, project save/load
test(e2e): add three mob-creation scenarios (hostile, rideable, open+edit)
```

---

## npm packages required

- **`jszip@3.10.1`** — installed in FEAT-004 step 1 (`npm install jszip@3.10.1`). JSZip v3.x ships bundled TypeScript types; no `@types/jszip` package needed.

No other new runtime dependencies. All other needed APIs (`crypto.randomUUID`, `URL.createObjectURL`, `FileReader`) are available in the browser environment.

---

## Playwright selector strategy for E2E tests

| Element | Selector |
|---------|---------|
| Language select | `page.selectOption('[aria-label="言語を選ぶ / Select language"]', 'ja')` |
| Mob type button | `page.getByRole('button', { name: /モブ/ })` |
| Next button | `page.getByRole('button', { name: /次へ/ })` |
| Vanilla search input | `page.getByPlaceholder('名前で検索...')` |
| Cow entity result | `page.locator('[data-testid="vanilla-entity-minecraft:cow"]')` |
| Chicken entity result | `page.locator('[data-testid="vanilla-entity-minecraft:chicken"]')` |
| Step 3 proceed button | `page.getByRole('button', { name: /編集を始める/ })` |
| Hostile trait card | `page.getByRole('checkbox', { name: /敵対的/ })` |
| Rideable trait card | `page.getByRole('checkbox', { name: /騎乗可能/ })` |
| Export button | `page.getByRole('button', { name: /エクスポート/ })` |
| Save button | `page.getByRole('button', { name: /保存/ })` |
| Open project button | `page.getByRole('button', { name: /既存のプロジェクトを開く/ })` |
| Status tab | `page.getByRole('tab', { name: /ステータス/ })` |
| Health number input | `page.getByRole('spinbutton', { name: /体力/ }).first()` |
| Download interception | `page.waitForEvent('download')` |
| File chooser interception | `page.waitForEvent('filechooser')` |

`data-testid="vanilla-entity-{id}"` attributes are added in FEAT-003 on the entity list items in `WizardStep2.tsx`.

---

## Digest

### Files this plan touches

**`app/index.html`**  
Block: `<title>app</title>` (line 7). Test: none needed (verified by build output). Verified: file read.

**`app/src/components/layout/Header.tsx`**  
Block 1: import section — add `Link` from `react-router-dom`; remove `import i18n from '@/i18n'` (FEAT-002).  
Block 2: `handleLocaleChange` (lines ~20-26) — remove `void i18n.changeLanguage(nextLocale)`.  
Block 3: logo div (lines ~29-33) — replace `<div>` wrapper with `<Link to="/">`.  
Tests: `Header.spec.ts` (all tests use mocked i18n — unaffected). Verified: file read.

**`app/src/i18n/index.ts`**  
Block: `.init({...})` options object — add `react: { useSuspense: false }`. Verified: file read.

**`app/src/pages/WizardPage.tsx`**  
Block 1: `WizardFormData` interface — add `selectedVanillaId: string | null`.  
Block 2: `useState<WizardFormData>` initial value — add `selectedVanillaId: null`.  
Block 3: `validateStep2` — add vanilla entity guard.  
Block 4: `handleDownload` → `handleProceedToEditor`.  
Block 5: Step 3 button in render — text + onClick.  
Tests: `WizardPage.spec.ts` (mocked i18n; existing tests check key names, not actual strings). Verified: file read.

**`app/src/components/wizard/WizardStep2.tsx`**  
Block: vanilla expanded section — add `useMemo` import, `filteredEntities`, entity list `<ul>`, error paragraph.  
Tests: `WizardStep2.spec.ts` (existing tests render with `baseType:'scratch'`, unaffected). Verified: file read.

**`app/src/components/wizard/WizardStep3.tsx`**  
Block: `baseLabel` computation — look up `VANILLA_MOBS` by `selectedVanillaId`.  
Tests: `WizardStep3.spec.ts`. Verified: file read.

**`app/src/stores/projectStore.ts`**  
New file. No existing test; covered indirectly by FEAT-004 integration and E2E. Verified: does not exist yet.

**`app/src/lib/mcaddonGenerator.ts`**  
New file. No existing test. Verified: does not exist yet.

**`app/src/lib/projectFile.ts`**  
New file. No existing test. Verified: does not exist yet.

**`app/src/pages/EditorPage.tsx`**  
Block 1: imports — add `useProjectStore`, `downloadMcaddon`, `saveProjectFile`, type `ProjectData`, `DEFAULT_STATUS`.  
Block 2: `selectedTraits` initialization — read from `project?.selectedTraits`.  
Block 3: `handleSave` and `handleExport` — replace stubs.  
Block 4: `entityName` — read from `project?.entityDisplayName`.  
Block 5: `<StatusPanel>` — pass `initialValues={project?.status}`.  
Tests: `EditorPage.spec.ts` (doesn't mock projectStore; store returns `project: null`; defaults apply). Verified: file read.

**`app/src/components/editor/StatusPanel.tsx`**  
Block 1: add `StatusPanelProps` interface with optional `initialValues`.  
Block 2: `useState` initialization — merge `initialValues`.  
Block 3: `handleChange` — also call `updateStatus`.  
Tests: `StatusPanel.spec.ts` — renders with `createElement(StatusPanel)` (no props). After change, `StatusPanel()` called with `{}` default → `initialValues` is `undefined` → `DEFAULT_VALUES` used → existing test assertions unchanged. Verified: spec file read.

**`app/src/pages/HomePage.tsx`**  
Block: `handleOpenProject` — replace empty body; add file input ref + handler.  
Tests: `HomePage.spec.ts`, `HomePage.kids.spec.ts` (mock uiStore; `handleOpenProject` stub is not under test). Verified: file read.

**`app/src/i18n/locales/ja.json`, `ja-kids.json`, `en.json`**  
Additions: `error.validation.vanillaEntityRequired`, `wizard.confirm.proceed`. Verified: files read.

**`app/e2e/fixtures/chicken-project.json`**  
New file. Used by FEAT-005 scenario (c). Verified: does not exist yet.

**`app/e2e/mob-creation.spec.ts`**  
New file. Three Playwright scenarios. Verified: does not exist yet.

**`app/package.json`**  
Addition: `"jszip": "3.10.1"` to `dependencies`. Verified: file read; jszip absent from node_modules.

### Build + test commands
```bash
cd app

# Unit tests (all FEATs)
npm test -- --silent

# TypeScript build (all FEATs)
npm run build

# Lint (all FEATs)
npm run lint

# E2E (FEAT-005 only — requires dev server on :5173)
npx playwright test --reporter=dot
```

### Tests passing today (baseline)
Unit: `npm test -- --silent` → all tests in `src/components/` and `src/pages/` pass.  
E2E: `npx playwright test` → `home.spec.ts` (4 tests), `wizard.spec.ts` (5 tests), `editor.spec.ts` (5 tests) all pass.  
Build: `npm run build` passes with 0 errors.
