import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'

interface StateNode {
  id: string
  isInitial: boolean
  animation: string
  x: number
  y: number
}

interface StateTransition {
  from: string
  to: string
  condition: string
}

const NODE_W = 110
const NODE_H = 40

const INITIAL_NODES: StateNode[] = [
  { id: 'idle', isInitial: true, animation: 'animation.idle', x: 20, y: 90 },
  { id: 'walk', isInitial: false, animation: 'animation.walk', x: 190, y: 90 },
  {
    id: 'attack',
    isInitial: false,
    animation: 'animation.attack',
    x: 360,
    y: 88,
  },
  { id: 'hurt', isInitial: false, animation: 'animation.hurt', x: 190, y: 230 },
  {
    id: 'death',
    isInitial: false,
    animation: 'animation.death',
    x: 190,
    y: 330,
  },
]

const INITIAL_TRANSITIONS: StateTransition[] = [
  { from: 'idle', to: 'walk', condition: 'query.is_moving' },
  { from: 'walk', to: 'attack', condition: 'query.target_distance < 2' },
  { from: 'walk', to: 'hurt', condition: 'query.is_hurt' },
  { from: 'attack', to: 'hurt', condition: 'query.is_hurt' },
  { from: 'hurt', to: 'death', condition: 'query.health == 0' },
]

/** Compute the point on a rect border where a line from center exits in direction (dx,dy) */
const rectBorderPoint = (
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): [number, number] => {
  if (dx === 0 && dy === 0) return [cx, cy]

  const halfW = NODE_W / 2
  const halfH = NODE_H / 2

  // Scale factors to reach each border
  const tx = dx !== 0 ? Math.abs(halfW / dx) : Infinity
  const ty = dy !== 0 ? Math.abs(halfH / dy) : Infinity

  const t = Math.min(tx, ty)
  return [cx + dx * t, cy + dy * t]
}

export const StateGraph = (): JSX.Element => {
  const { t } = useTranslation()
  const { mode } = useUiStore()
  const [nodes] = useState<StateNode[]>(INITIAL_NODES)
  const [transitions] = useState<StateTransition[]>(INITIAL_TRANSITIONS)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(
    'attack',
  )
  const [variables, setVariables] = useState<
    Array<{ name: string; defaultValue: number }>
  >([])
  const [events, setEvents] = useState<
    Array<{ type: 'entry' | 'exit'; action: string }>
  >([])

  const handleAddVariable = (): void => {
    setVariables((prev) => [...prev, { name: '', defaultValue: 0 }])
  }

  const handleDeleteVariable = (idx: number): void => {
    setVariables((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAddEvent = (type: 'entry' | 'exit'): void => {
    setEvents((prev) => [...prev, { type, action: '' }])
  }

  const handleDeleteEvent = (idx: number): void => {
    setEvents((prev) => prev.filter((_, i) => i !== idx))
  }

  const selectedNode = nodes.find((n) => n.id === selectedStateId) ?? null
  const selectedTransitions = transitions.filter(
    (tr) => tr.from === selectedStateId,
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: state list */}
      <div
        className="flex flex-col border-r border-[#E5E7EB] overflow-y-auto flex-shrink-0"
        style={{ width: '200px' }}
      >
        <div className="px-3 py-2 border-b border-[#E5E7EB]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('editor.stateGraph.stateListTitle')}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2 flex-1">
          {nodes.map((node) => (
            <div key={node.id} className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSelectedStateId(node.id)}
                className={[
                  'flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs font-mono cursor-pointer border-none transition-colors',
                  selectedStateId === node.id
                    ? 'bg-[#F0F8EA] text-[#5D9C3B] font-semibold'
                    : 'bg-transparent text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: node.isInitial ? '#5D9C3B' : '#9CA3AF',
                  }}
                />
                {node.id}
              </button>
              {/* Per-state delete button (wireframe #08) */}
              <button
                type="button"
                onClick={() => {/* Phase 3: remove state from graph */}}
                aria-label={`${node.id} を削除`}
                className="w-5 h-5 flex-shrink-0 text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent flex items-center justify-center rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-[#E5E7EB]">
          <button
            type="button"
            className="w-full text-xs text-[#5D9C3B] border border-[#5D9C3B] rounded px-2 py-1.5 hover:bg-[#F0F8EA] cursor-pointer bg-transparent"
          >
            {t('editor.stateGraph.addState')}
          </button>
        </div>
      </div>

      {/* Center: SVG canvas */}
      <div className="flex-1 overflow-hidden relative">
        {/* Canvas hint overlay — wireframe #08 */}
        <div className="absolute top-2 left-2 z-10 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded pointer-events-none">
          {t('editor.stateGraph.canvasHint')}
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 540 420"
          style={{
            backgroundImage:
              'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: '#F4F5F7',
          }}
        >
          <defs>
            {/* Gray arrowhead */}
            <marker
              id="arrow-gray"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#9CA3AF" />
            </marker>
            {/* Green arrowhead for selected */}
            <marker
              id="arrow-green"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#5D9C3B" />
            </marker>
          </defs>

          {/* Transition lines */}
          {transitions.map((tr, idx) => {
            const src = nodes.find((n) => n.id === tr.from)
            const tgt = nodes.find((n) => n.id === tr.to)
            if (!src || !tgt) return null

            const srcCx = src.x + NODE_W / 2
            const srcCy = src.y + NODE_H / 2
            const tgtCx = tgt.x + NODE_W / 2
            const tgtCy = tgt.y + NODE_H / 2

            const rawDx = tgtCx - srcCx
            const rawDy = tgtCy - srcCy
            const len = Math.sqrt(rawDx * rawDx + rawDy * rawDy)
            if (len === 0) return null

            const dx = rawDx / len
            const dy = rawDy / len

            const [x1, y1] = rectBorderPoint(srcCx, srcCy, dx, dy)
            const [x2, y2] = rectBorderPoint(tgtCx, tgtCy, -dx, -dy)

            const isSelected =
              tr.from === selectedStateId || tr.to === selectedStateId
            const color = isSelected ? '#5D9C3B' : '#9CA3AF'
            const marker = isSelected
              ? 'url(#arrow-green)'
              : 'url(#arrow-gray)'

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={isSelected ? 2 : 1.5}
                markerEnd={marker}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const cx = node.x + NODE_W / 2
            const cy = node.y + NODE_H / 2
            const isSelected = selectedStateId === node.id

            return (
              <g
                key={node.id}
                role="button"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedStateId(node.id)}
              >
                {/* Initial state triangle marker */}
                {node.isInitial && (
                  <polygon
                    points={`${node.x - 16},${cy - 7} ${node.x - 16},${cy + 7} ${node.x - 2},${cy}`}
                    fill="#5D9C3B"
                  />
                )}
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={6}
                  ry={6}
                  fill={isSelected ? '#F0F8EA' : '#FFFFFF'}
                  stroke={isSelected ? '#5D9C3B' : '#D1D5DB'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="ui-monospace, monospace"
                  fontSize={11}
                  fontWeight={isSelected ? 700 : 400}
                  fill={isSelected ? '#5D9C3B' : '#374151'}
                >
                  {node.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Zoom / Reset overlay controls — wireframe #08 */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button
            type="button"
            className="bg-white/95 border border-[#D1D5DB] rounded px-3 py-1.5 text-xs text-gray-700 cursor-pointer hover:bg-white shadow-sm"
          >
            {t('editor.stateGraph.zoom')}
          </button>
          <button
            type="button"
            className="bg-white/95 border border-[#D1D5DB] rounded px-3 py-1.5 text-xs text-gray-700 cursor-pointer hover:bg-white shadow-sm"
          >
            {t('editor.stateGraph.reset')}
          </button>
        </div>
      </div>

      {/* Right panel: selected state details */}
      <div
        className="flex flex-col border-l border-[#E5E7EB] overflow-y-auto flex-shrink-0"
        style={{ width: '280px' }}
      >
        {selectedNode ? (
          <div className="p-3 flex flex-col gap-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('editor.stateGraph.selectedState')}
            </div>

            {/* State name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">
                {t('editor.stateGraph.stateName')}
              </label>
              <input
                type="text"
                defaultValue={selectedNode.id}
                className="border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
            </div>

            {/* Animation */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">
                {t('editor.stateGraph.animation')}
              </label>
              <input
                type="text"
                defaultValue={selectedNode.animation}
                className="border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
            </div>

            {/* Transitions */}
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-bold text-gray-500">
                {t('editor.stateGraph.transitions')}
              </div>
              {selectedTransitions.length === 0 ? (
                <div className="text-xs text-gray-400 italic">—</div>
              ) : (
                selectedTransitions.map((tr, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs"
                  >
                    <span className="font-mono text-[#5D9C3B]">{tr.to}</span>
                    <span className="text-gray-400 mx-1">if</span>
                    <span className="font-mono text-gray-600">
                      {tr.condition}
                    </span>
                  </div>
                ))
              )}
              <button
                type="button"
                className="text-xs text-[#5D9C3B] border border-dashed border-[#5D9C3B] rounded px-2 py-1.5 hover:bg-[#F0F8EA] cursor-pointer bg-transparent mt-1"
              >
                {t('editor.stateGraph.addTransition')}
              </button>
            </div>

            {/* Variables section — advanced mode only */}
            {mode === 'advanced' && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-gray-500">
                  {t('editor.stateGraph.variables')}
                </div>
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={v.name}
                      placeholder={t('editor.stateGraph.variablesName')}
                      onChange={(e) => {
                        const name = e.target.value
                        setVariables((prev) =>
                          prev.map((item, idx) =>
                            idx === i ? { ...item, name } : item,
                          ),
                        )
                      }}
                      className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                    />
                    <input
                      type="number"
                      value={v.defaultValue}
                      placeholder={t('editor.stateGraph.variablesDefault')}
                      onChange={(e) => {
                        const defaultValue = parseFloat(e.target.value) || 0
                        setVariables((prev) =>
                          prev.map((item, idx) =>
                            idx === i ? { ...item, defaultValue } : item,
                          ),
                        )
                      }}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteVariable(i)}
                      aria-label="変数を削除"
                      className="w-5 h-5 flex items-center justify-center text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="text-xs text-[#5D9C3B] border border-dashed border-[#5D9C3B] rounded px-2 py-1.5 hover:bg-[#F0F8EA] cursor-pointer bg-transparent mt-1"
                >
                  {t('editor.stateGraph.addVariable')}
                </button>
              </div>
            )}

            {/* Event Triggers section — advanced mode only */}
            {mode === 'advanced' && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-gray-500">
                  {t('editor.stateGraph.eventTriggers')}
                </div>

                {/* on_entry */}
                <div className="text-xs text-gray-500 font-medium mt-1">
                  {t('editor.stateGraph.onEntry')}
                </div>
                {events.map((ev, idx) =>
                  ev.type === 'entry' ? (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={ev.action}
                        onChange={(e) => {
                          const action = e.target.value
                          setEvents((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, action } : item,
                            ),
                          )
                        }}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(idx)}
                        aria-label="イベントを削除"
                        className="w-5 h-5 flex items-center justify-center text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null,
                )}
                <button
                  type="button"
                  onClick={() => handleAddEvent('entry')}
                  className="text-xs text-[#5D9C3B] border border-dashed border-[#5D9C3B] rounded px-2 py-1.5 hover:bg-[#F0F8EA] cursor-pointer bg-transparent"
                >
                  {t('editor.stateGraph.addEvent')}
                </button>

                {/* on_exit */}
                <div className="text-xs text-gray-500 font-medium mt-2">
                  {t('editor.stateGraph.onExit')}
                </div>
                {events.map((ev, idx) =>
                  ev.type === 'exit' ? (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={ev.action}
                        onChange={(e) => {
                          const action = e.target.value
                          setEvents((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, action } : item,
                            ),
                          )
                        }}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(idx)}
                        aria-label="イベントを削除"
                        className="w-5 h-5 flex items-center justify-center text-xs text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null,
                )}
                <button
                  type="button"
                  onClick={() => handleAddEvent('exit')}
                  className="text-xs text-[#5D9C3B] border border-dashed border-[#5D9C3B] rounded px-2 py-1.5 hover:bg-[#F0F8EA] cursor-pointer bg-transparent"
                >
                  {t('editor.stateGraph.addEvent')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-xs text-gray-400 text-center mt-4">
            {t('editor.stateGraph.selectedState')}
          </div>
        )}
      </div>
    </div>
  )
}
