import type { ProjectData } from '@/stores/projectStore'

// showDirectoryPicker is not yet fully typed in all TypeScript DOM lib versions
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
  }
}

/** Minimal Bedrock geometry format for reading the description.identifier field */
interface GeoIdentifierEntry {
  description?: { identifier?: string }
}
interface GeoIdentifierFile {
  'minecraft:geometry'?: GeoIdentifierEntry[]
  geometry?: GeoIdentifierEntry[]
}

/**
 * Reads the first geometry identifier from a Bedrock .geo.json string.
 * Falls back to `geometry.<entityId>` when the file cannot be parsed.
 */
function readGeometryIdentifier(content: string, fallback: string): string {
  try {
    const geoFile = JSON.parse(content) as GeoIdentifierFile
    const geoArray = geoFile['minecraft:geometry'] ?? geoFile['geometry'] ?? []
    const identifier = geoArray[0]?.description?.identifier
    if (typeof identifier === 'string' && identifier.startsWith('geometry.')) {
      return identifier
    }
  } catch { /* fall through */ }
  return fallback
}

/**
 * Serialises the project to a JSON file and triggers a browser download.
 */
export function saveProjectFile(project: ProjectData): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.entityId}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Saves project files to a user-selected directory using the File System
 * Access API. Falls back to a single-file download when the API is not
 * available (e.g. Firefox, non-secure contexts).
 */
export async function saveProjectToDirectory(project: ProjectData): Promise<void> {
  if (!('showDirectoryPicker' in window)) {
    saveProjectFile(project)
    return
  }

  let dirHandle: FileSystemDirectoryHandle
  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
  } catch {
    return // user cancelled
  }

  async function writeText(
    dir: FileSystemDirectoryHandle,
    name: string,
    content: string,
  ): Promise<void> {
    const fh = await dir.getFileHandle(name, { create: true })
    const w = await fh.createWritable()
    await w.write(content)
    await w.close()
  }

  async function writeBinary(
    dir: FileSystemDirectoryHandle,
    name: string,
    data: Uint8Array,
  ): Promise<void> {
    const fh = await dir.getFileHandle(name, { create: true })
    const w = await fh.createWritable()
    await w.write(data.buffer as ArrayBuffer)
    await w.close()
  }

  const { entityId, entityDisplayName, selectedTraits, status } = project
  const NAMESPACE = 'myaddon'
  const entityIdentifier = `${NAMESPACE}:${entityId}`

  // project.json — full project state
  await writeText(dirHandle, 'project.json', JSON.stringify(project, null, 2))

  // ── Behavior pack (root directory) ───────────────────────────────────────

  // manifest.json (behavior pack)
  // UUIDs are read from ProjectData so iterative saves keep the same pack identity in Minecraft
  const manifest = {
    format_version: 2,
    header: {
      uuid: project.manifestUuid ?? crypto.randomUUID(),
      version: [1, 0, 0],
      name: entityDisplayName,
      description: `Behavior pack for ${entityDisplayName}`,
      min_engine_version: [1, 20, 0],
    },
    modules: [{ type: 'data', uuid: project.moduleUuid ?? crypto.randomUUID(), version: [1, 0, 0] }],
  }
  await writeText(dirHandle, 'manifest.json', JSON.stringify(manifest, null, 2))

  // entities/<id>.json
  const components: Record<string, unknown> = {
    'minecraft:health': { value: status.health, max: status.health },
    'minecraft:movement': { value: status.movementSpeed },
    'minecraft:scale': { value: status.scale },
  }
  if (selectedTraits.includes('hostile')) {
    // AI-goal components are required for the mob to actually target and pursue players
    components['minecraft:behavior.nearest_attackable_target'] = {
      entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'player' }, max_dist: 16 }],
    }
    components['minecraft:behavior.hurt_by_target'] = {}
    components['minecraft:attack'] = { damage: status.attackDamage }
  }
  if (selectedTraits.includes('rideable')) {
    components['minecraft:rideable'] = { seat_count: 1, seats: [{ position: [0, 1.1, 0] }] }
  }
  if (selectedTraits.includes('flying')) {
    components['minecraft:navigation.fly'] = {}
  }
  if (selectedTraits.includes('undead')) {
    components['minecraft:burn_in_daylight'] = { value: true }
  }
  if (selectedTraits.includes('aquatic')) {
    components['minecraft:underwater_movement'] = { value: 0.06 }
  }
  if (selectedTraits.includes('boss')) {
    components['minecraft:boss'] = { should_darken_sky: false, hud_range: 55 }
  }
  if (selectedTraits.includes('tameable')) {
    components['minecraft:tameable'] = { probability: 0.33, tame_items: 'bone' }
  }
  if (selectedTraits.includes('breedable')) {
    components['minecraft:breedable'] = { require_tame: false }
  }

  const entityBehavior = {
    format_version: '1.20.0',
    'minecraft:entity': {
      description: { identifier: entityIdentifier, is_spawnable: true, is_summonable: true },
      components,
    },
  }
  const entitiesDir = await dirHandle.getDirectoryHandle('entities', { create: true })
  await writeText(entitiesDir, `${entityId}.json`, JSON.stringify(entityBehavior, null, 2))

  // ── Resource pack (resource_pack/ subdirectory) ───────────────────────────
  // Geometry and texture files are placed here with a manifest and client-entity
  // definition so the game can load them. Without this, assets on disk are ignored.

  const rpDir = await dirHandle.getDirectoryHandle('resource_pack', { create: true })

  const rpManifest = {
    format_version: 2,
    header: {
      uuid: project.rpManifestUuid ?? crypto.randomUUID(),
      version: [1, 0, 0],
      name: `${entityDisplayName} Resource Pack`,
      description: `Resource pack for ${entityDisplayName}`,
      min_engine_version: [1, 20, 0],
    },
    modules: [{ type: 'resources', uuid: project.rpModuleUuid ?? crypto.randomUUID(), version: [1, 0, 0] }],
  }
  await writeText(rpDir, 'manifest.json', JSON.stringify(rpManifest, null, 2))

  // Client entity definition — wires geometry and texture to the entity identifier.
  // Read the actual geometry identifier from the uploaded .geo.json so Minecraft can resolve it;
  // fall back to geometry.<entityId> when no custom geometry is loaded.
  const geometryRef = project.geometry?.content
    ? readGeometryIdentifier(project.geometry.content, `geometry.${entityId}`)
    : `geometry.${entityId}`

  const entityClient = {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: entityIdentifier,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${entityId}` },
        geometry: { default: geometryRef },
        render_controllers: ['controller.render.default'],
      },
    },
  }
  const rpEntityDir = await rpDir.getDirectoryHandle('entity', { create: true })
  await writeText(rpEntityDir, `${entityId}.entity.json`, JSON.stringify(entityClient, null, 2))

  // models/entity/<id>.geo.json → resource pack
  if (project.geometry?.content) {
    const rpModelsDir = await rpDir.getDirectoryHandle('models', { create: true })
    const rpEntityModelsDir = await rpModelsDir.getDirectoryHandle('entity', { create: true })
    await writeText(rpEntityModelsDir, `${entityId}.geo.json`, project.geometry.content)
  }

  // textures/entity/<id>.png → resource pack
  if (project.texture?.dataUrl) {
    const dataUrl = project.texture.dataUrl
    const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] ?? '' : dataUrl
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const rpTexturesDir = await rpDir.getDirectoryHandle('textures', { create: true })
    const rpEntityTexDir = await rpTexturesDir.getDirectoryHandle('entity', { create: true })
    await writeBinary(rpEntityTexDir, `${entityId}.png`, bytes)
  }
}

/**
 * Reads a .json project file from the user's filesystem and parses it
 * as ProjectData. Rejects on FileReader error.
 */
export async function loadProjectFile(file: File): Promise<ProjectData> {
  return new Promise<ProjectData>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e): void => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text) as ProjectData
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (): void => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
