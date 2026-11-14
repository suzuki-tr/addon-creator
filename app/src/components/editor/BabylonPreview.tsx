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
}

export const BabylonPreview = ({
  geometryJson,
  textureUrl,
}: BabylonPreviewProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const materialRef = useRef<StandardMaterial | null>(null)
  const resizeRef = useRef<(() => void) | null>(null)
  // Keep textureUrl accessible inside the geometry effect without adding it to the dep array
  const textureUrlRef = useRef<string | undefined>(textureUrl)
  textureUrlRef.current = textureUrl
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
      if (!meshCreated) {
        MeshBuilder.CreateBox('defaultBox', { size: 1 }, scene)
      }

      // Create shared material and apply current texture via ref
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
  }, [geometryJson])

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
