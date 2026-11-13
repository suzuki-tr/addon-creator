import type { JSX } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { WizardPage } from '@/pages/WizardPage'
import { EditorPage } from '@/pages/EditorPage'
import { RecipeEditorPage } from '@/pages/RecipeEditorPage'
import { LootTableEditorPage } from '@/pages/LootTableEditorPage'
import { SpawnRulesEditorPage } from '@/pages/SpawnRulesEditorPage'

const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell>
              <HomePage />
            </AppShell>
          }
        />
        <Route
          path="/wizard"
          element={
            <AppShell>
              <WizardPage />
            </AppShell>
          }
        />
        <Route
          path="/editor"
          element={
            <AppShell noPadding>
              <EditorPage />
            </AppShell>
          }
        />
        <Route
          path="/recipe"
          element={
            <AppShell noPadding>
              <RecipeEditorPage />
            </AppShell>
          }
        />
        <Route
          path="/loot-table"
          element={
            <AppShell noPadding>
              <LootTableEditorPage />
            </AppShell>
          }
        />
        <Route
          path="/spawn-rules"
          element={
            <AppShell noPadding>
              <SpawnRulesEditorPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
