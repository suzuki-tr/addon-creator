import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/stores/projectStore'
import type { ProjectData } from '@/stores/projectStore'

interface JsonPreviewPanelProps {
  entityName: string
}

/** Minimal syntax-highlighted JSON token types */
type TokenKind = 'key' | 'str' | 'num' | 'punct'

interface Token {
  kind: TokenKind
  text: string
}

/** Build entity JSON object from live project data and tokenize it */
const buildTokens = (project: ProjectData | null, fallbackName: string): Token[] => {
  const entityId = project?.entityId ?? fallbackName.replace(/\s+/g, '_').toLowerCase()
  const health = project?.status.health ?? 20
  const movementSpeed = project?.status.movementSpeed ?? 0.25
  const scale = project?.status.scale ?? 1.0
  const attackDamage = project?.status.attackDamage ?? 3
  const traits = project?.selectedTraits ?? []

  const components: Record<string, unknown> = {
    'minecraft:health': { value: health, max: health },
    'minecraft:movement': { value: movementSpeed },
    'minecraft:scale': { value: scale },
  }

  if (traits.includes('hostile')) {
    components['minecraft:behavior.nearest_attackable_target'] = {
      entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'player' }, max_dist: 16 }],
    }
    components['minecraft:behavior.hurt_by_target'] = {}
    components['minecraft:attack'] = { damage: attackDamage }
  }

  if (traits.includes('rideable')) {
    components['minecraft:rideable'] = {
      seat_count: 1,
      seats: [{ position: [0, 1.1, 0] }],
    }
  }

  if (traits.includes('flying')) {
    components['minecraft:navigation.fly'] = {}
  }

  if (traits.includes('undead')) {
    components['minecraft:burn_in_daylight'] = { value: true }
  }

  if (traits.includes('aquatic')) {
    components['minecraft:underwater_movement'] = { value: 0.06 }
  }

  if (traits.includes('boss')) {
    components['minecraft:boss'] = { should_darken_sky: false, hud_range: 55 }
  }

  if (traits.includes('tameable')) {
    components['minecraft:tameable'] = { probability: 0.33, tame_items: 'bone' }
  }

  if (traits.includes('breedable')) {
    components['minecraft:breedable'] = { require_tame: false }
  }

  const entityObj = {
    format_version: '1.20.0',
    'minecraft:entity': {
      description: {
        identifier: `myaddon:${entityId}`,
        is_spawnable: true,
      },
      components,
    },
  }

  return tokenizeJson(JSON.stringify(entityObj, null, 2))
}

/** Simple JSON tokenizer — classifies each segment as key, str, num, or punct */
function tokenizeJson(jsonStr: string): Token[] {
  const tokens: Token[] = []
  // Pattern order matters: strings first, then numbers, booleans, then grouped punct/whitespace
  const re = /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],]|:\s*|\s+|./g
  let match: RegExpExecArray | null
  while ((match = re.exec(jsonStr)) !== null) {
    const text = match[0]
    if (text.startsWith('"')) {
      // Key if the remaining JSON (after this token) starts with a colon
      const after = jsonStr.slice(re.lastIndex).trimStart()
      tokens.push({ kind: after.startsWith(':') ? 'key' : 'str', text })
    } else if (/^-?\d/.test(text)) {
      tokens.push({ kind: 'num', text })
    } else if (text === 'true' || text === 'false' || text === 'null') {
      tokens.push({ kind: 'str', text })
    } else {
      tokens.push({ kind: 'punct', text })
    }
  }
  return tokens
}

const TOKEN_COLORS: Record<TokenKind, string> = {
  key: '#9CDCFE',
  str: '#CE9178',
  num: '#B5CEA8',
  punct: '#808080',
}

export const JsonPreviewPanel = ({
  entityName,
}: JsonPreviewPanelProps): JSX.Element => {
  const { t } = useTranslation()
  const { project } = useProjectStore()
  const tokens = buildTokens(project, entityName)

  const handleCopy = (): void => {
    const raw = tokens.map((tk) => tk.text).join('')
    void navigator.clipboard.writeText(raw)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* JSON Preview Section */}
      <div className="flex flex-col flex-1 overflow-hidden p-3 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('editor.jsonPreview.title')}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50 cursor-pointer"
          >
            {t('editor.jsonPreview.copyButton')}
          </button>
        </div>

        {/* Code block */}
        <div
          className="flex-1 overflow-y-auto min-h-0 rounded-md p-3 text-xs font-mono leading-relaxed overflow-x-auto"
          style={{ backgroundColor: '#1E1E1E', borderRadius: '6px' }}
        >
          <pre className="whitespace-pre m-0">
            {tokens.map((tk, i) => (
              <span key={i} style={{ color: TOKEN_COLORS[tk.kind] }}>
                {tk.text}
              </span>
            ))}
          </pre>
        </div>
      </div>

      {/* Validation Section */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {t('editor.validation.title')}
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          <span className="text-green-600 font-semibold text-sm">
            {t('editor.validation.ok')}
          </span>
          <span className="text-green-700 text-xs">
            {t('editor.validation.okMessage')}
          </span>
        </div>
      </div>

      {/* 3D Preview Section */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {t('editor.preview3d.title')}
        </div>
        <div className="bg-gray-100 rounded-md flex flex-col items-center justify-center gap-2 py-6">
          <span className="text-2xl">🧊</span>
          <span className="text-xs text-gray-400">
            {t('editor.preview3d.placeholder')}
          </span>
        </div>
        <div className="flex gap-1 mt-2">
          <button
            type="button"
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 hover:bg-gray-50 cursor-pointer text-gray-600"
          >
            {t('editor.preview3d.cameraReset')}
          </button>
          <button
            type="button"
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 hover:bg-gray-50 cursor-pointer text-gray-600"
          >
            {t('editor.preview3d.front')}
          </button>
          <button
            type="button"
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 hover:bg-gray-50 cursor-pointer text-gray-600"
          >
            {t('editor.preview3d.side')}
          </button>
          <button
            type="button"
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 hover:bg-gray-50 cursor-pointer text-gray-600"
          >
            {t('editor.preview3d.top')}
          </button>
        </div>
      </div>
    </div>
  )
}
