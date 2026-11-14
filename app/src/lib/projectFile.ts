import type { ProjectData } from '@/stores/projectStore'

// showDirectoryPicker is not yet fully typed in all TypeScript DOM lib versions
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
  }
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
    dirHandle = await window.showDirectoryPicker()
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

  // manifest.json (behavior pack)
  const manifest = {
    format_version: 2,
    header: {
      uuid: crypto.randomUUID(),
      version: [1, 0, 0],
      name: entityDisplayName,
      description: `Behavior pack for ${entityDisplayName}`,
      min_engine_version: [1, 20, 0],
    },
    modules: [{ type: 'data', uuid: crypto.randomUUID(), version: [1, 0, 0] }],
  }
  await writeText(dirHandle, 'manifest.json', JSON.stringify(manifest, null, 2))

  // entities/<id>.json
  const components: Record<string, unknown> = {
    'minecraft:health': { value: status.health, max: status.health },
    'minecraft:movement': { value: status.movementSpeed },
    'minecraft:scale': { value: status.scale },
  }
  if (selectedTraits.includes('hostile')) {
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

  // models/entity/<id>.geo.json
  if (project.geometry?.content) {
    const modelsDir = await dirHandle.getDirectoryHandle('models', { create: true })
    const entityModelsDir = await modelsDir.getDirectoryHandle('entity', { create: true })
    await writeText(entityModelsDir, `${entityId}.geo.json`, project.geometry.content)
  }

  // textures/entity/<id>.png
  if (project.texture?.dataUrl) {
    const dataUrl = project.texture.dataUrl
    const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] ?? '' : dataUrl
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const texturesDir = await dirHandle.getDirectoryHandle('textures', { create: true })
    const entityTexDir = await texturesDir.getDirectoryHandle('entity', { create: true })
    await writeBinary(entityTexDir, `${entityId}.png`, bytes)
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
