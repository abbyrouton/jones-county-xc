import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from './Navbar'
import HomePage from './pages/HomePage'
import AthletesPage from './pages/AthletesPage'
import ResultsPage from './pages/ResultsPage'
import TopTimesPage from './pages/TopTimesPage'
import { LoginPage } from './pages/LoginPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

// Component to handle focus and title on route change
function RouteChangeHandler() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Update page title based on route
    const titles: Record<string, string> = {
      '/': 'Home - Jones County Cross Country',
      '/athletes': 'Athletes - Jones County Cross Country',
      '/results': 'Results - Jones County Cross Country',
      '/top-times': 'Top Times - Jones County Cross Country',
      '/login': 'Admin Login - Jones County Cross Country',
      '/admin': 'Admin Dashboard - Jones County Cross Country',
    }
    document.title = titles[location.pathname] || 'Jones County Cross Country'

    // Only move focus to main content on navigation (not initial page load)
    // This lets keyboard users Tab through navbar first on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      const main = document.getElementById('main-content')
      if (main) {
        main.focus()
      }
    }
  }, [location.pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[100] bg-white px-4 py-2 rounded-lg shadow-lg text-[#16a34a] font-semibold -translate-y-full focus:translate-y-0 transition-transform focus:ring-2 focus:ring-[#16a34a] focus:outline-none"
        >
          Skip to main content
        </a>

        <RouteChangeHandler />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/top-times" element={<TopTimesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
