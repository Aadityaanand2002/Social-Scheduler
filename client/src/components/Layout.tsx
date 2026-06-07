import { useState } from 'react'
import Sidebar from './Sidebar'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { MenuIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Social Accounts',
  '/schedule': 'Scheduler',
  '/ai-composer': 'AI Composer',
  '/profile': 'Profile',
  '/support': 'Support & Help',
  '/admin': 'Admin Panel',
}

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'SocialAI'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 selection:bg-slate-200">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        {/* Soft dot pattern background */}
        <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMDUpIi8+Cjwvc3ZnPg==')] pointer-events-none" />
        
        {/* Subtle ambient lights for the dashboard content area */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply z-0" />
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] bg-purple-400/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply z-0" />

        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 md:px-8 gap-4 relative z-10 shadow-sm">
          <button
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="size-6" />
          </button>

          <div>
            <h1 className="text-slate-900 text-xl font-bold tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">Manage and automate your social presence</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Layout
