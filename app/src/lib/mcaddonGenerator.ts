import JSZip from 'jszip'
import type { ProjectData } from '@/stores/projectStore'

const NAMESPACE = 'myaddon'

/**
 * Generates a .mcaddon Blob containing behavior pack and resource pack
 * for the given project data.
 */
export async function generateMcaddon(project: ProjectData): Promise<Blob> {
  const zip = new JSZip()

  const bpUuid1 = crypto.randomUUID()
  const bpUuid2 = crypto.randomUUID()
  const rpUuid1 = crypto.randomUUID()
  const rpUuid2 = crypto.randomUUID()

  const { entityId, entityDisplayName, selectedTraits, status } = project
  const entityIdentifier = `${NAMESPACE}:${entityId}`

  // --- Behavior pack ---
  const bpManifest = {
    format_version: 2,
    header: {
      uuid: bpUuid1,
      version: [1, 0, 0],
      name: entityDisplayName,
      description: `Behavior pack for ${entityDisplayName}`,
      min_engine_version: [1, 20, 0],
    },
    modules: [{ type: 'data', uuid: bpUuid2, version: [1, 0, 0] }],
  }

  // Build entity components
  const components: Record<string, unknown> = {
    'minecraft:health': { value: status.health, max: status.health },
    'minecraft:movement': { value: status.movementSpeed },
    'minecraft:scale': { value: status.scale },
  }

  if (selectedTraits.includes('hostile')) {
    components['minecraft:attack'] = { damage: status.attackDamage }
  }

  if (selectedTraits.includes('rideable')) {
    components['minecraft:rideable'] = {
      seat_count: 1,
      seats: [
        {
          position: [0, 1.1, 0],
          min_rider_count: 0,
          max_rider_count: 1,
        },
      ],
    }
  }

  if (selectedTraits.includes('flying')) {
    components['minecraft:navigation.fly'] = {}
  }

  const entityBehavior = {
    format_version: '1.20.0',
    'minecraft:entity': {
      description: {
        identifier: entityIdentifier,
        is_spawnable: true,
        is_summonable: true,
      },
      components,
    },
  }

  // --- Resource pack ---
  const rpManifest = {
    format_version: 2,
    header: {
      uuid: rpUuid1,
      version: [1, 0, 0],
      name: `${entityDisplayName} Resources`,
      description: `Resource pack for ${entityDisplayName}`,
      min_engine_version: [1, 20, 0],
    },
    modules: [{ type: 'resources', uuid: rpUuid2, version: [1, 0, 0] }],
  }

  const entityResource = {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: entityIdentifier,
        textures: { default: `textures/entity/${entityId}` },
        geometry: { default: `geometry.${entityId}` },
        render_controllers: ['controller.render.default'],
      },
    },
  }

  const langContent = `entity.${entityIdentifier}.name=${entityDisplayName}\n`

  const bpFolder = `behavior_packs/${entityId}`
  const rpFolder = `resource_packs/${entityId}`

  zip.file(`${bpFolder}/manifest.json`, JSON.stringify(bpManifest, null, 2))
  zip.file(
    `${bpFolder}/entities/${entityId}.json`,
    JSON.stringify(entityBehavior, null, 2),
  )
  zip.file(`${rpFolder}/manifest.json`, JSON.stringify(rpManifest, null, 2))
  zip.file(
    `${rpFolder}/entity/${entityId}.entity.json`,
    JSON.stringify(entityResource, null, 2),
  )
  zip.file(`${rpFolder}/texts/en_US.lang`, langContent)

  return zip.generateAsync({ type: 'blob' })
}

/**
 * Generates a .mcaddon file and triggers a browser download.
 */
export async function downloadMcaddon(project: ProjectData): Promise<void> {
  const blob = await generateMcaddon(project)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.entityId}.mcaddon`
  a.click()
  URL.revokeObjectURL(url)
}
