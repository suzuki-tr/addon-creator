import { test, expect } from '@playwright/test'

function setupLocale(page: Parameters<Parameters<typeof test>[2]>[0]['page']): Promise<void> {
  return page.addInitScript(() => {
    localStorage.setItem('i18nextLng', 'ja')
    localStorage.setItem(
      'ui-store',
      JSON.stringify({ state: { locale: 'ja', mode: 'simple' }, version: 0 }),
    )
  })
}

/** Navigate to wizard, select Mob on Step 1, then advance to Step 2. */
async function goToStep2(page: Parameters<Parameters<typeof test>[2]>[0]['page']): Promise<void> {
  await page.goto('/wizard')
  await page.getByRole('button', { name: /モブ/ }).click()
  await page.getByRole('button', { name: /次へ/ }).click()
}

test.describe('ウィザードページ', () => {
  test.beforeEach(async ({ page }) => {
    await setupLocale(page)
  })

  test('Step1 でアドオン種類（Mob/Block/Item）を選択できる', async ({ page }) => {
    await page.goto('/wizard')

    // All three type cards should be visible
    const mobBtn = page.getByRole('button', { name: /モブ/ })
    const blockBtn = page.getByRole('button', { name: /ブロック/ })
    const itemBtn = page.getByRole('button', { name: /アイテム/ })
    await expect(mobBtn).toBeVisible()
    await expect(blockBtn).toBeVisible()
    await expect(itemBtn).toBeVisible()

    // Click Mob — aria-pressed should become 'true'
    await mobBtn.click()
    await expect(mobBtn).toHaveAttribute('aria-pressed', 'true')

    // Switch to Block
    await blockBtn.click()
    await expect(blockBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(mobBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('Step2 で日本語のみの表示名を入力した場合 ID フィールドが空にならない（isValidId ガード確認）', async ({
    page,
  }) => {
    await goToStep2(page)

    // Enter a valid ASCII display name — toId() auto-fills the ID field
    const displayNameInput = page.getByPlaceholder('例: かっこいいモブ')
    await displayNameInput.fill('test mob')

    const idInput = page.getByPlaceholder('例: my_cool_mob')
    await expect(idInput).toHaveValue('test_mob')

    // Replace display name with Japanese-only text
    // toId('テスト') returns '' which is falsy → onChange receives only
    // { displayName } and the ID field retains the previous value
    await displayNameInput.fill('テスト')

    // ID must still be 'test_mob', not empty
    await expect(idInput).not.toHaveValue('')
    await expect(idInput).toHaveValue('test_mob')
  })

  test('Step3 で確認サマリーが表示される', async ({ page }) => {
    await goToStep2(page)

    // Fill in required fields on Step 2
    await page.getByPlaceholder('例: かっこいいモブ').fill('テストモブ')
    // ID field may need to be set manually since display name is Japanese
    await page.getByPlaceholder('例: my_cool_mob').fill('test_mob')

    // Advance to Step 3
    await page.getByRole('button', { name: /次へ/ }).click()

    // Confirm title should appear — use heading role to avoid matching the
    // WizardProgress stepper span that also carries this text
    await expect(page.getByRole('heading', { name: '確認してダウンロードしよう' })).toBeVisible()

    // Summary row should show the display name we entered
    await expect(page.getByText('テストモブ')).toBeVisible()
  })

  test('戻るボタンで前ステップに戻れる', async ({ page }) => {
    await goToStep2(page)

    // We are on Step 2 — use heading role to avoid matching the progress bar span
    await expect(page.getByRole('heading', { name: '基本情報を入力してください' })).toBeVisible()

    // Click the back button
    await page.getByRole('button', { name: /戻る/ }).click()

    // Should be back on Step 1
    await expect(page.getByRole('heading', { name: '何を作りますか？' })).toBeVisible()
  })

  test('言語を切り替えるとウィザードのラベルが変わる', async ({ page }) => {
    await page.goto('/wizard')

    // Japanese is the default — step 1 title is in Japanese
    // Use heading role to avoid matching the WizardProgress stepper span
    await expect(page.getByRole('heading', { name: '何を作りますか？' })).toBeVisible()

    // Switch to English
    await page.selectOption('[aria-label="言語を選ぶ / Select language"]', 'en')

    // Step 1 title should now be in English (wizard.step1.title in en)
    await expect(page.getByRole('heading', { name: 'What do you want to create?' })).toBeVisible()
  })
})
