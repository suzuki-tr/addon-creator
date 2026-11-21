import type { JSX } from 'react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { VANILLA_MOBS } from '@/data/vanilla-entities'
import { BabylonPreview } from '@/components/editor/BabylonPreview'

type AppearanceSubTab = 'geometry' | 'texture' | 'material'

interface BoneItem {
  id: string
  label: string
  icon: string
  depth: number
  children?: BoneItem[]
}

const BONE_TREE: BoneItem[] = [
  {
    id: 'body',
    label: 'body',
    icon: '📦',
    depth: 0,
    children: [
      { id: 'head', label: 'head', icon: '📦', depth: 1 },
      { id: 'arm_left', label: 'arm_left', icon: '🦴', depth: 1 },
      { id: 'arm_right', label: 'arm_right', icon: '🦴', depth: 1 },
      {
        id: 'legs',
        label: 'legs',
        icon: '📦',
        depth: 1,
        children: [
          { id: 'leg_left', label: 'leg_left', icon: '🦴', depth: 2 },
          { id: 'leg_right', label: 'leg_right', icon: '🦴', depth: 2 },
        ],
      },
    ],
  },
]

const flattenBones = (items: BoneItem[]): BoneItem[] => {
  const result: BoneItem[] = []
  for (const item of items) {
    result.push(item)
    if (item.children) result.push(...flattenBones(item.children))
  }
  return result
}

const ATTACHMENT_POINTS = ['rightHand', 'leftHand', 'mouth']

/** Checkerboard CSS pattern for texture slot thumbnail */
const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%),' +
    'linear-gradient(-45deg, #ccc 25%, transparent 25%),' +
    'linear-gradient(45deg, transparent 75%, #ccc 75%),' +
    'linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  backgroundColor: '#f0f0f0',
}

interface TextureSlot {
  id: string
  name: string
  path: string
}

const TEXTURE_SLOTS: TextureSlot[] = [
  { id: 'default', name: 'default', path: 'textures/entity/my_mob.png' },
  { id: 'damage', name: 'damage', path: 'textures/entity/my_mob_hurt.png' },
]

interface TextureVariant {
  id: string
  description: string
  slot: string
}

const TEXTURE_VARIANTS: TextureVariant[] = [
  { id: 'variant_1', description: '通常の見た目', slot: 'default' },
  { id: 'variant_2', description: 'ダメージを受けた見た目', slot: 'damage' },
]


// ---------------------------------------------------------------------------
// Bedrock geometry UV parser (used to drive the UV map display)
// ---------------------------------------------------------------------------

interface _BedrockFaceEntry {
  uv: [number, number]
  uv_size: [number, number]
}

interface _BedrockPerFaceUv {
  north?: _BedrockFaceEntry
  south?: _BedrockFaceEntry
  east?: _BedrockFaceEntry
  west?: _BedrockFaceEntry
  up?: _BedrockFaceEntry
  down?: _BedrockFaceEntry
}

interface _BedrockCube {
  size: [number, number, number]
  uv?: [number, number] | _BedrockPerFaceUv
}

interface _BedrockGeoFile {
  'minecraft:geometry'?: Array<{
    description?: { texture_width?: number; texture_height?: number }
    bones?: Array<{ name: string; cubes?: _BedrockCube[] }>
  }>
  geometry?: Array<{
    description?: { texture_width?: number; texture_height?: number }
    bones?: Array<{ name: string; cubes?: _BedrockCube[] }>
  }>
}

interface ParsedUvBone {
  label: string
  x: number      // left edge in texture-pixel space
  y: number      // top edge in texture-pixel space
  w: number      // width in texture pixels
  h: number      // height in texture pixels
  color: string
  textColor: string
}

interface ParsedGeoUvData {
  textureWidth: number
  textureHeight: number
  boneRects: ParsedUvBone[]
}

const BONE_PALETTE: Array<{ color: string; textColor: string }> = [
  { color: '#2196F340', textColor: '#1565C0' },
  { color: '#4CAF5040', textColor: '#2E7D32' },
  { color: '#FF980040', textColor: '#E65100' },
  { color: '#FFEB3B40', textColor: '#F57F17' },
  { color: '#E91E6340', textColor: '#880E4F' },
  { color: '#9C27B040', textColor: '#4A148C' },
  { color: '#00BCD440', textColor: '#006064' },
  { color: '#8BC34A40', textColor: '#33691E' },
]

function parseGeoUvData(geoJson: string): ParsedGeoUvData {
  const DEFAULT: ParsedGeoUvData = { textureWidth: 64, textureHeight: 64, boneRects: [] }
  try {
    const geoFile = JSON.parse(geoJson) as _BedrockGeoFile
    const geo = (geoFile['minecraft:geometry'] ?? geoFile['geometry'] ?? [])[0]
    if (!geo) return DEFAULT

    const textureWidth = geo.description?.texture_width ?? 64
    const textureHeight = geo.description?.texture_height ?? 64
    const boneRects: ParsedUvBone[] = []
    let colorIdx = 0

    for (const bone of geo.bones ?? []) {
      if (!Array.isArray(bone.cubes)) continue
      for (const cube of bone.cubes) {
        if (!cube.uv) continue
        const [sx, sy, sz] = cube.size
        let x: number, y: number, w: number, h: number

        if (Array.isArray(cube.uv)) {
          // Box UV: full unrolled bounding box
          // Extent: X = [u, u + 2*sz + 2*sx], Y = [v, v + sz + sy]
          const [u, v] = cube.uv as [number, number]
          x = u
          y = v
          w = 2 * sz + 2 * sx
          h = sz + sy
        } else {
          // Per-face UV: union of all face corner bounds
          const perFace = cube.uv as _BedrockPerFaceUv
          const faces = [
            perFace.north, perFace.south, perFace.east,
            perFace.west, perFace.up, perFace.down,
          ].filter((f): f is _BedrockFaceEntry => f !== undefined)
          if (faces.length === 0) continue
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          for (const face of faces) {
            const [pu, pv] = face.uv
            const [pw, ph] = face.uv_size
            minX = Math.min(minX, pu, pu + pw)
            minY = Math.min(minY, pv, pv + ph)
            maxX = Math.max(maxX, pu, pu + pw)
            maxY = Math.max(maxY, pv, pv + ph)
          }
          x = minX; y = minY; w = maxX - minX; h = maxY - minY
        }

        const palette = BONE_PALETTE[colorIdx % BONE_PALETTE.length]
        colorIdx++
        boneRects.push({ label: bone.name, x, y, w, h, color: palette.color, textColor: palette.textColor })
      }
    }

    return { textureWidth, textureHeight, boneRects }
  } catch {
    return DEFAULT
  }
}

// ---------------------------------------------------------------------------
// Left pane — Babylon.js 3D preview with camera controls (wireframe #09)
// Shown for geometry and material sub-tabs.
// ---------------------------------------------------------------------------
interface PreviewPaneProps {
  /** Effective texture data URL (parent-managed). Used as textureUrl for BabylonPreview. */
  textureDataUrl?: string | undefined
}

const PreviewPane = ({ textureDataUrl }: PreviewPaneProps): JSX.Element => {
  const { t } = useTranslation()
  const { project } = useProjectStore()
  const vanillaEntity = project?.selectedVanillaId
    ? VANILLA_MOBS.find((m) => m.id === project.selectedVanillaId)
    : null
  const vanillaShape = vanillaEntity?.shapeCategory
  const vanillaColor = vanillaEntity?.previewColor
  return (
    <div className="w-1/2 min-w-[260px] max-w-[480px] border-r border-[#E5E7EB] flex flex-col flex-shrink-0">
      <div className="flex-1 bg-[#C9CDD4] overflow-hidden relative">
        <BabylonPreview
          geometryJson={project?.geometry?.content}
          textureUrl={textureDataUrl}
          {...(vanillaShape !== undefined && { vanillaShape })}
          {...(vanillaColor !== undefined && { vanillaColor })}
        />
        {/* Known limitation: UV atlas offsets and bone pivot/rotation transforms are not applied */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
          <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded select-none">
            {t('editor.preview3d.limitationNote')}
          </span>
        </div>
        {vanillaShape !== undefined && project?.geometry === undefined && (
          <div className="absolute top-1 inset-x-0 flex flex-col items-center gap-0.5 pointer-events-none">
            <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded select-none">
              {t('editor.preview3d.vanillaShapeNote')}
            </span>
            {project?.texture === undefined && (
              <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded select-none">
                {t('editor.preview3d.vanillaTextureNote')}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-1.5 p-2.5 bg-white border-t border-[#E5E7EB] flex-shrink-0 flex-wrap">
        {(
          [
            'editor.preview3d.cameraReset',
            'editor.preview3d.front',
            'editor.preview3d.side',
            'editor.preview3d.top',
          ] as const
        ).map((key) => (
          <button
            key={key}
            type="button"
            className="flex-1 min-w-[56px] px-2 py-1.5 border border-[#D1D5DB] rounded text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Left pane — UV mapping viewer (wireframe #10)
// Shown when texture sub-tab is active.
// ---------------------------------------------------------------------------
interface UvPaneProps {
  uvZoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  /** Effective texture data URL (parent-managed). Shown as UV map background image. */
  textureDataUrl?: string | undefined
}

const UvPane = ({ uvZoom, onZoomIn, onZoomOut, onReset, textureDataUrl }: UvPaneProps): JSX.Element => {
  const { t } = useTranslation()
  const { project } = useProjectStore()
  const svgSize = Math.round(288 * uvZoom)

  const vanillaEntity = project?.selectedVanillaId
    ? VANILLA_MOBS.find((m) => m.id === project.selectedVanillaId)
    : null
  const vanillaColor = vanillaEntity?.previewColor

  // Parse geometry to get actual texture dimensions and bone UV rectangles
  const geoUvData = useMemo<ParsedGeoUvData>(() => {
    if (!project?.geometry?.content) return { textureWidth: 64, textureHeight: 64, boneRects: [] }
    return parseGeoUvData(project.geometry.content)
  }, [project?.geometry?.content])

  const { textureWidth, textureHeight, boneRects } = geoUvData

  // Font sizes in viewBox (texture-pixel) coordinate space
  const axisFontSize = textureWidth / 32    // ~2 for 64px → ~9 display px at 288 SVG size
  const boneFontSize = textureWidth / 16    // ~4 for 64px → ~18 display px

  // Grid line positions at 25% intervals
  const gridX = [0, textureWidth / 4, textureWidth / 2, (textureWidth * 3) / 4, textureWidth]
  const gridY = [0, textureHeight / 4, textureHeight / 2, (textureHeight * 3) / 4, textureHeight]

  // Checker pattern cell size: 1/16 of texture width/height
  const checkerW = textureWidth / 8
  const checkerH = textureHeight / 8

  return (
    <div className="w-1/2 min-w-[260px] max-w-[480px] border-r border-[#E5E7EB] flex flex-col flex-shrink-0">
      {/* Header — shows actual texture dimensions from geometry */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-[#E5E7EB] flex-shrink-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {t('editor.appearance.texture.uvTitle')}
        </span>
        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
          {textureWidth} × {textureHeight}
        </span>
      </div>

      {/* UV grid canvas — viewBox uses texture-pixel coordinate space */}
      <div className="flex-1 overflow-auto bg-[#C9CDD4] flex items-start justify-center p-5">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${textureWidth} ${textureHeight}`}
          style={{ display: 'block' }}
          aria-label={`UV マッピンググリッド（${textureWidth}×${textureHeight} UV 空間）`}
        >
          <defs>
            {/* Checker pattern sized to 1/8 of the texture dimensions */}
            <pattern
              id="uv-checker"
              x="0"
              y="0"
              width={checkerW}
              height={checkerH}
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width={checkerW / 2} height={checkerH / 2} fill="#e0e0e0" />
              <rect x={checkerW / 2} y={checkerH / 2} width={checkerW / 2} height={checkerH / 2} fill="#e0e0e0" />
              <rect x={checkerW / 2} y="0" width={checkerW / 2} height={checkerH / 2} fill="#f8f8f8" />
              <rect x="0" y={checkerH / 2} width={checkerW / 2} height={checkerH / 2} fill="#f8f8f8" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={textureWidth} height={textureHeight} fill="url(#uv-checker)" />

          {/* Uploaded texture as background image (below grid and bones) */}
          {textureDataUrl && (
            <image
              x={0}
              y={0}
              width={textureWidth}
              height={textureHeight}
              href={textureDataUrl}
              preserveAspectRatio="none"
              style={{ opacity: 0.6 }}
            />
          )}

          {/* Grid lines at 25% intervals */}
          {gridX.map((gx) => (
            <line key={`gx-${gx}`} x1={gx} y1={0} x2={gx} y2={textureHeight} stroke="#bbb" strokeWidth={textureWidth / 288} />
          ))}
          {gridY.map((gy) => (
            <line key={`gy-${gy}`} x1={0} y1={gy} x2={textureWidth} y2={gy} stroke="#bbb" strokeWidth={textureHeight / 288} />
          ))}

          {/* Axis labels */}
          <text
            x={textureWidth / 2}
            y={textureHeight - axisFontSize * 0.5}
            textAnchor="middle"
            fontSize={axisFontSize}
            fill="#888"
            fontFamily="ui-monospace, monospace"
          >
            U →
          </text>
          <text
            x={axisFontSize * 1.5}
            y={textureHeight / 2}
            textAnchor="middle"
            fontSize={axisFontSize}
            fill="#888"
            fontFamily="ui-monospace, monospace"
            transform={`rotate(-90, ${axisFontSize * 1.5}, ${textureHeight / 2})`}
          >
            V →
          </text>

          {/* UV bone regions from geometry data */}
          {boneRects.map((bone) => {
            const fillColor = vanillaColor ? `${vanillaColor}66` : bone.color
            const strokeColor = vanillaColor ?? bone.textColor
            const labelColor = vanillaColor ?? bone.textColor
            return (
              <g key={bone.label}>
                <rect
                  x={bone.x}
                  y={bone.y}
                  width={bone.w}
                  height={bone.h}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={textureWidth / 288}
                />
                <text
                  x={bone.x + bone.w / 2}
                  y={bone.y + bone.h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={boneFontSize}
                  fontWeight={600}
                  fontFamily="ui-monospace, monospace"
                  fill={labelColor}
                >
                  {bone.label}
                </text>
              </g>
            )
          })}

          {/* Vanilla color label overlay */}
          {vanillaColor && (
            <text
              x={textureWidth / 2}
              y={axisFontSize * 2}
              textAnchor="middle"
              fontSize={axisFontSize}
              fill={vanillaColor}
              fontFamily="ui-monospace, monospace"
              fontWeight={600}
            >
              {t('editor.appearance.texture.vanillaColor')}: {vanillaColor}
            </text>
          )}
        </svg>
      </div>

      {/* UV controls — wireframe #10 */}
      <div className="flex gap-1.5 items-center p-2.5 bg-gray-50 border-t border-[#E5E7EB] flex-shrink-0 flex-wrap">
        <button
          type="button"
          onClick={onZoomIn}
          className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-white cursor-pointer bg-white"
        >
          🔍＋
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-white cursor-pointer bg-white"
        >
          🔍－
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-white cursor-pointer bg-white"
        >
          {t('editor.appearance.texture.uvReset')}
        </button>
        <span className="ml-auto text-xs text-gray-400">
          {Math.round(uvZoom * 100)}%
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Geometry panel
// ---------------------------------------------------------------------------
const GeometryPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { project, updateGeometry } = useProjectStore()
  const flatBones = flattenBones(BONE_TREE)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [geoFileName, setGeoFileName] = useState(
    project?.geometry?.fileName ?? 'models/entity/my_mob.geo.json',
  )

  const handleBrowseClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result
      if (typeof content === 'string') {
        updateGeometry({ fileName: file.name, content })
        setGeoFileName(file.name)
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.geo.json"
        className="hidden"
        data-testid="geometry-file-input"
        onChange={handleFileChange}
        aria-label={t('editor.appearance.geometry.fileLabel')}
      />

      {/* File path */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.appearance.geometry.fileLabel')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={geoFileName}
            readOnly
            className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          />
          <button
            type="button"
            onClick={handleBrowseClick}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer bg-white flex-shrink-0"
          >
            {t('editor.appearance.geometry.browseButton')}
          </button>
        </div>
      </div>

      {/* Geometry ID */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.appearance.geometry.idLabel')}
        </label>
        <input
          type="text"
          defaultValue="geometry.my_mob"
          className="border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>

      {/* Vanilla appearance info (shown when a vanilla entity is selected) */}
      {(() => {
        const vanillaEntity = project?.selectedVanillaId
          ? VANILLA_MOBS.find((m) => m.id === project.selectedVanillaId)
          : null
        if (!vanillaEntity?.defaultAppearance) return null
        const { geometryId, texturePath } = vanillaEntity.defaultAppearance
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex flex-col gap-1.5">
            <div className="text-xs font-bold text-blue-700">
              {t('editor.appearance.geometry.vanillaTitle')}
            </div>
            <div className="text-xs text-blue-600">
              {t('editor.appearance.geometry.vanillaUseLabel')}
            </div>
            <div className="flex gap-3 mt-0.5 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500">
                  {t('editor.appearance.geometry.vanillaGeometryId')}
                </span>
                <span className="text-xs font-mono bg-white border border-blue-100 rounded px-2 py-0.5 text-gray-700">
                  {geometryId}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500">
                  {t('editor.appearance.geometry.vanillaTexturePath')}
                </span>
                <span className="text-xs font-mono bg-white border border-blue-100 rounded px-2 py-0.5 text-gray-700">
                  {texturePath}
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Bone tree */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.geometry.bonesTitle')}
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {flatBones.map((bone) => (
            <div
              key={bone.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              style={{ paddingLeft: `${12 + bone.depth * 16}px` }}
            >
              <span>{bone.icon}</span>
              <span className="font-mono">{bone.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attachment points */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.geometry.attachmentTitle')}
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {ATTACHMENT_POINTS.map((pt) => (
            <div
              key={pt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <span>📍</span>
              <span className="font-mono">{pt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Texture slot + variant panel (right pane content when texture tab is active)
// UV map is now in UvPane (left pane).
// ---------------------------------------------------------------------------
interface TextureSlotPanelProps {
  /** Effective texture data URL (parent-managed). Shown as slot thumbnail. */
  textureDataUrl?: string | undefined
  /** Called after FileReader successfully loads a new texture file. */
  onTextureLoaded?: (dataUrl: string, fileName: string) => void
}

const TextureSlotPanel = ({ textureDataUrl, onTextureLoaded }: TextureSlotPanelProps): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const { project, updateTexture } = useProjectStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextureChangeClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result
      if (typeof dataUrl === 'string') {
        updateTexture({ fileName: file.name, dataUrl })
        // Notify parent so it can update local state: ensures thumbnail / 3D preview
        // update immediately even when project is null (e.g. after page refresh)
        onTextureLoaded?.(dataUrl, file.name)
      }
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png"
        className="hidden"
        data-testid="texture-file-input"
        onChange={handleFileChange}
        aria-label={t('editor.appearance.texture.change')}
      />

      {/* Vanilla appearance info (shown when a vanilla entity is selected) */}
      {(() => {
        const vanillaEntity = project?.selectedVanillaId
          ? VANILLA_MOBS.find((m) => m.id === project.selectedVanillaId)
          : null
        if (!vanillaEntity?.defaultAppearance) return null
        const { geometryId, texturePath } = vanillaEntity.defaultAppearance
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex flex-col gap-1.5">
            <div className="text-xs font-bold text-blue-700">
              {t('editor.appearance.geometry.vanillaTitle')}
            </div>
            <div className="text-xs text-blue-600">
              {t('editor.appearance.geometry.vanillaUseLabel')}
            </div>
            <div className="flex gap-3 mt-0.5 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500">
                  {t('editor.appearance.geometry.vanillaGeometryId')}
                </span>
                <span className="text-xs font-mono bg-white border border-blue-100 rounded px-2 py-0.5 text-gray-700">
                  {geometryId}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500">
                  {t('editor.appearance.geometry.vanillaTexturePath')}
                </span>
                <span className="text-xs font-mono bg-white border border-blue-100 rounded px-2 py-0.5 text-gray-700">
                  {texturePath}
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Texture slots */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.texture.slotsTitle')}
        </div>
        <div className="flex flex-col gap-2">
          {TEXTURE_SLOTS.map((slot) => {
            const vanillaEntity = project?.selectedVanillaId
              ? VANILLA_MOBS.find((m) => m.id === project.selectedVanillaId)
              : null
            const showVanillaColor =
              slot.id === 'default' && vanillaEntity?.previewColor && !textureDataUrl
            return (
              <div
                key={slot.id}
                className="flex items-center gap-3 border border-gray-200 rounded-md p-2"
              >
                {/* Thumbnail: uploaded texture, vanilla color patch, or checkerboard */}
                {slot.id === 'default' && textureDataUrl ? (
                  <img
                    src={textureDataUrl}
                    alt={slot.name}
                    className="w-14 h-14 rounded flex-shrink-0 object-cover"
                  />
                ) : showVanillaColor ? (
                  <div
                    className="w-14 h-14 rounded flex-shrink-0 flex flex-col items-center justify-center"
                    style={{ backgroundColor: vanillaEntity.previewColor }}
                    title={`${t('editor.appearance.texture.vanillaColor')}: ${vanillaEntity.previewColor}`}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded flex-shrink-0"
                    style={CHECKERBOARD_STYLE}
                  />
                )}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    {slot.name}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {slot.id === 'default' && project?.texture?.fileName
                      ? project.texture.fileName
                      : showVanillaColor
                        ? (vanillaEntity?.defaultAppearance?.texturePath ?? slot.path)
                        : slot.path}
                  </span>
                  {showVanillaColor && (
                    <span className="text-xs text-blue-500">
                      {t('editor.appearance.texture.vanillaColor')}: {vanillaEntity?.previewColor}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {slot.id === 'default' ? (
                    <button
                      type="button"
                      onClick={handleTextureChangeClick}
                      className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white text-gray-600"
                    >
                      {t('editor.appearance.texture.change')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white text-gray-600"
                    >
                      {t('editor.appearance.texture.change')}
                    </button>
                  )}
                  {/* Delete button — detail mode only, wireframe #10 */}
                  {mode === 'advanced' && (
                    <button
                      type="button"
                      aria-label={t('editor.appearance.texture.deleteSlot')}
                      className="w-6 h-6 flex items-center justify-center text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add slot button — detail mode only, wireframe #10 */}
        {mode === 'advanced' && (
          <button
            type="button"
            className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-500 hover:border-[#5D9C3B] hover:text-[#5D9C3B] cursor-pointer bg-transparent transition-colors"
          >
            {t('editor.appearance.texture.addSlot')}
          </button>
        )}
      </div>

      {/* Detail-only: mapping type + texture size */}
      {mode === 'advanced' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.texture.mappingType')}
            </label>
            <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
              <option value="UV">{t('editor.appearance.texture.mappingTypeUV')}</option>
              <option value="Triplanar">{t('editor.appearance.texture.mappingTypeTriplanar')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.texture.textureSize')}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                defaultValue={64}
                className="w-20 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
              <span className="text-xs text-gray-400">×</span>
              <input
                type="number"
                defaultValue={64}
                className="w-20 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
            </div>
          </div>
        </div>
      )}

      {/* テクスチャバリアント section — wireframe #10 */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1 pb-1.5 border-b border-gray-100">
          {t('editor.appearance.texture.variantsTitle')}
        </div>

        {mode === 'simple' ? (
          <div className="text-center py-5 px-3 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-md bg-gray-50">
            {t('editor.appearance.texture.variantAdvancedOnly')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {TEXTURE_VARIANTS.map((variant) => (
              <div
                key={variant.id}
                className="border border-gray-200 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {variant.id}
                  </span>
                  <button
                    type="button"
                    aria-label={`${variant.id} を削除`}
                    className="w-6 h-6 flex items-center justify-center text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      {t('editor.appearance.texture.variantDescription')}
                    </div>
                    <input
                      type="text"
                      defaultValue={variant.description}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      {t('editor.appearance.texture.variantSlot')}
                    </div>
                    <select
                      defaultValue={variant.slot}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                    >
                      {TEXTURE_SLOTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-500 hover:border-[#5D9C3B] hover:text-[#5D9C3B] cursor-pointer bg-transparent transition-colors"
            >
              {t('editor.appearance.texture.addVariant')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Material panel
// ---------------------------------------------------------------------------
const MaterialPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()

  if (mode === 'simple') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-3">
        <div className="text-gray-400 text-3xl">🔒</div>
        <p className="text-sm text-gray-500 text-center">
          {t('editor.appearance.material.simpleNotice')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {t('editor.appearance.material.title')}
      </div>

      {/* Material name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.appearance.material.materialName')}
        </label>
        <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
          <option>entity_alphatest</option>
          <option>entity</option>
          <option>entity_emissive</option>
        </select>
      </div>

      {/* Render controller */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.appearance.material.renderController')}
        </label>
        <input
          type="text"
          defaultValue="controller.render.default"
          className="border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>

      {/* Shader settings */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.material.shaderSettings')}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.material.culling')}
            </label>
            <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
              <option value="Back">{t('editor.appearance.material.cullingBack')}</option>
              <option value="Front">{t('editor.appearance.material.cullingFront')}</option>
              <option value="None">{t('editor.appearance.material.cullingNone')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.material.blend')}
            </label>
            <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
              <option value="None">{t('editor.appearance.material.blendNone')}</option>
              <option value="Alpha">{t('editor.appearance.material.blendAlpha')}</option>
              <option value="Additive">{t('editor.appearance.material.blendAdditive')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.material.emissive')}
            </label>
            <input
              type="number"
              defaultValue={0}
              min={0}
              max={1}
              step={0.1}
              className="border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AppearancePanel — 2-pane layout (wireframe #09, #10)
// Left: 3D preview (non-texture tabs) or UV map (texture tab)
// Right: sub-tabs + content
// ---------------------------------------------------------------------------
export const AppearancePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const { project } = useProjectStore()
  const [activeSubTab, setActiveSubTab] = useState<AppearanceSubTab>('geometry')
  const [uvZoom, setUvZoom] = useState<number>(1.0)
  // Local texture state: updated immediately on upload so thumbnail / UV map / 3D preview
  // all reflect the new image even when project is null (e.g. after page refresh or direct URL).
  const [localTextureDataUrl, setLocalTextureDataUrl] = useState<string | undefined>(
    project?.texture?.dataUrl,
  )

  const handleTextureLoaded = (dataUrl: string): void => {
    setLocalTextureDataUrl(dataUrl)
  }

  // Effective texture URL passed to all child panes:
  // project store takes priority (normal flow); local state is the fallback.
  const effectiveTextureDataUrl = project?.texture?.dataUrl ?? localTextureDataUrl

  // Switch away from material tab if mode drops to simple
  useEffect(() => {
    if (mode === 'simple' && activeSubTab === 'material') {
      setActiveSubTab('geometry')
    }
  }, [mode, activeSubTab])

  const handleZoomIn = (): void => setUvZoom((z) => Math.min(z + 0.25, 2.0))
  const handleZoomOut = (): void => setUvZoom((z) => Math.max(z - 0.25, 0.5))
  const handleZoomReset = (): void => setUvZoom(1.0)

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left pane: switches between 3D preview and UV map ── */}
      {activeSubTab === 'texture' ? (
        <UvPane
          uvZoom={uvZoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleZoomReset}
          textureDataUrl={effectiveTextureDataUrl}
        />
      ) : (
        <PreviewPane textureDataUrl={effectiveTextureDataUrl} />
      )}

      {/* ── Right pane: sub-tab bar + content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Sub-tab bar */}
        <div
          className="flex border-b border-[#E5E7EB] px-4 flex-shrink-0"
          role="tablist"
        >
          {(['geometry', 'texture'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`appearance-tab-${tab}`}
              aria-controls={`appearance-tabpanel-${tab}`}
              aria-selected={activeSubTab === tab}
              onClick={() => setActiveSubTab(tab)}
              className={[
                'px-4 py-2.5 text-xs font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors',
                activeSubTab === tab
                  ? 'text-[#5D9C3B] border-b-2 border-[#5D9C3B] font-semibold'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700',
              ].join(' ')}
            >
              {tab === 'geometry'
                ? t('editor.appearance.tabs.geometry')
                : t('editor.appearance.tabs.texture')}
            </button>
          ))}

          {/* Material tab — advanced mode only (wireframe #09) */}
          {mode === 'advanced' && (
            <button
              type="button"
              role="tab"
              id="appearance-tab-material"
              aria-controls="appearance-tabpanel-material"
              aria-selected={activeSubTab === 'material'}
              onClick={() => setActiveSubTab('material')}
              className={[
                'px-4 py-2.5 text-xs font-medium cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors',
                activeSubTab === 'material'
                  ? 'text-[#5D9C3B] border-b-2 border-[#5D9C3B] font-semibold'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700',
              ].join(' ')}
            >
              {t('editor.appearance.tabs.material')}
            </button>
          )}
        </div>

        {/* Tab panel */}
        <div
          role="tabpanel"
          id={`appearance-tabpanel-${activeSubTab}`}
          aria-labelledby={`appearance-tab-${activeSubTab}`}
          className="flex-1 overflow-hidden"
        >
          {activeSubTab === 'geometry' && <GeometryPanel />}
          {activeSubTab === 'texture' && (
            <TextureSlotPanel
              textureDataUrl={effectiveTextureDataUrl}
              onTextureLoaded={handleTextureLoaded}
            />
          )}
          {activeSubTab === 'material' && <MaterialPanel />}
        </div>
      </div>
    </div>
  )
}
