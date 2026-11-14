export interface VanillaEntity {
  id: string
  nameJa: string
  nameJaKids: string
  nameEn: string
  icon: string
  defaultHealth: number
}

/** Returns true if the entity matches the given search query (case-insensitive). */
export function matchesSearch(entity: VanillaEntity, query: string): boolean {
  const q = query.toLowerCase()
  return (
    entity.nameJa.includes(q) ||
    entity.nameJaKids.toLowerCase().includes(q) ||
    entity.nameEn.toLowerCase().includes(q) ||
    entity.id.toLowerCase().includes(q)
  )
}

export const VANILLA_MOBS: VanillaEntity[] = [
  { id: 'minecraft:cow', nameJa: '牛', nameJaKids: 'ウシ', nameEn: 'Cow', icon: '🐄', defaultHealth: 10 },
  { id: 'minecraft:chicken', nameJa: '鶏', nameJaKids: 'ニワトリ', nameEn: 'Chicken', icon: '🐔', defaultHealth: 4 },
  { id: 'minecraft:pig', nameJa: 'ブタ', nameJaKids: 'ブタ', nameEn: 'Pig', icon: '🐷', defaultHealth: 10 },
  { id: 'minecraft:sheep', nameJa: 'ヒツジ', nameJaKids: 'ヒツジ', nameEn: 'Sheep', icon: '🐑', defaultHealth: 8 },
  { id: 'minecraft:wolf', nameJa: 'オオカミ', nameJaKids: 'オオカミ', nameEn: 'Wolf', icon: '🐺', defaultHealth: 8 },
  { id: 'minecraft:creeper', nameJa: 'クリーパー', nameJaKids: 'クリーパー', nameEn: 'Creeper', icon: '💚', defaultHealth: 20 },
  { id: 'minecraft:zombie', nameJa: 'ゾンビ', nameJaKids: 'ゾンビ', nameEn: 'Zombie', icon: '🧟', defaultHealth: 20 },
  { id: 'minecraft:skeleton', nameJa: 'スケルトン', nameJaKids: 'スケルトン', nameEn: 'Skeleton', icon: '💀', defaultHealth: 20 },
  { id: 'minecraft:spider', nameJa: 'クモ', nameJaKids: 'クモ', nameEn: 'Spider', icon: '🕷️', defaultHealth: 16 },
  { id: 'minecraft:enderman', nameJa: 'エンダーマン', nameJaKids: 'エンダーマン', nameEn: 'Enderman', icon: '👾', defaultHealth: 40 },
  { id: 'minecraft:villager', nameJa: '村人', nameJaKids: 'むらびと', nameEn: 'Villager', icon: '👨‍🌾', defaultHealth: 20 },
  { id: 'minecraft:horse', nameJa: 'ウマ', nameJaKids: 'ウマ', nameEn: 'Horse', icon: '🐴', defaultHealth: 30 },
  { id: 'minecraft:cat', nameJa: 'ネコ', nameJaKids: 'ネコ', nameEn: 'Cat', icon: '🐱', defaultHealth: 10 },
  { id: 'minecraft:fox', nameJa: 'キツネ', nameJaKids: 'キツネ', nameEn: 'Fox', icon: '🦊', defaultHealth: 10 },
  { id: 'minecraft:panda', nameJa: 'パンダ', nameJaKids: 'パンダ', nameEn: 'Panda', icon: '🐼', defaultHealth: 20 },
  { id: 'minecraft:bee', nameJa: 'ハチ', nameJaKids: 'ハチ', nameEn: 'Bee', icon: '🐝', defaultHealth: 10 },
  { id: 'minecraft:axolotl', nameJa: 'ウーパールーパー', nameJaKids: 'ウーパールーパー', nameEn: 'Axolotl', icon: '🦎', defaultHealth: 14 },
  { id: 'minecraft:frog', nameJa: 'カエル', nameJaKids: 'カエル', nameEn: 'Frog', icon: '🐸', defaultHealth: 10 },
  { id: 'minecraft:goat', nameJa: 'ヤギ', nameJaKids: 'ヤギ', nameEn: 'Goat', icon: '🐐', defaultHealth: 10 },
  { id: 'minecraft:squid', nameJa: 'イカ', nameJaKids: 'イカ', nameEn: 'Squid', icon: '🦑', defaultHealth: 10 },
]
