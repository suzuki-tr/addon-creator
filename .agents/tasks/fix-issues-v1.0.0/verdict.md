# Code Review Verdict — fix/issues-v1.0.0

Reviewed diff `master...fix/issues-v1.0.0`. All seven issues verified against source files.

---

## Issue 1 — Tab title "mc-addon-editor"
`app/index.html` line 7: `<title>mc-addon-editor</title>`. ✓

## Issue 2 — "既存のプロジェクトを開く" file picker
`HomePage.tsx`: `fileInputRef = useRef<HTMLInputElement>(null)`. `handleOpenProject` calls `fileInputRef.current?.click()`. `handleFileInputChange` reads the selected `.json` via `loadProjectFile`, calls `setProject(data)`, then `navigate('/editor')`. Hidden `<input type="file" accept=".json">` rendered alongside both `StandardHomeLayout` and `KidsHomeLayout`. `loadProjectFile` (projectFile.ts) uses `FileReader.readAsText` → `JSON.parse` cast as `ProjectData`. ✓

## Issue 3 — Language switcher
`Header.tsx` `handleLocaleChange` contains only `setLocale(nextLocale)` — no `i18n.changeLanguage` call present (grep: 0 hits in Header.tsx). `uiStore.ts` `setLocale` calls `void i18n.changeLanguage(locale)` before `set({ locale })` — single point of truth. `i18n/index.ts` `.init()` options include `react: { useSuspense: false }`. ✓

## Issue 4 — Vanilla entity search shows filtered list; selection populates selectedVanillaId
`WizardStep2.tsx`: `filteredEntities` computed by `useMemo` over `VANILLA_MOBS.filter(matchesSearch)` when `vanillaSearch` is non-empty; full list shown otherwise. Each entity renders a `<button role="option" data-testid={"vanilla-entity-"+entity.id} aria-selected={data.selectedVanillaId === entity.id}` calling `onChange({ selectedVanillaId: entity.id })`. `matchesSearch` checks `nameJa`, `nameJaKids`, `nameEn`, and `id` case-insensitively. E2E search for '牛' matches cow (`nameJa`); 'ニワトリ' matches chicken (`nameJaKids`). ✓

## Issue 5 — Next blocked when baseType === "vanilla" and no entity selected
`WizardPage.tsx` `validateStep2`: `if (formData.baseType === 'vanilla' && !formData.selectedVanillaId) { setVanillaEntityError(t('error.validation.vanillaEntityRequired')); valid = false; }`. Error text "バニラエンティティを選択してください" present in all three locale files. `vanillaEntityError` passed to `WizardStep2` and displayed below the entity list. ✓

## Issue 6 — Header logo/title is a `<Link to="/">` and left-aligned
`Header.tsx`: logo section is `<Link to="/" className="flex items-center gap-2 flex-shrink-0 no-underline">`. It is the first child of the `max-w-[1200px] mx-auto flex items-center gap-4` container; a `<div className="flex-1" />` spacer follows, pushing controls right. Logo is visually left-aligned. ✓

## Issue 7 — All three E2E scenarios pass
`mob-creation.spec.ts` has three tests in `describe('モブ作成 E2E')`:
- Scenario (a): cow wizard → hostile trait → Export → `.mcaddon` download asserted.
- Scenario (b): chicken wizard → rideable trait → Save → `.json` download asserted.
- Scenario (c): open `fixtures/chicken-project.json` (health:4) via file chooser → navigate to /editor → status tab → verify spinbutton value '4' → fill '2048' + Tab → Export → `.mcaddon` download asserted.

`StatusPanel` correctly propagates changes: `handleChange` calls `updateStatus(row.key, clamped)` on the store; `EditorPage.handleExport` reads `project?.status` from the same store. `chicken-project.json` fixture matches `ProjectData` shape. FEAT-005 records 17/17 Playwright E2E tests passed, 212/212 unit tests passed, 0 TypeScript errors.

---

## Observations (non-blocking)
`StatusPanel.handleReset` only updates local component state and does not call `updateStatus`, so resetting a slider via the "デフォルト" button does not propagate to the store. The displayed value and the value that would be exported diverge until the slider is moved again. This edge case is not covered by any acceptance criterion or E2E test and is out of scope for this review.

---

**Verdict: APPROVED**
