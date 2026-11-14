# Issues v1.0.3 — locale decoupling, scroll isolation, addon-type editor routing, vanilla shape preview

Four issues resolved across five commits. Issue 4 strips all ja-kids conditional branches from Header, AppShell, and HomePage. Issue 3 adds the missing `min-h-0` to the JSON preview code block. Issue 1 introduces ItemEditor and BlockEditor with basic/components/json tabs and wires EditorPage to route by `contentType`. Issue 2 adds procedural box mesh generation in BabylonPreview behind a new `vanillaShape` prop, populates `shapeCategory` on all 20 vanilla mob entries, and adds a note overlay in AppearancePanel. The final commit updates E2E tests to match the new behavior.

**Watch for:**
- **confirmed** — JSON tab in ItemEditor and BlockEditor renders `minecraft:entity` behavior-pack JSON, not item or block format; misleads users of those editors.
- **possible** — `h-full` inside ItemEditor/BlockEditor's `overflow-y-auto` tab wrapper may not constrain JsonPreviewPanel to viewport height, causing content to expand rather than scroll internally.

**Verdict**: APPROVED

---

## High-level view

Locale decoupling is complete with no residual fragments. The `locale !== 'ja-kids'` conditional in Header, the `bgClass` branch in AppShell, and `KidsHomeLayout` in HomePage are all removed.

The scroll isolation fix is a one-line `min-h-0` addition to the code block div. The outer container and footer sections already carried the required classes from a prior pass.

ItemEditor and BlockEditor share the same tab layout, resize logic, and — notably — the same `'json-panel-width'` localStorage key. The JSON tab in both mounts `JsonPreviewPanel` unchanged, which generates `minecraft:entity` JSON regardless of content type; users of the item and block editors will see entity behavior-pack JSON in that tab.

`vanillaShape` is in the effect dependency array, triggering a full scene rebuild when the entity selection changes. A comment on `vanillaShapeRef` claims it avoids adding `vanillaShape` to the dep array — the opposite of what the code does. The `'fish'` variant in both the type union and the switch has no VANILLA_MOBS entry that uses it.

---

<details>
<summary>Issues (6)</summary>

1. **Entity JSON in item/block JSON tabs** — `JsonPreviewPanel` builds `minecraft:entity` JSON; both ItemEditor and BlockEditor mount it unchanged in their JSON tab. Users will see entity behavior-pack JSON (with `is_spawnable`, `minecraft:health`, etc.) when editing items or blocks. Add item- and block-specific JSON builders or mark the tab as a placeholder.

2. **JSON scroll containment in tab wrapper** — The JSON tab renders `<div className="h-full -m-6 overflow-hidden"><JsonPreviewPanel .../>` inside a parent with `className="flex-1 overflow-y-auto p-6"`. `h-full` inside `overflow-y-auto` resolves against scroll-content height, not viewport height, so JsonPreviewPanel may expand to full content rather than scroll internally. Verify visually; if broken, change the tab-content wrapper to `flex-1 overflow-hidden` when the JSON tab is active.

3. **Misleading `vanillaShapeRef` comment** — The comment reads "Keep vanillaShape accessible inside the geometry effect without adding it to the dep array" but `vanillaShape` is in the dependency array: `[geometryJson, vanillaShape]`. The ref is harmless but the comment will mislead future maintainers. Correct or remove it.

4. **`'fish'` shape category dead code** — `'fish'` is in the `shapeCategory` union type and handled in the `buildVanillaShape` switch (falls through to `'aquatic'`). No VANILLA_MOBS entry uses `'fish'`. Remove it from both the union and the switch, or add a comment explaining when it would be assigned and how it differs from `'aquatic'`.

5. **`localStorage` key collision between editors** — Both ItemEditor and BlockEditor read/write `'json-panel-width'`. Panel width is shared; resizing in one editor carries over to the other. Use distinct keys (`'item-json-panel-width'`, `'block-json-panel-width'`) if independent sizing is desired.

6. **No automated coverage for new editor paths** — ItemEditor/BlockEditor routing (`contentType === 'item'` / `'block'`) and the vanilla shape preview path (vanilla entity selected, no custom geometry) have no E2E or unit test coverage. Add at least smoke-level tests for each routing branch.

</details>

<details>
<summary>Details</summary>

### Entity JSON in item and block JSON tabs

Both ItemEditor and BlockEditor mount `<JsonPreviewPanel entityName={t('editor.files.placeholderEntityName')} />` in their JSON tab. `buildTokens` constructs a `minecraft:entity` behavior-pack object — `is_spawnable`, `minecraft:health`, `minecraft:movement`, trait-dependent components — none of which applies to items (`minecraft:item`) or blocks (`minecraft:block`). The issue spec required the tab to exist without specifying its content, but the mismatch will be visible at first use.

### JSON scroll containment inside ItemEditor/BlockEditor tab wrapper

The tab-content div in both editors is:
```tsx
<div className="flex-1 overflow-y-auto p-6" role="tabpanel" ...>
  {activeTab === 'json' && (
    <div className="h-full -m-6 overflow-hidden">
      <JsonPreviewPanel ... />
    </div>
  )}
</div>
```

`h-full` inside `overflow-y-auto` resolves to scroll-content height, not the visible viewport. `JsonPreviewPanel` relies on `flex flex-col h-full overflow-hidden` at its root to constrain internal scroll — this works in the entity editor's right panel (which is `flex overflow-hidden`), but here the ancestor is `overflow-y-auto`, which may allow it to expand to full content height and defeat the internal scroll. If the JSON tab expands the page rather than scrolling internally, change the tab-content wrapper to `flex-1 flex flex-col overflow-hidden` when the JSON tab is active and drop the `-m-6` trick.

### Misleading `vanillaShapeRef` comment

BabylonPreview.tsx around line 126:
```ts
// Keep vanillaShape accessible inside the geometry effect without adding it to the dep array
const vanillaShapeRef = useRef<typeof vanillaShape>(vanillaShape)
vanillaShapeRef.current = vanillaShape
```

`vanillaShape` is in the dependency array (`[geometryJson, vanillaShape]`), so the ref does not serve its stated purpose. The ref is harmless but the comment is incorrect and will mislead anyone reasoning about why the dep array was chosen this way.

### `'fish'` shape category dead code

`'fish'` appears in the `VanillaEntity.shapeCategory` union and in `buildVanillaShape` where it falls through to `'aquatic'`, producing an identical box mesh. No VANILLA_MOBS entry uses it. Remove from both the union and the switch, or assign `'fish'` to appropriate mobs (salmon, tropical fish) and differentiate the mesh.

### No automated coverage for new editor paths

The E2E suite covers locale decoupling (18 tests pass). It does not cover:
- Opening a project with `contentType === 'item'` and verifying `ItemEditor` renders
- Opening a project with `contentType === 'block'` and verifying `BlockEditor` renders
- Selecting a vanilla entity with no custom geometry and verifying the vanilla shape note appears

The vanilla shape mesh construction and EditorPage routing are both easy to exercise in integration tests.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `app/e2e/home.spec.ts` | Updated 3 tests to verify locale-decoupled behavior (bg color, mode toggle, layout) |
| `app/src/components/editor/AppearancePanel.tsx` | PreviewPane derives `vanillaShape` from selected vanilla entity; passes it to BabylonPreview; adds note overlay when active and no custom geometry |
| `app/src/components/editor/BabylonPreview.tsx` | Added `vanillaShape` prop and `buildVanillaShape` function; integrated into geometry effect; added `vanillaShape` to dep array |
| `app/src/components/editor/BlockEditor.tsx` | New file — block editor with basic/components/json tabs and resizable JSON side panel |
| `app/src/components/editor/ItemEditor.tsx` | New file — item editor with basic/components/json tabs and resizable JSON side panel |
| `app/src/components/editor/JsonPreviewPanel.tsx` | Added `min-h-0` to code block div |
| `app/src/components/layout/AppShell.tsx` | Removed `useUiStore` import and locale-based bg class; hardcoded `bg-[#F9FAFB]` |
| `app/src/components/layout/Header.tsx` | Removed `locale !== 'ja-kids'` guard from mode toggle; removed locale-conditional language selector styling |
| `app/src/data/vanilla-entities.ts` | Added `shapeCategory?` to `VanillaEntity` interface; assigned `shapeCategory` to all 20 VANILLA_MOBS entries |
| `app/src/i18n/locales/en.json` | Added `editor.item.*`, `editor.block.*`, and `editor.preview3d.vanillaShapeNote` keys |
| `app/src/i18n/locales/ja-kids.json` | Same additions as en.json, in kids-Japanese |
| `app/src/i18n/locales/ja.json` | Same additions as en.json, in Japanese |
| `app/src/pages/EditorPage.tsx` | Added early-return guards for `contentType === 'item'` and `'block'` routing to new editors |
| `app/src/pages/HomePage.tsx` | Removed `KidsHomeLayout` component and `locale`-based layout branch; removed `useUiStore` import |

</details>
