import type { JSX } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { WizardPage } from '@/pages/WizardPage'
import { EditorPage } from '@/pages/EditorPage'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
