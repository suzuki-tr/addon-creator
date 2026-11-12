import type { JSX } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { WizardPage } from '@/pages/WizardPage'

const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wizard" element={<WizardPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
