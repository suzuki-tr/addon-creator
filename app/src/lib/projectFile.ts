import type { ProjectData } from '@/stores/projectStore'

/**
 * Serialises the project to a JSON file and triggers a browser download.
 */
export function saveProjectFile(project: ProjectData): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.entityId}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Reads a .json project file from the user's filesystem and parses it
 * as ProjectData. Rejects on FileReader error.
 */
export async function loadProjectFile(file: File): Promise<ProjectData> {
  return new Promise<ProjectData>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e): void => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text) as ProjectData
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (): void => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
