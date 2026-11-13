/**
 * Pure utility functions for Bedrock Edition recipe JSON generation.
 * Extracted from RecipeEditor for independent testing.
 */

/**
 * Returns true when id matches the Bedrock 'namespace:name' format.
 * Both namespace and name may contain lowercase letters, digits, and underscores.
 * Exactly one colon is required.
 */
export function isValidItemId(id: string): boolean {
  return /^[a-z0-9_]+:[a-z0-9_]+$/.test(id)
}

/**
 * Builds a Bedrock Edition shaped crafting recipe JSON object.
 *
 * @param slots  9 slot values (index 0-8, row-major). Empty string = empty slot.
 * @param keys   Array of letter ↔ item-id mappings.
 * @param resultItem  Item ID of the crafting result.
 * @param resultCount Stack size of the crafting result.
 */
export function buildShapedRecipeJson(
  slots: string[],
  keys: Array<{ letter: string; itemId: string }>,
  resultItem: string,
  resultCount: number,
): Record<string, unknown> {
  const pattern = [
    slots.slice(0, 3).map((s) => s || ' ').join(''),
    slots.slice(3, 6).map((s) => s || ' ').join(''),
    slots.slice(6, 9).map((s) => s || ' ').join(''),
  ]
  const keyMap: Record<string, Record<string, string>> = {}
  for (const k of keys) {
    if (k.letter) {
      keyMap[k.letter] = { item: k.itemId }
    }
  }
  return {
    format_version: '1.20.0',
    'minecraft:recipe_shaped': {
      description: { identifier: 'minecraft:recipe_shaped' },
      pattern,
      key: keyMap,
      result: { item: resultItem, count: resultCount },
    },
  }
}

/**
 * Builds a Bedrock Edition furnace recipe JSON object.
 *
 * @param input      Item ID of the ingredient.
 * @param output     Item ID of the smelting result.
 * @param cookTime   Ticks to smelt (200 = 10 seconds).
 * @param experience Experience points awarded on completion.
 */
export function buildFurnaceRecipeJson(
  input: string,
  output: string,
  cookTime: number,
  experience: number,
): Record<string, unknown> {
  return {
    format_version: '1.20.0',
    'minecraft:recipe_furnace': {
      description: { identifier: 'minecraft:recipe_furnace' },
      input,
      output,
      tags: ['furnace'],
      cookTime,
      experience,
    },
  }
}
