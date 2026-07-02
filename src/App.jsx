import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { hasValidLicense } from './utils/auth'

function ProtectedRoute({ children }) {
  if (!hasValidLicense()) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App