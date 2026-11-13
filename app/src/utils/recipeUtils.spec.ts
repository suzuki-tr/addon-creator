import { describe, it, expect } from 'vitest'
import {
  isValidItemId,
  buildShapedRecipeJson,
  buildFurnaceRecipeJson,
} from './recipeUtils'

describe('isValidItemId', () => {
  it("accepts 'minecraft:planks'", () => {
    expect(isValidItemId('minecraft:planks')).toBe(true)
  })

  it("accepts custom 'my_mod:cool_item'", () => {
    expect(isValidItemId('my_mod:cool_item')).toBe(true)
  })

  it("accepts 'a:b' (minimal valid id)", () => {
    expect(isValidItemId('a:b')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidItemId('')).toBe(false)
  })

  it("rejects 'no_namespace' (no colon)", () => {
    expect(isValidItemId('no_namespace')).toBe(false)
  })

  it("rejects 'a:b:c' (two colons)", () => {
    expect(isValidItemId('a:b:c')).toBe(false)
  })

  it('rejects uppercase letters', () => {
    expect(isValidItemId('Minecraft:planks')).toBe(false)
  })

  it('rejects ids with spaces', () => {
    expect(isValidItemId('mine craft:planks')).toBe(false)
  })

  it('rejects ids starting with colon', () => {
    expect(isValidItemId(':planks')).toBe(false)
  })

  it('rejects ids ending with colon', () => {
    expect(isValidItemId('minecraft:')).toBe(false)
  })
})

describe('buildShapedRecipeJson', () => {
  const emptySlots = Array.from({ length: 9 }, () => '')

  it('output has format_version field', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    expect(result).toHaveProperty('format_version')
  })

  it('output has minecraft:recipe_shaped field', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    expect(result).toHaveProperty('minecraft:recipe_shaped')
  })

  it('shaped recipe has pattern field', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    expect(shaped).toHaveProperty('pattern')
  })

  it('shaped recipe has key field', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    expect(shaped).toHaveProperty('key')
  })

  it('shaped recipe has result field', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    expect(shaped).toHaveProperty('result')
  })

  it('pattern is an array of 3 rows', () => {
    const result = buildShapedRecipeJson(emptySlots, [], '', 1)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    expect(Array.isArray(shaped.pattern)).toBe(true)
    expect((shaped.pattern as unknown[]).length).toBe(3)
  })

  it('result count matches argument', () => {
    const result = buildShapedRecipeJson(emptySlots, [], 'minecraft:planks', 4)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    const res = shaped.result as Record<string, unknown>
    expect(res.count).toBe(4)
  })

  it('key map contains provided letter', () => {
    const keys = [{ letter: 'W', itemId: 'minecraft:planks' }]
    const result = buildShapedRecipeJson(emptySlots, keys, '', 1)
    const shaped = result['minecraft:recipe_shaped'] as Record<string, unknown>
    const keyMap = shaped.key as Record<string, unknown>
    expect(keyMap).toHaveProperty('W')
  })
})

describe('buildFurnaceRecipeJson', () => {
  it('output has format_version field', () => {
    const result = buildFurnaceRecipeJson('minecraft:raw_iron', 'minecraft:iron_ingot', 200, 0.7)
    expect(result).toHaveProperty('format_version')
  })

  it('output has minecraft:recipe_furnace field', () => {
    const result = buildFurnaceRecipeJson('minecraft:raw_iron', 'minecraft:iron_ingot', 200, 0.7)
    expect(result).toHaveProperty('minecraft:recipe_furnace')
  })

  it('furnace recipe has correct input item', () => {
    const result = buildFurnaceRecipeJson('minecraft:raw_iron', 'minecraft:iron_ingot', 200, 0.7)
    const furnace = result['minecraft:recipe_furnace'] as Record<string, unknown>
    expect(furnace.input).toBe('minecraft:raw_iron')
  })

  it('furnace recipe has correct output item', () => {
    const result = buildFurnaceRecipeJson('minecraft:raw_iron', 'minecraft:iron_ingot', 200, 0.7)
    const furnace = result['minecraft:recipe_furnace'] as Record<string, unknown>
    expect(furnace.output).toBe('minecraft:iron_ingot')
  })

  it('furnace recipe has tags field', () => {
    const result = buildFurnaceRecipeJson('minecraft:raw_iron', 'minecraft:iron_ingot', 200, 0.7)
    const furnace = result['minecraft:recipe_furnace'] as Record<string, unknown>
    expect(furnace).toHaveProperty('tags')
  })

  it('furnace recipe preserves cookTime', () => {
    const result = buildFurnaceRecipeJson('a:b', 'c:d', 300, 0.5)
    const furnace = result['minecraft:recipe_furnace'] as Record<string, unknown>
    expect(furnace.cookTime).toBe(300)
  })

  it('furnace recipe preserves experience', () => {
    const result = buildFurnaceRecipeJson('a:b', 'c:d', 200, 1.5)
    const furnace = result['minecraft:recipe_furnace'] as Record<string, unknown>
    expect(furnace.experience).toBe(1.5)
  })
})
