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

test.describe('エディタページ', () => {
  test.beforeEach(async ({ page }) => {
    await setupLocale(page)
  })

  test('/editor に遷移してエディタ画面が表示される', async ({ page }) => {
    await page.goto('/editor')

    // The editor renders a tab bar with role="tablist"
    await expect(page.getByRole('tablist')).toBeVisible()

    // "特性（トレイト）" tab (editor.tabs.traits in ja) is active by default
    await expect(page.getByRole('tab', { name: /特性/ })).toBeVisible()

    // Left sidebar and right action bar are present
    await expect(page.getByRole('button', { name: /保存/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /エクスポート/ })).toBeVisible()
  })

  test('シンプルモードではトレイトカードグリッドのみ表示（カード要素が可視）', async ({
    page,
  }) => {
    await page.goto('/editor')

    // Traits tab is active — 9 trait cards rendered as role="checkbox"
    const traitCards = page.getByRole('checkbox')
    await expect(traitCards).toHaveCount(9)

    // JSON preview panel is not rendered in simple mode
    // ("JSON プレビュー" text does not appear)
    await expect(page.getByText('JSON プレビュー')).not.toBeVisible()

    // Components / State Graph tabs are not shown in simple mode
    await expect(page.getByRole('tab', { name: /コンポーネント/ })).not.toBeVisible()
    await expect(page.getByRole('tab', { name: /状態グラフ/ })).not.toBeVisible()
  })

  test('詳細モードに切り替えると JSON プレビューパネルと追加タブが表示される', async ({
    page,
  }) => {
    await page.goto('/editor')

    // Switch to advanced mode via the mode toggle in the Header
    // (app.mode.advanced in ja = "くわしいモード")
    await page.getByRole('button', { name: 'くわしいモード' }).click()

    // JSON preview panel should now be visible (right aside)
    await expect(page.getByText('JSON プレビュー')).toBeVisible()

    // Components and State Graph tabs are added in advanced mode
    await expect(page.getByRole('tab', { name: /コンポーネント/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /状態グラフ/ })).toBeVisible()

    // Trait cards remain visible in the traits tab
    await expect(page.getByRole('checkbox')).toHaveCount(9)
  })

  test('外観タブでジオメトリ/テクスチャサブタブが切り替わる', async ({ page }) => {
    await page.goto('/editor')

    // Click the "外観" (appearance) tab — editor.tabs.appearance in ja
    await page.getByRole('tab', { name: '外観' }).click()

    // AppearancePanel renders two sub-tabs: Geometry and Texture
    const geoTab = page.getByRole('tab', { name: 'ジオメトリ' })
    const texTab = page.getByRole('tab', { name: 'テクスチャ' })
    await expect(geoTab).toBeVisible()
    await expect(texTab).toBeVisible()

    // Default sub-tab is Geometry — geometry file input should be present
    await expect(geoTab).toHaveAttribute('aria-selected', 'true')

    // Switch to the Texture sub-tab
    await texTab.click()
    await expect(texTab).toHaveAttribute('aria-selected', 'true')

    // Texture panel content: "テクスチャスロット" section title is visible
    await expect(page.getByText('テクスチャスロット')).toBeVisible()
  })

  test('状態グラフタブで SVG ノードが表示される', async ({ page }) => {
    await page.goto('/editor')

    // State graph tab only exists in advanced mode
    await page.getByRole('button', { name: 'くわしいモード' }).click()

    // Click the "状態グラフ" tab (editor.tabs.stateGraph in ja)
    await page.getByRole('tab', { name: '状態グラフ' }).click()

    // The active tab panel hosts the StateGraph component with an SVG canvas
    const tabPanel = page.locator('#tabpanel-stateGraph')
    await expect(tabPanel).toBeVisible()

    const svg = tabPanel.locator('svg').last()
    await expect(svg).toBeVisible()

    // StateGraph renders 5 state nodes (idle, walk, attack, hurt, death)
    // each represented by a <rect> inside the SVG
    await expect(tabPanel.locator('svg rect')).toHaveCount(5)
  })
})
