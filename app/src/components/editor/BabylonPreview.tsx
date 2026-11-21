import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  VertexData,
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
// Box mesh builder — explicit VertexData UV assignment per face
// ---------------------------------------------------------------------------

/**
 * Build a Babylon.js Mesh for a single Bedrock cube using VertexData.
 *
 * Each face is constructed with 4 vertices and 2 triangles, with UV
 * coordinates assigned directly per vertex from the Minecraft UV layout.
 * This eliminates the implicit UV-direction assumptions of MeshBuilder.CreateBox
 * faceUV, so all six faces (north/south/east/west/top/bottom) render correctly
 * without any mirroring workarounds.
 *
 * Origin and size are in Bedrock pixel units (16 units = 1 Babylon world unit).
 * Vertex positions are absolute world-space coordinates; mesh.position is not set.
 *
 * Minecraft Box UV unroll (u,v = pixel offset, sx/sy/sz = cube size):
 *   east:   (u,              v+sz) size (sz, sy)
 *   south:  (u+sz,           v+sz) size (sx, sy)
 *   west:   (u+sz+sx,        v+sz) size (sz, sy)
 *   north:  (u+sz+sx+sz,     v+sz) size (sx, sy)
 *   top:    (u+sz,           v)    size (sx, sz)
 *   bottom: (u+sz+sx,        v)    size (sx, sz)
 *
 * Texture V-axis: V_babylon = 1 − py / th  (Babylon.js invertY=true default).
 * Triangle winding per face (base = faceIndex * 4):
 *   [base+0, base+1, base+3,  base+0, base+3, base+2]  (TL,TR,BR | TL,BR,BL)
 */
function buildBoxMesh(
  name: string,
  origin: [number, number, number],
  size: [number, number, number],
  uv: [number, number] | BedrockPerFaceUv | undefined,
  tw: number,
  th: number,
  scene: Scene,
): Mesh {
  const [ox, oy, oz] = origin
  const [sx, sy, sz] = size

  // Bedrock pixel units → Babylon world units (16 px = 1 unit)
  const x0 = ox / 16
  const x1 = (ox + sx) / 16
  const y0 = oy / 16
  const y1 = (oy + sy) / 16
  const z0 = oz / 16
  const z1 = (oz + sz) / 16

  // Pixel (px, py) → normalized UV.
  // Babylon.js loads textures with invertY=true: V=0 is bottom of PNG,
  // so V_babylon = 1 − py / th.
  const toUV = (px: number, py: number): [number, number] => [px / tw, 1 - py / th]

  type UVCorners = {
    tl: [number, number]
    tr: [number, number]
    bl: [number, number]
    br: [number, number]
  }

  const buildUVFaces = (): {
    south: UVCorners; north: UVCorners; east: UVCorners
    west: UVCorners; top: UVCorners; bottom: UVCorners
  } => {
    if (uv === undefined) {
      const zero: UVCorners = { tl: [0, 0], tr: [0, 0], bl: [0, 0], br: [0, 0] }
      return { south: zero, north: zero, east: zero, west: zero, top: zero, bottom: zero }
    }
    if (Array.isArray(uv)) {
      // Box UV: Minecraft unroll pattern
      const [u, v] = uv
      return {
        // south (+Z front)
        south: {
          tl: toUV(u + sz,                v + sz),
          tr: toUV(u + sz + sx,           v + sz),
          bl: toUV(u + sz,                v + sz + sy),
          br: toUV(u + sz + sx,           v + sz + sy),
        },
        // north (-Z back)
        north: {
          tl: toUV(u + sz + sx + sz,      v + sz),
          tr: toUV(u + sz + sx + sz + sx, v + sz),
          bl: toUV(u + sz + sx + sz,      v + sz + sy),
          br: toUV(u + sz + sx + sz + sx, v + sz + sy),
        },
        // east (+X right)
        east: {
          tl: toUV(u,                     v + sz),
          tr: toUV(u + sz,                v + sz),
          bl: toUV(u,                     v + sz + sy),
          br: toUV(u + sz,                v + sz + sy),
        },
        // west (-X left)
        west: {
          tl: toUV(u + sz + sx,           v + sz),
          tr: toUV(u + sz + sx + sz,      v + sz),
          bl: toUV(u + sz + sx,           v + sz + sy),
          br: toUV(u + sz + sx + sz,      v + sz + sy),
        },
        // top (+Y up)
        top: {
          tl: toUV(u + sz,                v),
          tr: toUV(u + sz + sx,           v),
          bl: toUV(u + sz,                v + sz),
          br: toUV(u + sz + sx,           v + sz),
        },
        // bottom (-Y down)
        bottom: {
          tl: toUV(u + sz + sx,           v),
          tr: toUV(u + sz,                v),
          bl: toUV(u + sz + sx,           v + sz),
          br: toUV(u + sz,                v + sz),
        },
      }
    }
    // Per-face UV: each face specifies its own uv origin + uv_size.
    // Negative uv_size means mirror: (fu+fw) < fu naturally flips the UV direction.
    const pf = uv
    const faceToCorners = (f: BedrockFaceUvEntry | undefined): UVCorners => {
      if (!f) return { tl: [0, 0], tr: [0, 0], bl: [0, 0], br: [0, 0] }
      const [fu, fv] = f.uv
      const [fw, fh] = f.uv_size
      return {
        tl: toUV(fu,      fv),
        tr: toUV(fu + fw, fv),
        bl: toUV(fu,      fv + fh),
        br: toUV(fu + fw, fv + fh),
      }
    }
    return {
      south:  faceToCorners(pf.south),
      north:  faceToCorners(pf.north),
      east:   faceToCorners(pf.east),
      west:   faceToCorners(pf.west),
      top:    faceToCorners(pf.up),
      bottom: faceToCorners(pf.down),
    }
  }

  const faces = buildUVFaces()

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const addFace = (
    tl: [number, number, number],
    tr: [number, number, number],
    bl: [number, number, number],
    br: [number, number, number],
    uvCorners: UVCorners,
    normal: [number, number, number],
  ): void => {
    const base = positions.length / 3
    positions.push(...tl, ...tr, ...bl, ...br)
    normals.push(...normal, ...normal, ...normal, ...normal)
    uvs.push(...uvCorners.tl, ...uvCorners.tr, ...uvCorners.bl, ...uvCorners.br)
    // Two triangles: [TL,TR,BR] and [TL,BR,BL] — CCW winding (front-face outward)
    indices.push(base, base + 1, base + 3, base, base + 3, base + 2)
  }

  // SOUTH (+Z): normal=(0,0,+1)
  // TL=(x0,y1,z1) TR=(x1,y1,z1) BL=(x0,y0,z1) BR=(x1,y0,z1)
  addFace([x0, y1, z1], [x1, y1, z1], [x0, y0, z1], [x1, y0, z1], faces.south, [0, 0, 1])
  // NORTH (-Z): normal=(0,0,-1)
  // TL=(x1,y1,z0) TR=(x0,y1,z0) BL=(x1,y0,z0) BR=(x0,y0,z0)
  addFace([x1, y1, z0], [x0, y1, z0], [x1, y0, z0], [x0, y0, z0], faces.north, [0, 0, -1])
  // EAST (+X): normal=(+1,0,0)
  // TL=(x1,y1,z0) TR=(x1,y1,z1) BL=(x1,y0,z0) BR=(x1,y0,z1)
  addFace([x1, y1, z0], [x1, y1, z1], [x1, y0, z0], [x1, y0, z1], faces.east, [1, 0, 0])
  // WEST (-X): normal=(-1,0,0)
  // TL=(x0,y1,z1) TR=(x0,y1,z0) BL=(x0,y0,z1) BR=(x0,y0,z0)
  addFace([x0, y1, z1], [x0, y1, z0], [x0, y0, z1], [x0, y0, z0], faces.west, [-1, 0, 0])
  // TOP (+Y): normal=(0,+1,0)
  // TL=(x0,y1,z0) TR=(x1,y1,z0) BL=(x0,y1,z1) BR=(x1,y1,z1)
  addFace([x0, y1, z0], [x1, y1, z0], [x0, y1, z1], [x1, y1, z1], faces.top, [0, 1, 0])
  // BOTTOM (-Y): normal=(0,-1,0)
  // TL=(x1,y0,z0) TR=(x0,y0,z0) BL=(x1,y0,z1) BR=(x0,y0,z1)
  addFace([x1, y0, z0], [x0, y0, z0], [x1, y0, z1], [x0, y0, z1], faces.bottom, [0, -1, 0])

  const mesh = new Mesh(name, scene)
  const vertexData = new VertexData()
  vertexData.positions = positions
  vertexData.normals = normals
  vertexData.uvs = uvs
  vertexData.indices = indices
  vertexData.applyToMesh(mesh)

  return mesh
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
                buildBoxMesh(
                  `${bone.name}_${i}`,
                  cube.origin,
                  cube.size,
                  cube.uv,
                  tw,
                  th,
                  scene,
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
