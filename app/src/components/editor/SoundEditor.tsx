import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Switch from '@radix-ui/react-switch'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SoundCategory =
  | 'entity'
  | 'neutral'
  | 'ambient'
  | 'block'
  | 'player'
  | 'music'
  | 'weather'

type SoundCategoryLabelKey =
  | 'sound.categories.entity'
  | 'sound.categories.neutral'
  | 'sound.categories.ambient'
  | 'sound.categories.block'
  | 'sound.categories.player'
  | 'sound.categories.music'
  | 'sound.categories.weather'

interface SoundFile {
  id: string
  path: string
  volume: number
  pitch: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS: Array<{
  value: SoundCategory
  labelKey: SoundCategoryLabelKey
}> = [
  { value: 'entity', labelKey: 'sound.categories.entity' },
  { value: 'neutral', labelKey: 'sound.categories.neutral' },
  { value: 'ambient', labelKey: 'sound.categories.ambient' },
  { value: 'block', labelKey: 'sound.categories.block' },
  { value: 'player', labelKey: 'sound.categories.player' },
  { value: 'music', labelKey: 'sound.categories.music' },
  { value: 'weather', labelKey: 'sound.categories.weather' },
]

// ---------------------------------------------------------------------------
// SoundEditor
// ---------------------------------------------------------------------------

export const SoundEditor = (): JSX.Element => {
  const { t } = useTranslation()

  const [identifier, setIdentifier] = useState('mob.entity.my_mob.ambient')
  const [category, setCategory] = useState<SoundCategory>('neutral')
  const [volume, setVolume] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [is3D, setIs3D] = useState(true)
  const [loop, setLoop] = useState(false)
  const [files, setFiles] = useState<SoundFile[]>([
    { id: 'file-initial', path: 'sounds/mob/my_mob/ambient', volume: 1.0, pitch: 1.0 },
  ])

  const handleAddFile = (): void => {
    setFiles((prev) => [
      ...prev,
      { id: `file-${Date.now()}`, path: '', volume: 1.0, pitch: 1.0 },
    ])
  }

  const handleDeleteFile = (id: string): void => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleUpdateFilePath = (id: string, path: string): void => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, path } : f)))
  }

  const handleUpdateFileNumber = (
    id: string,
    field: 'volume' | 'pitch',
    value: number,
  ): void => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    )
  }

  return (
    <div className="max-w-2xl">
      {/* (1) Sound ID */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('sound.identifier')}
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
        />
      </div>

      {/* (2) Category + Volume + Pitch */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {t('sound.category')}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SoundCategory)}
            className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {t('sound.volume')}
          </label>
          <input
            type="number"
            value={volume}
            min={0}
            max={1}
            step={0.1}
            onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
            className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {t('sound.pitch')}
          </label>
          <input
            type="number"
            value={pitch}
            min={0}
            max={4}
            step={0.1}
            onChange={(e) => setPitch(parseFloat(e.target.value) || 0)}
            className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
          />
        </div>
      </div>

      {/* (3) is3D + Loop toggles */}
      <div className="mb-6 flex gap-8">
        <div className="flex items-center gap-3">
          <Switch.Root
            checked={is3D}
            onCheckedChange={setIs3D}
            aria-label={t('sound.is3D')}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5D9C3B] focus:ring-offset-2 data-[state=checked]:bg-[#5D9C3B]"
          >
            <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
          </Switch.Root>
          <span className="text-sm text-gray-700">{t('sound.is3D')}</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch.Root
            checked={loop}
            onCheckedChange={setLoop}
            aria-label={t('sound.loop')}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5D9C3B] focus:ring-offset-2 data-[state=checked]:bg-[#5D9C3B]"
          >
            <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
          </Switch.Root>
          <span className="text-sm text-gray-700">{t('sound.loop')}</span>
        </div>
      </div>

      {/* (4) Sound files list */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">
          {t('sound.files')}
        </div>

        <div className="flex flex-col gap-2 mb-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-2">
              <input
                type="text"
                value={file.path}
                onChange={(e) => handleUpdateFilePath(file.id, e.target.value)}
                placeholder={t('sound.filePath')}
                className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm font-mono text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
              <input
                type="number"
                value={file.volume}
                min={0}
                max={1}
                step={0.1}
                onChange={(e) =>
                  handleUpdateFileNumber(
                    file.id,
                    'volume',
                    parseFloat(e.target.value) || 0,
                  )
                }
                title={t('sound.fileVolume')}
                aria-label={t('sound.fileVolume')}
                className="w-20 border border-[#E5E7EB] rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
              <input
                type="number"
                value={file.pitch}
                min={0}
                max={4}
                step={0.1}
                onChange={(e) =>
                  handleUpdateFileNumber(
                    file.id,
                    'pitch',
                    parseFloat(e.target.value) || 0,
                  )
                }
                title={t('sound.filePitch')}
                aria-label={t('sound.filePitch')}
                className="w-20 border border-[#E5E7EB] rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#5D9C3B]"
              />
              <button
                type="button"
                onClick={() => handleDeleteFile(file.id)}
                aria-label={t('sound.deleteFile')}
                className="w-8 h-8 flex items-center justify-center text-sm text-gray-300 hover:text-red-400 cursor-pointer border-none bg-transparent rounded flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddFile}
          className="w-full text-sm text-[#5D9C3B] border border-dashed border-[#5D9C3B] rounded-md px-3 py-2 hover:bg-[#F0F8EA] cursor-pointer bg-transparent"
        >
          {t('sound.addFile')}
        </button>
      </div>
    </div>
  )
}
