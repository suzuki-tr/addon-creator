import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'

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
      {
        id: 'head',
        label: 'head',
        icon: '📦',
        depth: 1,
      },
      {
        id: 'arm_left',
        label: 'arm_left',
        icon: '🦴',
        depth: 1,
      },
      {
        id: 'arm_right',
        label: 'arm_right',
        icon: '🦴',
        depth: 1,
      },
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
    if (item.children) {
      result.push(...flattenBones(item.children))
    }
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

/** UV bone region definition */
interface UvBone {
  label: string
  x: number
  y: number
  w: number
  h: number
  color: string
  textColor: string
}

const UV_BONES: UvBone[] = [
  { label: 'body', x: 16, y: 16, w: 64, h: 48, color: '#4CAF5040', textColor: '#2E7D32' },
  { label: 'head', x: 0, y: 0, w: 64, h: 32, color: '#2196F340', textColor: '#1565C0' },
  { label: 'arm_left', x: 32, y: 112, w: 32, h: 48, color: '#FF980040', textColor: '#E65100' },
  { label: 'arm_right', x: 40, y: 160, w: 32, h: 48, color: '#FFEB3B40', textColor: '#F57F17' },
]

/** Geometry panel */
const GeometryPanel = (): JSX.Element => {
  const { t } = useTranslation()
  const flatBones = flattenBones(BONE_TREE)

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      {/* File path */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('editor.appearance.geometry.fileLabel')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            defaultValue="models/entity/my_mob.geo.json"
            className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          />
          <button
            type="button"
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

/** Texture panel */
const TexturePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const [uvZoom, setUvZoom] = useState<number>(1.0)

  const svgSize = Math.round(288 * uvZoom)

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      {/* Texture slots */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.texture.slotsTitle')}
        </div>
        <div className="flex flex-col gap-2">
          {TEXTURE_SLOTS.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 border border-gray-200 rounded-md p-2"
            >
              {/* Checkerboard thumbnail */}
              <div
                className="w-14 h-14 rounded flex-shrink-0"
                style={CHECKERBOARD_STYLE}
              />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-xs font-mono font-semibold text-gray-700">
                  {slot.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {slot.path}
                </span>
              </div>
              <button
                type="button"
                className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white flex-shrink-0 text-gray-600"
              >
                {t('editor.appearance.texture.change')}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-500 hover:border-[#5D9C3B] hover:text-[#5D9C3B] cursor-pointer bg-transparent transition-colors"
        >
          {t('editor.appearance.texture.addSlot')}
        </button>
      </div>

      {/* Detail-only: mapping type + texture size */}
      {mode === 'advanced' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.texture.mappingType')}
            </label>
            <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
              <option>UV</option>
              <option>Triplanar</option>
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

      {/* UV Mapping SVG */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('editor.appearance.texture.uvTitle')}
        </div>

        {/* UV controls */}
        <div className="flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => setUvZoom((z) => Math.min(z + 0.25, 2.0))}
            className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white text-gray-600"
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => setUvZoom((z) => Math.max(z - 0.25, 0.5))}
            className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white text-gray-600"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setUvZoom(1.0)}
            className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer bg-white text-gray-600"
          >
            {t('editor.stateGraph.reset')}
          </button>
          <span className="text-xs text-gray-400 self-center ml-1">
            {Math.round(uvZoom * 100)}%
          </span>
        </div>

        <div className="overflow-auto border border-gray-200 rounded-md">
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 288 288"
            style={{ display: 'block' }}
          >
            <defs>
              {/* Checkerboard background pattern */}
              <pattern
                id="uv-checker"
                x="0"
                y="0"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="8" height="8" fill="#e0e0e0" />
                <rect x="8" y="8" width="8" height="8" fill="#e0e0e0" />
                <rect x="8" y="0" width="8" height="8" fill="#f8f8f8" />
                <rect x="0" y="8" width="8" height="8" fill="#f8f8f8" />
              </pattern>
            </defs>

            {/* Background */}
            <rect width="288" height="288" fill="url(#uv-checker)" />

            {/* Grid lines */}
            {[0, 72, 144, 216, 288].map((v) => (
              <g key={v}>
                <line
                  x1={v}
                  y1={0}
                  x2={v}
                  y2={288}
                  stroke="#bbb"
                  strokeWidth={0.5}
                />
                <line
                  x1={0}
                  y1={v}
                  x2={288}
                  y2={v}
                  stroke="#bbb"
                  strokeWidth={0.5}
                />
              </g>
            ))}

            {/* Coordinate axis labels */}
            <text
              x={144}
              y={280}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
              fontFamily="ui-monospace, monospace"
            >
              U →
            </text>
            <text
              x={8}
              y={144}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
              fontFamily="ui-monospace, monospace"
              transform="rotate(-90, 8, 144)"
            >
              V →
            </text>

            {/* UV bone regions */}
            {UV_BONES.map((bone) => (
              <g key={bone.label}>
                <rect
                  x={bone.x}
                  y={bone.y}
                  width={bone.w}
                  height={bone.h}
                  fill={bone.color}
                  stroke={bone.textColor}
                  strokeWidth={1.5}
                />
                <text
                  x={bone.x + bone.w / 2}
                  y={bone.y + bone.h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="ui-monospace, monospace"
                  fill={bone.textColor}
                >
                  {bone.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

/** Material panel */
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
              <option>Back</option>
              <option>Front</option>
              <option>None</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('editor.appearance.material.blend')}
            </label>
            <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]">
              <option>None</option>
              <option>Alpha</option>
              <option>Additive</option>
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

export const AppearancePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const [activeSubTab, setActiveSubTab] = useState<AppearanceSubTab>('geometry')

  useEffect(() => {
    if (mode === 'simple' && activeSubTab === 'material') {
      setActiveSubTab('geometry')
    }
  }, [mode, activeSubTab])

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

        {/* Material tab only shown in advanced mode */}
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
        {activeSubTab === 'texture' && <TexturePanel />}
        {activeSubTab === 'material' && <MaterialPanel />}
      </div>
    </div>
  )
}
