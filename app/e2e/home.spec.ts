import { test, expect } from '@playwright/test'

/**
 * Pre-load localStorage with a known state so i18n and zustand are both
 * in Japanese / simple-mode regardless of the test runner's browser locale.
 *
 * addInitScript runs before the page evaluates any script, so the
 * LanguageDetector finds 'ja' in storage and zustand restores 'ja'/'simple'.
 */
function setupLocale(page: Parameters<Parameters<typeof test>[2]>[0]['page']): Promise<void> {
  return page.addInitScript(() => {
    localStorage.setItem('i18nextLng', 'ja')
    localStorage.setItem(
      'ui-store',
      JSON.stringify({ state: { locale: 'ja', mode: 'simple' }, version: 0 }),
    )
  })
}

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await setupLocale(page)
  })

  test('ホーム画面が表示される（h1 またはメインコンテンツが visible）', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('言語セレクタで「かんたん日本語」を選択しても標準レイアウトが維持される', async ({
    page,
  }) => {
    await page.goto('/')
    await page.selectOption('[aria-label="言語を選ぶ / Select language"]', 'ja-kids')

    // AppShell always uses bg-[#F9FAFB] regardless of locale (Issue 4: decouple ja-kids from layout)
    // rgb(249, 250, 251) === #F9FAFB
    const appShell = page.locator('.min-h-screen').first()
    await expect(appShell).toHaveCSS('background-color', 'rgb(249, 250, 251)')

    // Standard layout's new addon button is still visible (no separate KidsHomeLayout)
    const newAddonBtn = page
      .getByRole('button', { name: /新しいアドオンを作る|あたらしくつくる/ })
      .first()
    await expect(newAddonBtn).toBeVisible()
  })

  test('シンプル/詳細モードトグルが ja-kids 選択時にも表示される', async ({ page }) => {
    await page.goto('/')

    // Mode toggle (role="group") should be visible in default ja locale
    await expect(page.getByRole('group')).toBeVisible()

    // Switch to ja-kids — mode toggle must still be visible (Issue 4: decouple ja-kids from layout)
    await page.selectOption('[aria-label="言語を選ぶ / Select language"]', 'ja-kids')

    // Mode toggle is now rendered for all locales
    await expect(page.getByRole('group')).toBeVisible()
  })

  test('「新しいアドオンを作る」ボタンクリックで /wizard に遷移する', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /新しいアドオンを作る/ }).first().click()
    await expect(page).toHaveURL(/\/wizard/)
  })
})
