import { create } from 'zustand'
import type { ContentType, BaseType } from '@/pages/WizardPage'

export interface EntityStatus {
  health: number
  attackDamage: number
  movementSpeed: number
  scale: number
}

export interface ProjectData {
  entityId: string
  entityDisplayName: string
  contentType: ContentType
  baseType: BaseType
  selectedVanillaId: string | null
  selectedTraits: string[]
  status: EntityStatus
  geometry?: { fileName: string; content: string }
  texture?: { fileName: string; dataUrl: string }
}

export const DEFAULT_STATUS: EntityStatus = {
  health: 20,
  attackDamage: 3,
  movementSpeed: 0.25,
  scale: 1.0,
}

interface ProjectStore {
  project: ProjectData | null
  setProject: (data: ProjectData) => void
  updateStatus: (key: keyof EntityStatus, value: number) => void
  updateTraits: (traits: string[]) => void
  updateGeometry: (geo: { fileName: string; content: string } | null) => void
  updateTexture: (tex: { fileName: string; dataUrl: string } | null) => void
  clearProject: () => void
}

export const useProjectStore = create<ProjectStore>()((set) => ({
  project: null,

  setProject: (data: ProjectData): void => {
    set({ project: data })
  },

  updateStatus: (key: keyof EntityStatus, value: number): void => {
    set((state) => {
      if (state.project === null) return {}
      const updatedStatus: EntityStatus = { ...state.project.status }
      updatedStatus[key] = value
      return { project: { ...state.project, status: updatedStatus } }
    })
  },

  updateTraits: (traits: string[]): void => {
    set((state) => {
      if (!state.project) return {}
      return { project: { ...state.project, selectedTraits: traits } }
    })
  },

  updateGeometry: (geo: { fileName: string; content: string } | null): void => {
    set((state) => {
      if (!state.project) return {}
      // Explicitly omit geometry then re-add if non-null to satisfy exactOptionalPropertyTypes
      const { geometry: _g, ...rest } = state.project
      if (geo === null) {
        return { project: rest }
      }
      return { project: { ...rest, geometry: geo } }
    })
  },

  updateTexture: (tex: { fileName: string; dataUrl: string } | null): void => {
    set((state) => {
      if (!state.project) return {}
      // Explicitly omit texture then re-add if non-null to satisfy exactOptionalPropertyTypes
      const { texture: _t, ...rest } = state.project
      if (tex === null) {
        return { project: rest }
      }
      return { project: { ...rest, texture: tex } }
    })
  },

  clearProject: (): void => {
    set({ project: null })
  },
}))
