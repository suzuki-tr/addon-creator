import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import type { Download } from '@playwright/test'

// ESM-compatible __dirname (package.json has "type": "module")
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type PageType = Parameters<Parameters<typeof test>[2]>[0]['page']

function setupLocale(page: PageType): Promise<void> {
  return page.addInitScript(() => {
    localStorage.setItem('i18nextLng', 'ja')
    localStorage.setItem(
      'ui-store',
      JSON.stringify({ state: { locale: 'ja', mode: 'simple' }, version: 0 }),
    )
  })
}

test.describe('フルフロー E2E: 新規モブ作成', () => {
  test.beforeEach(async ({ page }) => {
    await setupLocale(page)
  })

  test('牛をベースに敵対的モブを作成してジオメトリ/テクスチャをロードしmcaddonをエクスポート', async ({
    page,
  }) => {
    // ── Step 1: Home → Wizard ─────────────────────────────────────────────
    await page.goto('/')
    await page.getByRole('button', { name: /新しいアドオンを作る/ }).first().click()
    await page.waitForURL('**/wizard')

    // ── Step 1 of wizard: select Mob ─────────────────────────────────────
    await page.getByRole('button', { name: /モブ（生き物）/ }).click()
    await page.getByRole('button', { name: /次へ/ }).click()

    // ── Step 2: vanilla cow ──────────────────────────────────────────────
    // Vanilla is selected by default; search for 牛 and select minecraft:cow
    await page.getByPlaceholder('名前で検索...').fill('牛')
    await page.getByTestId('vanilla-entity-minecraft:cow').click()

    // Fill display name and addon ID
    await page.getByPlaceholder('例: かっこいいモブ').fill('テスト牛')
    await page.getByPlaceholder('例: my_cool_mob').fill('test_cow')

    await page.getByRole('button', { name: /次へ/ }).click()

    // ── Step 3: confirm ──────────────────────────────────────────────────
    await expect(page.getByRole('heading', { name: '確認して編集を始めよう' })).toBeVisible()
    await page.getByRole('button', { name: /編集を始める/ }).click()
    await page.waitForURL('**/editor')

    // ── Editor: switch to advanced mode ──────────────────────────────────
    await page.getByRole('button', { name: 'くわしい' }).click()

    // ── Traits tab: toggle Hostile ────────────────────────────────────────
    const hostileCard = page.getByRole('checkbox', { name: /敵対的/ })
    await expect(hostileCard).toBeVisible()
    await hostileCard.click()
    await expect(hostileCard).toHaveAttribute('aria-checked', 'true')

    // ── JSON preview should contain hostile component keys ────────────────
    const preEl = page.locator('pre').first()
    await expect(preEl).toContainText('minecraft:attack')

    // ── Components tab: set health to 50 ──────────────────────────────────
    await page.getByRole('tab', { name: /コンポーネント/ }).click()

    // minecraft:health accordion is expanded by default
    const rangeInput = page.locator('input[type="range"]').first()
    await expect(rangeInput).toBeVisible()
    await rangeInput.fill('50')
    await expect(rangeInput).toHaveValue('50')

    // ── Appearance tab → Geometry sub-tab ────────────────────────────────
    await page.getByRole('tab', { name: '外観' }).click()

    // Geometry sub-tab is active by default; upload geometry fixture
    const geoInput = page.locator('[data-testid="geometry-file-input"]')
    await geoInput.setInputFiles(
      path.join(__dirname, 'fixtures', 'cow-geometry.geo.json'),
    )

    // ── Appearance tab → Texture sub-tab ─────────────────────────────────
    await page.getByRole('tab', { name: 'テクスチャ' }).click()

    const texInput = page.locator('[data-testid="texture-file-input"]')
    await texInput.setInputFiles(
      path.join(__dirname, 'fixtures', 'cow-texture.png'),
    )

    // ── Export mcaddon ────────────────────────────────────────────────────
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /エクスポート/ }).click()
    const dl: Download = await downloadPromise
    expect(dl.suggestedFilename()).toMatch(/\.mcaddon$/)
  })
})
