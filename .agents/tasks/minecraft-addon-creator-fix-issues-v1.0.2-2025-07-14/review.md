# v1.0.2 fix-pass: all six prior findings resolved

Commit `c59ce59` closes every finding from the first-pass review. The geometry client entity now reads `description.identifier` from the uploaded .geo.json instead of constructing a name from `entityId`; hostile behavior pack output now includes both AI-goal components alongside `minecraft:attack`; `BabylonPreview` geometry parsing is fully typed with four interfaces; UUID persistence handles pre-existing projects; vanilla appearance metadata is visible in both the geometry and texture sub-tabs; and texture changes no longer rebuild the full Babylon.js engine.

Two concerns surfaced in this pass that were not in the prior review. `atob()` for PNG byte conversion in the directory-save path is unguarded — a malformed texture data URL throws a `DOMException`, which the `handleSave` `.catch()` surfaces as an alert, but partial directory output remains. The `ResizeHandle` component declares `role="separator" aria-orientation="vertical"` without an `onKeyDown` handler, advertising keyboard resize operability that isn't implemented.

Watch for: `atob` unguarded — DOMException on corrupt texture leaves partial directory output (confirmed). `role="separator"` on `ResizeHandle` with no keyboard handler — panel is not keyboard-resizable (confirmed).

**Verdict**: APPROVED

## High-level view

`readGeometryIdentifier()` parses `minecraft:geometry[0].description.identifier` from the uploaded .geo.json, validates the `geometry.` prefix, and uses the result as the client entity geometry reference. The fallback to `geometry.<entityId>` activates only when no geometry file is loaded. Minecraft silently fails to resolve geometry by file path; this fix ensures the identifier in the client entity matches the one Bedrock actually looks up.

Hostile mob behavior pack output now matches the JSON preview: `nearest_attackable_target`, `hurt_by_target`, and `attack` are all written, so exported hostile mobs actually target and chase players.

The two-effect split in `BabylonPreview` — geometry effect on `[geometryJson]` for full scene rebuild, texture effect on `[textureUrl]` for `diffuseTexture` swap — avoids engine disposal on texture-only changes. `lastAppliedTextureRef` prevents the texture effect from re-applying a texture that the geometry effect already set when both inputs change in the same render cycle.

UUID persistence in `handleSave` generates all four pack UUIDs when any are absent and gates the `setProject` call on `!project?.manifestUuid`. This covers the two realistic cases: new projects (all four UUIDs already in the store from `WizardPage`) and fully pre-existing projects (none present, all generated and persisted). A project that has `manifestUuid` but is missing `rpManifestUuid` — possible only for builds made between commits `c15c5b4` and `c59ce59` — still churns the RP UUID across sessions, but this scenario does not arise in any released build.

The `atob` path for PNG bytes has no error handling. A corrupt or non-base64 data URL throws a `DOMException` that propagates out of `saveProjectToDirectory` and is caught by `handleSave`'s `.catch()`, which surfaces a user-facing alert with the error message. The partial output — `project.json`, BP manifest, entity behavior JSON, RP manifest, client entity, and optionally geometry — remains in the chosen directory. Because `project.json` is always written first, the project data is recoverable, but the directory is left incomplete.

The `ResizeHandle` component renders with `role="separator"` and `aria-orientation="vertical"`. Per the ARIA authoring practices, a resizable separator is expected to respond to `ArrowLeft`/`ArrowRight` for keyboard resize. No `onKeyDown` handler is present.

<details>
<summary>Issues (2)</summary>

1. **`atob` exception leaves partial directory** — `atob(b64)` for PNG byte conversion in `saveProjectToDirectory` (projectFile.ts, texture write section) has no try/catch. A corrupt texture data URL throws `DOMException`, propagates to `handleSave`'s `.catch()` alert, but partial directory contents are not cleaned up. Wrap the `atob` and `Uint8Array.from` call in a try/catch; either skip the PNG write and log a warning, or surface a typed error before any directory writes begin.

2. **ResizeHandle not keyboard-operable** — `role="separator" aria-orientation="vertical"` in `ResizeHandle.tsx` implies keyboard resize support per ARIA spec. No `onKeyDown` handler is present, so keyboard-only users cannot adjust panel width. Add `onKeyDown` with `ArrowLeft`/`ArrowRight` incrementing/decrementing `jsonPanelWidth` by a fixed step (e.g., 20px), clamped to the same 200 px–50 vw bounds.

</details>

<details>
<summary>Details</summary>

### Prior findings — all resolved

**Finding 1 (geometry identifier):** `readGeometryIdentifier()` in `projectFile.ts` parses the first entry in `minecraft:geometry` or the legacy `geometry` array, reads `description.identifier`, and validates the `geometry.` prefix before using it. The client entity writes `geometry: { default: geometryRef }` where `geometryRef` comes from this helper. The fallback `geometry.${entityId}` is used only when no geometry content is in the project. ✓

**Finding 2 (hostile behavior):** `saveProjectToDirectory` now writes identical hostile components to `JsonPreviewPanel`:

```typescript
components['minecraft:behavior.nearest_attackable_target'] = {
  entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'player' }, max_dist: 16 }],
}
components['minecraft:behavior.hurt_by_target'] = {}
components['minecraft:attack'] = { damage: status.attackDamage }
```
✓

**Finding 3 (`no-explicit-any`):** Four interfaces — `BedrockCube`, `BedrockBone`, `BedrockGeoEntry`, `BedrockGeoFile` — are defined at the top of `BabylonPreview.tsx`, removing all cast-through-any in the geometry-parsing loop. ✓

**Finding 4 (UUID migration):** `handleSave` generates all four UUIDs when absent and calls `setProject(exportData)` when `!project?.manifestUuid`. Pre-existing projects get stable UUIDs on first save and reuse them thereafter. ✓

**Finding 5 (vanilla info in texture tab):** The vanilla appearance info block is duplicated in `TextureSlotPanel` as well as `GeometryPanel`, so users on either sub-tab see both the geometry identifier and the texture path reference. ✓

**Finding 6 (BabylonPreview full rebuild):** The two-effect design is sound. When `geometryJson` changes, the geometry effect disposes and rebuilds the engine, reads `textureUrlRef.current` to apply the current texture, and records it in `lastAppliedTextureRef`. When only `textureUrl` changes, the texture effect fires, sees `textureUrl !== lastAppliedTextureRef.current`, and swaps `diffuseTexture` on the existing material without engine disposal. When both change in the same cycle, the geometry effect runs first and sets `lastAppliedTextureRef.current` to the new URL; the texture effect then skips. ✓

### `atob` exception path

In `saveProjectToDirectory`, after all manifest and entity writes complete:

```typescript
const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] ?? '' : dataUrl
const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
```

`atob` throws `InvalidCharacterError` (a `DOMException`) if `b64` contains characters outside the base64 alphabet. At this point in the execution path, `project.json`, the BP manifest, the entity behavior JSON, the RP manifest, the client entity JSON, and potentially the geometry file have already been written. The exception propagates out of the async function, is caught by `handleSave`'s `.catch()`, and surfaces as `window.alert(saveFailed + ': ' + message)`. The alert message will read something like `Failed to save project: InvalidCharacterError: Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.` — informative enough, but the partial directory remains.

The `project.json` write happens first and contains the full project state including the original `texture.dataUrl`, so the user can reload and retry.

### ResizeHandle keyboard gap

`ResizeHandle.tsx` renders:

```tsx
<div
  role="separator"
  aria-label="Resize JSON preview panel"
  aria-orientation="vertical"
  onMouseDown={onMouseDown}
  ...
/>
```

The ARIA separator pattern requires the widget to be focusable (`tabIndex={0}`) and to handle `ArrowLeft`/`ArrowRight` to adjust its value. Without these, `aria-orientation` is misleading and the panel width is inaccessible to keyboard users.

### Test coverage

The E2E test covers the fallback download path by deleting `showDirectoryPicker` from `window` via `addInitScript` before navigation. The File System Access happy path cannot be driven by Playwright without browser-level file-chooser instrumentation and is reasonably excluded.

The unit test for `AppearancePanel` checks that a `<canvas>` element is present. This confirms `BabylonPreview` mounts in jsdom without throwing, but does not exercise geometry parsing, texture application, or the two-effect interaction.

Not tested: the directory-save output structure (behavior entity components, client entity geometry/texture references, UUID stability across saves); the `readGeometryIdentifier` parsing and fallback; `atob` failure path; the vanilla info block rendering across the 20 mobs.

</details>

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `app/src/lib/projectFile.ts` | `readGeometryIdentifier()` helper; full BP+RP directory-save implementation; UUID fields in manifest |
| `app/src/pages/EditorPage.tsx` | `handleSave` → `saveProjectToDirectory` with error catch; resizable panel state; `handleResizeMouseDown` |
| `app/src/pages/WizardPage.tsx` | Generate all four pack UUIDs at project creation |
| `app/src/stores/projectStore.ts` | Four optional UUID fields added to `ProjectData` |
| `app/src/components/editor/ResizeHandle.tsx` | New drag-handle component (ARIA separator, mouse only) |
| `app/src/components/editor/BabylonPreview.tsx` | New Babylon.js WebGL preview; two-effect geometry/texture split; typed Bedrock interfaces |
| `app/src/components/editor/AppearancePanel.tsx` | Replace 3D placeholder with `BabylonPreview`; vanilla info block in `GeometryPanel` and `TextureSlotPanel` |
| `app/src/components/editor/AppearancePanel.spec.ts` | Update test: canvas element check instead of placeholder text |
| `app/src/data/vanilla-entities.ts` | `defaultAppearance` on `VanillaEntity`; populated for all 20 mobs |
| `app/src/i18n/locales/en.json` | `limitationNote`, `vanillaTitle`, `vanillaUseLabel`, `vanillaGeometryId`, `vanillaTexturePath` |
| `app/src/i18n/locales/ja.json` | Same keys in Japanese |
| `app/src/i18n/locales/ja-kids.json` | Same keys in kids Japanese |
| `app/package.json` | `@babylonjs/core: 9.36.0` (exact pin, `@babylonjs/loaders` removed as unused) |
| `app/e2e/mob-creation.spec.ts` | Delete `showDirectoryPicker` to force fallback in save E2E test |

Full diff: `git -C C:/Git/minecraft/minecraft-addon-creator diff master...fix/issues-v1.0.2`

</details>
