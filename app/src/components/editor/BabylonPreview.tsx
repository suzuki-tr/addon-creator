import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import {
  ArcRotateCamera,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core'

// Minimal Bedrock geometry format interfaces — cube-based preview only
interface BedrockCube {
  origin: [number, number, number]
  size: [number, number, number]
}
interface BedrockBone {
  name: string
  cubes?: BedrockCube[]
}
interface BedrockGeoEntry {
  bones?: BedrockBone[]
}
interface BedrockGeoFile {
  'minecraft:geometry'?: BedrockGeoEntry[]
  geometry?: BedrockGeoEntry[]
}

interface BabylonPreviewProps {
  geometryJson?: string | undefined
  textureUrl?: string | undefined
  vanillaShape?: 'quadruped' | 'bird' | 'humanoid' | 'fish' | 'aquatic'
}

/** Build procedural box meshes representing common vanilla entity shapes */
function buildVanillaShape(
  shape: 'quadruped' | 'bird' | 'humanoid' | 'fish' | 'aquatic',
  scene: Scene,
): void {
  switch (shape) {
    case 'humanoid': {
      // Torso
      const torso = MeshBuilder.CreateBox('torso', { width: 0.5, height: 0.75, depth: 0.25 }, scene)
      torso.position = new Vector3(0, 1.125, 0)
      // Head
      const head = MeshBuilder.CreateBox('head', { width: 0.5, height: 0.5, depth: 0.5 }, scene)
      head.position = new Vector3(0, 1.75, 0)
      // Arms
      const armL = MeshBuilder.CreateBox('arm_l', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      armL.position = new Vector3(-0.4, 1.125, 0)
      const armR = MeshBuilder.CreateBox('arm_r', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      armR.position = new Vector3(0.4, 1.125, 0)
      // Legs
      const legL = MeshBuilder.CreateBox('leg_l', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      legL.position = new Vector3(-0.15, 0.375, 0)
      const legR = MeshBuilder.CreateBox('leg_r', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      legR.position = new Vector3(0.15, 0.375, 0)
      break
    }
    case 'quadruped': {
      // Body
      const body = MeshBuilder.CreateBox('body', { width: 0.5, height: 0.6, depth: 1.0 }, scene)
      body.position = new Vector3(0, 0.8, 0)
      // Head
      const head = MeshBuilder.CreateBox('head', { width: 0.45, height: 0.45, depth: 0.45 }, scene)
      head.position = new Vector3(0, 0.95, -0.65)
      // Four legs
      const legFL = MeshBuilder.CreateBox('leg_fl', { width: 0.22, height: 0.6, depth: 0.22 }, scene)
      legFL.position = new Vector3(-0.3, 0.3, -0.25)
      const legFR = MeshBuilder.CreateBox('leg_fr', { width: 0.22, height: 0.6, depth: 0.22 }, scene)
      legFR.position = new Vector3(0.3, 0.3, -0.25)
      const legBL = MeshBuilder.CreateBox('leg_bl', { width: 0.22, height: 0.6, depth: 0.22 }, scene)
      legBL.position = new Vector3(-0.3, 0.3, 0.25)
      const legBR = MeshBuilder.CreateBox('leg_br', { width: 0.22, height: 0.6, depth: 0.22 }, scene)
      legBR.position = new Vector3(0.3, 0.3, 0.25)
      break
    }
    case 'bird': {
      // Body
      const body = MeshBuilder.CreateBox('body', { width: 0.4, height: 0.4, depth: 0.3 }, scene)
      body.position = new Vector3(0, 0.45, 0)
      // Head
      const head = MeshBuilder.CreateBox('head', { width: 0.3, height: 0.3, depth: 0.3 }, scene)
      head.position = new Vector3(0, 0.8, -0.1)
      // Wings
      const wingL = MeshBuilder.CreateBox('wing_l', { width: 0.5, height: 0.08, depth: 0.3 }, scene)
      wingL.position = new Vector3(-0.45, 0.5, 0)
      const wingR = MeshBuilder.CreateBox('wing_r', { width: 0.5, height: 0.08, depth: 0.3 }, scene)
      wingR.position = new Vector3(0.45, 0.5, 0)
      // Legs
      const legL = MeshBuilder.CreateBox('leg_l', { width: 0.08, height: 0.3, depth: 0.08 }, scene)
      legL.position = new Vector3(-0.1, 0.15, 0)
      const legR = MeshBuilder.CreateBox('leg_r', { width: 0.08, height: 0.3, depth: 0.08 }, scene)
      legR.position = new Vector3(0.1, 0.15, 0)
      break
    }
    case 'aquatic':
    case 'fish': {
      // Body
      const body = MeshBuilder.CreateBox('body', { width: 0.5, height: 0.35, depth: 1.0 }, scene)
      body.position = new Vector3(0, 0.4, 0)
      // Tail
      const tail = MeshBuilder.CreateBox('tail', { width: 0.25, height: 0.3, depth: 0.25 }, scene)
      tail.position = new Vector3(0, 0.4, 0.6)
      break
    }
  }
}

export const BabylonPreview = ({
  geometryJson,
  textureUrl,
  vanillaShape,
}: BabylonPreviewProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const materialRef = useRef<StandardMaterial | null>(null)
  const resizeRef = useRef<(() => void) | null>(null)
  // Keep textureUrl accessible inside the geometry effect without adding it to the dep array
  const textureUrlRef = useRef<string | undefined>(textureUrl)
  textureUrlRef.current = textureUrl
  // Keep vanillaShape accessible inside the geometry effect without adding it to the dep array
  const vanillaShapeRef = useRef<typeof vanillaShape>(vanillaShape)
  vanillaShapeRef.current = vanillaShape
  // Track the texture URL that was last applied so the texture-only effect can skip a redundant
  // apply immediately after the geometry effect already handled it
  const lastAppliedTextureRef = useRef<string | undefined>(undefined)

  // ── Geometry effect: full engine + scene rebuild ─────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Dispose previous engine and scene
    if (resizeRef.current) {
      window.removeEventListener('resize', resizeRef.current)
      resizeRef.current = null
    }
    engineRef.current?.dispose()
    engineRef.current = null
    sceneRef.current = null
    materialRef.current = null
    lastAppliedTextureRef.current = undefined

    let engine: Engine | null = null

    try {
      engine = new Engine(canvas, true, { preserveDrawingBuffer: true })
      const scene = new Scene(engine)
      scene.clearColor = new Color4(0.788, 0.804, 0.831, 1)

      const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 20, Vector3.Zero(), scene)
      camera.lowerRadiusLimit = 5
      camera.upperRadiusLimit = 50
      camera.attachControl(canvas, true)

      new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
      new DirectionalLight('dir', new Vector3(-1, -2, -1), scene)

      // Build geometry from Bedrock .geo.json cube data
      let meshCreated = false
      if (geometryJson) {
        try {
          const geoFile = JSON.parse(geometryJson) as BedrockGeoFile
          const geoArray = geoFile['minecraft:geometry'] ?? geoFile['geometry'] ?? []
          const geo = geoArray[0]
          if (geo?.bones) {
            for (const bone of geo.bones) {
              if (!Array.isArray(bone.cubes)) continue
              bone.cubes.forEach((cube, i) => {
                const [ox, oy, oz] = cube.origin
                const [sw, sh, sd] = cube.size
                const mesh = MeshBuilder.CreateBox(
                  `${bone.name}_${i}`,
                  { width: sw / 16, height: sh / 16, depth: sd / 16 },
                  scene,
                )
                mesh.position = new Vector3(
                  (ox + sw / 2) / 16,
                  (oy + sh / 2) / 16,
                  (oz + sd / 2) / 16,
                )
                meshCreated = true
              })
            }
          }
        } catch { /* parse failure — fall through to default box */ }
      }
      if (!meshCreated && vanillaShapeRef.current) {
        buildVanillaShape(vanillaShapeRef.current, scene)
        meshCreated = true
      }
      if (!meshCreated) {
        MeshBuilder.CreateBox('defaultBox', { size: 1 }, scene)
      }
      const mat = new StandardMaterial('mat', scene)
      materialRef.current = mat
      const currentUrl = textureUrlRef.current
      if (currentUrl) {
        mat.diffuseTexture = new Texture(currentUrl, scene)
      }
      for (const mesh of scene.meshes) mesh.material = mat
      // Record what was applied so the texture-only effect can skip a duplicate apply
      lastAppliedTextureRef.current = currentUrl

      engine.runRenderLoop(() => { scene.render() })
      engine.resize()

      const handleResize = (): void => { engineRef.current?.resize() }
      resizeRef.current = handleResize
      window.addEventListener('resize', handleResize)

      engineRef.current = engine
      sceneRef.current = scene
    } catch (err) {
      console.warn('BabylonPreview: init failed', err)
      engine?.dispose()
    }

    return () => {
      if (resizeRef.current) {
        window.removeEventListener('resize', resizeRef.current)
        resizeRef.current = null
      }
      engineRef.current?.dispose()
      engineRef.current = null
      sceneRef.current = null
      materialRef.current = null
      lastAppliedTextureRef.current = undefined
    }
  }, [geometryJson, vanillaShape])

  // ── Texture-only effect: swap diffuseTexture without rebuilding the engine ──
  useEffect(() => {
    // Skip when the geometry effect already applied this exact texture URL
    if (textureUrl === lastAppliedTextureRef.current) return

    const mat = materialRef.current
    const scene = sceneRef.current
    if (!mat || !scene) return

    mat.diffuseTexture?.dispose()
    mat.diffuseTexture = textureUrl != null ? new Texture(textureUrl, scene) : null
    lastAppliedTextureRef.current = textureUrl
  }, [textureUrl])

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}
