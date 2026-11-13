/**
 * Pure utility functions for Bedrock Edition loot table JSON generation.
 * Extracted from LootTableEditor for independent testing.
 */

export interface LootPoolEntry {
  type: string
  name: string
  weight: number
  count: number
}

export interface LootPool {
  rollsMin: number
  rollsMax: number
  entries: LootPoolEntry[]
}

/**
 * Returns the sum of all entry weights in a pool.
 */
export function totalWeight(entries: Array<{ weight: number }>): number {
  return entries.reduce((sum, e) => sum + e.weight, 0)
}

/**
 * Returns the drop probability of a single entry as a percentage (0–100).
 * Returns 0 when total is 0 to avoid division by zero.
 */
export function entryProbability(entryWeight: number, total: number): number {
  if (total === 0) return 0
  return (entryWeight / total) * 100
}

/**
 * Builds a Bedrock Edition loot table JSON object from an array of pools.
 */
export function buildLootTableJson(pools: LootPool[]): Record<string, unknown> {
  return {
    pools: pools.map((pool) => ({
      rolls: { min: pool.rollsMin, max: pool.rollsMax },
      entries: pool.entries.map((entry) => ({
        type: entry.type,
        name: entry.name,
        weight: entry.weight,
        functions: [{ function: 'set_count', count: entry.count }],
      })),
    })),
  }
}
