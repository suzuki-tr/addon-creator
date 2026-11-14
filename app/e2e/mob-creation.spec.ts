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

/**
 * Navigate through the wizard from home → wizard step1 (Mob) → step2 (vanilla entity)
 * → step3 confirmation → editor. Leaves the browser on /editor.
 */
async function goThroughWizard(
  page: PageType,
  searchQuery: string,
  entityTestId: string,
  displayName: string,
  addonId: string,
): Promise<void> {
  await page.goto('/')
  await page.getByRole('button', { name: /新しいアドオンを作る/ }).first().click()
  await page.waitForURL('**/wizard')

  // Step 1: select Mob type
  await page.getByRole('button', { name: /モブ（生き物）/ }).click()
  await page.getByRole('button', { name: /次へ/ }).click()

  // Step 2: vanilla base option (already selected by default — click confirms/resets search)
  await page.locator('[role="radio"]').filter({ hasText: 'バニラからカスタマイズ' }).click()

  // Search and select the vanilla entity
  await page.getByPlaceholder('名前で検索...').fill(searchQuery)
  await page.getByTestId(entityTestId).click()

  // Fill display name (Japanese — won't auto-fill the ID) then fill ID manually
  await page.getByPlaceholder('例: かっこいいモブ').fill(displayName)
  await page.getByPlaceholder('例: my_cool_mob').fill(addonId)

  // Step 2 → Step 3
  await page.getByRole('button', { name: /次へ/ }).click()

  // Step 3 → Editor
  await page.getByRole('button', { name: /編集を始める/ }).click()
  await page.waitForURL('**/editor')
}

test.describe('モブ作成 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await setupLocale(page)
  })

  test('牛からカスタマイズして敵対的なモブをmcaddonダウンロード', async ({ page }) => {
    await goThroughWizard(
      page,
      '牛',
      'vanilla-entity-minecraft:cow',
      'ウシカスタム',
      'ushi_custom',
    )

    // Ensure the "敵対的" (hostile) trait is checked
    const hostileCard = page.getByRole('checkbox', { name: /敵対的/ })
    if ((await hostileCard.getAttribute('aria-checked')) !== 'true') {
      await hostileCard.click()
    }
    await expect(hostileCard).toHaveAttribute('aria-checked', 'true')

    // Download mcaddon
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /エクスポート/ }).click()
    const download: Download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.mcaddon$/)
  })

  test('ニワトリからカスタマイズして騎乗可能なモブをプロジェクト保存', async ({ page }) => {
    await goThroughWizard(
      page,
      'ニワトリ',
      'vanilla-entity-minecraft:chicken',
      'ニワトリカスタム',
      'niwatori_custom',
    )

    // Ensure the "騎乗可能" (rideable) trait is checked
    const rideableCard = page.getByRole('checkbox', { name: /騎乗可能/ })
    if ((await rideableCard.getAttribute('aria-checked')) !== 'true') {
      await rideableCard.click()
    }
    await expect(rideableCard).toHaveAttribute('aria-checked', 'true')

    // Save project as JSON file
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /保存/ }).click()
    const download: Download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('既存ニワトリプロジェクトを開いて体力最大にしてmcaddonダウンロード', async ({ page }) => {
    await page.goto('/')

    // Open an existing project file via the native file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /既存のプロジェクトを開く/ }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, 'fixtures/chicken-project.json'))

    // Wait for the app to parse the JSON and navigate to the editor
    await page.waitForURL('**/editor')

    // Click the status tab (available in simple mode)
    await page.getByRole('tab', { name: /ステータス/ }).click()

    // The fixture sets health to 4 — verify before changing
    const healthInput = page.getByRole('spinbutton', { name: /体力/ }).first()
    await expect(healthInput).toHaveValue('4')

    // Set health to max value (2048) and blur to trigger the change handler
    await healthInput.fill('2048')
    await healthInput.press('Tab')

    // Export mcaddon
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /エクスポート/ }).click()
    const download: Download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.mcaddon$/)
  })
})
