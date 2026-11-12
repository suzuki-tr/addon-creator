import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

interface JsonPreviewPanelProps {
  entityName: string
}

/** Minimal syntax-highlighted JSON token types */
type TokenKind = 'key' | 'str' | 'num' | 'punct'

interface Token {
  kind: TokenKind
  text: string
}

/** Build a flat token list from a fixed mock entity structure using entityName */
const buildTokens = (entityName: string): Token[] => {
  const id = `myaddon:${entityName.replace(/\s+/g, '_').toLowerCase()}`
  const tokens: Token[] = [
    { kind: 'punct', text: '{\n' },
    { kind: 'key', text: '  "format_version"' },
    { kind: 'punct', text: ': ' },
    { kind: 'str', text: '"1.21.0"' },
    { kind: 'punct', text: ',\n' },
    { kind: 'key', text: '  "minecraft:entity"' },
    { kind: 'punct', text: ': {\n' },
    { kind: 'key', text: '    "description"' },
    { kind: 'punct', text: ': {\n' },
    { kind: 'key', text: '      "identifier"' },
    { kind: 'punct', text: ': ' },
    { kind: 'str', text: `"${id}"` },
    { kind: 'punct', text: ',\n' },
    { kind: 'key', text: '      "is_spawnable"' },
    { kind: 'punct', text: ': ' },
    { kind: 'str', text: 'true' },
    { kind: 'punct', text: '\n' },
    { kind: 'punct', text: '    },\n' },
    { kind: 'key', text: '    "components"' },
    { kind: 'punct', text: ': {\n' },
    { kind: 'key', text: '      "minecraft:health"' },
    { kind: 'punct', text: ': {\n' },
    { kind: 'key', text: '        "value"' },
    { kind: 'punct', text: ': ' },
    { kind: 'num', text: '20' },
    { kind: 'punct', text: '\n' },
    { kind: 'punct', text: '      }\n' },
    { kind: 'punct', text: '    }\n' },
    { kind: 'punct', text: '  }\n' },
    { kind: 'punct', text: '}' },
  ]
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
  const tokens = buildTokens(entityName)

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
          className="flex-1 overflow-y-auto rounded-md p-3 text-xs font-mono leading-relaxed overflow-x-auto"
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
