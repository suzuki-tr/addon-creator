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

interface BabylonPreviewProps {
  geometryJson?: string | undefined
  textureUrl?: string | undefined
}

export const BabylonPreview = ({
  geometryJson,
  textureUrl,
}: BabylonPreviewProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let engine: Engine | null = null
    let handleResize: (() => void) | null = null

    try {
      engine = new Engine(canvas, true, { preserveDrawingBuffer: true })
      const scene = new Scene(engine)
      scene.clearColor = new Color4(0.788, 0.804, 0.831, 1)

      const camera = new ArcRotateCamera(
        'cam',
        -Math.PI / 2,
        Math.PI / 3,
        20,
        Vector3.Zero(),
        scene,
      )
      camera.lowerRadiusLimit = 5
      camera.upperRadiusLimit = 50
      camera.attachControl(canvas, true)

      new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
      new DirectionalLight('dir', new Vector3(-1, -2, -1), scene)

      // Build geometry from Bedrock .geo.json cube data
      let meshCreated = false
      if (geometryJson) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geoFile = JSON.parse(geometryJson) as Record<string, any>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawGeo: unknown = geoFile['minecraft:geometry'] ?? geoFile['geometry']
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geoArray: any[] = Array.isArray(rawGeo) ? (rawGeo as any[]) : []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geo: any = geoArray[0]
          if (geo?.bones) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const bone of geo.bones as any[]) {
              if (!Array.isArray(bone.cubes)) continue
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              for (let i = 0; i < (bone.cubes as any[]).length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cube = (bone.cubes as any[])[i] as {
                  origin: [number, number, number]
                  size: [number, number, number]
                }
                const [ox, oy, oz] = cube.origin
                const [sw, sh, sd] = cube.size
                const mesh = MeshBuilder.CreateBox(
                  `${String(bone.name)}_${i}`,
                  { width: sw / 16, height: sh / 16, depth: sd / 16 },
                  scene,
                )
                mesh.position = new Vector3(
                  (ox + sw / 2) / 16,
                  (oy + sh / 2) / 16,
                  (oz + sd / 2) / 16,
                )
                meshCreated = true
              }
            }
          }
        } catch {
          // parse failure — fall through to default box
        }
      }
      if (!meshCreated) {
        MeshBuilder.CreateBox('defaultBox', { size: 1 }, scene)
      }

      if (textureUrl) {
        const mat = new StandardMaterial('mat', scene)
        mat.diffuseTexture = new Texture(textureUrl, scene)
        for (const mesh of scene.meshes) mesh.material = mat
      }

      const capturedEngine = engine
      engine.runRenderLoop(() => {
        scene.render()
      })
      capturedEngine.resize()

      handleResize = (): void => {
        capturedEngine.resize()
      }
      window.addEventListener('resize', handleResize)
    } catch (err) {
      console.warn('BabylonPreview: init failed', err)
    }

    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize)
      }
      engine?.dispose()
      engine = null
    }
  }, [geometryJson, textureUrl])

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
