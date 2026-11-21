import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
} from '@babylonjs/core'

// ---------------------------------------------------------------------------
// Bedrock geometry format interfaces
// ---------------------------------------------------------------------------

/** Per-face UV entry in a Bedrock face-UV cube */
interface BedrockFaceUvEntry {
  uv: [number, number]
  uv_size: [number, number]
}

/** Per-face UV mapping object (face names match Bedrock JSON keys) */
interface BedrockPerFaceUv {
  north?: BedrockFaceUvEntry
  south?: BedrockFaceUvEntry
  east?: BedrockFaceUvEntry
  west?: BedrockFaceUvEntry
  up?: BedrockFaceUvEntry
  down?: BedrockFaceUvEntry
}

interface BedrockCube {
  origin: [number, number, number]
  size: [number, number, number]
  /** Box UV: [u, v] pixel offset; or Per-face UV: { north, south, east, west, up, down } */
  uv?: [number, number] | BedrockPerFaceUv
}

interface BedrockBone {
  name: string
  cubes?: BedrockCube[]
}

interface BedrockGeoEntry {
  description?: {
    texture_width?: number
    texture_height?: number
  }
  bones?: BedrockBone[]
}

interface BedrockGeoFile {
  'minecraft:geometry'?: BedrockGeoEntry[]
  geometry?: BedrockGeoEntry[]
}

// ---------------------------------------------------------------------------
// UV helpers
// ---------------------------------------------------------------------------

/**
 * Convert a pixel-space Bedrock UV region to a Babylon.js faceUV Vector4.
 *
 * Babylon.js Texture loads images with invertY=true by default, which means
 * V=0 corresponds to the bottom of the original PNG and V=1 to the top.
 * Bedrock UV coordinates use a top-left origin (py=0 is the top of the PNG,
 * py=th is the bottom), so the conversion is: V_babylon = 1 − py / th.
 *
 * faceUV Vector4(bottomLeftU, bottomLeftV, topRightU, topRightV):
 *   bottomLeft = minimum-V corner = Bedrock bottom of region (py + ph)
 *   topRight   = maximum-V corner = Bedrock top of region (py)
 *
 * Negative pw/ph (per-face mirror): handled by swapping min/max and setting a flip flag.
 */
function pixelRegionToFaceUv(
  pxRaw: number, pyRaw: number, pwRaw: number, phRaw: number,
  tw: number, th: number,
): Vector4 {
  const flipU = pwRaw < 0
  const flipV = phRaw < 0

  const minPx = flipU ? pxRaw + pwRaw : pxRaw
  const maxPx = flipU ? pxRaw : pxRaw + pwRaw
  const minPy = flipV ? pyRaw + phRaw : pyRaw
  const maxPy = flipV ? pyRaw : pyRaw + phRaw

  // Babylon V=0 at bottom of PNG → larger Bedrock py = smaller Babylon V
  const minU = minPx / tw
  const maxU = maxPx / tw
  const minV = 1 - maxPy / th   // bottom of face (Babylon min-V) ← Bedrock bottom of region
  const maxV = 1 - minPy / th   // top of face (Babylon max-V) ← Bedrock top of region

  // Flip UV if negative size (mirror the face texture)
  return new Vector4(
    flipU ? maxU : minU,  // bottomLeftU
    flipV ? maxV : minV,  // bottomLeftV
    flipU ? minU : maxU,  // topRightU
    flipV ? minV : maxV,  // topRightV
  )
}

/**
 * Compute the 6-element faceUV array for a Bedrock Box UV cube.
 *
 * Bedrock Box UV unroll pattern (sx=size[0], sy=size[1], sz=size[2]):
 *   south:  (u+sz,         v+sz),  size (sx, sy)
 *   north:  (u+sz+sx,      v+sz),  size (sx, sy)
 *   east:   (u,            v+sz),  size (sz, sy)
 *   west:   (u+sz+sx+sz,   v+sz),  size (sz, sy)
 *   top:    (u+sz,         v),     size (sx, sz)
 *   bottom: (u+sz+sx,      v),     size (sx, sz)
 *
 * Babylon.js CreateBox face order: front(south)=0, back(north)=1,
 *   right(east)=2, left(west)=3, top=4, bottom=5.
 */
function computeBoxFaceUv(
  uv: [number, number],
  size: [number, number, number],
  tw: number, th: number,
): [Vector4, Vector4, Vector4, Vector4, Vector4, Vector4] {
  const [u, v] = uv
  const [sx, sy, sz] = size
  const r = (px: number, py: number, pw: number, ph: number): Vector4 =>
    pixelRegionToFaceUv(px, py, pw, ph, tw, th)

  return [
    r(u + sz,             v + sz, sx, sy), // [0] front  = south
    r(u + sz + sx,        v + sz, sx, sy), // [1] back   = north
    r(u,                  v + sz, sz, sy), // [2] right  = east
    r(u + sz + sx + sz,   v + sz, sz, sy), // [3] left   = west
    r(u + sz,             v,      sx, sz), // [4] top
    r(u + sz + sx,        v,      sx, sz), // [5] bottom
  ]
}

/**
 * Compute the 6-element faceUV array for a Bedrock per-face UV cube.
 * Babylon face order: front(south)=0, back(north)=1, right(east)=2,
 *   left(west)=3, top=4, bottom=5.
 */
function computePerFaceFaceUv(
  perFace: BedrockPerFaceUv,
  tw: number, th: number,
): [Vector4, Vector4, Vector4, Vector4, Vector4, Vector4] {
  const ZERO: BedrockFaceUvEntry = { uv: [0, 0], uv_size: [0, 0] }
  const toV4 = (f: BedrockFaceUvEntry): Vector4 =>
    pixelRegionToFaceUv(f.uv[0], f.uv[1], f.uv_size[0], f.uv_size[1], tw, th)

  return [
    toV4(perFace.south ?? ZERO), // [0] front  = south
    toV4(perFace.north ?? ZERO), // [1] back   = north
    toV4(perFace.east  ?? ZERO), // [2] right  = east
    toV4(perFace.west  ?? ZERO), // [3] left   = west
    toV4(perFace.up    ?? ZERO), // [4] top
    toV4(perFace.down  ?? ZERO), // [5] bottom
  ]
}

// ---------------------------------------------------------------------------
// Vanilla shape builder
// ---------------------------------------------------------------------------

interface BabylonPreviewProps {
  geometryJson?: string | undefined
  textureUrl?: string | undefined
  vanillaShape?: 'quadruped' | 'bird' | 'humanoid' | 'fish' | 'aquatic'
  vanillaColor?: string | undefined
}

/** Build procedural box meshes representing common vanilla entity shapes */
function buildVanillaShape(
  shape: 'quadruped' | 'bird' | 'humanoid' | 'fish' | 'aquatic',
  scene: Scene,
): void {
  switch (shape) {
    case 'humanoid': {
      const torso = MeshBuilder.CreateBox('torso', { width: 0.5, height: 0.75, depth: 0.25 }, scene)
      torso.position = new Vector3(0, 1.125, 0)
      const head = MeshBuilder.CreateBox('head', { width: 0.5, height: 0.5, depth: 0.5 }, scene)
      head.position = new Vector3(0, 1.75, 0)
      const armL = MeshBuilder.CreateBox('arm_l', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      armL.position = new Vector3(-0.4, 1.125, 0)
      const armR = MeshBuilder.CreateBox('arm_r', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      armR.position = new Vector3(0.4, 1.125, 0)
      const legL = MeshBuilder.CreateBox('leg_l', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      legL.position = new Vector3(-0.15, 0.375, 0)
      const legR = MeshBuilder.CreateBox('leg_r', { width: 0.25, height: 0.75, depth: 0.25 }, scene)
      legR.position = new Vector3(0.15, 0.375, 0)
      break
    }
    case 'quadruped': {
      const body = MeshBuilder.CreateBox('body', { width: 0.5, height: 0.6, depth: 1.0 }, scene)
      body.position = new Vector3(0, 0.8, 0)
      const head = MeshBuilder.CreateBox('head', { width: 0.45, height: 0.45, depth: 0.45 }, scene)
      head.position = new Vector3(0, 0.95, -0.65)
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
      const body = MeshBuilder.CreateBox('body', { width: 0.4, height: 0.4, depth: 0.3 }, scene)
      body.position = new Vector3(0, 0.45, 0)
      const head = MeshBuilder.CreateBox('head', { width: 0.3, height: 0.3, depth: 0.3 }, scene)
      head.position = new Vector3(0, 0.8, -0.1)
      const wingL = MeshBuilder.CreateBox('wing_l', { width: 0.5, height: 0.08, depth: 0.3 }, scene)
      wingL.position = new Vector3(-0.45, 0.5, 0)
      const wingR = MeshBuilder.CreateBox('wing_r', { width: 0.5, height: 0.08, depth: 0.3 }, scene)
      wingR.position = new Vector3(0.45, 0.5, 0)
      const legL = MeshBuilder.CreateBox('leg_l', { width: 0.08, height: 0.3, depth: 0.08 }, scene)
      legL.position = new Vector3(-0.1, 0.15, 0)
      const legR = MeshBuilder.CreateBox('leg_r', { width: 0.08, height: 0.3, depth: 0.08 }, scene)
      legR.position = new Vector3(0.1, 0.15, 0)
      break
    }
    case 'aquatic':
    case 'fish': {
      const body = MeshBuilder.CreateBox('body', { width: 0.5, height: 0.35, depth: 1.0 }, scene)
      body.position = new Vector3(0, 0.4, 0)
      const tail = MeshBuilder.CreateBox('tail', { width: 0.25, height: 0.3, depth: 0.25 }, scene)
      tail.position = new Vector3(0, 0.4, 0.6)
      break
    }
  }
}

// ---------------------------------------------------------------------------
// BabylonPreview component
// ---------------------------------------------------------------------------

export const BabylonPreview = ({
  geometryJson,
  textureUrl,
  vanillaShape,
  vanillaColor,
}: BabylonPreviewProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const materialRef = useRef<StandardMaterial | null>(null)
  const resizeRef = useRef<(() => void) | null>(null)
  const textureUrlRef = useRef<string | undefined>(textureUrl)
  textureUrlRef.current = textureUrl
  const vanillaShapeRef = useRef<typeof vanillaShape>(vanillaShape)
  vanillaShapeRef.current = vanillaShape
  const vanillaColorRef = useRef<string | undefined>(vanillaColor)
  vanillaColorRef.current = vanillaColor
  const lastAppliedTextureRef = useRef<string | undefined>(undefined)

  // ── Geometry effect: full engine + scene rebuild ─────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

      let meshCreated = false
      if (geometryJson) {
        try {
          const geoFile = JSON.parse(geometryJson) as BedrockGeoFile
          const geoArray = geoFile['minecraft:geometry'] ?? geoFile['geometry'] ?? []
          const geo = geoArray[0]
          if (geo?.bones) {
            // Read texture dimensions from geometry description (default 64×64)
            const tw = geo.description?.texture_width ?? 64
            const th = geo.description?.texture_height ?? 64

            for (const bone of geo.bones) {
              if (!Array.isArray(bone.cubes)) continue
              bone.cubes.forEach((cube, i) => {
                const [ox, oy, oz] = cube.origin
                const [sw, sh, sd] = cube.size

                // Compute per-face UV from geometry UV data
                let faceUV: [Vector4, Vector4, Vector4, Vector4, Vector4, Vector4] | undefined
                if (cube.uv !== undefined) {
                  if (Array.isArray(cube.uv)) {
                    // Box UV format: [u, v] pixel offset
                    faceUV = computeBoxFaceUv(
                      cube.uv as [number, number],
                      [sw, sh, sd],
                      tw, th,
                    )
                  } else {
                    // Per-face UV format: { north, south, east, west, up, down }
                    faceUV = computePerFaceFaceUv(
                      cube.uv as BedrockPerFaceUv,
                      tw, th,
                    )
                  }
                }

                const mesh = MeshBuilder.CreateBox(
                  `${bone.name}_${i}`,
                  {
                    width: sw / 16,
                    height: sh / 16,
                    depth: sd / 16,
                    ...(faceUV !== undefined && { faceUV }),
                  },
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
      } else if (vanillaColorRef.current) {
        mat.diffuseColor = Color3.FromHexString(vanillaColorRef.current)
      }
      for (const mesh of scene.meshes) mesh.material = mat
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
    if (textureUrl === lastAppliedTextureRef.current) return

    const mat = materialRef.current
    const scene = sceneRef.current
    if (!mat || !scene) return

    mat.diffuseTexture?.dispose()
    if (textureUrl != null) {
      mat.diffuseTexture = new Texture(textureUrl, scene)
      mat.diffuseColor = new Color3(1, 1, 1)
    } else {
      mat.diffuseTexture = null
      if (vanillaColorRef.current) {
        mat.diffuseColor = Color3.FromHexString(vanillaColorRef.current)
      } else {
        mat.diffuseColor = new Color3(1, 1, 1)
      }
    }
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
