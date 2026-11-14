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

  clearProject: (): void => {
    set({ project: null })
  },
}))
