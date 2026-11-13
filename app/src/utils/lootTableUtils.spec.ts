import { describe, it, expect } from 'vitest'
import {
  totalWeight,
  entryProbability,
  buildLootTableJson,
  type LootPool,
} from './lootTableUtils'

describe('totalWeight', () => {
  it('sums weights for three entries (1+2+3 = 6)', () => {
    expect(totalWeight([{ weight: 1 }, { weight: 2 }, { weight: 3 }])).toBe(6)
  })

  it('returns 0 for an empty array', () => {
    expect(totalWeight([])).toBe(0)
  })

  it('returns single entry weight when array has one element', () => {
    expect(totalWeight([{ weight: 10 }])).toBe(10)
  })

  it('handles equal weights correctly', () => {
    expect(totalWeight([{ weight: 5 }, { weight: 5 }])).toBe(10)
  })
})

describe('entryProbability', () => {
  it('returns ~33.33% for weight 2 out of total 6', () => {
    expect(entryProbability(2, 6)).toBeCloseTo(33.33, 2)
  })

  it('returns 100% when entry weight equals total', () => {
    expect(entryProbability(5, 5)).toBeCloseTo(100, 2)
  })

  it('returns 0 when total is 0 (avoids division by zero)', () => {
    expect(entryProbability(0, 0)).toBe(0)
  })

  it('returns 50% for weight 1 out of total 2', () => {
    expect(entryProbability(1, 2)).toBeCloseTo(50, 2)
  })

  it('returns 25% for weight 1 out of total 4', () => {
    expect(entryProbability(1, 4)).toBeCloseTo(25, 2)
  })
})

describe('buildLootTableJson', () => {
  const singlePool: LootPool[] = [
    {
      rollsMin: 1,
      rollsMax: 2,
      entries: [{ type: 'item', name: 'minecraft:stone', weight: 1, count: 1 }],
    },
  ]

  it('output has pools array', () => {
    const result = buildLootTableJson(singlePool)
    expect(result).toHaveProperty('pools')
    expect(Array.isArray(result.pools)).toBe(true)
  })

  it('pool has rolls field', () => {
    const result = buildLootTableJson(singlePool)
    const pools = result.pools as Array<Record<string, unknown>>
    expect(pools[0]).toHaveProperty('rolls')
  })

  it('pool has entries field', () => {
    const result = buildLootTableJson(singlePool)
    const pools = result.pools as Array<Record<string, unknown>>
    expect(pools[0]).toHaveProperty('entries')
  })

  it('pool count matches input', () => {
    const twoPools: LootPool[] = [
      { rollsMin: 1, rollsMax: 1, entries: [{ type: 'item', name: 'a:b', weight: 1, count: 1 }] },
      { rollsMin: 2, rollsMax: 3, entries: [{ type: 'item', name: 'c:d', weight: 2, count: 2 }] },
    ]
    const result = buildLootTableJson(twoPools)
    const pools = result.pools as unknown[]
    expect(pools.length).toBe(2)
  })

  it('rolls min/max are preserved', () => {
    const result = buildLootTableJson(singlePool)
    const pools = result.pools as Array<Record<string, unknown>>
    const rolls = pools[0].rolls as Record<string, unknown>
    expect(rolls.min).toBe(1)
    expect(rolls.max).toBe(2)
  })

  it('handles empty pools array', () => {
    const result = buildLootTableJson([])
    const pools = result.pools as unknown[]
    expect(pools.length).toBe(0)
  })
})
