export interface VanillaEntity {
  id: string
  nameJa: string
  nameJaKids: string
  nameEn: string
  icon: string
  defaultHealth: number
  defaultComponents?: {
    health?: number
    attackDamage?: number
    movementSpeed?: number
  }
  defaultAppearance?: {
    geometryId: string
    texturePath: string
  }
  shapeCategory?: 'humanoid' | 'quadruped' | 'bird' | 'fish' | 'aquatic'
  previewColor?: string
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
  { id: 'minecraft:cow', nameJa: '牛', nameJaKids: 'ウシ', nameEn: 'Cow', icon: '🐄', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 0, movementSpeed: 0.25 }, defaultAppearance: { geometryId: 'geometry.cow', texturePath: 'textures/entity/cow/cow' }, shapeCategory: 'quadruped', previewColor: '#A0A0A0' },
  { id: 'minecraft:chicken', nameJa: '鶏', nameJaKids: 'ニワトリ', nameEn: 'Chicken', icon: '🐔', defaultHealth: 4, defaultComponents: { health: 4, attackDamage: 0, movementSpeed: 0.25 }, defaultAppearance: { geometryId: 'geometry.chicken', texturePath: 'textures/entity/chicken' }, shapeCategory: 'bird', previewColor: '#F0EDD8' },
  { id: 'minecraft:pig', nameJa: 'ブタ', nameJaKids: 'ブタ', nameEn: 'Pig', icon: '🐷', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 0, movementSpeed: 0.25 }, defaultAppearance: { geometryId: 'geometry.pig', texturePath: 'textures/entity/pig/pig' }, shapeCategory: 'quadruped', previewColor: '#F0A0A0' },
  { id: 'minecraft:sheep', nameJa: 'ヒツジ', nameJaKids: 'ヒツジ', nameEn: 'Sheep', icon: '🐑', defaultHealth: 8, defaultComponents: { health: 8, attackDamage: 0, movementSpeed: 0.23 }, defaultAppearance: { geometryId: 'geometry.sheep', texturePath: 'textures/entity/sheep/sheep' }, shapeCategory: 'quadruped', previewColor: '#D8D8D8' },
  { id: 'minecraft:wolf', nameJa: 'オオカミ', nameJaKids: 'オオカミ', nameEn: 'Wolf', icon: '🐺', defaultHealth: 8, defaultComponents: { health: 8, attackDamage: 4, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.wolf', texturePath: 'textures/entity/wolf/wolf' }, shapeCategory: 'quadruped', previewColor: '#808080' },
  { id: 'minecraft:creeper', nameJa: 'クリーパー', nameJaKids: 'クリーパー', nameEn: 'Creeper', icon: '💚', defaultHealth: 20, defaultComponents: { health: 20, attackDamage: 0, movementSpeed: 0.25 }, defaultAppearance: { geometryId: 'geometry.creeper', texturePath: 'textures/entity/creeper/creeper' }, shapeCategory: 'humanoid', previewColor: '#5A8A5A' },
  { id: 'minecraft:zombie', nameJa: 'ゾンビ', nameJaKids: 'ゾンビ', nameEn: 'Zombie', icon: '🧟', defaultHealth: 20, defaultComponents: { health: 20, attackDamage: 3, movementSpeed: 0.23 }, defaultAppearance: { geometryId: 'geometry.zombie', texturePath: 'textures/entity/zombie/zombie' }, shapeCategory: 'humanoid', previewColor: '#7DA87D' },
  { id: 'minecraft:skeleton', nameJa: 'スケルトン', nameJaKids: 'スケルトン', nameEn: 'Skeleton', icon: '💀', defaultHealth: 20, defaultComponents: { health: 20, attackDamage: 2, movementSpeed: 0.25 }, defaultAppearance: { geometryId: 'geometry.skeleton.skeleton', texturePath: 'textures/entity/skeleton/skeleton' }, shapeCategory: 'humanoid', previewColor: '#E8E8E8' },
  { id: 'minecraft:spider', nameJa: 'クモ', nameJaKids: 'クモ', nameEn: 'Spider', icon: '🕷️', defaultHealth: 16, defaultComponents: { health: 16, attackDamage: 2, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.spider', texturePath: 'textures/entity/spider/spider' }, shapeCategory: 'quadruped', previewColor: '#4A3030' },
  { id: 'minecraft:enderman', nameJa: 'エンダーマン', nameJaKids: 'エンダーマン', nameEn: 'Enderman', icon: '👾', defaultHealth: 40, defaultComponents: { health: 40, attackDamage: 7, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.enderman', texturePath: 'textures/entity/enderman/enderman' }, shapeCategory: 'humanoid', previewColor: '#1A1A2E' },
  { id: 'minecraft:villager', nameJa: '村人', nameJaKids: 'むらびと', nameEn: 'Villager', icon: '👨‍🌾', defaultHealth: 20, defaultComponents: { health: 20, attackDamage: 0, movementSpeed: 0.5 }, defaultAppearance: { geometryId: 'geometry.villager.v2', texturePath: 'textures/entity/villager2/professions/farmer' }, shapeCategory: 'humanoid', previewColor: '#C8906C' },
  { id: 'minecraft:horse', nameJa: 'ウマ', nameJaKids: 'ウマ', nameEn: 'Horse', icon: '🐴', defaultHealth: 30, defaultComponents: { health: 30, attackDamage: 0, movementSpeed: 0.225 }, defaultAppearance: { geometryId: 'geometry.horse.v2', texturePath: 'textures/entity/horse2/horse_brown' }, shapeCategory: 'quadruped', previewColor: '#A06030' },
  { id: 'minecraft:cat', nameJa: 'ネコ', nameJaKids: 'ネコ', nameEn: 'Cat', icon: '🐱', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 3, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.cat', texturePath: 'textures/entity/cat/tabby' }, shapeCategory: 'quadruped', previewColor: '#F0A040' },
  { id: 'minecraft:fox', nameJa: 'キツネ', nameJaKids: 'キツネ', nameEn: 'Fox', icon: '🦊', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 2, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.fox', texturePath: 'textures/entity/fox/fox' }, shapeCategory: 'quadruped', previewColor: '#D05020' },
  { id: 'minecraft:panda', nameJa: 'パンダ', nameJaKids: 'パンダ', nameEn: 'Panda', icon: '🐼', defaultHealth: 20, defaultComponents: { health: 20, attackDamage: 2, movementSpeed: 0.15 }, defaultAppearance: { geometryId: 'geometry.panda', texturePath: 'textures/entity/panda/panda' }, shapeCategory: 'quadruped', previewColor: '#F0F0F0' },
  { id: 'minecraft:bee', nameJa: 'ハチ', nameJaKids: 'ハチ', nameEn: 'Bee', icon: '🐝', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 2, movementSpeed: 0.3 }, defaultAppearance: { geometryId: 'geometry.bee', texturePath: 'textures/entity/bee/bee' }, shapeCategory: 'bird', previewColor: '#D4A020' },
  { id: 'minecraft:axolotl', nameJa: 'ウーパールーパー', nameJaKids: 'ウーパールーパー', nameEn: 'Axolotl', icon: '🦎', defaultHealth: 14, defaultComponents: { health: 14, attackDamage: 2, movementSpeed: 0.1 }, defaultAppearance: { geometryId: 'geometry.axolotl', texturePath: 'textures/entity/axolotl/axolotl_lucy' }, shapeCategory: 'aquatic', previewColor: '#F0A0C0' },
  { id: 'minecraft:frog', nameJa: 'カエル', nameJaKids: 'カエル', nameEn: 'Frog', icon: '🐸', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 0, movementSpeed: 0.2 }, defaultAppearance: { geometryId: 'geometry.frog', texturePath: 'textures/entity/frog/temperate_frog' }, shapeCategory: 'aquatic', previewColor: '#808060' },
  { id: 'minecraft:goat', nameJa: 'ヤギ', nameJaKids: 'ヤギ', nameEn: 'Goat', icon: '🐐', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 2, movementSpeed: 0.4 }, defaultAppearance: { geometryId: 'geometry.goat', texturePath: 'textures/entity/goat/goat' }, shapeCategory: 'quadruped', previewColor: '#D8D0C0' },
  { id: 'minecraft:squid', nameJa: 'イカ', nameJaKids: 'イカ', nameEn: 'Squid', icon: '🦑', defaultHealth: 10, defaultComponents: { health: 10, attackDamage: 0, movementSpeed: 0.15 }, defaultAppearance: { geometryId: 'geometry.squid', texturePath: 'textures/entity/squid' }, shapeCategory: 'aquatic', previewColor: '#B0C0D8' },
]

export const VANILLA_ITEMS: VanillaEntity[] = [
  { id: 'minecraft:apple', nameJa: 'リンゴ', nameJaKids: 'りんご', nameEn: 'Apple', icon: '🍎', defaultHealth: 0 },
  { id: 'minecraft:diamond_sword', nameJa: 'ダイヤモンドの剣', nameJaKids: 'ダイヤモンドのけん', nameEn: 'Diamond Sword', icon: '⚔️', defaultHealth: 0 },
  { id: 'minecraft:bow', nameJa: '弓', nameJaKids: 'ゆみ', nameEn: 'Bow', icon: '🏹', defaultHealth: 0 },
  { id: 'minecraft:wooden_pickaxe', nameJa: '木のつるはし', nameJaKids: 'きのつるはし', nameEn: 'Wooden Pickaxe', icon: '⛏️', defaultHealth: 0 },
  { id: 'minecraft:bread', nameJa: 'パン', nameJaKids: 'パン', nameEn: 'Bread', icon: '🍞', defaultHealth: 0 },
  { id: 'minecraft:iron_axe', nameJa: '鉄のオノ', nameJaKids: 'てつのおの', nameEn: 'Iron Axe', icon: '🪓', defaultHealth: 0 },
  { id: 'minecraft:golden_carrot', nameJa: '金のニンジン', nameJaKids: 'きんのにんじん', nameEn: 'Golden Carrot', icon: '🥕', defaultHealth: 0 },
  { id: 'minecraft:fishing_rod', nameJa: '釣り竿', nameJaKids: 'つりざお', nameEn: 'Fishing Rod', icon: '🎣', defaultHealth: 0 },
  { id: 'minecraft:flint_and_steel', nameJa: '火打石と打ち金', nameJaKids: 'ひうちいし', nameEn: 'Flint and Steel', icon: '🔥', defaultHealth: 0 },
  { id: 'minecraft:compass', nameJa: 'コンパス', nameJaKids: 'コンパス', nameEn: 'Compass', icon: '🧭', defaultHealth: 0 },
  { id: 'minecraft:name_tag', nameJa: '名前タグ', nameJaKids: 'なまえタグ', nameEn: 'Name Tag', icon: '🏷️', defaultHealth: 0 },
  { id: 'minecraft:shears', nameJa: 'ハサミ', nameJaKids: 'はさみ', nameEn: 'Shears', icon: '✂️', defaultHealth: 0 },
]

export const VANILLA_BLOCKS: VanillaEntity[] = [
  { id: 'minecraft:stone', nameJa: '石', nameJaKids: 'いし', nameEn: 'Stone', icon: '🪨', defaultHealth: 0 },
  { id: 'minecraft:dirt', nameJa: '土', nameJaKids: 'つち', nameEn: 'Dirt', icon: '🟫', defaultHealth: 0 },
  { id: 'minecraft:grass', nameJa: '草ブロック', nameJaKids: 'くさブロック', nameEn: 'Grass Block', icon: '🌿', defaultHealth: 0 },
  { id: 'minecraft:oak_log', nameJa: 'オークの木', nameJaKids: 'オークのき', nameEn: 'Oak Log', icon: '🪵', defaultHealth: 0 },
  { id: 'minecraft:oak_planks', nameJa: 'オークの板材', nameJaKids: 'オークのいたざい', nameEn: 'Oak Planks', icon: '🪵', defaultHealth: 0 },
  { id: 'minecraft:sand', nameJa: '砂', nameJaKids: 'すな', nameEn: 'Sand', icon: '⬜', defaultHealth: 0 },
  { id: 'minecraft:gravel', nameJa: '砂利', nameJaKids: 'じゃり', nameEn: 'Gravel', icon: '⬜', defaultHealth: 0 },
  { id: 'minecraft:cobblestone', nameJa: '丸石', nameJaKids: 'まるいし', nameEn: 'Cobblestone', icon: '🪨', defaultHealth: 0 },
  { id: 'minecraft:iron_ore', nameJa: '鉄鉱石', nameJaKids: 'てつこうせき', nameEn: 'Iron Ore', icon: '⬜', defaultHealth: 0 },
  { id: 'minecraft:diamond_ore', nameJa: 'ダイヤモンド鉱石', nameJaKids: 'ダイヤモンドこうせき', nameEn: 'Diamond Ore', icon: '💎', defaultHealth: 0 },
  { id: 'minecraft:glass', nameJa: 'ガラス', nameJaKids: 'ガラス', nameEn: 'Glass', icon: '🪟', defaultHealth: 0 },
  { id: 'minecraft:bricks', nameJa: 'レンガ', nameJaKids: 'レンガ', nameEn: 'Bricks', icon: '🧱', defaultHealth: 0 },
]
